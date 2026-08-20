from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.domains.communication.repository import CommunicationRepository
from app.domains.communication.models import EmotionRecord
from app.domains.communication.schemas import EmotionCheckinRequest
from app.ai.emotion_ai import EmotionAI

class EmotionService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = CommunicationRepository(db)

    def record_emotion_checkin(self, req: EmotionCheckinRequest, user_id: Optional[str] = None) -> Dict[str, Any]:
        rec = EmotionAI.get_emotion_recommendations(req.emotion, req.intensity)
        
        record = EmotionRecord(
            user_id=user_id,
            emotion=req.emotion.lower(),
            intensity=req.intensity,
            note=req.note,
            recommended_phrases=rec["recommended_phrases"],
        )
        saved = self.repo.create_emotion_record(record)

        return {
            "id": saved.id,
            "emotion": saved.emotion,
            "intensity": saved.intensity,
            "note": saved.note,
            "recommended_phrases": rec["recommended_phrases"],
            "sensory_tip": rec["sensory_tip"],
            "created_at": saved.created_at,
        }

    def get_recent_checkins(self, user_id: Optional[str] = None, limit: int = 10) -> List[EmotionRecord]:
        return self.repo.get_recent_emotions(user_id=user_id, limit=limit)
