import uuid
import json
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.config.database import Base


class SafetyEvent(Base):
    """
    SQLAlchemy ORM Model representing a Safety Audit Event in NIVARA.
    Central immutable log for all safety-related events: geofence breaches, separation alerts,
    SOS triggers, low battery warnings, device disconnections, and speed alerts.
    """
    __tablename__ = "safety_events"
    __table_args__ = {"extend_existing": True}

    # Event Type Constants
    EVENT_GEOFENCE_EXIT = "geofence_exit"
    EVENT_GEOFENCE_ENTRY = "geofence_entry"
    EVENT_SEPARATION_ALERT = "separation_alert"
    EVENT_LOW_BATTERY = "low_battery"
    EVENT_DEVICE_OFFLINE = "device_offline"
    EVENT_SOS_TRIGGERED = "sos_triggered"
    EVENT_SPEED_ALERT = "speed_alert"

    # Severity Constants
    SEVERITY_INFO = "info"
    SEVERITY_WARNING = "warning"
    SEVERITY_CRITICAL = "critical"

    # Primary Identifier: event-xxxxxxxx
    id = Column(String, primary_key=True, default=lambda: f"event-{uuid.uuid4().hex[:8]}")
    child_id = Column(String, ForeignKey("children.id"), nullable=False, index=True)

    # Event Classification
    event_type = Column(String, nullable=False)  # "geofence_exit", "geofence_entry", "separation_alert", "low_battery", "device_offline", "sos_triggered", "speed_alert"
    severity = Column(String, default="warning")  # "info", "warning", "critical"

    # Human-Readable Content
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)

    # Location Context
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # Extra Payload
    metadata_json = Column(Text, nullable=True)  # JSON string of event payload

    # Acknowledgement Tracking
    is_acknowledged = Column(Boolean, default=False)
    acknowledged_at = Column(DateTime, nullable=True)
    acknowledged_by = Column(String, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    # ORM Relationships
    child = relationship("Child", back_populates="safety_events")

    @property
    def is_critical(self) -> bool:
        """Returns True if this event has critical severity."""
        return self.severity == self.SEVERITY_CRITICAL

    @property
    def parsed_metadata(self) -> Optional[Dict[str, Any]]:
        """Parses and returns the JSON metadata payload if available."""
        if not self.metadata_json:
            return None
        try:
            return json.loads(self.metadata_json)
        except Exception:
            return None

    def acknowledge(self, acknowledged_by_user_id: str) -> None:
        """Marks this event as acknowledged by the given caregiver user ID."""
        self.is_acknowledged = True
        self.acknowledged_at = datetime.now(timezone.utc)
        self.acknowledged_by = acknowledged_by_user_id

    def to_dict(self) -> Dict[str, Any]:
        """Serializes SafetyEvent record to dictionary."""
        return {
            "id": self.id,
            "child_id": self.child_id,
            "event_type": self.event_type,
            "severity": self.severity,
            "is_critical": self.is_critical,
            "title": self.title,
            "description": self.description,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "metadata": self.parsed_metadata,
            "is_acknowledged": self.is_acknowledged,
            "acknowledged_at": self.acknowledged_at.isoformat() if self.acknowledged_at else None,
            "acknowledged_by": self.acknowledged_by,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
