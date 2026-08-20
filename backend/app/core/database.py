import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

db_url = settings.DATABASE_URL
if db_url.startswith("sqlite"):
    # Normalize path for SQLite on Windows & POSIX
    if db_url.startswith("sqlite:///."):
        rel_subpath = db_url.replace("sqlite:///.", "").lstrip("/\\")
        abs_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../..", rel_subpath))
        abs_path = abs_path.replace("\\", "/")
        db_url = f"sqlite:///{abs_path}"
    elif db_url.startswith("sqlite:///") and not os.path.isabs(db_url.replace("sqlite:///", "")):
        rel_subpath = db_url.replace("sqlite:///", "")
        abs_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../..", rel_subpath))
        abs_path = abs_path.replace("\\", "/")
        db_url = f"sqlite:///{abs_path}"
    connect_args = {"check_same_thread": False}
else:
    connect_args = {}

engine = create_engine(
    db_url, connect_args=connect_args
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
