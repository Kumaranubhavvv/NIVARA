from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, Field

class NotificationCreate(BaseModel):
    recipient_id: str
    type: str = Field(min_length=1, max_length=64)
    title: str = Field(min_length=1, max_length=255)
    message: str = Field(min_length=1, max_length=2000)
    data: Optional[dict[str, Any]] = None

class NotificationResponse(BaseModel):
    id: str
    recipient_id: str
    type: str
    title: str
    message: str
    data: Optional[dict[str, Any]] = None
    is_read: bool
    created_at: datetime
    read_at: Optional[datetime] = None
