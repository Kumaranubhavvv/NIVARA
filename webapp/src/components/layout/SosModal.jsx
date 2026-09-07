import React, { useState, useEffect } from 'react';
import { AlertOctagon, PhoneCall, CheckCircle, Volume2, VolumeX, ShieldAlert } from 'lucide-react';
import { audioService } from '../../services/audioService';
import { mockEmergencyContacts } from '../../mock/mockData';

export default function SosModal({ isOpen, child, onClose, onResolve, onStartCall }) {
  const [countdown, setCountdown] = useState(5);
  const [isDispatched, setIsDispatched] = useState(false);
  const [sirenMuted, setSirenMuted] = useState(false);

  useEffect(() => {
    let timer;
    if (isOpen && !isDispatched) {
      setCountdown(5);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsDispatched(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, isDispatched]);

  if (!isOpen) return null;

  return (
    <div className="sos-overlay" role="dialog" aria-modal="true">
      <div className="sos-modal-card animate-sos-flash">
        {/* Siren sound control */}
        <button
          onClick={() => {
            setSirenMuted(!sirenMuted);
            if (!sirenMuted) {
              audioService.stopAmbient();
            } else {
              audioService.playSiren();
            }
          }}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255,255,255,0.1)',
            padding: '8px',
            borderRadius: '50%',
            color: 'white',
          }}
          title={sirenMuted ? 'Unmute Siren' : 'Mute Siren'}
        >
          {sirenMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>

        {/* Flashing Alert Header */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'var(--accent-danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 0 30px var(--accent-danger)',
            }}
            className="animate-pulse"
          >
            <AlertOctagon size={40} />
          </div>
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '800', color: 'white', letterSpacing: '0.5px' }}>
          {isDispatched ? 'EMERGENCY DISPATCH ACTIVE' : `AUTO-DISPATCHING IN ${countdown}s`}
        </h2>
        <p style={{ color: '#FCA5A5', fontSize: '13px', marginTop: '6px', fontWeight: '600' }}>
          Alert broadcasted to primary caregivers & local emergency services
        </p>

        {/* Telemetry Card in Modal */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: 'var(--radius-sm)',
            padding: '16px',
            margin: '20px 0',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Child Monitored</span>
            <strong style={{ color: 'white', fontSize: '13px' }}>{child.name} (Age {child.age})</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Current Coordinates</span>
            <strong style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
              {child.location?.latitude?.toFixed(4)}°N, {child.location?.longitude?.toFixed(4)}°E
            </strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Last Known Spot</span>
            <span style={{ color: '#E2E8F0', fontSize: '12px', fontWeight: '500' }}>
              {child.location?.address}
            </span>
          </div>
        </div>

        {/* Quick Dial Contacts */}
        <div style={{ textAlign: 'left', marginBottom: '24px' }}>
          <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '10px' }}>
            Emergency Contact Chain
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {mockEmergencyContacts.map((contact) => (
              <div
                key={contact.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'white' }}>{contact.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{contact.relation} • {contact.phone}</div>
                </div>
                <button
                  onClick={() => {
                    audioService.playClick();
                    onStartCall && onStartCall(contact);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'var(--accent-primary)',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '11px',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <PhoneCall size={12} /> Call
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => {
              audioService.playClick();
              setIsDispatched(false);
              onResolve();
              onClose();
            }}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--accent-success)',
              color: 'white',
              fontWeight: '800',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
            }}
          >
            <CheckCircle size={18} />
            SAFE & RESOLVED
          </button>
          <button
            onClick={() => {
              audioService.playClick();
              onClose();
            }}
            style={{
              padding: '14px 20px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255,255,255,0.1)',
              color: '#CBD5E1',
              fontWeight: '700',
              fontSize: '14px',
            }}
          >
            Close Dialog
          </button>
        </div>
      </div>
    </div>
  );
}
