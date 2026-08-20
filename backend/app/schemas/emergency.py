from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

class EmergencyCreate(BaseModel):
    child_id: str
    triggered_by: str = Field("sos_button", example="sos_button")
    severity: str = Field("critical", example="critical")
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)
    address: Optional[str] = None
    message: Optional[str] = "Emergency SOS button pressed!"

class EmergencyResolveRequest(BaseModel):
    status: str = Field("resolved", example="resolved")  # resolved, false_alarm
    resolution_notes: Optional[str] = "Child found safe and sound."

class EmergencyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    child_id: str
    caregiver_id: Optional[str] = None
    status: str
    severity: str
    triggered_by: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    message: Optional[str] = None
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[str] = None
    resolution_notes: Optional[str] = None
    created_at: datetime
