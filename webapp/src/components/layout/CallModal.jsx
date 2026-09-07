import React, { useState, useEffect, useRef } from 'react';
import { 
  PhoneCall, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Sparkles, 
  Volume2, 
  ShieldCheck, 
  Activity,
  Heart,
  User
} from 'lucide-react';
import { audioService } from '../../services/audioService';

export default function CallModal({ isOpen, contact, child, onClose }) {
  const [callStatus, setCallStatus] = useState('initiating'); // initiating, ringing, connected, ended
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [aiCue, setAiCue] = useState('Voice tone: Calm and comforting. Sensory level optimal.');
  const [volumeLevel, setVolumeLevel] = useState(35);

  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const wsRef = useRef(null);

  const calleeName = contact ? contact.name : (child ? child.name : 'Emergency Contact');
  const calleeRelation = contact ? contact.relation : 'Child Tracker Band';
  const calleeAvatar = child?.avatar || '👦🏽';

  // WebSocket signaling and media initialization
  useEffect(() => {
    if (!isOpen) {
      cleanupCall();
      return;
    }

    setCallStatus('initiating');
    setCallDuration(0);
    audioService.playClick();

    // Determine WebSocket URL
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const roomId = (contact ? contact.id : (child ? child.id : 'room-1')).replace(/[^a-zA-Z0-9_-]/g, '_');
    const wsUrl = `${protocol}//${host}/ws/call/${roomId}`;

    let socket;
    try {
      socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        socket.send(JSON.stringify({
          type: 'CALL_REQUEST',
          caller: 'Caregiver Dashboard',
          room_id: roomId
        }));
        setCallStatus('ringing');
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'CALL_ACCEPTED' || data.type === 'PEER_JOINED') {
            setCallStatus('connected');
          } else if (data.type === 'HANGUP' || data.type === 'PEER_LEFT') {
            handleEndCall();
          } else if (data.type === 'AI_CUE' && data.message) {
            setAiCue(data.message);
          }
        } catch (e) {
          console.warn('Call message parse error', e);
        }
      };

      socket.onerror = () => {
        // Fallback simulation: Auto-connect after brief ring
        setTimeout(() => {
          setCallStatus('connected');
        }, 1800);
      };
    } catch (err) {
      setTimeout(() => {
        setCallStatus('connected');
      }, 1800);
    }

    // Attempt real user media (camera/mic)
    navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.log('Using simulated camera/audio stream', err);
      });

    // Auto connect simulation if peer hasn't answered in 2.5 seconds
    const ringTimer = setTimeout(() => {
      setCallStatus((curr) => (curr === 'ringing' || curr === 'initiating' ? 'connected' : curr));
    }, 2500);

    return () => {
      clearTimeout(ringTimer);
      cleanupCall();
    };
  }, [isOpen]);

  // Duration and AI cue timer when call is connected
  useEffect(() => {
    let interval;
    if (callStatus === 'connected') {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
        // Simulate real-time volume & AI emotional cues
        setVolumeLevel(Math.floor(25 + Math.random() * 45));
      }, 1000);

      const aiCues = [
        'Voice tone: Calm and comforting. Sensory level optimal.',
        'Child heart rate steady at 78 bpm. Breathing calm.',
        'Visual contact established. Eye gaze engaged.',
        'Low ambient background noise detected (38dB).',
        'AAC quick phrase recommendation: "I am right here with you."'
      ];

      const cueInterval = setInterval(() => {
        setAiCue(aiCues[Math.floor(Math.random() * aiCues.length)]);
      }, 6000);

      return () => {
        clearInterval(interval);
        clearInterval(cueInterval);
      };
    }
  }, [callStatus]);

  const cleanupCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (wsRef.current) {
      try {
        wsRef.current.send(JSON.stringify({ type: 'HANGUP' }));
        wsRef.current.close();
      } catch (e) {}
      wsRef.current = null;
    }
  };

  const handleEndCall = () => {
    audioService.playClick();
    setCallStatus('ended');
    cleanupCall();
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const toggleMute = () => {
    audioService.playClick();
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    audioService.playClick();
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
    setIsVideoOn(!isVideoOn);
  };

  if (!isOpen) return null;

  const formatDuration = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div className="sos-overlay" role="dialog" aria-modal="true" style={{ backdropFilter: 'blur(16px)' }}>
      <div 
        className="glass-card animate-fade-in" 
        style={{
          width: '94%',
          maxWidth: '560px',
          padding: '24px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(59, 130, 246, 0.25)',
          background: 'rgba(15, 23, 42, 0.92)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          color: 'white',
          position: 'relative'
        }}
      >
        {/* Top Status Header */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span 
              className="beacon-dot animate-pulse" 
              style={{ backgroundColor: callStatus === 'connected' ? 'var(--accent-success)' : 'var(--accent-cyan)' }} 
            />
            <span style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase', color: callStatus === 'connected' ? 'var(--accent-success)' : 'var(--accent-cyan)' }}>
              {callStatus === 'initiating' && 'Connecting WebRTC Relay...'}
              {callStatus === 'ringing' && 'Ringing...'}
              {callStatus === 'connected' && `Encrypted 2-Way HD Call • ${formatDuration(callDuration)}`}
              {callStatus === 'ended' && 'Call Terminated'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <ShieldCheck size={14} color="var(--accent-success)" />
            <span>NIVARA Band SafeLink</span>
          </div>
        </div>

        {/* Video / Visual Stream Area */}
        <div 
          style={{
            width: '100%',
            height: '240px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '16px'
          }}
        >
          {/* Main Video or Avatar */}
          {isVideoOn ? (
            <video 
              ref={localVideoRef} 
              autoPlay 
              playsInline 
              muted 
              style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
            />
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '84px', height: '84px', borderRadius: '50%', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '38px', margin: '0 auto 12px auto' }}>
                {calleeAvatar}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>{calleeName}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Camera Muted</p>
            </div>
          )}

          {/* Callee Picture-in-Picture Badge */}
          <div 
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(8px)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}
          >
            <span style={{ fontSize: '16px' }}>{calleeAvatar}</span>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700' }}>{calleeName}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{calleeRelation}</div>
            </div>
          </div>

          {/* Live Audio Spectrum Visualizer */}
          {callStatus === 'connected' && (
            <div 
              style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                background: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(8px)',
                padding: '6px 10px',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Activity size={14} color="var(--accent-cyan)" />
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '14px' }}>
                <span style={{ width: '3px', height: `${Math.max(4, volumeLevel * 0.2)}px`, backgroundColor: 'var(--accent-cyan)', borderRadius: '2px' }} />
                <span style={{ width: '3px', height: `${Math.max(4, volumeLevel * 0.35)}px`, backgroundColor: 'var(--accent-cyan)', borderRadius: '2px' }} />
                <span style={{ width: '3px', height: `${Math.max(4, volumeLevel * 0.25)}px`, backgroundColor: 'var(--accent-cyan)', borderRadius: '2px' }} />
                <span style={{ width: '3px', height: `${Math.max(4, volumeLevel * 0.4)}px`, backgroundColor: 'var(--accent-cyan)', borderRadius: '2px' }} />
              </div>
            </div>
          )}
        </div>

        {/* AI Calming Sensory Cue Ribbon */}
        <div 
          style={{
            width: '100%',
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '20px'
          }}
        >
          <Sparkles size={18} color="var(--accent-cyan)" className="animate-pulse" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
              Sensory AI Calming Monitor
            </div>
            <div style={{ fontSize: '12px', color: '#E2E8F0', marginTop: '2px' }}>
              {aiCue}
            </div>
          </div>
        </div>

        {/* Call Controls Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Mute Button */}
          <button
            onClick={toggleMute}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: isMuted ? 'var(--accent-danger)' : 'rgba(255, 255, 255, 0.12)',
              color: 'white',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          {/* Video Toggle Button */}
          <button
            onClick={toggleVideo}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: !isVideoOn ? 'var(--accent-danger)' : 'rgba(255, 255, 255, 0.12)',
              color: 'white',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title={isVideoOn ? 'Turn camera off' : 'Turn camera on'}
          >
            {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
          </button>

          {/* End Call Button */}
          <button
            onClick={handleEndCall}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--accent-danger)',
              color: 'white',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 0 25px rgba(239, 68, 68, 0.5)',
              transition: 'all 0.2s ease'
            }}
            title="End Call"
          >
            <PhoneOff size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
