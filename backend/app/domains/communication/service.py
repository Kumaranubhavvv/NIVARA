from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.domains.communication.repository import CommunicationRepository
from app.domains.communication.models import SavedPhrase, CommunicationLog
from app.domains.communication.schemas import (
    SentenceBuildRequest,
    SentenceBuildResponse,
    SimplifyTextRequest,
    SimplifyTextResponse,
    TextToSpeechRequest,
    TextToSpeechResponse,
    EmotionCheckinRequest,
    EmotionCheckinResponse,
    SavedPhraseCreate,
    CommunicationLogCreate,
)
from app.domains.communication.aac_service import AACService
from app.domains.communication.emotion_service import EmotionService
from app.domains.communication.speech_service import SpeechService
from app.ai.communication_ai import CommunicationAI

class CommunicationService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = CommunicationRepository(db)
        self.aac_service = AACService(db)
        self.emotion_service = EmotionService(db)

    def get_aac_board(self) -> List[Dict[str, Any]]:
        return self.aac_service.get_categories_with_cards()

    def build_sentence(self, req: SentenceBuildRequest, user_id: Optional[str] = None) -> SentenceBuildResponse:
        res = self.aac_service.assemble_sentence(req.tokens, emotion=req.emotion, style=req.style or "natural")
        
        # Log communication attempt
        if res.get("generated_sentence"):
            log = CommunicationLog(
                user_id=user_id,
                sentence=res["generated_sentence"],
                source="aac",
                emotion=req.emotion,
                audio_played=True,
            )
            self.repo.create_log(log)

        return SentenceBuildResponse(
            raw_tokens=res["raw_tokens"],
            generated_sentence=res["generated_sentence"],
            suggested_alternatives=res.get("suggested_alternatives", []),
            simplified_sentence=res.get("simplified_sentence"),
            audio_hint=res.get("audio_hint"),
        )

    def simplify_text(self, req: SimplifyTextRequest) -> SimplifyTextResponse:
        res = CommunicationAI.simplify_complex_text(req.text, target_level=req.target_level or "easy")
        return SimplifyTextResponse(
            original_text=res["original_text"],
            simplified_text=res["simplified_text"],
            key_points=res["key_points"],
            matching_aac_tokens=res["matching_aac_tokens"],
        )

    def synthesize_speech(self, req: TextToSpeechRequest) -> TextToSpeechResponse:
        res = SpeechService.synthesize_speech_metadata(req)
        return TextToSpeechResponse(
            text=res["text"],
            audio_url=res.get("audio_url"),
            phonetic_guide=res.get("phonetic_guide"),
            duration_estimate_sec=res.get("duration_estimate_sec", 1.5),
        )

    def checkin_emotion(self, req: EmotionCheckinRequest, user_id: Optional[str] = None) -> EmotionCheckinResponse:
        res = self.emotion_service.record_emotion_checkin(req, user_id=user_id)
        return EmotionCheckinResponse(
            id=res["id"],
            emotion=res["emotion"],
            intensity=res["intensity"],
            note=res.get("note"),
            recommended_phrases=res.get("recommended_phrases", []),
            sensory_tip=res.get("sensory_tip"),
            created_at=res.get("created_at"),
        )

    def get_saved_phrases(self, user_id: Optional[str] = None) -> List[SavedPhrase]:
        return self.repo.get_saved_phrases(user_id=user_id)

    def save_phrase(self, req: SavedPhraseCreate, user_id: Optional[str] = None) -> SavedPhrase:
        phrase = SavedPhrase(
            user_id=user_id,
            text=req.text,
            tokens=req.tokens,
            category=req.category,
            icon=req.icon,
        )
        return self.repo.create_saved_phrase(phrase)

    def delete_saved_phrase(self, phrase_id: str) -> bool:
        return self.repo.delete_saved_phrase(phrase_id)

    def log_communication(self, req: CommunicationLogCreate, user_id: Optional[str] = None) -> CommunicationLog:
        log = CommunicationLog(
            user_id=user_id,
            sentence=req.sentence,
            source=req.source,
            emotion=req.emotion,
            audio_played=req.audio_played,
        )
        return self.repo.create_log(log)

    def get_communication_logs(self, user_id: Optional[str] = None, limit: int = 30) -> List[CommunicationLog]:
        return self.repo.get_logs(user_id=user_id, limit=limit)
