from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    role: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(default=None, min_length=1, max_length=120)
