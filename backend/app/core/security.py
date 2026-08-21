import uuid
import jwt
from datetime import datetime, timedelta
from typing import Optional
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        # Fallback simple match if seeded plain text
        return plain_password == hashed_password

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(user_id: str, expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    if not settings.SECRET_KEY:
        raise RuntimeError("SECRET_KEY must be configured before issuing tokens.")
    to_encode = {"sub": user_id, "type": "access", "jti": uuid.uuid4().hex, "exp": expire}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_refresh_token(user_id: str) -> str:
    if not settings.SECRET_KEY:
        raise RuntimeError("SECRET_KEY must be configured before issuing tokens.")
    expire = datetime.utcnow() + timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": user_id, "type": "refresh", "jti": uuid.uuid4().hex, "exp": expire}, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_token(token: str, expected_type: Optional[str] = None) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if expected_type and payload.get("type", "access") != expected_type:
            return None
        return payload
    except jwt.PyJWTError:
        return None

def decode_access_token(token: str) -> Optional[str]:
    try:
        payload = decode_token(token, "access")
        return payload.get("sub") if payload else None
    except Exception:
        return None
