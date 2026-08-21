import uuid
import json
from datetime import datetime, timezone
from typing import Dict, Any, Tuple, List, Optional
from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.config.database import Base


class SafeZone(Base):
    """
    SQLAlchemy ORM Model representing a Geofenced Safe Zone in NIVARA.
    Supports circular perimeter boundaries (center + radius) and multi-vertex polygon boundaries.
    """
    __tablename__ = "safe_zones"
    __table_args__ = {"extend_existing": True}

    # Zone Type Constants
    TYPE_CIRCLE = "circle"
    TYPE_POLYGON = "polygon"

    # Primary Identifier: sz-xxxxxxxx
    id = Column(String, primary_key=True, default=lambda: f"sz-{uuid.uuid4().hex[:8]}")
    child_id = Column(String, ForeignKey("children.id"), nullable=False, index=True)

    # Zone Metadata
    name = Column(String, nullable=False)  # e.g. "Home Sanctuary", "School", "Therapy Clinic"
    zone_type = Column(String, default="circle")  # "circle" or "polygon"

    # Coordinate Geometry
    center_latitude = Column(Float, nullable=False)
    center_longitude = Column(Float, nullable=False)
    radius_meters = Column(Float, default=150.0)  # default 150.0m for circular zones
    polygon_coordinates = Column(Text, nullable=True)  # JSON string of [(lat, lon), ...]
    address = Column(String, nullable=True)

    # Trigger Configuration
    is_active = Column(Boolean, default=True)
    alert_on_exit = Column(Boolean, default=True)
    alert_on_enter = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # ORM Relationships
    child = relationship("Child", back_populates="safe_zones")

    @property
    def center_coordinates(self) -> Tuple[float, float]:
        """Returns (center_latitude, center_longitude) as a tuple."""
        return (self.center_latitude, self.center_longitude)

    @property
    def parsed_polygon_coordinates(self) -> Optional[List[Tuple[float, float]]]:
        """Parses and returns polygon coordinates list if available."""
        if not self.polygon_coordinates:
            return None
        try:
            return json.loads(self.polygon_coordinates)
        except Exception:
            return None

    def to_dict(self) -> Dict[str, Any]:
        """Serializes SafeZone record to dictionary."""
        return {
            "id": self.id,
            "child_id": self.child_id,
            "name": self.name,
            "zone_type": self.zone_type,
            "center_latitude": self.center_latitude,
            "center_longitude": self.center_longitude,
            "radius_meters": self.radius_meters,
            "polygon_coordinates": self.parsed_polygon_coordinates,
            "address": self.address,
            "is_active": self.is_active,
            "alert_on_exit": self.alert_on_exit,
            "alert_on_enter": self.alert_on_enter,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
