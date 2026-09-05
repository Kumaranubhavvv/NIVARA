from sqlalchemy.orm import Session
from app.core.exceptions import AuthorizationError
from app.domains.caregivers.models import Caregiver
from app.models.child import Child

ROLE_SUPPORTED_USER = "supported_user"
ROLE_CAREGIVER = "caregiver"
ROLE_ADMIN = "admin"

def require_role(user, *roles: str):
    if user.role not in roles:
        raise AuthorizationError("You do not have permission to perform this action.")
    return user

def can_access_supported_user(db: Session, caregiver_user_id: str, supported_user_id: str) -> bool:
    """Access is relationship-based; caregivers never receive blanket child access."""
    if caregiver_user_id == supported_user_id:
        return True
    return db.query(Child).filter(Child.id == supported_user_id, Child.caregiver_id == caregiver_user_id).first() is not None

def require_caregiver_relationship(db: Session, caregiver: Caregiver, supported_user_id: str) -> None:
    if not can_access_supported_user(db, caregiver.user_id, supported_user_id):
        raise AuthorizationError("You do not have access to this supported user.")
