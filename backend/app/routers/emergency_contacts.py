from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from app.config.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.child import Child
from app.models.emergency_contact import EmergencyContact
from app.schemas.emergency_contact import (
    EmergencyContactCreate,
    EmergencyContactUpdate,
    EmergencyContactReorderRequest,
    EmergencyContactNotifyToggle,
    EmergencyContactResponse,
    EmergencyContactListResponse,
)
from app.utils.validators import validate_phone_number

router = APIRouter(prefix="/emergency-contacts", tags=["Safety - Emergency Contacts"])


@router.post("/", response_model=EmergencyContactResponse, status_code=status.HTTP_201_CREATED)
def create_emergency_contact(
    data: EmergencyContactCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Add a trusted emergency contact (Family, Doctor, Therapist, Police, Neighbor).
    Validates phone number and ensures at least one notification channel (SMS, Call, Push) is active.
    """
    valid_phone, msg_phone = validate_phone_number(data.phone_number)
    if not valid_phone:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg_phone)

    user_id = (current_user.id if current_user else None) or data.user_id
    if not user_id:
        # Fallback to demo default user if neither is provided
        first_user = db.query(User).first()
        user_id = first_user.id if first_user else "user-default-1"

    if data.child_id:
        child = db.query(Child).filter(Child.id == data.child_id).first()
        if not child:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Child not found.")

    contact = EmergencyContact(
        user_id=user_id,
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


@router.get("/", response_model=List[EmergencyContactResponse])
def list_emergency_contacts(
    child_id: Optional[str] = Query(None, description="Filter contacts scoped to a specific child"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    List all emergency contacts ordered by priority (1 is highest priority).
    """
    query = db.query(EmergencyContact)
    if current_user:
        query = query.filter(EmergencyContact.user_id == current_user.id)

    if child_id:
        query = query.filter((EmergencyContact.child_id == child_id) | (EmergencyContact.child_id.is_(None)))

    contacts = query.order_by(EmergencyContact.priority_order.asc()).all()
    return contacts


@router.get("/{contact_id}", response_model=EmergencyContactResponse)
def get_emergency_contact(
    contact_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Get emergency contact details, priority, and notification channel settings.
    """
    query = db.query(EmergencyContact).filter(EmergencyContact.id == contact_id)
    if current_user:
        query = query.filter(EmergencyContact.user_id == current_user.id)

    contact = query.first()
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Emergency contact not found.")
    return contact


@router.put("/{contact_id}", response_model=EmergencyContactResponse)
def update_emergency_contact(
    contact_id: str,
    data: EmergencyContactUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Update contact identity, phone number, priority order, or notification preferences.
    """
    query = db.query(EmergencyContact).filter(EmergencyContact.id == contact_id)
    if current_user:
        query = query.filter(EmergencyContact.user_id == current_user.id)

    contact = query.first()
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

    # Ensure at least one channel remains active
    if not (contact.notify_via_sms or contact.notify_via_call or contact.notify_via_push):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one notification channel (SMS, Call, or Push) must remain enabled."
        )

    db.commit()
    db.refresh(contact)
    return contact


@router.patch("/{contact_id}/channels", response_model=EmergencyContactResponse)
def toggle_contact_channels(
    contact_id: str,
    data: EmergencyContactNotifyToggle,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Quick-toggle individual notification channels (SMS, Call, Push) for an emergency contact.
    """
    query = db.query(EmergencyContact).filter(EmergencyContact.id == contact_id)
    if current_user:
        query = query.filter(EmergencyContact.user_id == current_user.id)

    contact = query.first()
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Emergency contact not found.")

    if data.notify_via_sms is not None:
        contact.notify_via_sms = data.notify_via_sms
    if data.notify_via_call is not None:
        contact.notify_via_call = data.notify_via_call
    if data.notify_via_push is not None:
        contact.notify_via_push = data.notify_via_push

    if not (contact.notify_via_sms or contact.notify_via_call or contact.notify_via_push):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot disable all channels. At least one notification channel must remain active."
        )

    db.commit()
    db.refresh(contact)
    return contact


@router.post("/reorder", response_model=List[EmergencyContactResponse])
def reorder_emergency_contacts(
    data: EmergencyContactReorderRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Bulk reorder the priority order of emergency contacts in a single call.
    """
    updated_contacts = []
    for item in data.reorder:
        query = db.query(EmergencyContact).filter(EmergencyContact.id == item.contact_id)
        if current_user:
            query = query.filter(EmergencyContact.user_id == current_user.id)
        contact = query.first()
        if contact:
            contact.priority_order = item.priority_order
            updated_contacts.append(contact)

    db.commit()
    for c in updated_contacts:
        db.refresh(c)

    return sorted(updated_contacts, key=lambda x: x.priority_order)


@router.delete("/{contact_id}", status_code=status.HTTP_200_OK)
def delete_emergency_contact(
    contact_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Remove an emergency contact.
    """
    query = db.query(EmergencyContact).filter(EmergencyContact.id == contact_id)
    if current_user:
        query = query.filter(EmergencyContact.user_id == current_user.id)

    contact = query.first()
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Emergency contact not found.")

    db.delete(contact)
    db.commit()
    return {"message": "Emergency contact deleted successfully", "id": contact_id}
