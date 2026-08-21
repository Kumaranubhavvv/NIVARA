import json
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.device import Device
from app.models.child import Child
from app.models.safety_event import SafetyEvent
from app.schemas.device import DeviceCreate, DeviceUpdate, DeviceHeartbeat, DevicePairingRequest
from app.schemas.location import LocationCreate
from app.config.settings import settings

logger = logging.getLogger("safety.device")


class DeviceService:
    """
    Core Hardware Device & Wearable Band Service in NIVARA.
    Manages hardware registration, child profile pairing/unpairing,
    heartbeat telemetry ingestion, inline GPS capture, battery health tracking,
    and automatic offline state sweeps.
    """

    @staticmethod
    def register_device(db: Session, data: DeviceCreate) -> Device:
        """
        Registers a new hardware wearable device in the NIVARA system.
        Validates serial number uniqueness.
        """
        # Ensure serial number is not already registered
        existing = db.query(Device).filter(Device.serial_number == data.serial_number).first()
        if existing:
            raise ValueError(f"Device with serial number '{data.serial_number}' is already registered.")

        # If paired to a child immediately, verify child exists
        if data.child_id:
            child = db.query(Child).filter(Child.id == data.child_id).first()
            if not child:
                raise ValueError(f"Child with id '{data.child_id}' does not exist.")

        device = Device(
            child_id=data.child_id,
            device_name=data.device_name,
            device_type=data.device_type,
            serial_number=data.serial_number,
            battery_level=data.battery_level if data.battery_level is not None else 100,
            firmware_version=data.firmware_version or "v1.2.0",
            is_active=True,
            is_online=True,
            last_ping_at=datetime.now(timezone.utc),
            created_at=datetime.now(timezone.utc),
        )
        db.add(device)
        db.commit()
        db.refresh(device)
        logger.info(f"[DEVICE REGISTERED] '{device.device_name}' (SN: {device.serial_number}, ID: {device.id})")
        return device

    @staticmethod
    def update_device(db: Session, device_id: str, data: DeviceUpdate) -> Optional[Device]:
        """
        Partially updates an existing device record.
        """
        device = db.query(Device).filter(Device.id == device_id).first()
        if not device:
            return None

        if data.child_id is not None:
            if data.child_id == "":
                device.child_id = None
            else:
                child = db.query(Child).filter(Child.id == data.child_id).first()
                if not child:
                    raise ValueError(f"Child with id '{data.child_id}' does not exist.")
                device.child_id = data.child_id

        if data.device_name is not None:
            device.device_name = data.device_name
        if data.device_type is not None:
            device.device_type = data.device_type
        if data.is_active is not None:
            device.is_active = data.is_active
        if data.firmware_version is not None:
            device.firmware_version = data.firmware_version

        db.commit()
        db.refresh(device)
        return device

    @staticmethod
    def pair_device(db: Session, pairing: DevicePairingRequest) -> Device:
        """
        Pairs an existing device to a specific child profile.
        """
        device = db.query(Device).filter(Device.id == pairing.device_id).first()
        if not device:
            raise ValueError(f"Device '{pairing.device_id}' not found.")

        child = db.query(Child).filter(Child.id == pairing.child_id).first()
        if not child:
            raise ValueError(f"Child '{pairing.child_id}' not found.")

        if device.child_id and device.child_id != pairing.child_id and not pairing.force:
            raise ValueError(f"Device is already paired to child '{device.child_id}'. Use force=true to override.")

        device.child_id = pairing.child_id
        db.commit()
        db.refresh(device)
        logger.info(f"[DEVICE PAIRED] Device '{device.device_name}' paired to Child '{child.name}' ({child.id}).")
        return device

    @staticmethod
    def unpair_device(db: Session, device_id: str) -> Optional[Device]:
        """
        Unpairs a device from its current child.
        """
        device = db.query(Device).filter(Device.id == device_id).first()
        if not device:
            return None

        device.child_id = None
        db.commit()
        db.refresh(device)
        logger.info(f"[DEVICE UNPAIRED] Device '{device.device_name}' ({device.id}) unpaired.")
        return device

    @classmethod
    def handle_heartbeat(cls, db: Session, heartbeat: DeviceHeartbeat) -> Dict[str, Any]:
        """
        Ingests periodic hardware telemetry from a wearable band.
        Updates battery state, online status, and auto-records inline GPS snapshots if present.
        """
        device = db.query(Device).filter(Device.serial_number == heartbeat.serial_number).first()
        if not device:
            return {
                "accepted": False,
                "device_id": "",
                "serial_number": heartbeat.serial_number,
                "is_low_battery": False,
                "location_ingested": False,
                "triggered_events": [],
                "message": f"Device with serial '{heartbeat.serial_number}' is not registered.",
            }

        # Update telemetry
        device.battery_level = heartbeat.battery_level
        device.last_ping_at = datetime.now(timezone.utc)
        device.is_online = heartbeat.is_online if heartbeat.is_online is not None else True
        if heartbeat.firmware_version:
            device.firmware_version = heartbeat.firmware_version

        events_created: List[str] = []
        location_ingested = False

        # 1. Low battery evaluation (<= 20% or configured threshold)
        low_battery_threshold = getattr(settings, "LOW_BATTERY_ALERT_THRESHOLD", 20)
        if heartbeat.battery_level <= low_battery_threshold and device.child_id:
            event = SafetyEvent(
                child_id=device.child_id,
                event_type=SafetyEvent.EVENT_LOW_BATTERY,
                severity=SafetyEvent.SEVERITY_WARNING,
                title=f"Low Battery: {device.device_name} at {heartbeat.battery_level}%",
                description=f"Device battery is critically low ({heartbeat.battery_level}%). Please recharge soon.",
                latitude=heartbeat.latitude,
                longitude=heartbeat.longitude,
                metadata_json=json.dumps({
                    "device_id": device.id,
                    "serial_number": device.serial_number,
                    "battery_level": heartbeat.battery_level,
                }),
            )
            db.add(event)
            db.commit()
            db.refresh(event)
            events_created.append(event.id)

        # 2. Ingest inline GPS snapshot if supplied and device is paired
        if heartbeat.latitude is not None and heartbeat.longitude is not None and device.child_id:
            try:
                from app.services.location_service import location_service
                loc_create = LocationCreate(
                    child_id=device.child_id,
                    device_id=device.id,
                    latitude=heartbeat.latitude,
                    longitude=heartbeat.longitude,
                    accuracy=heartbeat.accuracy or 5.0,
                    speed=heartbeat.speed or 0.0,
                    heading=heartbeat.heading or 0.0,
                    battery_level=float(heartbeat.battery_level),
                )
                loc_res = location_service.record_location(db=db, location_in=loc_create, evaluate_geofence=True)
                location_ingested = True
                if loc_res.get("triggered_events"):
                    events_created.extend(loc_res["triggered_events"])
            except Exception as e:
                logger.error(f"Failed to auto-ingest location from heartbeat: {e}")

        db.commit()
        db.refresh(device)

        events_triggered_types = ["low_battery"] if device.is_low_battery else []
        if location_ingested and events_created:
            events_triggered_types.append("geofence_or_speed")

        return {
            "accepted": True,
            "device_id": device.id,
            "serial_number": device.serial_number,
            "battery_level": device.battery_level,
            "is_low_battery": device.is_low_battery,
            "location_ingested": location_ingested,
            "events_triggered": events_triggered_types,
            "triggered_events": events_created,
            "message": "Heartbeat telemetry successfully processed.",
        }

    @staticmethod
    def get_device_by_id(db: Session, device_id: str) -> Optional[Device]:
        return db.query(Device).filter(Device.id == device_id).first()

    @staticmethod
    def get_device_by_serial(db: Session, serial_number: str) -> Optional[Device]:
        return db.query(Device).filter(Device.serial_number == serial_number.strip().upper()).first()

    @staticmethod
    def get_devices_for_caregiver(db: Session, caregiver_id: str) -> List[Device]:
        """
        Retrieves all devices paired to children belonging to a specific caregiver.
        """
        children_ids = [c.id for c in db.query(Child.id).filter(Child.caregiver_id == caregiver_id).all()]
        return (
            db.query(Device)
            .filter(
                (Device.child_id.in_(children_ids)) | (Device.child_id == None),
                Device.is_active == True,
            )
            .order_by(desc(Device.created_at))
            .all()
        )

    @staticmethod
    def get_device_telemetry_summary(db: Session, device_id: str) -> Optional[Dict[str, Any]]:
        """
        Builds a lightweight battery and connectivity snapshot for dashboard widgets.
        """
        device = db.query(Device).filter(Device.id == device_id).first()
        if not device:
            return None

        child_name = None
        if device.child_id:
            child = db.query(Child).filter(Child.id == device.child_id).first()
            child_name = child.name if child else None

        minutes_since_ping = None
        if device.last_ping_at:
            last_ping = device.last_ping_at
            if last_ping.tzinfo is None:
                last_ping = last_ping.replace(tzinfo=timezone.utc)
            delta = datetime.now(timezone.utc) - last_ping
            minutes_since_ping = round(delta.total_seconds() / 60.0, 1)

        return {
            "device_id": device.id,
            "serial_number": device.serial_number,
            "child_id": device.child_id,
            "child_name": child_name,
            "battery_level": device.battery_level,
            "is_low_battery": device.is_low_battery,
            "is_online": device.is_online,
            "last_ping_at": device.last_ping_at.isoformat() if device.last_ping_at else None,
            "minutes_since_last_ping": minutes_since_ping,
        }

    @staticmethod
    def check_and_mark_offline_devices(db: Session, offline_threshold_minutes: int = 15) -> int:
        """
        Background maintenance sweep: marks devices as offline if no ping received within threshold.
        """
        cutoff_time = datetime.now(timezone.utc) - timedelta(minutes=offline_threshold_minutes)
        stale_devices = (
            db.query(Device)
            .filter(Device.is_online == True, Device.last_ping_at < cutoff_time)
            .all()
        )

        count = 0
        for dev in stale_devices:
            dev.is_online = False
            count += 1
            if dev.child_id:
                offline_event = SafetyEvent(
                    child_id=dev.child_id,
                    event_type=SafetyEvent.EVENT_DEVICE_OFFLINE,
                    severity=SafetyEvent.SEVERITY_WARNING,
                    title=f"Device Offline: {dev.device_name}",
                    description=f"No telemetry received for over {offline_threshold_minutes} minutes.",
                    metadata_json=json.dumps({
                        "device_id": dev.id,
                        "serial_number": dev.serial_number,
                        "threshold_minutes": offline_threshold_minutes,
                    }),
                )
                db.add(offline_event)

        if count > 0:
            db.commit()
            logger.info(f"[OFFLINE SWEEP] Marked {count} devices as offline.")
        return count

    @staticmethod
    def delete_device(db: Session, device_id: str, soft_delete: bool = True) -> bool:
        device = db.query(Device).filter(Device.id == device_id).first()
        if not device:
            return False

        if soft_delete:
            device.is_active = False
            device.child_id = None
        else:
            db.delete(device)

        db.commit()
        return True


device_service = DeviceService()

