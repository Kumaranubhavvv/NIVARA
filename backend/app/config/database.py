# Unified database engine and Base from app.core.database for seamless cross-phase integration
from app.core.database import Base, engine, SessionLocal, get_db

__all__ = ["Base", "engine", "SessionLocal", "get_db"]
