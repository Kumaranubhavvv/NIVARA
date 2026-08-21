import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.config.database import Base


class EmergencyAlert(Base):
    """
    SQLAlchemy ORM Model representing an SOS Emergency Alert in NIVARA.
    Tracks critical emergency events, coordinates, multi-channel dispatches, and caregiver resolution notes.
    """
    __tablename__ = "emergency_alerts"
    __table_args__ = {"extend_existing": True}

    # Status Constants
    STATUS_ACTIVE = "active"
    STATUS_RESOLVED = "resolved"
    STATUS_FALSE_ALARM = "false_alarm"

    # Severity Constants
    SEVERITY_CRITICAL = "critical"
    SEVERITY_HIGH = "high"
    SEVERITY_MEDIUM = "medium"

    # Trigger Types
    TRIGGER_SOS_BUTTON = "sos_button"
    TRIGGER_GEOFENCE_BREACH = "geofence_breach"
    TRIGGER_SEPARATION = "separation"
    TRIGGER_CAREGIVER_APP = "caregiver_app"

    # Primary Identifier: emg-xxxxxxxx
    id = Column(String, primary_key=True, default=lambda: f"emg-{uuid.uuid4().hex[:8]}")
    child_id = Column(String, ForeignKey("children.id"), nullable=False, index=True)
    caregiver_id = Column(String, ForeignKey("users.id"), nullable=True)

    # Status & Severity
    status = Column(String, default="active")    # "active", "resolved", "false_alarm"
    severity = Column(String, default="critical")  # "critical", "high", "medium"
    triggered_by = Column(String, default="sos_button")  # "sos_button", "geofence_breach", "separation", "caregiver_app"

    # Location & Context
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    address = Column(String, nullable=True)
    message = Column(Text, nullable=True)

    # Resolution Audit
    resolved_at = Column(DateTime, nullable=True)
    resolved_by = Column(String, nullable=True)
    resolution_notes = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    # ORM Relationships
    child = relationship("Child", back_populates="emergencies")

    @property
    def is_active(self) -> bool:
        """Returns True if the emergency alert is currently active."""
        return self.status == self.STATUS_ACTIVE

    def to_dict(self) -> Dict[str, Any]:
        """Serializes EmergencyAlert record to dictionary."""
        return {
            "id": self.id,
            "child_id": self.child_id,
            "caregiver_id": self.caregiver_id,
            "status": self.status,
            "is_active": self.is_active,
            "severity": self.severity,
            "triggered_by": self.triggered_by,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "address": self.address,
            "message": self.message,
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None,
            "resolved_by": self.resolved_by,
            "resolution_notes": self.resolution_notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
