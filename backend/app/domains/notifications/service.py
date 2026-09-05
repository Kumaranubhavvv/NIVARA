from sqlalchemy.orm import Session
from app.core.exceptions import ResourceNotFoundError
from app.domains.notifications.repository import NotificationRepository

class NotificationService:
    def __init__(self, repository=None):
        self.repository = repository or NotificationRepository()

    def list(self, db: Session, user_id: str):
        return self.repository.list_for_user(db, user_id)

    def unread_count(self, db: Session, user_id: str) -> int:
        return self.repository.unread_count(db, user_id)

    def mark_read(self, db: Session, user_id: str, notification_id: str):
        notification = self.repository.get_owned(db, notification_id, user_id)
        if not notification:
            raise ResourceNotFoundError("Notification not found.")
        return self.repository.mark_read(db, notification)

    def mark_all_read(self, db: Session, user_id: str) -> int:
        return self.repository.mark_all_read(db, user_id)

    def delete(self, db: Session, user_id: str, notification_id: str) -> None:
        notification = self.repository.get_owned(db, notification_id, user_id)
        if not notification:
            raise ResourceNotFoundError("Notification not found.")
        self.repository.delete_owned(db, notification)
