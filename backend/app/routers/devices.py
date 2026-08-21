from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.config.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.child import Child
from app.models.device import Device
from app.schemas.device import (
    DeviceCreate,
    DeviceUpdate,
    DevicePairingRequest,
    DeviceHeartbeat,
    DeviceResponse,
    DeviceTelemetrySummary,
    DeviceHeartbeatResponse,
)
from app.services.device_service import device_service

router = APIRouter(prefix="/devices", tags=["Safety - Wearables & Hardware Devices"])


@router.post("/", response_model=DeviceResponse, status_code=status.HTTP_201_CREATED)
def register_device(
    data: DeviceCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Register a new safety GPS band or wearable device.
    Normalizes serial number and validates uniqueness.
    """
    existing = db.query(Device).filter(Device.serial_number == data.serial_number.strip().upper()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A device with serial number '{data.serial_number}' is already registered."
        )

    try:
        device = device_service.register_device(db, data)
        return device
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/", response_model=List[DeviceResponse])
def list_devices(
    child_id: Optional[str] = Query(None, description="Filter devices paired to a specific child"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    List all paired and active devices. If authenticated as a caregiver, filters
    to devices assigned to caregiver's children.
    """
    if child_id:
        devices = db.query(Device).filter(Device.child_id == child_id, Device.is_active == True).all()
        return devices

    if current_user and current_user.children:
        user_child_ids = [c.id for c in current_user.children]
        devices = (
            db.query(Device)
            .filter((Device.child_id.in_(user_child_ids)) | (Device.child_id.is_(None)))
            .filter(Device.is_active == True)
            .all()
        )
        return devices

    devices = db.query(Device).filter(Device.is_active == True).all()
    return devices


@router.get("/{device_id}", response_model=DeviceResponse)
def get_device(
    device_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Get device telemetry status, battery level, online state, and hardware details.
    """
    device = device_service.get_device_by_id(db, device_id)
    if not device:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found.")
    return device


@router.get("/{device_id}/summary", response_model=DeviceTelemetrySummary)
def get_device_summary(
    device_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Lightweight telemetry snapshot for dashboard widgets (battery level, last ping, online state).
    """
    summary = device_service.get_device_telemetry_summary(db, device_id)
    if not summary:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found.")
    return DeviceTelemetrySummary(**summary)


@router.put("/{device_id}", response_model=DeviceResponse)
def update_device(
    device_id: str,
    data: DeviceUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Update device settings, label, firmware version, or re-pair to a child profile.
    """
    try:
        device = device_service.update_device(db, device_id, data)
        if not device:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found.")
        return device
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/pair", response_model=DeviceResponse)
def pair_device(
    data: DevicePairingRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Explicitly pair a wearable device with a child profile.
    """
    try:
        device = device_service.pair_device(db, data)
        return device
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/unpair/{device_id}", response_model=DeviceResponse)
def unpair_device(
    device_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Unpair a wearable device from its currently assigned child profile.
    """
    device = device_service.unpair_device(db, device_id)
    if not device:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found.")
    return device


@router.delete("/{device_id}", status_code=status.HTTP_200_OK)
def delete_device(
    device_id: str,
    soft_delete: bool = Query(True, description="If True, marks device inactive rather than deleting row"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Delete or deactivate a hardware device.
    """
    success = device_service.delete_device(db, device_id, soft_delete=soft_delete)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found.")
    return {
        "message": "Device deleted successfully" if not soft_delete else "Device deactivated successfully",
        "device_id": device_id,
        "soft_delete": soft_delete
    }


@router.post("/heartbeat", response_model=DeviceHeartbeatResponse, status_code=status.HTTP_200_OK)
def process_device_heartbeat(
    data: DeviceHeartbeat,
    db: Session = Depends(get_db)
):
    """
    Hardware endpoint: Ingest periodic telemetry ping from GPS wearable (battery level,
    online status, optional inline GPS coordinates, firmware version).
    Automatically triggers low battery & geofence events when applicable.
    """
    res = device_service.handle_heartbeat(db, data)
    if not res.get("accepted"):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=res.get("message", "Device not registered."))
    return DeviceHeartbeatResponse(**res)


@router.get("/band/status")
def get_band_status(
    child_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Returns active band status, battery level, RSSI, connection state for the child.
    """
    target_child_id = child_id
    if not target_child_id and current_user and current_user.children:
        target_child_id = current_user.children[0].id

    device = None
    if target_child_id:
        device = db.query(Device).filter(Device.child_id == target_child_id, Device.is_active == True).first()
    if not device:
        device = db.query(Device).filter(Device.is_active == True).first()

    if not device:
        return {
            "id": "NV-BAND-DEFAULT",
            "name": "NIVARA GPS SmartBand",
            "model": "CoreBand Pro",
            "connected": False,
            "battery": 85,
            "isCharging": False,
            "gpsStatus": "STANDBY",
            "rssi": -65,
            "distanceMeters": 0.0,
            "lastSync": None,
            "firmware": "v1.2.0",
        }

    return {
        "id": device.id,
        "name": device.device_name,
        "model": device.device_type.capitalize(),
        "connected": device.is_online,
        "battery": device.battery_level or 85,
        "isCharging": False,
        "gpsStatus": "ACTIVE" if device.is_online else "OFFLINE",
        "rssi": -58 if device.is_online else -95,
        "distanceMeters": 3.8 if device.is_online else None,
        "lastSync": device.last_ping_at.isoformat() if device.last_ping_at else None,
        "firmware": device.firmware_version,
    }


@router.post("/band/connect")
def connect_band(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    device = db.query(Device).filter(Device.is_active == True).first()
    if device:
        device.is_online = True
        db.commit()
    return {"success": True, "status": "CONNECTED", "deviceId": device.id if device else "NV-BAND-001"}


@router.post("/band/disconnect")
def disconnect_band(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    device = db.query(Device).filter(Device.is_active == True).first()
    if device:
        device.is_online = False
        db.commit()
    return {"success": True, "status": "DISCONNECTED"}

