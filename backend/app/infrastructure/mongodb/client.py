import logging
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
from app.core.config import settings

logger = logging.getLogger(__name__)

class MongoClientManager:
    def __init__(self):
        self.client = None
        self.db = None
        self.sync_client = None
        self.sync_db = None

    def connect(self):
        if not settings.MONGODB_URL:
            logger.warning("MONGODB_URL is not set. MongoDB connection skipped.")
            return
        
        try:
            # Async client (Motor)
            self.client = AsyncIOMotorClient(
                settings.MONGODB_URL,
                minPoolSize=10,
                maxPoolSize=100
            )
            self.db = self.client[settings.DATABASE_NAME]
            
            # Sync client (PyMongo) - for sync contexts
            self.sync_client = MongoClient(settings.MONGODB_URL)
            self.sync_db = self.sync_client[settings.DATABASE_NAME]
            
            logger.info("Connected to MongoDB successfully.")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")

    def close(self):
        if self.client:
            self.client.close()
            logger.info("Async MongoDB connection closed.")
        if self.sync_client:
            self.sync_client.close()
            logger.info("Sync MongoDB connection closed.")

mongo_manager = MongoClientManager()

def get_mongo_db():
    return mongo_manager.db

def get_sync_mongo_db():
    return mongo_manager.sync_db
