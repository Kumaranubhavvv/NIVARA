import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.host = settings.SMTP_HOST
        self.port = settings.SMTP_PORT
        self.username = settings.SMTP_USERNAME
        self.password = settings.SMTP_PASSWORD
        self.from_email = settings.SMTP_FROM_EMAIL or "noreply@nivara.app"

    def send_email(self, to_email: str, subject: str, body_text: str, body_html: str = None) -> bool:
        if not to_email:
            logger.warning("Recipient email is empty. Skipping dispatch.")
            return False

        if not self.host or not self.username:
            logger.info("=========================================")
            logger.info("EMAIL DISPATCH (DEVELOPMENT FALLBACK LOG)")
            logger.info(f"To: {to_email}")
            logger.info(f"From: {self.from_email}")
            logger.info(f"Subject: {subject}")
            logger.info(f"Body: {body_text}")
            logger.info("=========================================")
            return True

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = self.from_email
            msg["To"] = to_email

            part1 = MIMEText(body_text, "plain")
            msg.attach(part1)

            if body_html:
                part2 = MIMEText(body_html, "html")
                msg.attach(part2)

            with smtplib.SMTP(self.host, self.port) as server:
                server.starttls()
                server.login(self.username, self.password)
                server.sendmail(self.from_email, to_email, msg.as_string())

            logger.info(f"Email sent successfully to {to_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email to {to_email} via SMTP: {e}")
            return False

    def send_password_reset(self, to_email: str, token: str) -> bool:
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}" if settings.FRONTEND_URL else f"http://localhost:3000/reset-password?token={token}"
        subject = "Reset Your Password - NIVARA"
        body_text = f"You requested a password reset. Please use the following link to reset your password:\n\n{reset_url}\n\nThis link is valid for 30 minutes."
        body_html = f"""
        <html>
            <body>
                <h2>Reset Your Password</h2>
                <p>You requested a password reset for your NIVARA caregiver account.</p>
                <p>Click the link below to set a new password:</p>
                <p><a href="{reset_url}">{reset_url}</a></p>
                <p>This link is valid for 30 minutes.</p>
            </body>
        </html>
        """
        return self.send_email(to_email, subject, body_text, body_html)

    def send_caregiver_verification_update(self, to_email: str, status: str, comments: str = None) -> bool:
        subject = "Caregiver Verification Status Update - NIVARA"
        body_text = f"Your caregiver verification status has been updated to: {status}.\n\n"
        if comments:
            body_text += f"Comments: {comments}\n"
        body_html = f"""
        <html>
            <body>
                <h2>Caregiver Verification Update</h2>
                <p>Your verification status is now: <strong>{status}</strong>.</p>
                {"<p>Notes from review team: " + comments + "</p>" if comments else ""}
            </body>
        </html>
        """
        return self.send_email(to_email, subject, body_text, body_html)

email_service = EmailService()
