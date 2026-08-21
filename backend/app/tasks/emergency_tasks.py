import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models.emergency import EmergencyAlert
from app.models.child import Child
from app.services.notification_service import notification_service

logger = logging.getLogger("safety.tasks.emergency")

UNRESOLVED_ESCALATION_THRESHOLD_MINUTES = 10


def check_unresolved_emergencies(db: Session) -> Dict[str, Any]:
    """
    Background worker: monitors active SOS emergencies that have remained unresolved.
    Sends re-dispatch escalation notifications if still active past threshold.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(minutes=UNRESOLVED_ESCALATION_THRESHOLD_MINUTES)
    active_emergencies = (
        db.query(EmergencyAlert)
        .filter(EmergencyAlert.status == EmergencyAlert.STATUS_ACTIVE)
        .all()
    )

    escalated_count = 0

    for emg in active_emergencies:
        created = emg.created_at
        if created:
            if created.tzinfo is None:
                created = created.replace(tzinfo=timezone.utc)
            if created < cutoff:
                child = db.query(Child).filter(Child.id == emg.child_id).first()
                if child:
                    coords = None
                    if emg.latitude and emg.longitude:
                        coords = {"latitude": emg.latitude, "longitude": emg.longitude}

                    # Re-dispatch reminder alert
                    notification_service.send_emergency_alert(
                        db=db,
                        child=child,
                        alert_title=f"🚨 URGENT: Active SOS Alert Unresolved for {child.name}",
                        alert_message=f"SOS alert initiated at {created.strftime('%H:%M:%S')} UTC is still active. Please verify child safety immediately.",
                        severity=EmergencyAlert.SEVERITY_CRITICAL,
                        coordinates=coords,
                    )
                    escalated_count += 1

    logger.info(f"[TASK: EMERGENCY REMINDERS] Checked {len(active_emergencies)} active emergencies, re-dispatched {escalated_count}.")

    return {
        "active_emergencies_count": len(active_emergencies),
        "reminders_dispatched": escalated_count,
    }
