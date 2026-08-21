import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.config.database import Base


class EmergencyContact(Base):
    """
    SQLAlchemy ORM Model representing a Trusted Emergency Contact in NIVARA.
    Maintains contact info, priority order, and multi-channel alert delivery preferences (SMS, Voice Call, In-App Push).
    """
    __tablename__ = "emergency_contacts"
    __table_args__ = {"extend_existing": True}

    # Common Relationship Constants
    RELATIONSHIP_MOTHER = "Mother"
    RELATIONSHIP_FATHER = "Father"
    RELATIONSHIP_DOCTOR = "Doctor"
    RELATIONSHIP_THERAPIST = "Therapist"
    RELATIONSHIP_POLICE = "Police"
    RELATIONSHIP_FAMILY = "Family"
    RELATIONSHIP_OTHER = "Other"

    # Primary Identifier: contact-xxxxxxxx
    id = Column(String, primary_key=True, default=lambda: f"contact-{uuid.uuid4().hex[:8]}")
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    child_id = Column(String, ForeignKey("children.id"), nullable=True, index=True)

    # Contact Details
    name = Column(String, nullable=False)
    relationship_type = Column(String, default="Family")  # "Mother", "Father", "Grandparent", "Doctor", "Police", "Family", "Other"
    phone_number = Column(String, nullable=False)
    email = Column(String, nullable=True)
    priority_order = Column(Integer, default=1)  # 1 = highest priority

    # Notification Channels
    notify_via_sms = Column(Boolean, default=True)
    notify_via_call = Column(Boolean, default=True)
    notify_via_push = Column(Boolean, default=True)

    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # ORM Relationships
    user = relationship("User", back_populates="emergency_contacts")

    @property
    def has_active_channels(self) -> bool:
        """Returns True if at least one alert channel (SMS, Call, or Push) is enabled."""
        return bool(self.notify_via_sms or self.notify_via_call or self.notify_via_push)

    def to_dict(self) -> Dict[str, Any]:
        """Serializes EmergencyContact record to dictionary."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "child_id": self.child_id,
            "name": self.name,
            "relationship_type": self.relationship_type,
            "phone_number": self.phone_number,
            "email": self.email,
            "priority_order": self.priority_order,
            "notify_via_sms": self.notify_via_sms,
            "notify_via_call": self.notify_via_call,
            "notify_via_push": self.notify_via_push,
            "has_active_channels": self.has_active_channels,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
