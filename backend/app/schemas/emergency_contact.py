from pydantic import BaseModel, Field, field_validator, model_validator, EmailStr, ConfigDict
from typing import Optional, List, Literal
from datetime import datetime
import re


# ─────────────────────────────────────────────────────────────
# Constants — mirror EmergencyContact ORM model constants
# ─────────────────────────────────────────────────────────────

RELATIONSHIP_TYPES = Literal[
    "Mother", "Father", "Grandparent", "Doctor",
    "Therapist", "Police", "Family", "Other"
]

# E.164 international phone format pattern
_PHONE_RE = re.compile(r"^\+?[0-9]{4,15}$")


# ─────────────────────────────────────────────────────────────
# Input Schemas
# ─────────────────────────────────────────────────────────────

class EmergencyContactCreate(BaseModel):
    """
    Schema for registering a new emergency contact for a caregiver or child.
    At least one notification channel (SMS, Call, Push) must remain enabled.
    """
    user_id: Optional[str] = Field(None, description="Caregiver user ID (set server-side from JWT if not provided)")
    child_id: Optional[str] = Field(None, description="Optional: scope this contact to a specific child")

    # Identity
    name: str = Field(..., min_length=2, max_length=128, description="Full name of the contact", examples=["Dr. Emily Watson"])
    relationship_type: str = Field("Family", description="Relationship to the child")

    # Reach details
    phone_number: str = Field(..., description="Phone number in E.164 or local format", examples=["+1-555-0199"])
    email: Optional[EmailStr] = Field(None, description="Contact's email address (optional)")

    # Priority (1 = first to be called)
    priority_order: int = Field(1, ge=1, le=10, description="Alert dispatch priority — 1 is highest")

    # Notification channels
    notify_via_sms: bool = Field(True, description="Receive SMS alerts")
    notify_via_call: bool = Field(True, description="Receive voice call alerts")
    notify_via_push: bool = Field(True, description="Receive in-app push notifications")

    @field_validator("name")
    @classmethod
    def strip_name(cls, v: str) -> str:
        return v.strip()

    @field_validator("phone_number")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        """Normalise phone — strip spaces/dashes, then validate E.164-ish format."""
        normalised = re.sub(r"[\s\-\(\)]", "", v)
        if not _PHONE_RE.match(normalised):
            raise ValueError("phone_number must be a valid international number (e.g. +15550199 or 07700900123)")
        return normalised

    @model_validator(mode="after")
    def at_least_one_channel(self) -> "EmergencyContactCreate":
        """Ensures at least one notification channel is active."""
        if not any([self.notify_via_sms, self.notify_via_call, self.notify_via_push]):
            raise ValueError("At least one notification channel (SMS, Call, or Push) must be enabled")
        return self


class EmergencyContactUpdate(BaseModel):
    """
    Schema for partially updating an emergency contact.
    All fields optional; channel constraint is re-validated if any channel field changes.
    """
    name: Optional[str] = Field(None, min_length=2, max_length=128)
    relationship_type: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[EmailStr] = None
    priority_order: Optional[int] = Field(None, ge=1, le=10)
    notify_via_sms: Optional[bool] = None
    notify_via_call: Optional[bool] = None
    notify_via_push: Optional[bool] = None

    @field_validator("phone_number")
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        normalised = re.sub(r"[\s\-\(\)]", "", v)
        if not _PHONE_RE.match(normalised):
            raise ValueError("phone_number must be a valid international number")
        return normalised

    @field_validator("name")
    @classmethod
    def strip_name(cls, v: Optional[str]) -> Optional[str]:
        return v.strip() if v else v


class EmergencyContactReorderRequest(BaseModel):
    """
    Schema for bulk-reordering multiple emergency contacts in a single call.
    Sends a list of {contact_id, priority_order} pairs.
    """
    class PriorityItem(BaseModel):
        contact_id: str
        priority_order: int = Field(..., ge=1, le=10)

    reorder: List[PriorityItem] = Field(..., min_length=1, description="Ordered list of contacts with new priorities")

    @model_validator(mode="after")
    def unique_priorities(self) -> "EmergencyContactReorderRequest":
        """Priorities must be unique across the reorder batch."""
        priorities = [item.priority_order for item in self.reorder]
        if len(priorities) != len(set(priorities)):
            raise ValueError("priority_order values must be unique within a reorder batch")
        return self


class EmergencyContactNotifyToggle(BaseModel):
    """
    Quick-toggle schema for enabling/disabling individual notification channels
    without performing a full PATCH.
    """
    notify_via_sms: Optional[bool] = None
    notify_via_call: Optional[bool] = None
    notify_via_push: Optional[bool] = None

    @model_validator(mode="after")
    def at_least_one_field(self) -> "EmergencyContactNotifyToggle":
        if all(v is None for v in [self.notify_via_sms, self.notify_via_call, self.notify_via_push]):
            raise ValueError("At least one channel toggle must be provided")
        return self


# ─────────────────────────────────────────────────────────────
# Output Schemas
# ─────────────────────────────────────────────────────────────

class EmergencyContactResponse(BaseModel):
    """
    Full serialisation of an emergency contact record.
    Supports ORM-mode loading from the EmergencyContact SQLAlchemy model.
    """
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    child_id: Optional[str] = None

    # Identity
    name: str
    relationship_type: str
    phone_number: str
    email: Optional[str] = None

    # Priority & channels
    priority_order: int
    notify_via_sms: bool
    notify_via_call: bool
    notify_via_push: bool

    # Derived
    has_active_channels: bool = True

    # Timestamps
    created_at: datetime


class ContactDispatchResult(BaseModel):
    """
    Per-contact dispatch outcome after an emergency alert is triggered.
    Records which channels were attempted and which succeeded.
    """
    contact_id: str
    contact_name: str
    phone_number: str
    priority_order: int

    # Channel-level outcomes
    sms_sent: bool = False
    call_initiated: bool = False
    push_delivered: bool = False

    # Overall
    reached: bool = False
    error_message: Optional[str] = None
    dispatched_at: Optional[datetime] = None


class EmergencyContactListResponse(BaseModel):
    """
    Full list of emergency contacts for a caregiver or child,
    ordered by priority_order ascending.
    """
    user_id: str
    child_id: Optional[str] = None
    total: int
    contacts: List[EmergencyContactResponse]

