// ==========================================================================
// NIVARA Web Speech Synthesis Service (AAC Voice Engine)
// ==========================================================================

class SpeechService {
  constructor() {
    this.synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
    this.voices = [];
    this.selectedVoice = null;

    if (this.synth) {
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
    // Prefer natural English voices (e.g. Google US English, Samantha, Natural)
    this.selectedVoice = 
      this.voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))) ||
      this.voices.find(v => v.lang.startsWith('en')) ||
      this.voices[0];
  }

  speak(text, onWordSpoken = null, onEnd = null) {
    if (!this.synth) {
      console.warn('Speech synthesis not supported on this browser.');
      if (onEnd) onEnd();
      return;
    }

    // Cancel any current utterance
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    utterance.rate = 0.95; // Slightly slower for clarity in AAC contexts
    utterance.pitch = 1.05; // Slightly friendly tone

    if (onWordSpoken) {
      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          onWordSpoken(event.charIndex);
        }
      };
    }

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    this.synth.speak(utterance);
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

export const speechService = new SpeechService();
