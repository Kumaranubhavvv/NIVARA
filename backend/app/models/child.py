import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.config.database import Base


class Child(Base):
    """
    SQLAlchemy ORM Model representing a Child profile in NIVARA.
    Maintains child profile info, neurodivergent care context, real-time safety status,
    paired wearable hardware devices, geofenced safe zones, GPS coordinates, and emergencies.
    """
    __tablename__ = "children"
    __table_args__ = {"extend_existing": True}

    # Status Constants & State Machine
    STATUS_SAFE = "safe"
    STATUS_OUT_OF_BOUNDS = "out_of_bounds"
    STATUS_SEPARATION_ALERT = "separation_alert"
    STATUS_SEPARATION = "separation_alert"  # Alias for proximity monitoring
    STATUS_EMERGENCY = "emergency"

    # Autism Spectrum Care Levels
    AUTISM_LEVEL_1 = "Level 1"  # Requiring support
    AUTISM_LEVEL_2 = "Level 2"  # Requiring substantial support
    AUTISM_LEVEL_3 = "Level 3"  # Requiring very substantial support

    # Primary Identifier
    id = Column(String, primary_key=True, default=lambda: f"child-{uuid.uuid4().hex[:8]}")
    caregiver_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)

    # Profile Attributes
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    autism_level = Column(String, nullable=True, default="Level 1")
    medical_notes = Column(Text, nullable=True)
    emergency_instructions = Column(Text, nullable=True)

    # Real-time Tracking & Safety State
    tracking_enabled = Column(Boolean, default=True)
    current_status = Column(String, default="safe")  # safe, out_of_bounds, separation_alert, emergency

    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # ORM Relationships
    caregiver = relationship("User", back_populates="children")
    devices = relationship("Device", back_populates="child", cascade="all, delete-orphan")
    locations = relationship("Location", back_populates="child", cascade="all, delete-orphan")
    safe_zones = relationship("SafeZone", back_populates="child", cascade="all, delete-orphan")
    emergencies = relationship("EmergencyAlert", back_populates="child", cascade="all, delete-orphan")
    safety_events = relationship("SafetyEvent", back_populates="child", cascade="all, delete-orphan")

    @property
    def is_safe(self) -> bool:
        """Returns True if child is in 'safe' status with no active breaches or alerts."""
        return self.current_status == self.STATUS_SAFE

    @property
    def is_in_emergency(self) -> bool:
        """Returns True if an emergency/SOS alert is currently active for this child."""
        return self.current_status == self.STATUS_EMERGENCY

    @property
    def is_out_of_bounds(self) -> bool:
        """Returns True if child has breached configured safe zone boundaries."""
        return self.current_status == self.STATUS_OUT_OF_BOUNDS

    @property
    def primary_device(self) -> Optional[Any]:
        """Returns the first active paired device, if available."""
        if self.devices:
            for dev in self.devices:
                if dev.is_active:
                    return dev
            return self.devices[0]
        return None

    @property
    def active_emergency(self) -> Optional[Any]:
        """Returns the active emergency record if one is currently in progress."""
        if self.emergencies:
            for emg in self.emergencies:
                if emg.is_active:
                    return emg
        return None

    def to_dict(self, include_telemetry: bool = False) -> Dict[str, Any]:
        """Serializes Child record to dictionary with optional device & safety telemetry."""
        data = {
            "id": self.id,
            "caregiver_id": self.caregiver_id,
            "name": self.name,
            "age": self.age,
            "gender": self.gender,
            "avatar_url": self.avatar_url,
            "autism_level": self.autism_level,
            "medical_notes": self.medical_notes,
            "emergency_instructions": self.emergency_instructions,
            "tracking_enabled": self.tracking_enabled,
            "current_status": self.current_status,
            "is_safe": self.is_safe,
            "is_in_emergency": self.is_in_emergency,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

        if include_telemetry:
            dev = self.primary_device
            data["device_battery"] = dev.battery_level if dev else None
            data["device_online"] = dev.is_online if dev else False
            data["has_active_emergency"] = self.active_emergency is not None

        return data
