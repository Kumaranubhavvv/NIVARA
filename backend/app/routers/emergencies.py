from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.config.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.child import Child
from app.models.emergency import EmergencyAlert
from app.schemas.emergency import (
    EmergencyCreate,
    EmergencyResolveRequest,
    EmergencyEscalateRequest,
    EmergencyUpdateRequest,
    EmergencyResponse,
    EmergencySummary,
)
from app.services.emergency_service import emergency_service

router = APIRouter(prefix="/emergencies", tags=["Safety - Emergency & SOS"])


@router.post("/sos", response_model=EmergencyResponse, status_code=status.HTTP_201_CREATED)
def trigger_sos_alert(
    data: EmergencyCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Trigger critical SOS alert.
    Immediately updates child state machine to 'emergency', logs an immutable SafetyEvent audit record,
    and executes multi-channel priority notifications (SMS, Voice Calls, Push) to emergency contacts.
    """
    caregiver_id = current_user.id if current_user else None
    try:
        res = emergency_service.trigger_emergency(db, data, caregiver_id=caregiver_id)
        emergency_obj = res["emergency"]
        child_name = res.get("child_name")

        # Map to response schema
        response = EmergencyResponse.model_validate(emergency_obj)
        response.child_name = child_name
        response.is_active = emergency_obj.is_active
        return response
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/active", response_model=List[EmergencyResponse])
def get_active_emergencies(
    child_id: Optional[str] = Query(None, description="Filter active emergencies for a specific child"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    List all currently active emergency alerts scoped to the authenticated caregiver or child.
    """
    caregiver_id = current_user.id if current_user else None
    emergencies = emergency_service.get_active_emergencies(
        db, caregiver_id=caregiver_id, child_id=child_id, limit=limit
    )

    results = []
    for emg in emergencies:
        resp = EmergencyResponse.model_validate(emg)
        resp.is_active = emg.is_active
        if emg.child:
            resp.child_name = emg.child.name
        results.append(resp)

    return results


@router.get("/history", response_model=List[EmergencyResponse])
def get_emergency_history(
    child_id: Optional[str] = Query(None, description="Filter history by child ID"),
    status: Optional[str] = Query(None, description="Filter by status ('active', 'resolved', 'false_alarm')"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Query chronological history of all emergency alerts with status and child filtering.
    """
    caregiver_id = current_user.id if current_user else None
    emergencies = emergency_service.get_emergency_history(
        db, caregiver_id=caregiver_id, child_id=child_id, status=status, limit=limit
    )

    results = []
    for emg in emergencies:
        resp = EmergencyResponse.model_validate(emg)
        resp.is_active = emg.is_active
        if emg.child:
            resp.child_name = emg.child.name
        results.append(resp)

    return results


@router.get("/stats")
def get_emergency_statistics(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Get aggregated emergency statistics (total, active, resolved, false alarms) for dashboard metrics.
    """
    caregiver_id = current_user.id if current_user else None
    stats = emergency_service.get_emergency_summary_stats(db, caregiver_id=caregiver_id)
    return stats


@router.get("/{emergency_id}", response_model=EmergencyResponse)
def get_emergency_detail(
    emergency_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Get detailed emergency alert record, coordinates, active duration, and resolution audit notes.
    """
    detail = emergency_service.get_emergency_by_id(db, emergency_id)
    if not detail:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Emergency record not found.")
    return EmergencyResponse(**detail)


@router.post("/{emergency_id}/resolve", response_model=EmergencyResponse)
def resolve_emergency(
    emergency_id: str,
    data: EmergencyResolveRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Resolve an active emergency alert or mark it as a false alarm.
    Audits resolution notes, captures resolver identity, and resets child status to 'safe' if no other alerts exist.
    """
    user_id = current_user.id if current_user else (data.resolved_by or "caregiver")
    resolved = emergency_service.resolve_emergency(
        db,
        emergency_id=emergency_id,
        resolve_in=data,
        resolved_by_user_id=user_id,
    )
    if not resolved:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Emergency not found.")

    resp = EmergencyResponse.model_validate(resolved)
    resp.is_active = resolved.is_active
    if resolved.child:
        resp.child_name = resolved.child.name
    return resp


@router.post("/{emergency_id}/escalate", response_model=EmergencyResponse)
def escalate_emergency(
    emergency_id: str,
    data: EmergencyEscalateRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Escalate an active emergency alert to a higher severity level (e.g. medium -> critical).
    """
    user_id = current_user.id if current_user else None
    escalated = emergency_service.escalate_emergency(
        db,
        emergency_id=emergency_id,
        escalate_in=data,
        escalated_by=user_id,
    )
    if not escalated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Emergency not found.")

    resp = EmergencyResponse.model_validate(escalated)
    resp.is_active = escalated.is_active
    if escalated.child:
        resp.child_name = escalated.child.name
    return resp


@router.put("/{emergency_id}", response_model=EmergencyResponse)
def update_emergency(
    emergency_id: str,
    data: EmergencyUpdateRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Update context or coordinates for an active emergency alert.
    """
    updated = emergency_service.update_emergency(db, emergency_id, data)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Emergency not found.")

    resp = EmergencyResponse.model_validate(updated)
    resp.is_active = updated.is_active
    if updated.child:
        resp.child_name = updated.child.name
    return resp
