from typing import List, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime

class AACCategoryBase(BaseModel):
    name: str
    icon: str = "⭐"
    color: str = "#2563EB"
    order: int = 0
    is_system: bool = True

class AACCategoryCreate(AACCategoryBase):
    pass

class AACCategoryResponse(AACCategoryBase):
    id: str
    created_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class AACCardBase(BaseModel):
    category_id: Optional[str] = None
    label: str
    spoken_text: Optional[str] = None
    icon: str = "💬"
    image_url: Optional[str] = None
    part_of_speech: str = "noun"
    bg_color: str = "#FFFFFF"
    text_color: str = "#0F172A"
    is_quick_need: bool = False

class AACCardCreate(AACCardBase):
    pass

class AACCardResponse(AACCardBase):
    id: str
    usage_count: int = 0
    created_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class SentenceBuildRequest(BaseModel):
    tokens: List[str] = Field(..., description="List of AAC card labels or word tokens")
    emotion: Optional[str] = None
    style: Optional[str] = "natural"  # natural, simple, polite, urgent

class SentenceBuildResponse(BaseModel):
    raw_tokens: List[str]
    generated_sentence: str
    suggested_alternatives: List[str] = []
    simplified_sentence: Optional[str] = None
    audio_hint: Optional[str] = None

class SimplifyTextRequest(BaseModel):
    text: str
    target_level: Optional[str] = "easy"  # easy, pictorial, short

class SimplifyTextResponse(BaseModel):
    original_text: str
    simplified_text: str
    key_points: List[str] = []
    matching_aac_tokens: List[str] = []

class TextToSpeechRequest(BaseModel):
    text: str
    voice: Optional[str] = "friendly_child"  # friendly_child, calm_female, clear_male
    speed: Optional[float] = 1.0
    pitch: Optional[float] = 1.0

class TextToSpeechResponse(BaseModel):
    text: str
    audio_url: Optional[str] = None
    phonetic_guide: Optional[str] = None
    duration_estimate_sec: float = 1.5

class EmotionCheckinRequest(BaseModel):
    emotion: str
    intensity: int = Field(5, ge=1, le=10)
    note: Optional[str] = None

class EmotionCheckinResponse(BaseModel):
    id: str
    emotion: str
    intensity: int
    note: Optional[str] = None
    recommended_phrases: List[str] = []
    sensory_tip: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class SavedPhraseCreate(BaseModel):
    text: str
    tokens: List[str] = []
    category: str = "Favorites"
    icon: str = "⭐"

class SavedPhraseResponse(BaseModel):
    id: str
    text: str
    tokens: List[str] = []
    category: str
    icon: str
    use_count: int
    created_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class CommunicationLogCreate(BaseModel):
    sentence: str
    source: str = "aac"
    emotion: Optional[str] = None
    audio_played: bool = True

class CommunicationLogResponse(BaseModel):
    id: str
    sentence: str
    source: str
    emotion: Optional[str] = None
    audio_played: bool
    created_at: Optional[datetime] = None

    class Config:
        orm_mode = True
