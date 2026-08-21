import hashlib
import hmac
import secrets
from typing import Optional


def hash_token(token: str, salt: Optional[str] = None) -> str:
    """Computes a secure SHA-256 hash of a token with an optional salt."""
    salt_val = (salt or "").encode("utf-8")
    return hashlib.sha256(salt_val + token.encode("utf-8")).hexdigest()


def generate_secure_token(nbytes: int = 32) -> str:
    """Generates a cryptographically strong URL-safe random string."""
    return secrets.token_urlsafe(nbytes)


def generate_device_pin(length: int = 6) -> str:
    """Generates a numeric pairing PIN for wearable hardware."""
    return "".join(secrets.choice("0123456789") for _ in range(length))


def mask_phone_number(phone: Optional[str]) -> str:
    """Masks a phone number for privacy display (e.g. '+1 (555) ***-0199')."""
    if not phone or len(phone) < 4:
        return "****"
    last_four = phone[-4:]
    return f"{'*' * (len(phone) - 4)}{last_four}"


def mask_email(email: Optional[str]) -> str:
    """Masks an email address for privacy display (e.g. 's***h@nivara.app')."""
    if not email or "@" not in email:
        return "****"
    name, domain = email.split("@", 1)
    if len(name) <= 2:
        masked_name = name[0] + "*"
    else:
        masked_name = name[0] + ("*" * (len(name) - 2)) + name[-1]
    return f"{masked_name}@{domain}"


def constant_time_compare(val1: str, val2: str) -> bool:
    """Performs constant-time comparison to prevent timing attacks."""
    return hmac.compare_digest(val1.encode("utf-8"), val2.encode("utf-8"))
