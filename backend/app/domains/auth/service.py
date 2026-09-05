from sqlalchemy.orm import Session
from app.core.exceptions import AuthenticationError, ConflictError, ResourceNotFoundError
from app.core.security import create_access_token, create_refresh_token, decode_token, get_password_hash, verify_password
from app.domains.auth.repository import AuthRepository
from app.domains.users.models import User
from app.domains.caregivers.models import Caregiver, VerificationSubmission

class AuthService:
    def __init__(self, repository=None):
        self.repository = repository or AuthRepository()
        self.revoked_token_ids = set()

    def token_response(self, user, caregiver=None):
        return {"access_token": create_access_token(user.id), "refresh_token": create_refresh_token(user.id), "token_type": "bearer", "user_id": user.id, "email": user.email, "full_name": user.full_name, "role": user.role, "is_verified": bool(caregiver and caregiver.is_verified), "verification_status": caregiver.verification_status if caregiver else "not_applicable"}

    def register(self, db: Session, *, email: str, password: str, full_name: str, bio: str):
        email = email.strip().lower()
        if self.repository.get_user_by_email(db, email):
            raise ConflictError("An account with this email already exists.")
        user = User(email=email, hashed_password=get_password_hash(password), full_name=full_name.strip(), role="caregiver")
        db.add(user)
        db.commit()
        db.refresh(user)
        caregiver = self.repository.create_caregiver(db, Caregiver(user_id=user.id, bio=bio, is_verified=True, verification_status="verified", is_online=True))
        return self.token_response(user, caregiver)

    def login(self, db: Session, *, email: str, password: str):
        user = self.repository.get_user_by_email(db, email.strip().lower())
        if not user or not verify_password(password, user.hashed_password):
            raise AuthenticationError("Incorrect email or password.")
        return self.token_response(user, self.repository.caregiver(db, user.id))

    def refresh(self, db: Session, refresh_token: str):
        payload = decode_token(refresh_token, "refresh")
        if not payload or payload.get("jti") in self.revoked_token_ids:
            raise AuthenticationError("Invalid or expired refresh token.")
        user = self.repository.get_user(db, payload.get("sub"))
        if not user:
            raise AuthenticationError("User not found.")
        return self.token_response(user, self.repository.caregiver(db, user.id))

    def logout(self, token: str):
        payload = decode_token(token)
        if payload and payload.get("jti"):
            self.revoked_token_ids.add(payload["jti"])

    def reset_password(self, db: Session, reset_token: str, new_password: str):
        payload = decode_token(reset_token, "reset")
        if not payload:
            raise AuthenticationError("Invalid or expired reset token.")
        user = self.repository.get_user(db, payload.get("sub"))
        if not user:
            raise ResourceNotFoundError("User not found.")
        user.hashed_password = get_password_hash(new_password)
        db.commit()

    def create_reset_token(self, user_id: str):
        from datetime import datetime, timedelta
        import jwt, uuid
        from app.core.config import settings
        return jwt.encode({"sub": user_id, "type": "reset", "jti": uuid.uuid4().hex, "exp": datetime.utcnow() + timedelta(minutes=30)}, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    def submit_caregiver_verification(self, db: Session, user_id: str, role_bio: str, document_notes: str | None):
        caregiver = self.repository.caregiver(db, user_id)
        if not caregiver:
            raise ResourceNotFoundError("Caregiver profile not found.")
        caregiver.is_verified, caregiver.verification_status = False, "pending"
        db.add(VerificationSubmission(user_id=user_id, role_bio=role_bio, document_notes=document_notes, status="pending"))
        db.commit()
        return caregiver
