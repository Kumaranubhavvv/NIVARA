import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  CloudRain, 
  Waves, 
  Wind, 
  SunMedium, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { audioService } from '../services/audioService';

const BREATH_PHASES = [
  { name: 'inhale', label: 'Breathe In Slowly', duration: 4, tip: 'Fill your lungs with cool, gentle air' },
  { name: 'hold', label: 'Hold Peacefully', duration: 4, tip: 'Feel calm and centered in your body' },
  { name: 'exhale', label: 'Breathe Out Gently', duration: 4, tip: 'Release all tension and tight muscles' },
  { name: 'rest', label: 'Rest and Be Still', duration: 4, tip: 'You are safe and supported' },
];

export default function SensoryView() {
  const [isBreathingActive, setIsBreathingActive] = useState(true);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState(4);
  const [activeSound, setActiveSound] = useState(null);

  // Breathing Box Timer
  useEffect(() => {
    let interval;
    if (isBreathingActive) {
      interval = setInterval(() => {
        setPhaseSecondsLeft((prev) => {
          if (prev <= 1) {
            setPhaseIndex((currPhase) => (currPhase + 1) % BREATH_PHASES.length);
            return BREATH_PHASES[(phaseIndex + 1) % BREATH_PHASES.length].duration;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBreathingActive, phaseIndex]);

  const currentPhase = BREATH_PHASES[phaseIndex];

  // Sound selection
  const handleToggleSound = (soundType) => {
    audioService.playClick();
    if (activeSound === soundType) {
      audioService.stopAmbient();
      setActiveSound(null);
    } else {
      audioService.playAmbient(soundType);
      setActiveSound(soundType);
    }
  };

  const soundPresets = [
    { id: 'rain', label: 'Gentle Rain', desc: 'Soft raindrops on foliage', icon: CloudRain },
    { id: 'ocean', label: 'Ocean Waves', desc: 'Rhythmic deep tide swell', icon: Waves },
    { id: 'zen', label: 'Singing Bowl', desc: '432Hz harmonic resonance', icon: SunMedium },
    { id: 'white', label: 'Soft White Noise', desc: 'Broadband sensory mask', icon: Wind },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header Banner */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Sensory Calming Room & Overload Relief</h2>
          <p className="section-subtitle">
            Box breathing sphere, procedural soothing soundscapes, and sensory de-escalation protocols
          </p>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginTop: 0 }}>
        {/* Left Column: Breathing Sphere */}
        <div className="col-7 glass-card" style={{ padding: '32px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              4-4-4-4 Box Breathing Guide
            </span>
            <button
              onClick={() => setIsBreathingActive(!isBreathingActive)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '12px',
                fontWeight: '700',
              }}
            >
              {isBreathingActive ? <Pause size={14} /> : <Play size={14} />}
              {isBreathingActive ? 'Pause Guide' : 'Start Guide'}
            </button>
          </div>

          {/* Guided Sphere Stage */}
          <div className="breathing-stage">
            <div className={`breathing-sphere ${currentPhase.name}`}>
              <div className="breathing-text">
                <div>{phaseSecondsLeft}s</div>
                <div style={{ fontSize: '14px', fontWeight: '600', opacity: 0.9 }}>
                  {currentPhase.name.toUpperCase()}
                </div>
              </div>
            </div>
          </div>

          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '16px' }}>
            {currentPhase.label}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px' }}>
            {currentPhase.tip}
          </p>
        </div>

        {/* Right Column: Ambient Sound Generator & De-escalation */}
        <div className="col-5" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Calming Soundscapes */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: '800' }}>Ambient Soundscapes</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Real procedural audio (zero streaming latency)</p>
              </div>
              {activeSound && (
                <span className="telemetry-pill safe" style={{ padding: '4px 10px', fontSize: '11px' }}>
                  <Volume2 size={12} /> Playing {activeSound}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {soundPresets.map((snd) => {
                const Icon = snd.icon;
                const isPlaying = activeSound === snd.id;

                return (
                  <div
                    key={snd.id}
                    className={`sound-preset-card ${isPlaying ? 'active' : ''}`}
                    onClick={() => handleToggleSound(snd.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '36px', 
                        height: '36px', 
                        borderRadius: 'var(--radius-xs)', 
                        background: isPlaying ? 'var(--accent-cyan)' : 'var(--bg-secondary)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: isPlaying ? 'white' : 'var(--text-secondary)'
                      }}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{snd.label}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{snd.desc}</div>
                      </div>
                    </div>
                    <div>
                      {isPlaying ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <span className="beacon-dot animate-pulse" style={{ backgroundColor: 'var(--accent-cyan)' }} />
                          <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-cyan)' }}>Stop</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Play</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Sensory Overload De-Escalation Steps */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HelpCircle size={16} color="var(--accent-warning)" />
              Sensory Overload Checklist
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: 'var(--accent-cyan)', fontWeight: '700' }}>1.</span>
                <span>Dim harsh overhead fluorescent lights or close curtains.</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: 'var(--accent-cyan)', fontWeight: '700' }}>2.</span>
                <span>Put on noise-cancelling headphones or soft earmuffs.</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: 'var(--accent-cyan)', fontWeight: '700' }}>3.</span>
                <span>Offer a weighted sensory lap pad or firm reassuring hug.</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: 'var(--accent-cyan)', fontWeight: '700' }}>4.</span>
                <span>Avoid rapid questioning; allow 10-15 minutes of silent space.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
