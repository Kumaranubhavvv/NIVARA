import json
import logging
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from app.models.safe_zone import SafeZone
from app.models.child import Child
from app.models.safety_event import SafetyEvent
from app.utils.distance import calculate_haversine_distance, is_point_in_polygon
from app.services.notification_service import notification_service

logger = logging.getLogger("safety.geofence")


class GeofenceService:
    """
    Core Geofencing Domain Service in NIVARA.
    Handles Haversine circular containment, Ray-Casting polygon containment,
    real-time boundary breach & return detection, automated SafetyEvent logging,
    and multi-channel emergency notification dispatches.
    """

    @staticmethod
    def is_inside_safe_zone(
        lat: float, lon: float, safe_zone: SafeZone
    ) -> Tuple[bool, float]:
        """
        Determines whether GPS point (lat, lon) is inside a specific SafeZone.
        Returns:
            Tuple of (is_inside: bool, distance_to_center_meters: float)
        """
        dist_to_center = calculate_haversine_distance(
            lat, lon, safe_zone.center_latitude, safe_zone.center_longitude
        )

        # Polygon Zone
        if safe_zone.zone_type == SafeZone.TYPE_POLYGON:
            coords = safe_zone.parsed_polygon_coordinates
            if coords and len(coords) >= 3:
                try:
                    inside = is_point_in_polygon(lat, lon, coords)
                    return inside, dist_to_center
                except Exception as e:
                    logger.error(
                        f"Error evaluating polygon for zone {safe_zone.id} ({safe_zone.name}): {e}"
                    )
            # Fallback to circle if polygon parsing fails
            inside = dist_to_center <= safe_zone.radius_meters
            return inside, dist_to_center

        # Default Circular Zone
        inside = dist_to_center <= safe_zone.radius_meters
        return inside, dist_to_center

    @classmethod
    def calculate_distance_to_boundary(
        cls, lat: float, lon: float, safe_zone: SafeZone
    ) -> float:
        """
        Calculates distance in meters from point to the safe zone boundary.
        Positive value means outside boundary; negative value means inside.
        """
        dist_to_center = calculate_haversine_distance(
            lat, lon, safe_zone.center_latitude, safe_zone.center_longitude
        )
        return dist_to_center - safe_zone.radius_meters

    @classmethod
    def evaluate_location_against_safe_zones(
        cls,
        db: Session,
        child_id: str,
        lat: float,
        lon: float,
        create_events: bool = True,
    ) -> Dict[str, Any]:
        """
        Evaluates a newly ingested GPS coordinate against all active safe zones for a child.
        Updates Child state machine, logs SafetyEvent on breach/return, and dispatches alerts.
        """
        child = db.query(Child).filter(Child.id == child_id).first()
        if not child:
            return {
                "child_id": child_id,
                "error": "Child not found",
                "is_inside_safe_zone": False,
                "status": "unknown",
            }

        # Query all active safe zones configured for this child
        safe_zones: List[SafeZone] = (
            db.query(SafeZone)
            .filter(SafeZone.child_id == child_id, SafeZone.is_active == True)
            .all()
        )

        # If no active safe zones configured, default to safe
        if not safe_zones:
            return {
                "child_id": child_id,
                "latitude": lat,
                "longitude": lon,
                "is_inside_safe_zone": True,
                "active_zone_id": None,
                "active_zone_name": "No Safe Zones Configured",
                "zone_type": None,
                "distance_to_boundary_meters": 0.0,
                "distance_to_center_meters": 0.0,
                "nearest_zone_id": None,
                "nearest_zone_name": None,
                "nearest_zone_distance_meters": 0.0,
                "exit_alert_triggered": False,
                "enter_alert_triggered": False,
                "status": child.current_status,
            }

        inside_any = False
        active_zone: Optional[SafeZone] = None
        nearest_zone: Optional[SafeZone] = None
        min_distance_to_center = float("inf")
        distance_to_boundary: Optional[float] = None

        for zone in safe_zones:
            inside, dist_to_center = cls.is_inside_safe_zone(lat, lon, zone)
            if dist_to_center < min_distance_to_center:
                min_distance_to_center = dist_to_center
                nearest_zone = zone

            if inside and not inside_any:
                inside_any = True
                active_zone = zone
                distance_to_boundary = cls.calculate_distance_to_boundary(lat, lon, zone)

        if not inside_any and nearest_zone:
            distance_to_boundary = cls.calculate_distance_to_boundary(lat, lon, nearest_zone)

        # State transition handling
        previous_status = child.current_status
        new_status = child.current_status
        exit_alert_triggered = False
        enter_alert_triggered = False

        if inside_any:
            # Child is inside a safe zone
            if previous_status == Child.STATUS_OUT_OF_BOUNDS:
                new_status = Child.STATUS_SAFE
                child.current_status = new_status
                db.commit()

                # Trigger Safe Zone Entry Event if enabled
                if create_events and (active_zone is None or active_zone.alert_on_enter or previous_status == Child.STATUS_OUT_OF_BOUNDS):
                    enter_alert_triggered = True
                    event_title = f"Safe Zone Return: {child.name} entered {active_zone.name if active_zone else 'safe zone'}"
                    event_desc = f"{child.name} has safely returned inside boundaries."
                    metadata_payload = {
                        "zone_id": active_zone.id if active_zone else None,
                        "zone_name": active_zone.name if active_zone else None,
                        "zone_type": active_zone.zone_type if active_zone else "circle",
                        "distance_to_center_m": round(min_distance_to_center, 2),
                        "distance_to_boundary_m": round(distance_to_boundary or 0.0, 2),
                    }
                    entry_event = SafetyEvent(
                        child_id=child.id,
                        event_type=SafetyEvent.EVENT_GEOFENCE_ENTRY,
                        severity=SafetyEvent.SEVERITY_INFO,
                        title=event_title,
                        description=event_desc,
                        latitude=lat,
                        longitude=lon,
                        metadata_json=json.dumps(metadata_payload),
                    )
                    db.add(entry_event)
                    db.commit()
                    logger.info(f"[GEOFENCE ENTRY] {child.name} entered safe zone: {active_zone.name if active_zone else 'zone'}")
            elif previous_status != Child.STATUS_EMERGENCY and previous_status != Child.STATUS_SEPARATION:
                new_status = Child.STATUS_SAFE
                child.current_status = new_status
                db.commit()

        else:
            # Child is outside all active safe zones
            if previous_status != Child.STATUS_OUT_OF_BOUNDS and previous_status != Child.STATUS_EMERGENCY:
                new_status = Child.STATUS_OUT_OF_BOUNDS
                child.current_status = new_status
                db.commit()

                # Trigger Safe Zone Exit Breach Alert
                should_alert = nearest_zone is None or nearest_zone.alert_on_exit
                if create_events and should_alert:
                    exit_alert_triggered = True
                    event_title = f"Geofence Breach: {child.name} has left safe boundaries"
                    event_desc = f"{child.name} is {round(min_distance_to_center, 1)}m away from closest safe zone ({nearest_zone.name if nearest_zone else 'Safe Zone'})."
                    metadata_payload = {
                        "zone_id": nearest_zone.id if nearest_zone else None,
                        "zone_name": nearest_zone.name if nearest_zone else None,
                        "zone_type": nearest_zone.zone_type if nearest_zone else "circle",
                        "distance_to_nearest_meters": round(min_distance_to_center, 2),
                        "distance_to_boundary_m": round(distance_to_boundary or 0.0, 2),
                        "previous_status": previous_status,
                    }
                    breach_event = SafetyEvent(
                        child_id=child.id,
                        event_type=SafetyEvent.EVENT_GEOFENCE_EXIT,
                        severity=SafetyEvent.SEVERITY_CRITICAL,
                        title=event_title,
                        description=event_desc,
                        latitude=lat,
                        longitude=lon,
                        metadata_json=json.dumps(metadata_payload),
                    )
                    db.add(breach_event)
                    db.commit()
                    db.refresh(breach_event)

                    # Multi-channel notification dispatch
                    notification_service.send_emergency_alert(
                        db=db,
                        child=child,
                        alert_title="GEOFENCE BREACH ALERT",
                        alert_message=f"{child.name} has moved outside designated safe boundaries!",
                        severity=SafetyEvent.SEVERITY_CRITICAL,
                        coordinates={"latitude": lat, "longitude": lon},
                    )
                    logger.warning(f"[GEOFENCE BREACH] {child.name} exited safe zone: {nearest_zone.name if nearest_zone else 'zone'}")

        return {
            "child_id": child_id,
            "latitude": lat,
            "longitude": lon,
            "is_inside_safe_zone": inside_any,
            "active_zone_id": active_zone.id if active_zone else None,
            "active_zone_name": active_zone.name if active_zone else None,
            "zone_type": active_zone.zone_type if active_zone else (nearest_zone.zone_type if nearest_zone else None),
            "distance_to_boundary_meters": round(distance_to_boundary, 2) if distance_to_boundary is not None else None,
            "distance_to_center_meters": round(min_distance_to_center, 2) if min_distance_to_center != float("inf") else None,
            "nearest_zone_id": nearest_zone.id if nearest_zone else None,
            "nearest_zone_name": nearest_zone.name if nearest_zone else None,
            "nearest_zone_distance_meters": round(min_distance_to_center, 2) if min_distance_to_center != float("inf") else 0.0,
            "exit_alert_triggered": exit_alert_triggered,
            "enter_alert_triggered": enter_alert_triggered,
            "status": new_status,
        }

    @classmethod
    def check_point_containment(
        cls, db: Session, child_id: str, lat: float, lon: float
    ) -> Dict[str, Any]:
        """
        On-demand point containment check without mutating database state or sending alerts.
        """
        return cls.evaluate_location_against_safe_zones(
            db=db, child_id=child_id, lat=lat, lon=lon, create_events=False
        )

    @classmethod
    def get_child_geofence_overview(
        cls, db: Session, child_id: str, current_lat: Optional[float] = None, current_lon: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Returns full geofence status across all active zones for a child.
        """
        child = db.query(Child).filter(Child.id == child_id).first()
        if not child:
            return {"error": "Child not found", "total_active_zones": 0}

        zones: List[SafeZone] = (
            db.query(SafeZone)
            .filter(SafeZone.child_id == child_id, SafeZone.is_active == True)
            .all()
        )

        zones_inside = []
        zones_outside = []
        zone_details = []

        for zone in zones:
            if current_lat is not None and current_lon is not None:
                inside, dist = cls.is_inside_safe_zone(current_lat, current_lon, zone)
                dist_boundary = cls.calculate_distance_to_boundary(current_lat, current_lon, zone)
                if inside:
                    zones_inside.append(zone.name)
                else:
                    zones_outside.append(zone.name)

                zone_details.append({
                    "zone_id": zone.id,
                    "zone_name": zone.name,
                    "zone_type": zone.zone_type,
                    "is_inside": inside,
                    "distance_to_center_meters": round(dist, 2),
                    "distance_to_boundary_meters": round(dist_boundary, 2),
                })
            else:
                zones_outside.append(zone.name)
                zone_details.append({
                    "zone_id": zone.id,
                    "zone_name": zone.name,
                    "zone_type": zone.zone_type,
                    "is_inside": False,
                    "distance_to_center_meters": None,
                    "distance_to_boundary_meters": None,
                })

        return {
            "child_id": child_id,
            "child_name": child.name,
            "total_active_zones": len(zones),
            "zones_inside": zones_inside,
            "zones_outside": zones_outside,
            "zone_details": zone_details,
        }


geofence_service = GeofenceService()

