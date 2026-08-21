from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional
from app.config.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.child import Child
from app.schemas.separation import (
    SeparationEvaluateRequest,
    SeparationCheckRequest,
    SeparationEvaluationResponse,
)
from app.services.separation_service import separation_service
from app.utils.validators import validate_coordinates

router = APIRouter(prefix="/separation", tags=["Safety - Separation & Proximity"])


@router.post("/evaluate", response_model=SeparationEvaluationResponse)
def evaluate_separation(
    data: SeparationEvaluateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Evaluates real-time proximity between child and caregiver coordinates.
    Updates child state machine (separation_alert ↔ safe), logs SafetyEvents,
    and dispatches multi-channel alerts upon breach.
    """
    valid_c, msg_c = validate_coordinates(data.child_latitude, data.child_longitude)
    if not valid_c:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid child coordinates: {msg_c}")

    valid_p, msg_p = validate_coordinates(data.caregiver_latitude, data.caregiver_longitude)
    if not valid_p:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid caregiver coordinates: {msg_p}")

    result = separation_service.evaluate_separation(
        db=db,
        child_id=data.child_id,
        child_lat=data.child_latitude,
        child_lon=data.child_longitude,
        caregiver_lat=data.caregiver_latitude,
        caregiver_lon=data.caregiver_longitude,
        custom_threshold_meters=data.custom_threshold_meters,
        caregiver_id=current_user.id,
        create_event=data.create_event,
    )

    if "error" in result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=result["error"])

    return result


@router.post("/check", response_model=SeparationEvaluationResponse)
def check_separation_with_latest_location(
    data: SeparationCheckRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Evaluates proximity using the child's most recent GPS location ping against
    the caregiver's current position. By default, performs a dry-run check without logging events.
    """
    valid, msg = validate_coordinates(data.caregiver_latitude, data.caregiver_longitude)
    if not valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid caregiver coordinates: {msg}")

    result = separation_service.check_child_separation_with_latest_location(
        db=db,
        child_id=data.child_id,
        caregiver_lat=data.caregiver_latitude,
        caregiver_lon=data.caregiver_longitude,
        custom_threshold_meters=data.custom_threshold_meters,
        caregiver_id=current_user.id,
        create_event=data.create_event,
    )

    if "error" in result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=result["error"])

    return result
