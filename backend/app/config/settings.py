import os
from app.core.config import settings

# Unified settings from core with safety domain fallbacks
settings.APP_NAME = getattr(settings, "APP_NAME", "NIVARA Safety & Geofencing Platform")
settings.APP_VERSION = getattr(settings, "APP_VERSION", "1.0.0")
settings.DEFAULT_SAFE_ZONE_RADIUS_METERS = float(os.getenv("DEFAULT_SAFE_ZONE_RADIUS_METERS", "150.0"))
settings.SEPARATION_ALERT_THRESHOLD_METERS = float(os.getenv("SEPARATION_ALERT_THRESHOLD_METERS", "50.0"))
settings.LOW_BATTERY_ALERT_THRESHOLD = int(os.getenv("LOW_BATTERY_ALERT_THRESHOLD", "20"))
settings.GPS_ACCURACY_THRESHOLD_METERS = float(os.getenv("GPS_ACCURACY_THRESHOLD_METERS", "100.0"))
settings.LOCATION_UPDATE_INTERVAL_SECONDS = int(os.getenv("LOCATION_UPDATE_INTERVAL_SECONDS", "10"))
settings.EMERGENCY_BROADCAST_RETRY_COUNT = int(os.getenv("EMERGENCY_BROADCAST_RETRY_COUNT", "3"))
settings.SMS_NOTIFICATIONS_ENABLED = os.getenv("SMS_NOTIFICATIONS_ENABLED", "true").lower() == "true"
settings.PUSH_NOTIFICATIONS_ENABLED = os.getenv("PUSH_NOTIFICATIONS_ENABLED", "true").lower() == "true"

__all__ = ["settings"]
