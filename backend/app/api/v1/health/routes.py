from sqlalchemy import text
from fastapi import APIRouter, HTTPException
from app.core.database import engine, check_mongo_health

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("")
def health():
    return {"status": "ok"}

@router.get("/db")
async def database_health():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except Exception:
        raise HTTPException(status_code=503, detail="SQL database unavailable.")

    # Validate MongoDB health status
    mongo_ok = await check_mongo_health()
    if not mongo_ok:
        raise HTTPException(status_code=503, detail="MongoDB database unavailable.")

    return {"status": "ok"}
