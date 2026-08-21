from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime, timezone
from app.config.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.child import Child
from app.models.safe_zone import SafeZone
from app.schemas.geofence import (
    GeofenceEvaluateRequest,
    GeofenceBatchEvaluateRequest,
    GeofenceEvaluationResponse,
    GeofenceBatchEvaluationResponse,
    GeofenceBatchEvaluationResult,
    GeofenceOverviewResponse,
    GeofenceBoundaryDistanceResponse,
    GeofenceChildStatusSummary,
    GeofenceCaregiverStatusResponse,
    ZoneContainmentDetail,
)
from app.services.geofence_service import geofence_service
from app.utils.validators import validate_coordinates

router = APIRouter(prefix="/geofence", tags=["Safety - Geofencing"])


# ─────────────────────────────────────────────────────────────
# POST /geofence/evaluate
# ─────────────────────────────────────────────────────────────

@router.post("/evaluate", response_model=GeofenceEvaluationResponse)
def evaluate_location(
    data: GeofenceEvaluateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Evaluate a GPS coordinate against all active safe zones for a child.

    - **Full state machine evaluation**: Updates child status (safe ↔ out_of_bounds).
    - **SafetyEvent logging**: Logs `GEOFENCE_EXIT` or `GEOFENCE_ENTRY` events on status transitions.
    - **Multi-channel alert dispatch**: Triggers emergency notifications on boundary breach.
    - Set `create_events=false` to perform a dry-run without any side effects.
    """
    valid, msg = validate_coordinates(data.latitude, data.longitude)
    if not valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)

    result = geofence_service.evaluate_location_against_safe_zones(
        db=db,
        child_id=data.child_id,
        lat=data.latitude,
        lon=data.longitude,
        create_events=data.create_events,
    )

    if "error" in result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=result["error"])

    return GeofenceEvaluationResponse(**result)


# ─────────────────────────────────────────────────────────────
# POST /geofence/check
# ─────────────────────────────────────────────────────────────

@router.post("/check", response_model=GeofenceEvaluationResponse)
def check_point_containment(
    data: GeofenceEvaluateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    On-demand read-only containment check.

    Identical to `/evaluate` but **never** mutates child state, logs events,
    or dispatches notifications. Safe to call as frequently as needed
    (e.g., live map preview, route simulation).
    """
    valid, msg = validate_coordinates(data.latitude, data.longitude)
    if not valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)

    result = geofence_service.check_point_containment(
        db=db,
        child_id=data.child_id,
        lat=data.latitude,
        lon=data.longitude,
    )

    if "error" in result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=result["error"])

    return GeofenceEvaluationResponse(**result)


# ─────────────────────────────────────────────────────────────
# POST /geofence/batch-evaluate
# ─────────────────────────────────────────────────────────────

@router.post("/batch-evaluate", response_model=GeofenceBatchEvaluationResponse)
def batch_evaluate_location(
    data: GeofenceBatchEvaluateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Batch evaluate a single GPS coordinate against multiple children simultaneously.

    Useful for group-monitoring scenarios such as school pickups, theme parks,
    or any situation where a caregiver is tracking several children at once.
    Events are suppressed by default (`create_events=false`).
    """
    valid, msg = validate_coordinates(data.latitude, data.longitude)
    if not valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)

    results: List[GeofenceBatchEvaluationResult] = []
    children_inside = 0
    children_outside = 0

    for child_id in data.child_ids:
        raw = geofence_service.evaluate_location_against_safe_zones(
            db=db,
            child_id=child_id,
            lat=data.latitude,
            lon=data.longitude,
            create_events=data.create_events,
        )

        if "error" in raw:
            results.append(
                GeofenceBatchEvaluationResult(
                    child_id=child_id,
                    is_inside_safe_zone=False,
                    status="unknown",
                    error=raw["error"],
                )
            )
            continue

        if raw.get("is_inside_safe_zone"):
            children_inside += 1
        else:
            children_outside += 1

        results.append(
            GeofenceBatchEvaluationResult(
                child_id=child_id,
                is_inside_safe_zone=raw.get("is_inside_safe_zone", False),
                status=raw.get("status", "unknown"),
                active_zone_name=raw.get("active_zone_name"),
                nearest_zone_name=raw.get("nearest_zone_name"),
                nearest_zone_distance_meters=raw.get("nearest_zone_distance_meters"),
                exit_alert_triggered=raw.get("exit_alert_triggered", False),
            )
        )

    return GeofenceBatchEvaluationResponse(
        latitude=data.latitude,
        longitude=data.longitude,
        total_evaluated=len(data.child_ids),
        children_inside=children_inside,
        children_outside=children_outside,
        results=results,
    )


# ─────────────────────────────────────────────────────────────
# GET /geofence/overview/{child_id}
# ─────────────────────────────────────────────────────────────

@router.get("/overview/{child_id}", response_model=GeofenceOverviewResponse)
def get_child_geofence_overview(
    child_id: str,
    current_lat: Optional[float] = Query(None, ge=-90.0, le=90.0, description="Child's current latitude"),
    current_lon: Optional[float] = Query(None, ge=-180.0, le=180.0, description="Child's current longitude"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve the full geofence status snapshot across all active zones for a child.

    - If `current_lat` and `current_lon` are provided, each zone's `is_inside`
      and distance fields are populated.
    - Omit coordinates to get a zone list without containment calculations.
    """
    raw = geofence_service.get_child_geofence_overview(
        db=db,
        child_id=child_id,
        current_lat=current_lat,
        current_lon=current_lon,
    )

    if "error" in raw:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=raw["error"])

    zone_details = [
        ZoneContainmentDetail(
            zone_id=z["zone_id"],
            zone_name=z["zone_name"],
            zone_type=z["zone_type"],
            is_inside=z["is_inside"],
            distance_to_center_meters=z.get("distance_to_center_meters"),
            distance_to_boundary_meters=z.get("distance_to_boundary_meters"),
        )
        for z in raw.get("zone_details", [])
    ]

    return GeofenceOverviewResponse(
        child_id=raw["child_id"],
        child_name=raw.get("child_name"),
        total_active_zones=raw["total_active_zones"],
        zones_inside=raw.get("zones_inside", []),
        zones_outside=raw.get("zones_outside", []),
        zone_details=zone_details,
    )


