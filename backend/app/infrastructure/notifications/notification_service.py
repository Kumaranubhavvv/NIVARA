import logging
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.domains.notifications.models import Notification
from app.realtime.notification_manager import notification_manager

logger = logging.getLogger(__name__)

class BaseNotificationProvider:
    async def send(self, recipient_id: str, title: str, message: str, data: Optional[Dict[str, Any]] = None) -> bool:
        raise NotImplementedError

class RealtimeNotificationProvider(BaseNotificationProvider):
    async def send(self, recipient_id: str, title: str, message: str, data: Optional[Dict[str, Any]] = None) -> bool:
        try:
            # Reuses the existing connection manager notification route
            class TemporaryNotificationObject:
                def __init__(self, id, type, title, body, read, created_at=None):
                    self.id = id
                    self.type = type
                    self.title = title
                    self.body = body
                    self.read = read
                    self.created_at = created_at

            notif_obj = TemporaryNotificationObject(
                id=data.get("id") if data else "notif-temp",
                type=data.get("type") if data else "community",
                title=title,
                body=message,
                read=False
            )
            await notification_manager.send_notification(recipient_id, notif_obj)
            return True
        except Exception as e:
            logger.warning(f"Failed to dispatch websocket notification: {e}")
            return False

class PushNotificationProvider(BaseNotificationProvider):
    async def send(self, recipient_id: str, title: str, message: str, data: Optional[Dict[str, Any]] = None) -> bool:
        logger.info(f"Push notification dispatched (MOCK) to user {recipient_id}: {title} - {message}")
        return True

class NotificationService:
    def __init__(self):
        self.realtime_provider = RealtimeNotificationProvider()
        self.push_provider = PushNotificationProvider()

    async def send_notification(
        self,
        db: Session,
        recipient_id: str,
        type: str,
        title: str,
        message: str,
        data: Optional[Dict[str, Any]] = None,
        send_push: bool = True,
        send_realtime: bool = True
    ) -> Notification:
        # 1. In-App persist
        notif = Notification(
            user_id=recipient_id,
            type=type,
            title=title,
            body=message,
            data=data or {},
            read=False
        )
        db.add(notif)
        db.commit()
        db.refresh(notif)
        
        # 2. Real-time WS Dispatch
        if send_realtime:
            payload = (data or {}).copy()
            payload["id"] = notif.id
            payload["type"] = type
            await self.realtime_provider.send(recipient_id, title, message, payload)
            
        # 3. Push Dispatch
        if send_push:
            await self.push_provider.send(recipient_id, title, message, data)
            
        return notif

notification_service = NotificationService()
