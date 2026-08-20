from typing import Dict, Any
from app.domains.communication.schemas import TextToSpeechRequest

class SpeechService:
    @classmethod
    def synthesize_speech_metadata(cls, req: TextToSpeechRequest) -> Dict[str, Any]:
        text_clean = req.text.strip()
        word_count = len(text_clean.split())
        est_duration = max(1.0, round(word_count * 0.35 / req.speed, 2))

        return {
            "text": text_clean,
            "audio_url": None,  # Supports browser Web Speech API on client side
            "phonetic_guide": " ".join([w.lower() for w in text_clean.split()]),
            "duration_estimate_sec": est_duration,
        }
