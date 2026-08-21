import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.emergency_contact import EmergencyContact
from app.services.notification_service import notification_service

logger = logging.getLogger("safety.tasks.notification")


def dispatch_async_safety_notification(
    caregiver_user_id: str,
    title: str,
    message: str,
    event_type: str = "safety_alert",
    metadata: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Background worker helper to process asynchronous push notification delivery.
    """
    res = notification_service.send_safety_notification(
        caregiver_user_id=caregiver_user_id,
        title=title,
        message=message,
        event_type=event_type,
        metadata=metadata,
    )
    logger.info(f"[ASYNC NOTIFICATION] Dispatched '{title}' to caregiver {caregiver_user_id}")
    return res


def bulk_verify_contact_channels(db: Session, user_id: str) -> List[Dict[str, Any]]:
    """
    Runs connectivity health checks across all emergency contacts configured by a caregiver.
    """
    contacts = db.query(EmergencyContact).filter(EmergencyContact.user_id == user_id).all()
    results = []
    for contact in contacts:
        res = notification_service.test_contact_dispatch(contact)
        results.append(res)
    return results
