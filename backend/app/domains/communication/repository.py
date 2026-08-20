from typing import List, Optional
from sqlalchemy.orm import Session
from app.domains.communication.models import AACCategory, AACCard, SavedPhrase, EmotionRecord, CommunicationLog

class CommunicationRepository:
    def __init__(self, db: Session):
        self.db = db

    # Categories
    def get_categories(self) -> List[AACCategory]:
        return self.db.query(AACCategory).order_by(AACCategory.order.asc()).all()

    def get_category_by_id(self, category_id: str) -> Optional[AACCategory]:
        return self.db.query(AACCategory).filter(AACCategory.id == category_id).first()

    def create_category(self, category: AACCategory) -> AACCategory:
        self.db.add(category)
        self.db.commit()
        self.db.refresh(category)
        return category

    # Cards
    def get_cards(self, category_id: Optional[str] = None, quick_needs_only: bool = False) -> List[AACCard]:
        query = self.db.query(AACCard)
        if category_id:
            query = query.filter(AACCard.category_id == category_id)
        if quick_needs_only:
            query = query.filter(AACCard.is_quick_need == True)
        return query.order_by(AACCard.usage_count.desc(), AACCard.created_at.asc()).all()

    def get_card_by_id(self, card_id: str) -> Optional[AACCard]:
        return self.db.query(AACCard).filter(AACCard.id == card_id).first()

    def create_card(self, card: AACCard) -> AACCard:
        self.db.add(card)
        self.db.commit()
        self.db.refresh(card)
        return card

    def increment_card_usage(self, card_id: str):
        card = self.get_card_by_id(card_id)
        if card:
            card.usage_count = (card.usage_count or 0) + 1
            self.db.commit()

    # Saved Phrases
    def get_saved_phrases(self, user_id: Optional[str] = None) -> List[SavedPhrase]:
        query = self.db.query(SavedPhrase)
        if user_id:
            query = query.filter((SavedPhrase.user_id == user_id) | (SavedPhrase.user_id == None))
        return query.order_by(SavedPhrase.use_count.desc(), SavedPhrase.created_at.desc()).all()

    def create_saved_phrase(self, phrase: SavedPhrase) -> SavedPhrase:
        self.db.add(phrase)
        self.db.commit()
        self.db.refresh(phrase)
        return phrase

    def delete_saved_phrase(self, phrase_id: str) -> bool:
        phrase = self.db.query(SavedPhrase).filter(SavedPhrase.id == phrase_id).first()
        if phrase:
            self.db.delete(phrase)
            self.db.commit()
            return True
        return False

    def increment_phrase_usage(self, phrase_id: str):
        phrase = self.db.query(SavedPhrase).filter(SavedPhrase.id == phrase_id).first()
        if phrase:
            phrase.use_count = (phrase.use_count or 0) + 1
            self.db.commit()

    # Emotion Records
    def create_emotion_record(self, record: EmotionRecord) -> EmotionRecord:
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record

    def get_recent_emotions(self, user_id: Optional[str] = None, limit: int = 10) -> List[EmotionRecord]:
        query = self.db.query(EmotionRecord)
        if user_id:
            query = query.filter((EmotionRecord.user_id == user_id) | (EmotionRecord.user_id == None))
        return query.order_by(EmotionRecord.created_at.desc()).limit(limit).all()

    # Communication Logs
    def create_log(self, log: CommunicationLog) -> CommunicationLog:
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)
        return log

    def get_logs(self, user_id: Optional[str] = None, limit: int = 30) -> List[CommunicationLog]:
        query = self.db.query(CommunicationLog)
        if user_id:
            query = query.filter((CommunicationLog.user_id == user_id) | (CommunicationLog.user_id == None))
        return query.order_by(CommunicationLog.created_at.desc()).limit(limit).all()
