import logging
from app.infrastructure.email.email_service import email_service

logger = logging.getLogger(__name__)

def send_async_password_reset_email(email: str, token: str):
    try:
        email_service.send_password_reset(email, token)
    except Exception as e:
        logger.error(f"Error sending async password reset email: {e}")

def send_async_caregiver_verification_email(email: str, status: str, comments: str = None):
    try:
        email_service.send_caregiver_verification_update(email, status, comments)
    except Exception as e:
        logger.error(f"Error sending async caregiver verification email: {e}")
