from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.domains.communication.repository import CommunicationRepository
from app.domains.communication.models import AACCategory, AACCard
from app.domains.communication.schemas import AACCardCreate, AACCategoryCreate
from app.ai.communication_ai import CommunicationAI

class AACService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = CommunicationRepository(db)

    def get_categories_with_cards(self) -> List[Dict[str, Any]]:
        categories = self.repo.get_categories()
        result = []
        for cat in categories:
            cards = self.repo.get_cards(category_id=cat.id)
            result.append({
                "id": cat.id,
                "name": cat.name,
                "icon": cat.icon,
                "color": cat.color,
                "order": cat.order,
                "cards": [
                    {
                        "id": c.id,
                        "label": c.label,
                        "spoken_text": c.spoken_text or c.label,
                        "icon": c.icon,
                        "part_of_speech": c.part_of_speech,
                        "bg_color": c.bg_color,
                        "text_color": c.text_color,
                        "is_quick_need": c.is_quick_need,
                        "usage_count": c.usage_count,
                    }
                    for c in cards
                ]
            })
        return result

    def get_quick_needs(self) -> List[AACCard]:
        return self.repo.get_cards(quick_needs_only=True)

    def assemble_sentence(self, tokens: List[str], emotion: Optional[str] = None, style: str = "natural") -> Dict[str, Any]:
        # Track usage of cards matching tokens
        for t in tokens:
            card = self.db.query(AACCard).filter(AACCard.label.ilike(t.strip())).first()
            if card:
                self.repo.increment_card_usage(card.id)

        ai_res = CommunicationAI.generate_sentence_from_tokens(tokens, emotion=emotion, style=style)
        return {
            "raw_tokens": tokens,
            "generated_sentence": ai_res["generated_sentence"],
            "suggested_alternatives": ai_res["suggested_alternatives"],
            "simplified_sentence": ai_res["simplified_sentence"],
            "audio_hint": ai_res["audio_hint"],
        }
