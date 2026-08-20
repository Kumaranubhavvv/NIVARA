import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class AACCategory(Base):
    __tablename__ = "aac_categories"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    icon = Column(String(50), nullable=False, default="⭐")
    color = Column(String(50), nullable=False, default="#2563EB")
    order = Column(Integer, default=0)
    is_system = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    cards = relationship("AACCard", back_populates="category_rel", cascade="all, delete-orphan")

class AACCard(Base):
    __tablename__ = "aac_cards"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    category_id = Column(String(64), ForeignKey("aac_categories.id"), nullable=True)
    label = Column(String(100), nullable=False)
    spoken_text = Column(String(200), nullable=True)
    icon = Column(String(50), nullable=False, default="💬")
    image_url = Column(String(500), nullable=True)
    part_of_speech = Column(String(50), default="noun")  # noun, verb, pronoun, adjective, preposition
    bg_color = Column(String(50), default="#FFFFFF")
    text_color = Column(String(50), default="#0F172A")
    usage_count = Column(Integer, default=0)
    is_quick_need = Column(Boolean, default=False)
    user_id = Column(String(64), nullable=True)  # custom card per user or null for global
    created_at = Column(DateTime, default=datetime.utcnow)

    category_rel = relationship("AACCategory", back_populates="cards")

class SavedPhrase(Base):
    __tablename__ = "saved_phrases"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(64), nullable=True)
    text = Column(String(500), nullable=False)
    tokens = Column(JSON, default=list)  # list of token labels / card ids
    category = Column(String(100), default="Favorites")
    icon = Column(String(50), default="⭐")
    use_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class EmotionRecord(Base):
    __tablename__ = "emotion_records"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(64), nullable=True)
    emotion = Column(String(50), nullable=False)  # happy, calm, anxious, sad, angry, overwhelmed, tired, excited
    intensity = Column(Integer, default=5)  # 1-10
    note = Column(Text, nullable=True)
    recommended_phrases = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

class CommunicationLog(Base):
    __tablename__ = "communication_logs"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(64), nullable=True)
    sentence = Column(String(500), nullable=False)
    source = Column(String(50), default="aac")  # aac, quick_need, speech, emotion
    emotion = Column(String(50), nullable=True)
    audio_played = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
