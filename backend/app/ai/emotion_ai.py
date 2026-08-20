from typing import Dict, Any, List

class EmotionAI:
    """
    Emotion-aware recommendation engine for neurodivergent individuals.
    Provides empathetic sentence suggestions, sensory grounding tips,
    and visual communication cues tailored to real-time emotional states.
    """

    EMOTION_KNOWLEDGE_BASE = {
        "happy": {
            "icon": "😊",
            "phrases": [
                "I am happy right now!",
                "I want to share what made me smile.",
                "I'm feeling good and ready to do activities.",
                "Can we do this again tomorrow?",
            ],
            "sensory_tip": "Great time for active play, creative drawing, or engaging learning tasks.",
        },
        "calm": {
            "icon": "😌",
            "phrases": [
                "I feel peaceful and relaxed.",
                "Everything is okay.",
                "I am ready to listen and learn.",
                "I like this quiet space.",
            ],
            "sensory_tip": "Maintain this soothing rhythm with low-stimulus lighting and comfortable seating.",
        },
        "anxious": {
            "icon": "😰",
            "phrases": [
                "I am feeling worried right now.",
                "Can you stay close to me?",
                "What is going to happen next?",
                "I need a 5-minute quiet break.",
            ],
            "sensory_tip": "Try 4-7-8 deep breaths, a weighted lap pad, or noise-canceling headphones.",
        },
        "overwhelmed": {
            "icon": "🤯",
            "phrases": [
                "Too much is happening at once.",
                "It is too loud and bright here.",
                "Please stop talking for a moment.",
                "I need to go to my safe sensory corner.",
            ],
            "sensory_tip": "Dim lights immediately, remove auditory clutter, and reduce verbal instructions.",
        },
        "sad": {
            "icon": "😢",
            "phrases": [
                "I am feeling sad.",
                "Can I have a gentle hug?",
                "I miss something/someone.",
                "I just need some quiet comfort.",
            ],
            "sensory_tip": "Offer a soft blanket, favorite sensory object, and empathetic silent presence.",
        },
        "angry": {
            "icon": "😡",
            "phrases": [
                "I feel very frustrated and angry!",
                "I do not want to do this right now.",
                "I need space to cool down safely.",
                "Please listen to what I am saying.",
            ],
            "sensory_tip": "Provide deep-pressure proprioceptive squeeze, stress ball, or safe physical movement.",
        },
        "tired": {
            "icon": "😴",
            "phrases": [
                "I am very sleepy and out of energy.",
                "Can I lay down for a little bit?",
                "I need to pause this activity.",
                "My body feels heavy.",
            ],
            "sensory_tip": "Transition to low-energy calming activities or prepare for rest with dim light.",
        },
        "excited": {
            "icon": "🤩",
            "phrases": [
                "I am so excited and have lots of energy!",
                "Look at what I did!",
                "I want to jump and celebrate!",
                "Let's go do it now!",
            ],
            "sensory_tip": "Channel energy into a physical movement break like trampoline jumps or dancing.",
        },
    }

    @classmethod
    def get_emotion_recommendations(cls, emotion: str, intensity: int = 5) -> Dict[str, Any]:
        em_key = emotion.lower().strip()
        data = cls.EMOTION_KNOWLEDGE_BASE.get(
            em_key,
            {
                "icon": "😐",
                "phrases": [
                    f"I am feeling {emotion}.",
                    "I want to express what I need.",
                    "Can you help me right now?",
                ],
                "sensory_tip": "Check in gently and allow time for self-regulation.",
            },
        )

        phrases = list(data["phrases"])
        if intensity >= 8:
            if em_key in ["anxious", "overwhelmed", "angry"]:
                phrases.insert(0, "URGENT: I need quiet and space immediately.")
            elif em_key in ["happy", "excited"]:
                phrases.insert(0, "I am bursting with happy energy!")

        return {
            "emotion": emotion,
            "intensity": intensity,
            "icon": data["icon"],
            "recommended_phrases": phrases,
            "sensory_tip": data["sensory_tip"],
        }
