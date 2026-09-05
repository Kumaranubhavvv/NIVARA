from datetime import datetime
from sqlalchemy.orm import Session
from app.domains.notifications.models import Notification

class NotificationRepository:
    def list_for_user(self, db: Session, user_id: str):
        return db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).all()

    def unread_count(self, db: Session, user_id: str) -> int:
        return db.query(Notification).filter(Notification.user_id == user_id, Notification.read.is_(False)).count()

    def get_owned(self, db: Session, notification_id: str, user_id: str):
        return db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == user_id).first()

    def mark_read(self, db: Session, notification: Notification):
        notification.read, notification.read_at = True, datetime.utcnow()
        db.commit()
        db.refresh(notification)
        return notification

    def mark_all_read(self, db: Session, user_id: str) -> int:
        updated = db.query(Notification).filter(Notification.user_id == user_id, Notification.read.is_(False)).update({Notification.read: True, Notification.read_at: datetime.utcnow()}, synchronize_session=False)
        db.commit()
        return updated

    def delete_owned(self, db: Session, notification: Notification) -> None:
        db.delete(notification)
        db.commit()
