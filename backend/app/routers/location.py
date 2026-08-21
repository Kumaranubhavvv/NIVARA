from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from app.config.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.child import Child
from app.models.location import Location
from app.schemas.location import (
    LocationCreate,
    LocationUpdate,
    BulkLocationCreate,
    LocationResponse,
    CurrentLocationResponse,
    RoutePlaybackResponse,
    LocationBulkResponse,
)
from app.services.location_service import location_service
from app.services.geofence_service import geofence_service

router = APIRouter(prefix="/locations", tags=["Safety - Location Tracking"])


@router.post("/", response_model=LocationResponse, status_code=status.HTTP_201_CREATED)
def record_child_location(
    data: LocationCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Log a new GPS coordinate ping for a child. Automatically checks geofence boundaries
    and triggers speed/battery anomaly safety events if thresholds are exceeded.
    """
    try:
        res = location_service.record_location(db, data, evaluate_geofence=True)
        return res["location"]
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/bulk", response_model=LocationBulkResponse, status_code=status.HTTP_201_CREATED)
def record_bulk_locations(
    data: BulkLocationCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Batch ingestion of location pings (e.g., offline store-and-forward sync from GPS wearable).
    Processes up to 500 coordinates in chronological order.
    """
    try:
        result = location_service.record_bulk_locations(db, data, evaluate_last=True)
        return LocationBulkResponse(
            accepted=result["accepted"],
            rejected=result["rejected"],
            errors=result["errors"],
            triggered_events=result["triggered_events"]
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/current/{child_id}", response_model=CurrentLocationResponse)
def get_child_current_location(
    child_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Fetch the most up-to-date position, safety perimeter status, active safe zone,
    battery percentage, and hardware connectivity state for a child.
    """
    child = db.query(Child).filter(Child.id == child_id).first()
    if not child:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Child not found.")

    latest = location_service.get_latest_location(db, child_id)
    if not latest:
        return CurrentLocationResponse(
            child_id=child.id,
            child_name=child.name,
            avatar_url=child.avatar_url,
            current_location=None,
            is_safe=True,
            active_zone_name=None,
            is_device_online=False,
            last_updated=None,
        )

    geofence_eval = geofence_service.evaluate_location_against_safe_zones(
        db, child_id, latest.latitude, latest.longitude, create_events=False
    )

    device = child.devices[0] if child.devices else None

    return CurrentLocationResponse(
        child_id=child.id,
        child_name=child.name,
        avatar_url=child.avatar_url,
        current_location=LocationResponse.model_validate(latest),
        is_safe=geofence_eval.get("is_inside_safe_zone", True),
        active_zone_name=geofence_eval.get("active_zone_name"),
        zone_type=geofence_eval.get("zone_type"),
        distance_to_zone_boundary_m=geofence_eval.get("distance_to_boundary_meters"),
        battery_percentage=device.battery_level if device else (int(latest.battery_level) if latest.battery_level is not None else None),
        battery_is_low=device.is_low_battery if device else False,
        is_device_online=device.is_online if device else True,
        device_last_seen=device.last_ping_at if device else None,
        last_updated=latest.created_at,
    )


@router.get("/history/{child_id}", response_model=List[LocationResponse])
def get_child_location_history(
    child_id: str,
    start_time: Optional[datetime] = Query(None, description="Filter records on or after UTC datetime"),
    end_time: Optional[datetime] = Query(None, description="Filter records on or before UTC datetime"),
    limit: int = Query(100, ge=1, le=1000, description="Max number of coordinates to return"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Retrieve historical GPS breadcrumbs for breadcrumb visualization and route analysis.
    Ordered newest first.
    """
    child = db.query(Child).filter(Child.id == child_id).first()
    if not child:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Child not found.")

    history = location_service.get_location_history(
        db, child_id=child_id, start_time=start_time, end_time=end_time, limit=limit
    )
    return history


@router.get("/playback/{child_id}", response_model=RoutePlaybackResponse)
def get_child_route_playback(
    child_id: str,
    start_time: Optional[datetime] = Query(None, description="Start timestamp of route window"),
    end_time: Optional[datetime] = Query(None, description="End timestamp of route window"),
    limit: int = Query(500, ge=1, le=2000, description="Max route waypoints"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Retrieve an ordered sequential trail of GPS waypoints with cumulative distance (km)
    for animated route playback and path visualization.
    """
    child = db.query(Child).filter(Child.id == child_id).first()
    if not child:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Child not found.")

    playback = location_service.get_route_playback(
        db, child_id=child_id, start_time=start_time, end_time=end_time, limit=limit
    )
    return RoutePlaybackResponse(**playback)


@router.get("/point/{location_id}", response_model=LocationResponse)
def get_location_point(
    location_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Retrieve single GPS location ping details by its ID.
    """
    loc = db.query(Location).filter(Location.id == location_id).first()
    if not loc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Location record not found.")
    return loc


@router.put("/point/{location_id}", response_model=LocationResponse)
def update_location_point(
    location_id: str,
    data: LocationUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Update reverse-geocoded address or refine telemetry for an existing location record.
    """
    loc = db.query(Location).filter(Location.id == location_id).first()
    if not loc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Location record not found.")

    if data.accuracy is not None:
        loc.accuracy = data.accuracy
    if data.altitude is not None:
        loc.altitude = data.altitude
    if data.speed is not None:
        loc.speed = data.speed
    if data.heading is not None:
        loc.heading = data.heading
    if data.battery_level is not None:
        loc.battery_level = data.battery_level
    if data.address is not None:
        loc.address = data.address

    db.commit()
    db.refresh(loc)
    return loc


@router.delete("/history/{child_id}", status_code=status.HTTP_200_OK)
def delete_child_location_history(
    child_id: str,
    before_time: Optional[datetime] = Query(None, description="Delete records older than this UTC datetime. If omitted, all history is deleted."),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Purge historical GPS coordinates for data retention compliance and privacy management.
    """
    child = db.query(Child).filter(Child.id == child_id).first()
    if not child:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Child not found.")

    deleted_count = location_service.delete_location_history(
        db, child_id=child_id, before_time=before_time
    )
    return {
        "message": "Location history deleted successfully",
        "child_id": child_id,
        "deleted_count": deleted_count
    }
