import logging
from app.infrastructure.mongodb.client import get_mongo_db

logger = logging.getLogger(__name__)

async def create_indexes():
    db = get_mongo_db()
    if db is None:
        logger.warning("MongoDB database is not initialized. Skipping index creation.")
        return

    try:
        # Index on notifications collection for fast recipient queries and sorting
        await db.notifications.create_index([("user_id", 1)])
        await db.notifications.create_index([("created_at", -1)])
        # Index on audit logs/events if we store them in Mongo later
        await db.audit_logs.create_index([("user_id", 1)])
        await db.audit_logs.create_index([("created_at", -1)])
        logger.info("MongoDB indexes created successfully.")
    except Exception as e:
        logger.error(f"Error creating MongoDB indexes: {e}")
