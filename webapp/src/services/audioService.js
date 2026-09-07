// ==========================================================================
// NIVARA Procedural Web Audio API Ambient Generator & Sound Effects
// 100% standalone, no external mp3 or network dependencies needed!
// ==========================================================================

class AudioService {
  constructor() {
    this.ctx = null;
    this.activeSource = null;
    this.activeGain = null;
    this.currentTrack = null;
    this.isPlaying = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // --- Short Sound Effects ---
  playClick() {
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {
      // Audio context policy fallback
    }
  }

  playOutgoingRingtone() {
    try {
      this.stopRingtone();
      this.init();
      this.ringtoneInterval = setInterval(() => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        // 440Hz + 480Hz US telephone ringing tone for 1.5 seconds, then pause
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.frequency.setValueAtTime(440, now);
        osc2.frequency.setValueAtTime(480, now);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.setValueAtTime(0.08, now + 1.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.3);
        osc2.stop(now + 1.3);
      }, 3000);
    } catch (e) {}
  }

  stopRingtone() {
    if (this.ringtoneInterval) {
      clearInterval(this.ringtoneInterval);
      this.ringtoneInterval = null;
    }
  }

  playCallEndedTone() {
    try {
      this.stopRingtone();
      this.init();
      const now = this.ctx.currentTime;
      [440, 370, 300].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.12, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.1);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.1);
      });
    } catch (e) {}
  }

  playSuccessChime() {
    try {
      this.init();
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0.18, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.45);
      });
    } catch (e) {}
  }

  playSiren() {
    try {
      this.init();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      // Emergency dual-tone siren
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.linearRampToValueAtTime(950, now + 0.3);
      osc.frequency.linearRampToValueAtTime(750, now + 0.6);
      osc.frequency.linearRampToValueAtTime(950, now + 0.9);
      osc.frequency.linearRampToValueAtTime(750, now + 1.2);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 1.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 1.3);
    } catch (e) {}
  }

  // --- Continuous Calming Soundscapes ---
  playAmbient(type) {
    this.stopAmbient();
    this.init();
    this.currentTrack = type;
    this.isPlaying = true;

    if (type === 'rain') {
      this.generateRainNoise();
    } else if (type === 'ocean') {
      this.generateOceanWaves();
    } else if (type === 'zen') {
      this.generateSingingBowl();
    } else if (type === 'white') {
      this.generateWhiteNoise();
    }
  }

  stopAmbient() {
    if (this.activeSource) {
      try {
        if (this.activeGain) {
          this.activeGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
        }
        setTimeout(() => {
          if (this.activeSource) {
            this.activeSource.stop();
            this.activeSource.disconnect();
            this.activeSource = null;
          }
        }, 500);
      } catch (e) {}
    }
    this.isPlaying = false;
    this.currentTrack = null;
  }

  generateRainNoise() {
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to simulate soft raindrops
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
    filter.Q.setValueAtTime(0.8, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    whiteNoise.start();
    this.activeSource = whiteNoise;
    this.activeGain = gain;
  }

  generateOceanWaves() {
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, this.ctx.currentTime);

    // LFO to modulate lowpass cutoff for rolling waves
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // 1 wave every 8 seconds
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(250, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    whiteNoise.start();
    this.activeSource = whiteNoise;
    this.activeGain = gain;
  }

  generateSingingBowl() {
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(216, this.ctx.currentTime); // Deep resonant A
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(432.5, this.ctx.currentTime); // Gentle harmonic beat

    gain.gain.setValueAtTime(0.14, this.ctx.currentTime);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start();
    osc2.start();

    this.activeSource = {
      stop: () => {
        osc1.stop();
        osc2.stop();
      },
      disconnect: () => {
        osc1.disconnect();
        osc2.disconnect();
      }
    };
    this.activeGain = gain;
  }

  generateWhiteNoise() {
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.05;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);

    whiteNoise.connect(gain);
    gain.connect(this.ctx.destination);

    whiteNoise.start();
    this.activeSource = whiteNoise;
    this.activeGain = gain;
  }
}

export const audioService = new AudioService();
