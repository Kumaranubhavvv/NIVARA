import json
import logging
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.emergency import EmergencyAlert
from app.models.child import Child
from app.models.safety_event import SafetyEvent
from app.schemas.emergency import (
    EmergencyCreate,
    EmergencyResolveRequest,
    EmergencyEscalateRequest,
    EmergencyUpdateRequest,
)
from app.services.notification_service import notification_service

logger = logging.getLogger("safety.emergency")


class EmergencyService:
    """
    Core Emergency Management Service in NIVARA.
    Coordinates critical SOS panic workflows, caregiver resolution audit trails,
    severity escalations, child profile safety state transitions, and
    multi-channel emergency contact dispatches (SMS, Calls, Push).
    """

    @staticmethod
    def trigger_emergency(
        db: Session,
        emergency_in: EmergencyCreate,
        caregiver_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Triggers a new critical emergency alert.
        Transitions child status to 'emergency', logs an immutable SafetyEvent,
        and executes priority multi-channel notification dispatches.
        """
        child = db.query(Child).filter(Child.id == emergency_in.child_id).first()
        if not child:
            raise ValueError(f"Child with id '{emergency_in.child_id}' does not exist.")

        # 1. State machine transition
        child.current_status = Child.STATUS_EMERGENCY

        # 2. Insert EmergencyAlert record
        effective_caregiver = caregiver_id or emergency_in.caregiver_id or child.caregiver_id
        emergency = EmergencyAlert(
            child_id=emergency_in.child_id,
            caregiver_id=effective_caregiver,
            status=EmergencyAlert.STATUS_ACTIVE,
            severity=emergency_in.severity or EmergencyAlert.SEVERITY_CRITICAL,
            triggered_by=emergency_in.triggered_by or EmergencyAlert.TRIGGER_SOS_BUTTON,
            latitude=emergency_in.latitude,
            longitude=emergency_in.longitude,
            address=emergency_in.address,
            message=emergency_in.message or "EMERGENCY SOS Triggered!",
            created_at=datetime.now(timezone.utc),
        )
        db.add(emergency)

        # 3. Log SafetyEvent audit entry
        event_metadata = {
            "emergency_id": emergency.id,
            "triggered_by": emergency_in.triggered_by,
            "severity": emergency_in.severity,
            "latitude": emergency_in.latitude,
            "longitude": emergency_in.longitude,
            "address": emergency_in.address,
        }
        event = SafetyEvent(
            child_id=child.id,
            event_type=SafetyEvent.EVENT_SOS_TRIGGERED,
            severity=SafetyEvent.SEVERITY_CRITICAL,
            title=f"🚨 SOS EMERGENCY ACTIVATED FOR {child.name.upper()}",
            description=emergency_in.message or "Emergency SOS button pressed!",
            latitude=emergency_in.latitude,
            longitude=emergency_in.longitude,
            metadata_json=json.dumps(event_metadata),
        )
        db.add(event)
        db.commit()
        db.refresh(emergency)

        # 4. Dispatch Multi-Channel Notifications
        coords = None
        if emergency_in.latitude is not None and emergency_in.longitude is not None:
            coords = {"latitude": emergency_in.latitude, "longitude": emergency_in.longitude}

        dispatch_result = notification_service.send_emergency_alert(
            db=db,
            child=child,
            alert_title=f"🚨 SOS EMERGENCY ALERT: {child.name}",
            alert_message=emergency_in.message or "Immediate assistance required!",
            severity=emergency.severity,
            coordinates=coords,
        )

        logger.warning(
            f"[SOS TRIGGERED] Emergency {emergency.id} initiated for child '{child.name}' ({child.id}) by {emergency.triggered_by}."
        )

        return {
            "emergency": emergency,
            "dispatch_status": dispatch_result,
            "child_name": child.name,
        }

    @staticmethod
    def resolve_emergency(
        db: Session,
        emergency_id: str,
        resolve_in: EmergencyResolveRequest,
        resolved_by_user_id: Optional[str] = None,
    ) -> Optional[EmergencyAlert]:
        """
        Resolves an active emergency or marks it as a false alarm.
        Audits resolution notes and resets child status to 'safe' if no other active emergencies remain.
        """
        emergency = db.query(EmergencyAlert).filter(EmergencyAlert.id == emergency_id).first()
        if not emergency:
            return None

        acting_user = resolved_by_user_id or resolve_in.resolved_by
        emergency.status = resolve_in.status
        emergency.resolved_at = datetime.now(timezone.utc)
        emergency.resolved_by = acting_user
        emergency.resolution_notes = resolve_in.resolution_notes

        # Re-evaluate child status: check if any other emergencies remain active for this child
        other_active_count = (
            db.query(EmergencyAlert)
            .filter(
                EmergencyAlert.child_id == emergency.child_id,
                EmergencyAlert.status == EmergencyAlert.STATUS_ACTIVE,
                EmergencyAlert.id != emergency_id,
            )
            .count()
        )

        child = db.query(Child).filter(Child.id == emergency.child_id).first()
        if child and other_active_count == 0:
            child.current_status = Child.STATUS_SAFE

        # Log resolution audit event
        resolution_event = SafetyEvent(
            child_id=emergency.child_id,
            event_type="emergency_resolved" if resolve_in.status == "resolved" else "false_alarm",
            severity=SafetyEvent.SEVERITY_INFO,
            title=f"Emergency Alert {resolve_in.status.upper()}: {child.name if child else 'Child'}",
            description=f"Resolved by {acting_user or 'Caregiver'}. Notes: {resolve_in.resolution_notes or 'None'}",
            metadata_json=json.dumps({
                "emergency_id": emergency.id,
                "status": resolve_in.status,
                "resolved_by": acting_user,
                "resolution_notes": resolve_in.resolution_notes,
            }),
        )
        db.add(resolution_event)

        db.commit()
        db.refresh(emergency)
        logger.info(f"[EMERGENCY RESOLVED] Alert {emergency.id} marked '{resolve_in.status}' by {acting_user}.")
        return emergency

    @staticmethod
    def escalate_emergency(
        db: Session,
        emergency_id: str,
        escalate_in: EmergencyEscalateRequest,
        escalated_by: Optional[str] = None,
    ) -> Optional[EmergencyAlert]:
        """
        Escalates the severity of an active emergency alert.
        """
        emergency = db.query(EmergencyAlert).filter(EmergencyAlert.id == emergency_id).first()
        if not emergency:
            return None

        previous_severity = emergency.severity
        emergency.severity = escalate_in.new_severity

        child = db.query(Child).filter(Child.id == emergency.child_id).first()

        # Log escalation event
        escalation_event = SafetyEvent(
            child_id=emergency.child_id,
            event_type="emergency_escalated",
            severity=SafetyEvent.SEVERITY_CRITICAL,
            title=f"Emergency Escalation: {child.name if child else 'Child'} -> {escalate_in.new_severity.upper()}",
            description=f"Severity escalated from {previous_severity} to {escalate_in.new_severity}. Reason: {escalate_in.escalation_reason or 'None'}",
            metadata_json=json.dumps({
                "emergency_id": emergency.id,
                "previous_severity": previous_severity,
                "new_severity": escalate_in.new_severity,
                "reason": escalate_in.escalation_reason,
                "escalated_by": escalated_by,
            }),
        )
        db.add(escalation_event)
        db.commit()
        db.refresh(emergency)

        logger.warning(f"[EMERGENCY ESCALATED] Alert {emergency.id} upgraded to {escalate_in.new_severity}.")
        return emergency

    @staticmethod
    def update_emergency(
        db: Session,
        emergency_id: str,
        update_in: EmergencyUpdateRequest,
    ) -> Optional[EmergencyAlert]:
        """
        Partially updates an active emergency (coordinates, address, message, severity).
        """
        emergency = db.query(EmergencyAlert).filter(EmergencyAlert.id == emergency_id).first()
        if not emergency:
            return None

        if update_in.latitude is not None:
            emergency.latitude = update_in.latitude
        if update_in.longitude is not None:
            emergency.longitude = update_in.longitude
        if update_in.address is not None:
            emergency.address = update_in.address
        if update_in.message is not None:
            emergency.message = update_in.message
        if update_in.severity is not None:
            emergency.severity = update_in.severity

        db.commit()
        db.refresh(emergency)
        return emergency

    @staticmethod
    def get_emergency_by_id(db: Session, emergency_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetches an emergency alert with enriched child context and duration calculations.
        """
        emergency = db.query(EmergencyAlert).filter(EmergencyAlert.id == emergency_id).first()
        if not emergency:
            return None

        child = db.query(Child).filter(Child.id == emergency.child_id).first()

        now = datetime.now(timezone.utc)
        created_at = emergency.created_at
        end_time = emergency.resolved_at or now

        # Compute duration in seconds
        duration = None
        if created_at and end_time:
            duration = (end_time - created_at).total_seconds()

        res = emergency.to_dict()
        res["child_name"] = child.name if child else None
        res["duration_seconds"] = round(duration, 1) if duration is not None else None
        return res

    @staticmethod
    def get_active_emergencies(
        db: Session,
        caregiver_id: Optional[str] = None,
        child_id: Optional[str] = None,
        limit: int = 50,
    ) -> List[EmergencyAlert]:
        """
        Queries currently active emergency alerts.
        """
        query = db.query(EmergencyAlert).filter(EmergencyAlert.status == EmergencyAlert.STATUS_ACTIVE)
        if caregiver_id:
            query = query.filter(EmergencyAlert.caregiver_id == caregiver_id)
        if child_id:
            query = query.filter(EmergencyAlert.child_id == child_id)

        return query.order_by(desc(EmergencyAlert.created_at)).limit(limit).all()

    @staticmethod
    def get_emergency_history(
        db: Session,
        caregiver_id: Optional[str] = None,
        child_id: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 50,
    ) -> List[EmergencyAlert]:
        """
        Queries all historical emergencies with optional filters.
        """
        query = db.query(EmergencyAlert)
        if caregiver_id:
            query = query.filter(EmergencyAlert.caregiver_id == caregiver_id)
        if child_id:
            query = query.filter(EmergencyAlert.child_id == child_id)
        if status:
            query = query.filter(EmergencyAlert.status == status)

        return query.order_by(desc(EmergencyAlert.created_at)).limit(limit).all()

    @staticmethod
    def get_emergency_summary_stats(
        db: Session, caregiver_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Calculates emergency statistics for the caregiver safety dashboard.
        """
        query = db.query(EmergencyAlert)
        if caregiver_id:
            query = query.filter(EmergencyAlert.caregiver_id == caregiver_id)

        all_alerts = query.all()
        active_count = sum(1 for a in all_alerts if a.status == EmergencyAlert.STATUS_ACTIVE)
        resolved_count = sum(1 for a in all_alerts if a.status == EmergencyAlert.STATUS_RESOLVED)
        false_alarm_count = sum(1 for a in all_alerts if a.status == EmergencyAlert.STATUS_FALSE_ALARM)

        return {
            "total_emergencies": len(all_alerts),
            "active_count": active_count,
            "resolved_count": resolved_count,
            "false_alarm_count": false_alarm_count,
        }


emergency_service = EmergencyService()

