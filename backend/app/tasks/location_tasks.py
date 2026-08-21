import json
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.device import Device
from app.models.child import Child
from app.models.safety_event import SafetyEvent
from app.services.notification_service import notification_service

logger = logging.getLogger("safety.tasks.location")

INACTIVE_DEVICE_THRESHOLD_MINUTES = 5


def check_inactive_devices(db: Session) -> Dict[str, Any]:
    """
    Background worker: scans active devices for inactivity.
    If a device hasn't pinged in > 5 minutes, marks it offline and triggers a SafetyEvent.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(minutes=INACTIVE_DEVICE_THRESHOLD_MINUTES)
    devices = db.query(Device).filter(Device.is_active == True, Device.is_online == True).all()

    offline_count = 0
    events_created = []

    for device in devices:
        last_ping = device.last_ping_at
        if last_ping:
            if last_ping.tzinfo is None:
                last_ping = last_ping.replace(tzinfo=timezone.utc)
            if last_ping < cutoff:
                device.is_online = False
                offline_count += 1

                if device.child_id:
                    child = db.query(Child).filter(Child.id == device.child_id).first()
                    child_name = child.name if child else "Child"
                    event = SafetyEvent(
                        child_id=device.child_id,
                        event_type=SafetyEvent.EVENT_DEVICE_OFFLINE,
                        severity=SafetyEvent.SEVERITY_WARNING,
                        title=f"Device Offline: {device.device_name}",
                        description=f"{device.device_name} paired to {child_name} has stopped sending telemetry for > {INACTIVE_DEVICE_THRESHOLD_MINUTES} mins.",
                        metadata_json=json.dumps({
                            "device_id": device.id,
                            "serial_number": device.serial_number,
                            "last_ping_at": last_ping.isoformat(),
                        }),
                    )
                    db.add(event)
                    events_created.append(device.id)

                    # Send push notification to caregiver
                    if child:
                        notification_service.send_safety_notification(
                            caregiver_user_id=child.caregiver_id,
                            title=f"⚠️ {device.device_name} Disconnected",
                            message=f"{child_name}'s safety band stopped transmitting. Please check device connection.",
                            event_type="device_offline",
                            metadata={"device_id": device.id},
                        )

    if offline_count > 0:
        db.commit()
        logger.warning(f"[TASK: INACTIVE DEVICES] Marked {offline_count} devices offline.")

    return {
        "devices_checked": len(devices),
        "devices_marked_offline": offline_count,
        "events_created": len(events_created),
    }
