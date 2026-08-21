from pydantic import BaseModel, Field, field_validator, model_validator, ConfigDict
from typing import Optional, List, Literal
from datetime import datetime


# ─────────────────────────────────────────────────────────────
# Constants — mirror EmergencyAlert ORM model constants
# ─────────────────────────────────────────────────────────────

EMERGENCY_STATUSES = Literal["active", "resolved", "false_alarm"]
EMERGENCY_SEVERITIES = Literal["critical", "high", "medium"]
EMERGENCY_TRIGGERS = Literal["sos_button", "geofence_breach", "separation", "caregiver_app"]


# ─────────────────────────────────────────────────────────────
# Input Schemas
# ─────────────────────────────────────────────────────────────

class EmergencyCreate(BaseModel):
    """
    Schema for triggering a new emergency alert.
    Used by the SOS button, geofence breach service, and separation detection service.
    """
    child_id: str = Field(..., description="ID of the child in distress")
    caregiver_id: Optional[str] = Field(None, description="Caregiver who triggered the alert (if via app)")
    triggered_by: EMERGENCY_TRIGGERS = Field("sos_button", description="Source that triggered this alert")
    severity: EMERGENCY_SEVERITIES = Field("critical", description="Alert severity level")

    # Location context at time of trigger
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0, description="Child's latitude at trigger time")
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0, description="Child's longitude at trigger time")
    address: Optional[str] = Field(None, max_length=512, description="Reverse-geocoded address at trigger")

    # Message payload
    message: Optional[str] = Field(
        "Emergency SOS button pressed!",
        max_length=1000,
        description="Human-readable description of the emergency"
    )

    @field_validator("message")
    @classmethod
    def strip_message(cls, v: Optional[str]) -> Optional[str]:
        return v.strip() if v else v


class EmergencyResolveRequest(BaseModel):
    """
    Schema for resolving or marking an emergency alert as a false alarm.
    Must be submitted by an authenticated caregiver.
    """
    status: Literal["resolved", "false_alarm"] = Field(
        "resolved",
        description="Terminal status for this emergency — 'resolved' (child found safe) or 'false_alarm'"
    )
    resolved_by: Optional[str] = Field(None, description="User ID of the caregiver resolving this alert")
    resolution_notes: Optional[str] = Field(
        None,
        max_length=2000,
        description="Free-text notes explaining how the emergency was resolved"
    )

    @field_validator("resolution_notes")
    @classmethod
    def strip_notes(cls, v: Optional[str]) -> Optional[str]:
        return v.strip() if v else v


class EmergencyEscalateRequest(BaseModel):
    """
    Schema for escalating an emergency to a higher severity level
    (e.g., upgrading from 'high' to 'critical' if the situation worsens).
    """
    new_severity: EMERGENCY_SEVERITIES = Field(..., description="Upgraded severity level")
    escalation_reason: Optional[str] = Field(None, max_length=500, description="Reason for escalation")
    notify_emergency_services: bool = Field(
        False, description="Whether to dispatch to external emergency services (future integration)"
    )


class EmergencyUpdateRequest(BaseModel):
    """
    Schema for partial update of a non-resolved emergency
    (e.g., correcting location or updating the message).
    """
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)
    address: Optional[str] = Field(None, max_length=512)
    message: Optional[str] = Field(None, max_length=1000)
    severity: Optional[EMERGENCY_SEVERITIES] = None


class ActiveEmergencyQuery(BaseModel):
    """
    Query filter for fetching active emergencies across children.
    """
    child_id: Optional[str] = Field(None, description="Filter by specific child")
    caregiver_id: Optional[str] = Field(None, description="Filter by caregiver who triggered")
    severity: Optional[EMERGENCY_SEVERITIES] = Field(None, description="Filter by severity level")
    triggered_by: Optional[EMERGENCY_TRIGGERS] = Field(None, description="Filter by trigger type")
    limit: int = Field(50, ge=1, le=200)


# ─────────────────────────────────────────────────────────────
# Output Schemas
# ─────────────────────────────────────────────────────────────

class EmergencyResponse(BaseModel):
    """
    Full serialisation of an emergency alert record.
    Supports ORM-mode loading from the EmergencyAlert SQLAlchemy model.
    """
    model_config = ConfigDict(from_attributes=True)

    id: str
    child_id: str
    caregiver_id: Optional[str] = None

    # Classification
    status: str
    severity: str
    triggered_by: str

    # Derived flags
    is_active: bool = False

    # Location
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    message: Optional[str] = None

    # Resolution audit
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[str] = None
    resolution_notes: Optional[str] = None

    # Timestamps
    created_at: datetime

    # Enrichment (populated by service layer, not ORM)
    child_name: Optional[str] = None
    duration_seconds: Optional[float] = None   # seconds from created_at → resolved_at or now
    contacts_notified: int = 0                 # number of emergency contacts dispatched


class EmergencySummary(BaseModel):
    """
    Condensed emergency snapshot for dashboard badges and list views.
    """
    id: str
    child_id: str
    child_name: Optional[str] = None
    status: str
    severity: str
    triggered_by: str
    is_active: bool
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at: datetime
    duration_seconds: Optional[float] = None


class EmergencyListResponse(BaseModel):
    """
    Paginated list of emergency alerts.
    """
    total: int
    active_count: int = 0
    limit: int
    emergencies: List[EmergencyResponse]


class EmergencyDispatchStatus(BaseModel):
    """
    Result of a multi-channel dispatch after an emergency is triggered.
    Reports which emergency contacts were reached and via what channels.
    """
    emergency_id: str
    child_id: str
    total_contacts: int
    contacts_reached: int
    contacts_failed: int
    channels_used: List[str] = []    # ["sms", "push", "email", "call"]
    dispatch_errors: List[str] = []  # human-readable error descriptions
    dispatched_at: datetime