# ─────────────────────────────────────────────────────────────
# GET /geofence/distance/{zone_id}
# ─────────────────────────────────────────────────────────────

@router.get("/distance/{zone_id}", response_model=GeofenceBoundaryDistanceResponse)
def get_boundary_distance(
    zone_id: str,
    latitude: float = Query(..., ge=-90.0, le=90.0, description="GPS latitude"),
    longitude: float = Query(..., ge=-180.0, le=180.0, description="GPS longitude"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Calculate the signed distance from a GPS point to a specific safe zone boundary.

    - **Positive value** → point is **outside** the boundary.
    - **Negative value** → point is **inside** the boundary.

    Useful for proximity warnings (e.g., "85 m until leaving safe zone").
    """
    valid, msg = validate_coordinates(latitude, longitude)
    if not valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)

    zone = db.query(SafeZone).filter(SafeZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Safe zone not found.")

    inside, dist_to_center = geofence_service.is_inside_safe_zone(latitude, longitude, zone)
    dist_to_boundary = geofence_service.calculate_distance_to_boundary(latitude, longitude, zone)

    return GeofenceBoundaryDistanceResponse(
        zone_id=zone.id,
        zone_name=zone.name,
        zone_type=zone.zone_type,
        latitude=latitude,
        longitude=longitude,
        distance_to_center_meters=round(dist_to_center, 2),
        distance_to_boundary_meters=round(dist_to_boundary, 2),
        is_inside=inside,
    )


# ─────────────────────────────────────────────────────────────
# GET /geofence/caregiver-status
# ─────────────────────────────────────────────────────────────

@router.get("/caregiver-status", response_model=GeofenceCaregiverStatusResponse)
def get_caregiver_geofence_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Aggregated real-time geofence safety status for all children linked to the authenticated caregiver.

    Returns a dashboard-ready summary: how many children are safe, out of bounds,
    or in emergency, along with per-child status cards.
    """
    children: List[Child] = (
        db.query(Child).filter(Child.caregiver_id == current_user.id).all()
    )

    children_safe = 0
    children_out_of_bounds = 0
    children_emergency = 0
    summaries = []

    for child in children:
        status_val = child.current_status or "unknown"

        if status_val == Child.STATUS_SAFE:
            children_safe += 1
        elif status_val == Child.STATUS_OUT_OF_BOUNDS:
            children_out_of_bounds += 1
        elif status_val == Child.STATUS_EMERGENCY:
            children_emergency += 1

        # Use latest location to compute zone distances if available
        nearest_zone_name = None
        nearest_zone_dist = None
        active_zone_name = None
        is_inside = status_val == Child.STATUS_SAFE

        # Quick nearest-zone lookup using stored child data (no live eval)
        zones: List[SafeZone] = (
            db.query(SafeZone)
            .filter(SafeZone.child_id == child.id, SafeZone.is_active == True)
            .all()
        )

        summaries.append(
            GeofenceChildStatusSummary(
                child_id=child.id,
                child_name=child.name,
                current_status=status_val,
                is_inside_safe_zone=is_inside,
                active_zone_name=active_zone_name,
                nearest_zone_name=nearest_zone_name,
                nearest_zone_distance_meters=nearest_zone_dist,
                last_evaluated_at=None,
            )
        )

    return GeofenceCaregiverStatusResponse(
        caregiver_id=current_user.id,
        total_children=len(children),
        children_safe=children_safe,
        children_out_of_bounds=children_out_of_bounds,
        children_emergency=children_emergency,
        children=summaries,
    )
