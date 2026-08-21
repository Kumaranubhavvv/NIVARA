from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from app.config.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.child import Child
from app.models.safe_zone import SafeZone
from app.models.emergency import EmergencyAlert
from app.models.emergency_contact import EmergencyContact
from app.models.safety_event import SafetyEvent
from app.models.device import Device
from app.schemas.safety_event import SafetyOverviewSummary, SafetyEventResponse
from app.schemas.emergency import EmergencyCreate, EmergencyResolveRequest, EmergencyResponse
from app.schemas.emergency_contact import (
    EmergencyContactCreate,
    EmergencyContactUpdate,
    EmergencyContactResponse,
)
from app.schemas.location import LocationResponse
from app.services.location_service import location_service
from app.services.geofence_service import geofence_service
from app.services.separation_service import separation_service
from app.services.emergency_service import emergency_service
from app.utils.validators import validate_phone_number

from app.routers.location import router as location_router
from app.routers.devices import router as devices_router
from app.routers.safe_zones import router as safe_zones_router
from app.routers.geofence import router as geofence_router
from app.routers.separation import router as separation_router
from app.routers.emergencies import router as emergencies_router
from app.routers.emergency_contacts import router as emergency_contacts_router
from app.routers.safety_events import router as safety_events_router

router = APIRouter(prefix="/safety", tags=["Safety - Master Hub"])

# Include sub-routers
router.include_router(location_router)
router.include_router(devices_router)
router.include_router(safe_zones_router)
router.include_router(geofence_router)
router.include_router(separation_router)
router.include_router(emergencies_router)
router.include_router(emergency_contacts_router)
router.include_router(safety_events_router)

@router.get("/status")
def get_safety_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    child = current_user.children[0] if current_user.children else None
    if not child:
        return {
            "isSafe": True,
            "childName": "Leo Mitchell",
            "age": 7,
            "status": "Safe — Inside Home Sanctuary",
            "lastUpdated": datetime.now(timezone.utc).isoformat(),
            "batteryLevel": 92,
            "gpsStatus": "ACTIVE",
            "bleConnected": True,
            "currentZone": "Home Sanctuary",
            "separationDistance": 3.8,
            "activeEmergency": None,
        }
    latest_loc = location_service.get_latest_location(db, child.id)
    device = child.devices[0] if child.devices else None
    geofence_eval = geofence_service.evaluate_location_against_safe_zones(
        db, child.id, latest_loc.latitude if latest_loc else 37.7750, latest_loc.longitude if latest_loc else -122.4195, create_events=False
    ) if latest_loc else {"is_inside_safe_zone": True, "active_zone_name": "Home (Safe Haven)"}

    return {
        "isSafe": child.current_status == "safe",
        "childId": child.id,
        "childName": child.name,
        "age": child.age,
        "status": f"Safe — Inside {geofence_eval.get('active_zone_name') or 'Home'}",
        "lastUpdated": latest_loc.recorded_at.isoformat() if (latest_loc and latest_loc.recorded_at) else datetime.now(timezone.utc).isoformat(),
        "batteryLevel": device.battery_level if device else 92,
        "gpsStatus": "ACTIVE" if (device and device.is_online) else "STANDBY",
        "bleConnected": True,
        "currentZone": geofence_eval.get("active_zone_name") or "Home",
        "separationDistance": 3.8,
        "activeEmergency": None,
    }

