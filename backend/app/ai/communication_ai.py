import re
from typing import List, Dict, Any, Optional

class CommunicationAI:
    """
    AI engine for AAC sentence generation, phrase expansion,
    simplification, and smart predictive communication.
    """

    DEFAULT_EXPANSIONS = {
        ("I", "WANT", "WATER"): "I want a glass of water, please.",
        ("I", "WANT", "FOOD"): "I am hungry and would like some food.",
        ("I", "WANT", "TOILET"): "I need to use the restroom, please.",
        ("I", "NEED", "HELP"): "I need help right now, please.",
        ("I", "FEEL", "TIRED"): "I am feeling tired and need to rest.",
        ("I", "WANT", "PLAY"): "I would like to play now.",
        ("NO", "WANT"): "I don't want this right now.",
        ("TOO", "LOUD"): "It is too loud here. I need quiet.",
    }

    @classmethod
    def generate_sentence_from_tokens(
        cls, tokens: List[str], emotion: Optional[str] = None, style: str = "natural"
    ) -> Dict[str, Any]:
        if not tokens:
            return {
                "generated_sentence": "I want to share something.",
                "suggested_alternatives": ["Can you help me?", "I need a moment."],
                "simplified_sentence": "I want to share.",
            }

        cleaned_tokens = [t.strip().upper() for t in tokens if t.strip()]
        token_tuple = tuple(cleaned_tokens)

        # Check direct lookup dictionary
        if token_tuple in cls.DEFAULT_EXPANSIONS:
            base_sentence = cls.DEFAULT_EXPANSIONS[token_tuple]
        else:
            # Rule-based natural language builder
            words = [t.capitalize() for t in tokens]
            if len(words) == 1:
                word = words[0]
                if word.lower() in ["water", "food", "juice", "snack", "apple", "milk"]:
                    base_sentence = f"I would like some {word.lower()}, please."
                elif word.lower() in ["toilet", "bathroom", "restroom"]:
                    base_sentence = "I need to use the bathroom, please."
                elif word.lower() in ["help", "assist"]:
                    base_sentence = "Please help me with this."
                elif word.lower() in ["tired", "sleep", "rest", "break"]:
                    base_sentence = "I am tired and need a break."
                elif word.lower() in ["happy", "sad", "angry", "scared", "overwhelmed"]:
                    base_sentence = f"I am feeling {word.lower()} right now."
                else:
                    base_sentence = f"I want {word.lower()}, please."
            elif words[0].lower() == "i":
                # e.g., ["I", "want", "water"]
                verb_part = " ".join(w.lower() for w in words[1:])
                base_sentence = f"I {verb_part}, please."
            else:
                base_sentence = f"I want {' '.join(w.lower() for w in words)}, please."

        # Apply emotion tone if provided
        if emotion:
            em = emotion.lower()
            if em in ["anxious", "overwhelmed", "scared"]:
                base_sentence = f"{base_sentence} It feels overwhelming right now."
            elif em in ["tired", "exhausted"]:
                base_sentence = f"{base_sentence} I am feeling very tired."
            elif em in ["happy", "excited"]:
                base_sentence = f"{base_sentence} I'm excited!"

        # Generate intelligent variations
        raw_combined = " ".join(tokens)
        alternatives = [
            f"Please give me {raw_combined}.",
            f"Can I have {raw_combined}?",
            f"I need {raw_combined}.",
        ]

        simplified = " ".join(tokens).capitalize() + "."

        return {
            "generated_sentence": base_sentence,
            "suggested_alternatives": alternatives,
            "simplified_sentence": simplified,
            "audio_hint": f"Clear speech generated for {len(tokens)} symbols",
        }

    @classmethod
    def simplify_complex_text(cls, text: str, target_level: str = "easy") -> Dict[str, Any]:
        if not text or not text.strip():
            return {
                "original_text": "",
                "simplified_text": "Please speak simply.",
                "key_points": [],
                "matching_aac_tokens": [],
            }

        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]

        key_points = []
        aac_tokens = []

        lower_text = text.lower()
        if "water" in lower_text or "drink" in lower_text or "thirsty" in lower_text:
            key_points.append("Drink water")
            aac_tokens.extend(["I", "WANT", "WATER"])
        if "food" in lower_text or "eat" in lower_text or "hungry" in lower_text or "lunch" in lower_text or "dinner" in lower_text:
            key_points.append("Eat food")
            aac_tokens.extend(["I", "WANT", "FOOD"])
        if "toilet" in lower_text or "bathroom" in lower_text or "restroom" in lower_text:
            key_points.append("Go to bathroom")
            aac_tokens.extend(["I", "NEED", "TOILET"])
        if "help" in lower_text or "assist" in lower_text or "stuck" in lower_text:
            key_points.append("Ask for help")
            aac_tokens.extend(["PLEASE", "HELP"])
        if "quiet" in lower_text or "loud" in lower_text or "noise" in lower_text:
            key_points.append("Too loud - need quiet")
            aac_tokens.extend(["TOO", "LOUD"])
        if "sleep" in lower_text or "bed" in lower_text or "rest" in lower_text or "tired" in lower_text:
            key_points.append("Time to rest")
            aac_tokens.extend(["I", "FEEL", "TIRED"])

        if not key_points and sentences:
            # Pick first sentence and shorten it
            first = sentences[0]
            words = first.split()
            simplified = " ".join(words[:6]) + ("." if not words[:6][-1].endswith(".") else "")
            key_points.append(simplified)
            aac_tokens.extend([w.upper() for w in words[:3] if len(w) > 2])

        simplified_text = " • ".join(key_points) if key_points else "Keep calm and take one step at a time."

        return {
            "original_text": text,
            "simplified_text": simplified_text,
            "key_points": key_points if key_points else ["Take a breath", "One step at a time"],
            "matching_aac_tokens": list(dict.fromkeys(aac_tokens))[:6],
        }
