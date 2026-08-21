import json
import logging
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from app.models.location import Location
from app.models.child import Child
from app.models.device import Device
from app.models.safety_event import SafetyEvent
from app.schemas.location import LocationCreate, BulkLocationCreate
from app.services.geofence_service import geofence_service
from app.utils.distance import calculate_haversine_distance

logger = logging.getLogger("safety.location")

# Speed threshold for alerting: 15.0 m/s (~54 km/h) — typical vehicle transit speed
SPEED_ALERT_THRESHOLD_MS = 15.0


class LocationService:
    """
    Core Location Management Service in NIVARA.
    Handles real-time GPS coordinate ingestion, hardware telemetry sync,
    geofence evaluation triggers, speed & battery anomaly detection,
    chronological breadcrumb retrieval, and route playback generation.
    """

    @staticmethod
    def record_location(
        db: Session,
        location_in: LocationCreate,
        evaluate_geofence: bool = True,
    ) -> Dict[str, Any]:
        """
        Records a new GPS coordinate ping for a child, updates device telemetry,
        and triggers geofence/safety anomaly evaluations.
        """
        child = db.query(Child).filter(Child.id == location_in.child_id).first()
        if not child:
            raise ValueError(f"Child with id '{location_in.child_id}' does not exist.")

        loc_obj = Location(
            child_id=location_in.child_id,
            device_id=location_in.device_id,
            latitude=location_in.latitude,
            longitude=location_in.longitude,
            accuracy=location_in.accuracy or 5.0,
            altitude=location_in.altitude,
            speed=location_in.speed or 0.0,
            heading=location_in.heading or 0.0,
            battery_level=location_in.battery_level,
            address=location_in.address,
            recorded_at=location_in.recorded_at or datetime.now(timezone.utc),
            created_at=datetime.now(timezone.utc),
        )
        db.add(loc_obj)

        # Update paired device telemetry if device_id is specified or child has paired devices
        target_device: Optional[Device] = None
        if location_in.device_id:
            target_device = db.query(Device).filter(Device.id == location_in.device_id).first()
        else:
            target_device = db.query(Device).filter(Device.child_id == child.id, Device.is_active == True).first()

        if target_device:
            target_device.last_ping_at = datetime.now(timezone.utc)
            target_device.is_online = True
            if location_in.battery_level is not None:
                target_device.battery_level = int(location_in.battery_level)

        db.commit()
        db.refresh(loc_obj)

        triggered_event_ids: List[str] = []

        # 1. Geofence evaluation
        geofence_status = {}
        if evaluate_geofence:
            geofence_status = geofence_service.evaluate_location_against_safe_zones(
                db=db,
                child_id=child.id,
                lat=location_in.latitude,
                lon=location_in.longitude,
                create_events=True,
            )

        # 2. Speed anomaly evaluation (> 15 m/s or 54 km/h)
        if location_in.speed is not None and location_in.speed >= SPEED_ALERT_THRESHOLD_MS:
            speed_kmh = round(location_in.speed * 3.6, 1)
            speed_event = SafetyEvent(
                child_id=child.id,
                event_type=SafetyEvent.EVENT_SPEED_ALERT,
                severity=SafetyEvent.SEVERITY_WARNING,
                title=f"High Speed Alert: {child.name} moving at {speed_kmh} km/h",
                description=f"Rapid transit detected ({speed_kmh} km/h). May indicate vehicle travel.",
                latitude=location_in.latitude,
                longitude=location_in.longitude,
                metadata_json=json.dumps({
                    "speed_ms": location_in.speed,
                    "speed_kmh": speed_kmh,
                    "threshold_kmh": SPEED_ALERT_THRESHOLD_MS * 3.6,
                }),
            )
            db.add(speed_event)
            db.commit()
            db.refresh(speed_event)
            triggered_event_ids.append(speed_event.id)
            logger.warning(f"[SPEED ALERT] {child.name} speed anomaly: {speed_kmh} km/h")

        # 3. Battery level evaluation
        if location_in.battery_level is not None and location_in.battery_level <= 20:
            low_battery_event = SafetyEvent(
                child_id=child.id,
                event_type=SafetyEvent.EVENT_LOW_BATTERY,
                severity=SafetyEvent.SEVERITY_WARNING,
                title=f"Low Battery: {target_device.device_name if target_device else 'Wearable'} at {int(location_in.battery_level)}%",
                description=f"Device battery is critically low ({int(location_in.battery_level)}%). Please charge soon.",
                latitude=location_in.latitude,
                longitude=location_in.longitude,
                metadata_json=json.dumps({
                    "battery_level": int(location_in.battery_level),
                    "device_id": target_device.id if target_device else None,
                }),
            )
            db.add(low_battery_event)
            db.commit()
            db.refresh(low_battery_event)
            triggered_event_ids.append(low_battery_event.id)

        return {
            "location": loc_obj,
            "geofence_evaluation": geofence_status,
            "triggered_events": triggered_event_ids,
        }

    @classmethod
    def record_bulk_locations(
        cls,
        db: Session,
        bulk_in: BulkLocationCreate,
        evaluate_last: bool = True,
    ) -> Dict[str, Any]:
        """
        Batch ingestion of location pings (e.g. device syncing stored offline pings).
        """
        if not bulk_in.locations:
            return {"accepted": 0, "rejected": 0, "errors": [], "triggered_events": []}

        accepted_count = 0
        rejected_count = 0
        errors = []
        triggered_events = []

        # Sort locations by recorded_at ascending
        sorted_locs = sorted(
            bulk_in.locations,
            key=lambda x: x.recorded_at or datetime.now(timezone.utc)
        )

        for i, loc_in in enumerate(sorted_locs):
            is_last = (i == len(sorted_locs) - 1)
            try:
                result = cls.record_location(
                    db=db,
                    location_in=loc_in,
                    evaluate_geofence=evaluate_last if is_last else False,
                )
                accepted_count += 1
                if result.get("triggered_events"):
                    triggered_events.extend(result["triggered_events"])
            except Exception as e:
                rejected_count += 1
                errors.append(f"Ping {i}: {str(e)}")

        return {
            "accepted": accepted_count,
            "rejected": rejected_count,
            "errors": errors,
            "triggered_events": triggered_events,
        }

    @staticmethod
    def get_latest_location(db: Session, child_id: str) -> Optional[Location]:
        """
        Retrieves the most recent GPS location ping for a child.
        """
        return (
            db.query(Location)
            .filter(Location.child_id == child_id)
            .order_by(desc(Location.created_at))
            .first()
        )

    @classmethod
    def get_current_location_snapshot(
        cls, db: Session, child_id: str
    ) -> Dict[str, Any]:
        """
        Constructs an enriched, safety-aware snapshot of a child's current location.
        Compatible with CurrentLocationResponse schema.
        """
        child = db.query(Child).filter(Child.id == child_id).first()
        if not child:
            return {"error": "Child not found", "child_id": child_id}

        latest_loc = cls.get_latest_location(db, child_id)
        paired_device = (
            db.query(Device)
            .filter(Device.child_id == child_id, Device.is_active == True)
            .first()
        )

        # Geofence check
        is_safe = child.current_status == Child.STATUS_SAFE
        active_zone_name = None
        zone_type = None
        dist_to_boundary = None

        if latest_loc:
            geo_eval = geofence_service.check_point_containment(
                db=db, child_id=child_id, lat=latest_loc.latitude, lon=latest_loc.longitude
            )
            is_safe = geo_eval.get("is_inside_safe_zone", is_safe)
            active_zone_name = geo_eval.get("active_zone_name")
            zone_type = geo_eval.get("zone_type")
            dist_to_boundary = geo_eval.get("distance_to_boundary_meters")

        unacked_events_count = (
            db.query(SafetyEvent)
            .filter(SafetyEvent.child_id == child_id, SafetyEvent.is_acknowledged == False)
            .count()
        )

        return {
            "child_id": child.id,
            "child_name": child.name,
            "avatar_url": child.avatar_url,
            "current_location": latest_loc.to_dict() if latest_loc else None,
            "is_safe": is_safe,
            "active_zone_name": active_zone_name,
            "zone_type": zone_type,
            "distance_to_zone_boundary_m": dist_to_boundary,
            "distance_to_caregiver_meters": None,
            "separation_alert": child.current_status == Child.STATUS_SEPARATION,
            "battery_percentage": paired_device.battery_level if paired_device else (int(latest_loc.battery_level) if latest_loc and latest_loc.battery_level is not None else None),
            "battery_is_low": paired_device.is_low_battery if paired_device else False,
            "is_device_online": paired_device.is_online if paired_device else True,
            "device_last_seen": paired_device.last_ping_at if paired_device else None,
            "last_updated": latest_loc.created_at if latest_loc else None,
            "unacknowledged_event_count": unacked_events_count,
        }

    @staticmethod
    def get_location_history(
        db: Session,
        child_id: str,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        limit: int = 100,
    ) -> List[Location]:
        """
        Queries chronological location breadcrumbs for a child.
        """
        query = db.query(Location).filter(Location.child_id == child_id)
        if start_time:
            query = query.filter(Location.created_at >= start_time)
        if end_time:
            query = query.filter(Location.created_at <= end_time)

        return query.order_by(desc(Location.created_at)).limit(limit).all()

    @classmethod
    def get_route_playback(
        cls,
        db: Session,
        child_id: str,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        limit: int = 500,
    ) -> Dict[str, Any]:
        """
        Returns an ordered sequence of waypoints for route animation and total distance.
        """
        child = db.query(Child).filter(Child.id == child_id).first()
        child_name = child.name if child else None

        query = db.query(Location).filter(Location.child_id == child_id)
        if start_time:
            query = query.filter(Location.created_at >= start_time)
        if end_time:
            query = query.filter(Location.created_at <= end_time)

        # Order ascending for sequential route playback
        locations = query.order_by(asc(Location.created_at)).limit(limit).all()

        waypoints = []
        total_distance_meters = 0.0

        for i, loc in enumerate(locations):
            waypoints.append({
                "latitude": loc.latitude,
                "longitude": loc.longitude,
                "accuracy": loc.accuracy,
                "speed": loc.speed,
                "heading": loc.heading,
                "battery_level": loc.battery_level,
                "address": loc.address,
                "recorded_at": loc.recorded_at.isoformat() if loc.recorded_at else loc.created_at.isoformat(),
            })

            # Calculate running distance
            if i > 0:
                prev_loc = locations[i - 1]
                dist = calculate_haversine_distance(
                    prev_loc.latitude, prev_loc.longitude, loc.latitude, loc.longitude
                )
                total_distance_meters += dist

        return {
            "child_id": child_id,
            "child_name": child_name,
            "start_time": start_time.isoformat() if start_time else (locations[0].created_at.isoformat() if locations else None),
            "end_time": end_time.isoformat() if end_time else (locations[-1].created_at.isoformat() if locations else None),
            "total_points": len(locations),
            "total_distance_km": round(total_distance_meters / 1000.0, 2),
            "waypoints": waypoints,
        }

    @staticmethod
    def delete_location_history(
        db: Session, child_id: str, before_time: Optional[datetime] = None
    ) -> int:
        """
        Deletes location records for privacy/retention compliance.
        """
        query = db.query(Location).filter(Location.child_id == child_id)
        if before_time:
            query = query.filter(Location.created_at < before_time)

        deleted = query.delete(synchronize_session=False)
        db.commit()
        return deleted


location_service = LocationService()