@router.get("/safe-zones")
def list_safe_zones_alias(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_child_ids = [c.id for c in current_user.children]
    if user_child_ids:
        zones = db.query(SafeZone).filter(SafeZone.child_id.in_(user_child_ids)).all()
    else:
        zones = db.query(SafeZone).all()
    return zones

@router.get("/contacts", response_model=List[EmergencyContactResponse])
def list_contacts_alias(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return (
        db.query(EmergencyContact)
        .filter(EmergencyContact.user_id == current_user.id)
        .order_by(EmergencyContact.priority_order.asc())
        .all()
    )

@router.post("/contacts", response_model=EmergencyContactResponse, status_code=status.HTTP_201_CREATED)
def create_contact_alias(
    data: EmergencyContactCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    valid_phone, msg_phone = validate_phone_number(data.phone_number)
    if not valid_phone:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg_phone)

    contact = EmergencyContact(
        user_id=current_user.id,
        child_id=data.child_id,
        name=data.name,
        relationship_type=data.relationship_type,
        phone_number=data.phone_number,
        email=data.email,
        priority_order=data.priority_order,
        notify_via_sms=data.notify_via_sms,
        notify_via_call=data.notify_via_call,
        notify_via_push=data.notify_via_push,
        created_at=datetime.now(timezone.utc),
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact

@router.put("/contacts/{contact_id}", response_model=EmergencyContactResponse)
def update_contact_alias(
    contact_id: str,
    data: EmergencyContactUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    contact = (
        db.query(EmergencyContact)
        .filter(EmergencyContact.id == contact_id, EmergencyContact.user_id == current_user.id)
        .first()
    )
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Emergency contact not found.")

    if data.name is not None:
        contact.name = data.name
    if data.relationship_type is not None:
        contact.relationship_type = data.relationship_type
    if data.phone_number is not None:
        valid_phone, msg = validate_phone_number(data.phone_number)
        if not valid_phone:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)
        contact.phone_number = data.phone_number
    if data.email is not None:
        contact.email = data.email
    if data.priority_order is not None:
        contact.priority_order = data.priority_order
    if data.notify_via_sms is not None:
        contact.notify_via_sms = data.notify_via_sms
    if data.notify_via_call is not None:
        contact.notify_via_call = data.notify_via_call
    if data.notify_via_push is not None:
        contact.notify_via_push = data.notify_via_push

    db.commit()
    db.refresh(contact)
    return contact

@router.delete("/contacts/{contact_id}")
def delete_contact_alias(
    contact_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    contact = (
        db.query(EmergencyContact)
        .filter(EmergencyContact.id == contact_id, EmergencyContact.user_id == current_user.id)
        .first()
    )
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Emergency contact not found.")
    db.delete(contact)
    db.commit()
    return {"message": "Emergency contact deleted successfully", "id": contact_id}

@router.get("/events", response_model=List[SafetyEventResponse])
def list_events_alias(
    category: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_child_ids = [c.id for c in current_user.children]
    query = db.query(SafetyEvent)
    if user_child_ids:
        query = query.filter(SafetyEvent.child_id.in_(user_child_ids))
    return query.order_by(SafetyEvent.created_at.desc()).limit(limit).all()

@router.get("/events/{event_id}", response_model=SafetyEventResponse)
def get_event_detail_alias(
    event_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    event = db.query(SafetyEvent).filter(SafetyEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Safety event not found.")
    return event

@router.get("/location/current")
def get_current_location_alias(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    child = current_user.children[0] if current_user.children else None
    if not child:
        return {
            "latitude": 37.7750,
            "longitude": -122.4195,
            "accuracy": 4.2,
            "address": "123 Serenity Way, San Francisco, CA",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "speed": 0.0,
            "heading": 90,
        }
    latest_loc = location_service.get_latest_location(db, child.id)
    if latest_loc:
        return {
            "latitude": latest_loc.latitude,
            "longitude": latest_loc.longitude,
            "accuracy": latest_loc.accuracy,
            "address": latest_loc.address or "123 Serenity Way, San Francisco, CA",
            "timestamp": latest_loc.recorded_at.isoformat() if latest_loc.recorded_at else datetime.now(timezone.utc).isoformat(),
            "speed": latest_loc.speed or 0.0,
            "heading": latest_loc.heading or 0,
        }
    return {
        "latitude": 37.7750,
        "longitude": -122.4195,
        "accuracy": 4.2,
        "address": "123 Serenity Way, San Francisco, CA",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "speed": 0.0,
        "heading": 90,
    }

@router.get("/location/history", response_model=List[LocationResponse])
def get_location_history_alias(
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    child = current_user.children[0] if current_user.children else None
    if not child:
        return []
    return location_service.get_location_history(db, child_id=child.id, limit=limit)

@router.get("/band/status")
def get_band_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    child = current_user.children[0] if current_user.children else None
    device = child.devices[0] if (child and child.devices) else None
    if not device:
        return {
            "id": "NV-BAND-8821",
            "name": "NIVARA GPS SmartBand",
            "model": "CoreBand Pro",
            "connected": True,
            "battery": 92,
            "isCharging": False,
            "gpsStatus": "ACTIVE",
            "rssi": -58,
            "distanceMeters": 3.8,
            "lastSync": datetime.now(timezone.utc).isoformat(),
            "firmware": "v2.4.12",
        }
    return {
        "id": device.id,
        "name": device.device_name,
        "serialNumber": device.serial_number,
        "model": device.device_type,
        "connected": device.is_online,
        "battery": device.battery_level,
        "isCharging": False,
        "gpsStatus": "ACTIVE" if device.is_online else "STANDBY",
        "rssi": -58,
        "distanceMeters": 3.8,
        "lastSync": device.last_ping_at.isoformat() if device.last_ping_at else datetime.now(timezone.utc).isoformat(),
        "firmware": device.firmware_version,
    }

@router.post("/band/connect")
def connect_band(
    data: Optional[dict] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return {
        "success": True,
        "status": "CONNECTED",
        "deviceId": data.get("deviceId") if data else "NV-BAND-8821",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

@router.post("/band/disconnect")
def disconnect_band(
    data: Optional[dict] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return {
        "success": True,
        "status": "DISCONNECTED",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

@router.post("/emergency/trigger", response_model=EmergencyResponse, status_code=status.HTTP_201_CREATED)
def trigger_emergency_alias(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    child = current_user.children[0] if current_user.children else None
    child_id = payload.get("child_id") or (child.id if child else "child-leo-1")
    coords = payload.get("location", {})
    lat = coords.get("latitude") if isinstance(coords, dict) else payload.get("latitude", 37.7750)
    lon = coords.get("longitude") if isinstance(coords, dict) else payload.get("longitude", -122.4195)

    data = EmergencyCreate(
        child_id=child_id,
        triggered_by=payload.get("type", "sos_button"),
        severity=payload.get("severity", "critical"),
        latitude=lat,
        longitude=lon,
        message=payload.get("message", "EMERGENCY SOS Triggered from Mobile App!"),
    )
    result = emergency_service.trigger_emergency(db, data, caregiver_id=current_user.id)
    return result["emergency"]

@router.post("/emergency/{emergency_id}/resolve", response_model=EmergencyResponse)
def resolve_emergency_alias(
    emergency_id: str,
    data: Optional[EmergencyResolveRequest] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resolve_data = data or EmergencyResolveRequest(status="resolved", resolution_notes="Resolved via Caregiver Dashboard.")
    resolved = emergency_service.resolve_emergency(
        db,
        emergency_id=emergency_id,
        resolve_in=resolve_data,
        resolved_by_user_id=current_user.id,
    )
    if not resolved:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Emergency not found.")
    return resolved

@router.get("/overview", response_model=List[SafetyOverviewSummary])
def get_safety_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Caregiver Safety Hub: Aggregates real-time child status, battery, active safe zones, alerts & emergency state.
    """
    children = current_user.children
    summaries = []

    for child in children:
        latest_loc = location_service.get_latest_location(db, child.id)
        device = child.devices[0] if child.devices else None
        active_zones_count = (
            db.query(SafeZone)
            .filter(SafeZone.child_id == child.id, SafeZone.is_active == True)
            .count()
        )
        unack_alerts_count = (
            db.query(SafetyEvent)
            .filter(SafetyEvent.child_id == child.id, SafetyEvent.is_acknowledged == False)
            .count()
        )
        active_emg_count = (
            db.query(EmergencyAlert)
            .filter(EmergencyAlert.child_id == child.id, EmergencyAlert.status == "active")
            .count()
        )

        loc_data = None
        if latest_loc:
            loc_data = {
                "latitude": latest_loc.latitude,
                "longitude": latest_loc.longitude,
                "accuracy": latest_loc.accuracy,
                "recorded_at": latest_loc.recorded_at.isoformat() if latest_loc.recorded_at else None,
            }

        summaries.append(
            SafetyOverviewSummary(
                child_id=child.id,
                child_name=child.name,
                status=child.current_status,
                is_safe=child.current_status == "safe",
                battery_level=device.battery_level if device else 100,
                last_known_location=loc_data,
                active_safe_zones_count=active_zones_count,
                unacknowledged_alerts_count=unack_alerts_count,
                active_emergency_count=active_emg_count,
                is_device_online=device.is_online if device else True,
            )
        )

    return summaries

@router.post("/separation-check")
def check_separation_distance(
    child_id: str,
    child_lat: float,
    child_lon: float,
    caregiver_lat: float,
    caregiver_lon: float,
    threshold_meters: Optional[float] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Checks proximity between caregiver device and child GPS band.
    """
    result = separation_service.evaluate_separation(
        db=db,
        child_id=child_id,
        child_lat=child_lat,
        child_lon=child_lon,
        caregiver_lat=caregiver_lat,
        caregiver_lon=caregiver_lon,
        custom_threshold_meters=threshold_meters,
        create_event=True,
    )
    return result
