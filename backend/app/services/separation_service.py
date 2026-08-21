import json
import logging
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.child import Child
from app.models.location import Location
from app.models.safety_event import SafetyEvent
from app.utils.distance import calculate_haversine_distance
from app.config.settings import settings
from app.services.notification_service import notification_service

logger = logging.getLogger("safety.separation")


class SeparationService:
    """
    Core Separation & Proximity Monitoring Service in NIVARA.
    Calculates dynamic distance between caregiver smartphone coordinates
    and child GPS wearable band coordinates, detects safety perimeter breaches,
    manages child state transitions, and dispatches proximity alert notifications.
    """

    @staticmethod
    def get_proximity_zone(distance_meters: float, threshold_meters: float) -> str:
        """
        Classifies proximity into 4 distinct zones for UI gauge rendering:
        - 'immediate': < 10m (hand-in-hand / side-by-side)
        - 'near': 10m to threshold (safe visual range)
        - 'caution': threshold to 2x threshold (perimeter breached)
        - 'critical': > 2x threshold (severe separation / out of sight)
        """
        if distance_meters < 10.0:
            return "immediate"
        elif distance_meters <= threshold_meters:
            return "near"
        elif distance_meters <= (threshold_meters * 2.0):
            return "caution"
        else:
            return "critical"

    @classmethod
    def calculate_separation(
        cls,
        child_lat: float,
        child_lon: float,
        caregiver_lat: float,
        caregiver_lon: float,
        max_allowed_distance_meters: Optional[float] = None,
    ) -> Dict[str, Any]:
        """
        Computes great-circle distance between child and caregiver coordinates.
        Determines separation flag, severity tier, and proximity zone classification.
        """
        threshold = max_allowed_distance_meters or getattr(
            settings, "SEPARATION_ALERT_THRESHOLD_METERS", 50.0
        )
        distance = calculate_haversine_distance(
            child_lat, child_lon, caregiver_lat, caregiver_lon
        )
        is_separated = distance > threshold

        # Severity escalation based on distance multiple
        if distance > (threshold * 2.0):
            severity = SafetyEvent.SEVERITY_CRITICAL
        elif is_separated:
            severity = SafetyEvent.SEVERITY_WARNING
        else:
            severity = SafetyEvent.SEVERITY_INFO

        proximity_zone = cls.get_proximity_zone(distance, threshold)

        return {
            "distance_meters": round(distance, 2),
            "threshold_meters": round(threshold, 2),
            "is_separated": is_separated,
            "severity": severity,
            "proximity_zone": proximity_zone,
            "child_coordinates": {"latitude": child_lat, "longitude": child_lon},
            "caregiver_coordinates": {"latitude": caregiver_lat, "longitude": caregiver_lon},
        }

    @classmethod
    def evaluate_separation(
        cls,
        db: Session,
        child_id: str,
        child_lat: float,
        child_lon: float,
        caregiver_lat: float,
        caregiver_lon: float,
        custom_threshold_meters: Optional[float] = None,
        caregiver_id: Optional[str] = None,
        create_event: bool = True,
    ) -> Dict[str, Any]:
        """
        Evaluates real-time proximity between child and caregiver.
        Updates child safety status, logs SafetyEvent, and fires notifications on perimeter breach.
        """
        child = db.query(Child).filter(Child.id == child_id).first()
        if not child:
            return {"error": "Child not found", "child_id": child_id, "is_separated": False}

        result = cls.calculate_separation(
            child_lat=child_lat,
            child_lon=child_lon,
            caregiver_lat=caregiver_lat,
            caregiver_lon=caregiver_lon,
            max_allowed_distance_meters=custom_threshold_meters,
        )

        previous_status = child.current_status
        triggered_event_id: Optional[str] = None

        if result["is_separated"]:
            # State transition to separation_alert (unless in full emergency)
            if child.current_status != Child.STATUS_EMERGENCY:
                child.current_status = Child.STATUS_SEPARATION
                db.commit()

            if create_event:
                event_metadata = {
                    "distance_to_caregiver_m": result["distance_meters"],
                    "threshold_m": result["threshold_meters"],
                    "caregiver_id": caregiver_id or child.caregiver_id,
                    "proximity_zone": result["proximity_zone"],
                    "severity": result["severity"],
                }
                event = SafetyEvent(
                    child_id=child.id,
                    event_type=SafetyEvent.EVENT_SEPARATION_ALERT,
                    severity=result["severity"],
                    title=f"⚠️ Separation Alert: {child.name} is {result['distance_meters']}m away",
                    description=f"Distance exceeded proximity threshold of {result['threshold_meters']}m ({result['proximity_zone'].upper()} zone).",
                    latitude=child_lat,
                    longitude=child_lon,
                    metadata_json=json.dumps(event_metadata),
                )
                db.add(event)
                db.commit()
                db.refresh(event)
                triggered_event_id = event.id

                # Multi-channel notification dispatch
                notification_service.send_emergency_alert(
                    db=db,
                    child=child,
                    alert_title="PROXIMITY SEPARATION ALERT",
                    alert_message=f"{child.name} has moved {result['distance_meters']}m away from your safety perimeter!",
                    severity=result["severity"],
                    coordinates={"latitude": child_lat, "longitude": child_lon},
                )
                logger.warning(
                    f"[SEPARATION ALERT] {child.name} is {result['distance_meters']}m away (threshold: {result['threshold_meters']}m)."
                )

        else:
            # Child has returned within safe proximity
            if child.current_status == Child.STATUS_SEPARATION:
                child.current_status = Child.STATUS_SAFE
                db.commit()

                if create_event:
                    reconnect_event = SafetyEvent(
                        child_id=child.id,
                        event_type="proximity_restored",
                        severity=SafetyEvent.SEVERITY_INFO,
                        title=f"Proximity Restored: {child.name} is back in close range",
                        description=f"Distance reduced to {result['distance_meters']}m (within {result['threshold_meters']}m safety perimeter).",
                        latitude=child_lat,
                        longitude=child_lon,
                        metadata_json=json.dumps({
                            "distance_meters": result["distance_meters"],
                            "previous_status": previous_status,
                        }),
                    )
                    db.add(reconnect_event)
                    db.commit()
                    triggered_event_id = reconnect_event.id
                    logger.info(f"[PROXIMITY RESTORED] {child.name} returned within {result['distance_meters']}m.")

        result["child_id"] = child.id
        result["child_name"] = child.name
        result["status"] = child.current_status
        result["triggered_event_id"] = triggered_event_id
        return result

    @classmethod
    def check_child_separation_with_latest_location(
        cls,
        db: Session,
        child_id: str,
        caregiver_lat: float,
        caregiver_lon: float,
        custom_threshold_meters: Optional[float] = None,
        caregiver_id: Optional[str] = None,
        create_event: bool = False,
    ) -> Dict[str, Any]:
        """
        Shortcut helper: pulls child's most recent GPS ping and evaluates proximity
        against the caregiver's live coordinates.
        """
        latest_loc = (
            db.query(Location)
            .filter(Location.child_id == child_id)
            .order_by(desc(Location.created_at))
            .first()
        )

        if not latest_loc:
            return {
                "error": "No location pings found for child",
                "child_id": child_id,
                "is_separated": False,
                "distance_meters": None,
            }

        return cls.evaluate_separation(
            db=db,
            child_id=child_id,
            child_lat=latest_loc.latitude,
            child_lon=latest_loc.longitude,
            caregiver_lat=caregiver_lat,
            caregiver_lon=caregiver_lon,
            custom_threshold_meters=custom_threshold_meters,
            caregiver_id=caregiver_id,
            create_event=create_event,
        )


separation_service = SeparationService()

