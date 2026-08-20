from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.domains.communication.service import CommunicationService
from app.domains.communication.schemas import (
    AACCategoryResponse,
    SentenceBuildRequest,
    SentenceBuildResponse,
    SimplifyTextRequest,
    SimplifyTextResponse,
    TextToSpeechRequest,
    TextToSpeechResponse,
    EmotionCheckinRequest,
    EmotionCheckinResponse,
    SavedPhraseCreate,
    SavedPhraseResponse,
    CommunicationLogCreate,
    CommunicationLogResponse,
)

router = APIRouter(prefix="/communication", tags=["AI Communication & AAC"])

@router.get("/aac-board")
def get_aac_board(db: Session = Depends(get_db)):
    """Retrieve full AAC category & picture card communication board."""
    service = CommunicationService(db)
    return service.get_aac_board()

@router.post("/build-sentence", response_model=SentenceBuildResponse)
def build_sentence(req: SentenceBuildRequest, db: Session = Depends(get_db)):
    """Generate grammatically complete natural sentence from AAC tokens."""
    service = CommunicationService(db)
    return service.build_sentence(req)

@router.post("/simplify-text", response_model=SimplifyTextResponse)
def simplify_text(req: SimplifyTextRequest, db: Session = Depends(get_db)):
    """Simplify complex text into concise, visual-friendly bullet points and AAC tokens."""
    service = CommunicationService(db)
    return service.simplify_text(req)

@router.post("/text-to-speech", response_model=TextToSpeechResponse)
def text_to_speech(req: TextToSpeechRequest, db: Session = Depends(get_db)):
    """Synthesize speech metadata and pronunciation guide."""
    service = CommunicationService(db)
    return service.synthesize_speech(req)

@router.post("/emotion-checkin", response_model=EmotionCheckinResponse)
def emotion_checkin(req: EmotionCheckinRequest, db: Session = Depends(get_db)):
    """Record an emotion check-in and get empathetic phrase recommendations."""
    service = CommunicationService(db)
    return service.checkin_emotion(req)

@router.get("/saved-phrases", response_model=List[SavedPhraseResponse])
def get_saved_phrases(db: Session = Depends(get_db)):
    """Retrieve saved favorite communication phrases."""
    service = CommunicationService(db)
    return service.get_saved_phrases()

@router.post("/saved-phrases", response_model=SavedPhraseResponse)
def save_phrase(req: SavedPhraseCreate, db: Session = Depends(get_db)):
    """Save a favorite communication phrase or sentence strip."""
    service = CommunicationService(db)
    return service.save_phrase(req)

@router.delete("/saved-phrases/{phrase_id}")
def delete_saved_phrase(phrase_id: str, db: Session = Depends(get_db)):
    """Delete a saved phrase."""
    service = CommunicationService(db)
    success = service.delete_saved_phrase(phrase_id)
    if not success:
        raise HTTPException(status_code=404, detail="Phrase not found")
    return {"message": "Phrase deleted successfully"}

@router.get("/history", response_model=List[CommunicationLogResponse])
def get_communication_history(limit: int = Query(30, ge=1, le=100), db: Session = Depends(get_db)):
    """Get history of spoken communication sentences and requests."""
    service = CommunicationService(db)
    return service.get_communication_logs(limit=limit)

@router.post("/log", response_model=CommunicationLogResponse)
def log_communication(req: CommunicationLogCreate, db: Session = Depends(get_db)):
    """Log an AAC or voice communication event."""
    service = CommunicationService(db)
    return service.log_communication(req)
