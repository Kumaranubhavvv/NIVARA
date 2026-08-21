from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.domains.notifications.service import NotificationService

router = APIRouter(prefix="/notifications", tags=["Notifications"])
service = NotificationService()

def _serialize(item):
    return {
        "id": item.id,
        "recipient_id": item.user_id,
        "type": item.type,
        "title": item.title,
        "message": item.body,
        "data": item.data,
        "is_read": item.read,
        "created_at": item.created_at,
        "read_at": item.read_at
    }

@router.get("")
def list_notifications(user=Depends(get_current_user), db: Session = Depends(get_db)):
    return {"success": True, "data": [_serialize(item) for item in service.list(db, user.id)]}

@router.get("/unread-count")
def unread_count(user=Depends(get_current_user), db: Session = Depends(get_db)):
    return {"success": True, "data": {"count": service.unread_count(db, user.id)}}

@router.patch("/{notification_id}/read")
def mark_read(notification_id: str, user=Depends(get_current_user), db: Session = Depends(get_db)):
    return {"success": True, "data": _serialize(service.mark_read(db, user.id, notification_id))}

@router.patch("/read-all")
def mark_all_read(user=Depends(get_current_user), db: Session = Depends(get_db)):
    return {"success": True, "data": {"updated": service.mark_all_read(db, user.id)}}

@router.delete("/{notification_id}", status_code=204)
def delete_notification(notification_id: str, user=Depends(get_current_user), db: Session = Depends(get_db)):
    service.delete(db, user.id, notification_id)
