from pydantic import BaseModel, EmailStr, Field

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=1, max_length=120)
    bio: str = Field(default="Parent caregiver", max_length=1000)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)

class RefreshRequest(BaseModel):
    refresh_token: str = Field(min_length=1)

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    reset_token: str = Field(min_length=1)
    new_password: str = Field(min_length=8, max_length=128)

class CaregiverVerificationRequest(BaseModel):
    role_bio: str = Field(min_length=10, max_length=1000)
    document_notes: str | None = Field(default=None, max_length=2000)
