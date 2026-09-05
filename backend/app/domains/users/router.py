from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.permissions import require_role, ROLE_ADMIN
from app.domains.users.schemas import UserUpdate
from app.domains.users.service import UserService

router = APIRouter(prefix="/users", tags=["Users"])
service = UserService()

def _serialize(user):
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "avatar": getattr(user, "avatar", None),
        "communication_preferences": getattr(user, "communication_preferences", {}),
        "sensory_preferences": getattr(user, "sensory_preferences", {}),
        "notification_preferences": getattr(user, "notification_preferences", {})
    }

@router.get("/me")
def get_me(user=Depends(get_current_user)):
    return {"success": True, "data": _serialize(user)}

@router.patch("/me")
def update_me(payload: UserUpdate, user=Depends(get_current_user), db: Session = Depends(get_db)):
    updated = service.update_me(db, user.id, **payload.model_dump(exclude_unset=True))
    return {"success": True, "message": "Profile updated.", "data": _serialize(updated)}

@router.get("/{user_id}")
def get_user(user_id: str, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.id != user_id:
        require_role(current_user, ROLE_ADMIN)
    return {"success": True, "data": _serialize(service.get(db, user_id))}
