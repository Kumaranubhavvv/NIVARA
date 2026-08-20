from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

class EmergencyContactCreate(BaseModel):
    child_id: Optional[str] = None
    name: str = Field(..., example="Dr. Emily Watson", min_length=2)
    relationship_type: str = Field("Therapist", example="Mother")
    phone_number: str = Field(..., example="+1-555-0199")
    email: Optional[str] = None
    priority_order: int = Field(1, ge=1, le=10)
    notify_via_sms: bool = True
    notify_via_call: bool = True
    notify_via_push: bool = True

class EmergencyContactUpdate(BaseModel):
    name: Optional[str] = None
    relationship_type: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[str] = None
    priority_order: Optional[int] = None
    notify_via_sms: Optional[bool] = None
    notify_via_call: Optional[bool] = None
    notify_via_push: Optional[bool] = None

class EmergencyContactResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    child_id: Optional[str] = None
    name: str
    relationship_type: str
    phone_number: str
    email: Optional[str] = None
    priority_order: int
    notify_via_sms: bool
    notify_via_call: bool
    notify_via_push: bool
    created_at: datetime
