import os
from pathlib import Path

# Automatically load .env if python-dotenv is present, or parse directly
env_file = Path(__file__).resolve().parent.parent.parent / ".env"
if env_file.exists():
    try:
        from dotenv import load_dotenv
        load_dotenv(dotenv_path=env_file)
    except ImportError:
        # Fallback simple .env parser
        with open(env_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    val = val.strip().strip('"').strip("'")
                    if key not in os.environ:
                        os.environ[key] = val

class Settings:
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "NIVARA Caregiver Community Backend")
    API_V1_STR: str = os.getenv("API_V1_STR", "/api/v1")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # Database
    DEFAULT_DB_PATH: str = str(Path(__file__).resolve().parent.parent.parent / "nivara.db")
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_DB_PATH}")

    # JWT Authentication
    SECRET_KEY: str = os.getenv("SECRET_KEY", os.getenv("JWT_SECRET", ""))
    ALGORITHM: str = os.getenv("JWT_ALGORITHM", os.getenv("ALGORITHM", "HS256"))
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", str(60 * 24 * 7)))
    REFRESH_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_MINUTES", str(60 * 24 * 30)))

    # Optional future MongoDB configuration. The active application store remains DATABASE_URL.
    MONGODB_URL: str = os.getenv("MONGODB_URL", "")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "nivara")

    # Real-Time & WebSockets / Socket.IO
    SOCKETIO_PATH: str = os.getenv("SOCKETIO_PATH", "/socket.io")
    SOCKET_CORS_ALLOWED_ORIGINS: str = os.getenv("SOCKET_CORS_ALLOWED_ORIGINS", "*")
    WS_URL: str = os.getenv("WS_URL", "ws://localhost:8000/api/v1/ws")

    # Server & CORS
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "*")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "")

    # Provider configuration is intentionally optional in development.
    SMTP_HOST: str = os.getenv("SMTP_HOST", "")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME: str = os.getenv("SMTP_USERNAME", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SMTP_FROM_EMAIL: str = os.getenv("SMTP_FROM_EMAIL", "")
    STORAGE_PROVIDER: str = os.getenv("STORAGE_PROVIDER", "local")
    MAX_UPLOAD_SIZE_MB: int = int(os.getenv("MAX_UPLOAD_SIZE_MB", "10"))

    @property
    def cors_origin_list(self):
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

settings = Settings()
