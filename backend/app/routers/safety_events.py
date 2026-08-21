import json
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from app.config.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.child import Child
from app.models.safety_event import SafetyEvent
from app.schemas.safety_event import (
    SafetyEventCreate,
    SafetyEventAcknowledge,
    SafetyEventBulkAcknowledge,
    SafetyEventResponse,
    SafetyEventFeedResponse,
    SafetyEventBulkAckResponse,
)

router = APIRouter(prefix="/safety-events", tags=["Safety - Audit & Event Logs"])


@router.post("/", response_model=SafetyEventResponse, status_code=status.HTTP_201_CREATED)
def create_safety_event(
    data: SafetyEventCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Log a new safety event into the immutable audit trail.
    Automatically serializes event metadata into JSON.
    """
    child = db.query(Child).filter(Child.id == data.child_id).first()
    if not child:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Child not found.")

    metadata_str = json.dumps(data.metadata) if data.metadata else None

    event = SafetyEvent(
        child_id=data.child_id,
        event_type=data.event_type,
        severity=data.severity or "warning",
        title=data.title,
        description=data.description,
        latitude=data.latitude,
        longitude=data.longitude,
        metadata_json=metadata_str,
        created_at=datetime.now(timezone.utc),
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    resp = SafetyEventResponse.model_validate(event)
    resp.is_critical = event.is_critical
    resp.child_name = child.name
    return resp


@router.get("/", response_model=List[SafetyEventResponse])
def list_safety_events(
    child_id: Optional[str] = Query(None, description="Filter events for a specific child"),
    event_type: Optional[str] = Query(None, description="Filter by event type (geofence_exit, separation_alert, sos_triggered, low_battery, etc.)"),
    severity: Optional[str] = Query(None, description="Filter by severity (info, warning, critical)"),
    is_acknowledged: Optional[bool] = Query(None, description="Filter by acknowledgment state"),
    start_time: Optional[datetime] = Query(None, description="UTC start of time window"),
    end_time: Optional[datetime] = Query(None, description="UTC end of time window"),
    limit: int = Query(50, ge=1, le=500, description="Max records to return"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    List safety and security events (breaches, separation alerts, SOS panic triggers, low battery).
    Caregivers see events for all of their children by default unless scoped by child_id.
    """
    query = db.query(SafetyEvent)

    if child_id:
        query = query.filter(SafetyEvent.child_id == child_id)
    elif current_user and current_user.children:
        user_child_ids = [c.id for c in current_user.children]
        query = query.filter(SafetyEvent.child_id.in_(user_child_ids))

    if event_type:
        query = query.filter(SafetyEvent.event_type == event_type)
    if severity:
        query = query.filter(SafetyEvent.severity == severity)
    if is_acknowledged is not None:
        query = query.filter(SafetyEvent.is_acknowledged == is_acknowledged)
    if start_time:
        query = query.filter(SafetyEvent.created_at >= start_time)
    if end_time:
        query = query.filter(SafetyEvent.created_at <= end_time)

    events = query.order_by(SafetyEvent.created_at.desc()).limit(limit).all()

    results = []
    for ev in events:
        resp = SafetyEventResponse.model_validate(ev)
        resp.is_critical = ev.is_critical
        if ev.child:
            resp.child_name = ev.child.name
        results.append(resp)

    return results


@router.get("/{event_id}", response_model=SafetyEventResponse)
def get_safety_event(
    event_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Get full details for a single safety event including parsed metadata payload.
    """
    event = db.query(SafetyEvent).filter(SafetyEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Safety event not found.")

    resp = SafetyEventResponse.model_validate(event)
    resp.is_critical = event.is_critical
    if event.child:
        resp.child_name = event.child.name
    return resp


@router.post("/{event_id}/acknowledge", response_model=SafetyEventResponse)
def acknowledge_safety_event(
    event_id: str,
    data: Optional[SafetyEventAcknowledge] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Mark a safety alert or event as acknowledged by the caregiver.
    """
    event = db.query(SafetyEvent).filter(SafetyEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Safety event not found.")

    user_id = (current_user.id if current_user else None) or (data.acknowledged_by if data else None) or "caregiver"
    event.acknowledge(user_id)
    db.commit()
    db.refresh(event)

    resp = SafetyEventResponse.model_validate(event)
    resp.is_critical = event.is_critical
    if event.child:
        resp.child_name = event.child.name
    return resp


@router.post("/bulk-acknowledge", response_model=SafetyEventBulkAckResponse)
def bulk_acknowledge_safety_events(
    data: SafetyEventBulkAcknowledge,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Bulk-acknowledge up to 100 safety events in a single batch.
    """
    user_id = (current_user.id if current_user else None) or data.acknowledged_by or "caregiver"
    events = db.query(SafetyEvent).filter(SafetyEvent.id.in_(data.event_ids)).all()

    found_ids = {e.id for e in events}
    not_found_count = len(set(data.event_ids) - found_ids)

    ack_ids = []
    skipped_count = 0

    for ev in events:
        if ev.is_acknowledged:
            skipped_count += 1
        else:
            ev.acknowledge(user_id)
            ack_ids.append(ev.id)

    db.commit()

    return SafetyEventBulkAckResponse(
        acknowledged=len(ack_ids),
        skipped=skipped_count,
        not_found=not_found_count,
        event_ids=ack_ids,
    )


@router.get("/child/{child_id}/feed", response_model=SafetyEventFeedResponse)
def get_child_safety_feed(
    child_id: str,
    limit: int = Query(50, ge=1, le=200),
    unacknowledged_only: bool = Query(False, description="If True, only return unacknowledged events"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Paginated safety event feed for a single child, including total unacknowledged count for badges.
    """
    child = db.query(Child).filter(Child.id == child_id).first()
    if not child:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Child not found.")

    query = db.query(SafetyEvent).filter(SafetyEvent.child_id == child_id)
    if unacknowledged_only:
        query = query.filter(SafetyEvent.is_acknowledged == False)

    total = query.count()
    unacked_count = (
        db.query(SafetyEvent)
        .filter(SafetyEvent.child_id == child_id, SafetyEvent.is_acknowledged == False)
        .count()
    )

    events = query.order_by(SafetyEvent.created_at.desc()).limit(limit).all()

    items = []
    for ev in events:
        resp = SafetyEventResponse.model_validate(ev)
        resp.is_critical = ev.is_critical
        resp.child_name = child.name
        items.append(resp)

    return SafetyEventFeedResponse(
        child_id=child_id,
        total=total,
        unacknowledged_count=unacked_count,
        limit=limit,
        events=items,
    )


@router.delete("/{event_id}", status_code=status.HTTP_200_OK)
def delete_safety_event(
    event_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Delete a safety event record (for admin/audit maintenance).
    """
    event = db.query(SafetyEvent).filter(SafetyEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Safety event not found.")

    db.delete(event)
    db.commit()
    return {"message": "Safety event deleted successfully", "id": event_id}
