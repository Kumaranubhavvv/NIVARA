import React from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  BatteryCharging, 
  Heart, 
  Radio, 
  MessageSquareHeart, 
  Sparkles, 
  CheckCircle2, 
  Users2, 
  AlertTriangle,
  ArrowRight,
  Clock,
  Compass,
  PhoneCall
} from 'lucide-react';
import { audioService } from '../services/audioService';

export default function DashboardView({ child, onNavigate, onTriggerSos, onStartCall }) {
  const isSafe = child.status === 'SAFE';

  return (
    <div className="animate-fade-in">
      {/* Top Welcome & Status Banner */}
      <div 
        className="glass-card" 
        style={{ 
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(56, 189, 248, 0.1) 100%)',
          border: '1px solid var(--border-glow)',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Real-Time Caregiver Telemetry
            </span>
            <span className="beacon-dot animate-pulse" style={{ backgroundColor: 'var(--accent-cyan)' }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)' }}>
            Welcome back! Monitoring {child.name}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            {child.diagnosis} • Currently at <strong style={{ color: 'var(--text-primary)' }}>{child.currentZone}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button 
            className="glass-card"
            style={{
              padding: '12px 18px',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, rgba(74, 144, 226, 0.2) 0%, rgba(111, 207, 151, 0.15) 100%)',
              border: '1px solid var(--accent-cyan)',
              color: 'var(--text-primary)',
              fontWeight: '700',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
            onClick={() => {
              audioService.playClick();
              onStartCall && onStartCall();
            }}
            title="Start live 2-way WebRTC voice/video call with tracker band"
          >
            <PhoneCall size={16} color="var(--accent-cyan)" />
            <span>Live 2-Way Call</span>
          </button>

          <button 
            className="sos-quick-btn"
            onClick={() => {
              audioService.playSiren();
              onTriggerSos();
            }}
          >
            <AlertTriangle size={18} />
            HOLD SOS ALERT
          </button>
        </div>
      </div>

      {/* 4 Telemetry Feature Cards */}
      <div className="dashboard-grid" style={{ marginTop: 0, marginBottom: '24px' }}>
        {/* Card 1: Safe Zone Status */}
        <div className="col-3 glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Zone</span>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '4px' }}>
                {isSafe ? 'Secure Zone' : 'Breach Detected'}
              </h3>
            </div>
            <div style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: 'var(--radius-sm)', 
              background: isSafe ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: isSafe ? 'var(--accent-success)' : 'var(--accent-danger)'
            }}>
              <ShieldCheck size={22} />
            </div>
          </div>
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <MapPin size={14} color="var(--accent-cyan)" />
            <span>{child.currentZone}</span>
          </div>
        </div>

        {/* Card 2: GPS SmartBand Battery */}
        <div className="col-3 glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Band Battery</span>
              <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                {child.telemetry?.battery}%
              </h3>
            </div>
            <div style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: 'var(--radius-sm)', 
              background: 'rgba(56, 189, 248, 0.15)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'var(--accent-cyan)'
            }}>
              <BatteryCharging size={22} />
            </div>
          </div>
          <div style={{ marginTop: '16px', width: '100%', height: '6px', background: 'var(--bg-tertiary)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ width: `${child.telemetry?.battery}%`, height: '100%', background: 'var(--accent-cyan)', borderRadius: '999px' }} />
          </div>
        </div>

        {/* Card 3: Proximity Separation */}
        <div className="col-3 glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Proximity Radar</span>
              <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                {child.telemetry?.separationDistance} <span style={{ fontSize: '14px', fontWeight: '600' }}>meters</span>
              </h3>
            </div>
            <div style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: 'var(--radius-sm)', 
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'var(--accent-primary)'
            }}>
              <Radio size={22} className="animate-pulse" />
            </div>
          </div>
          <div style={{ marginTop: '16px', fontSize: '12px', color: 'var(--accent-success)', fontWeight: '600' }}>
            ✓ Within safe caregiver boundary (&lt; 15m)
          </div>
        </div>

        {/* Card 4: Biometrics / Heart Rate */}
        <div className="col-3 glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Child Biometrics</span>
              <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                {child.telemetry?.heartRate} <span style={{ fontSize: '14px', fontWeight: '600' }}>BPM</span>
              </h3>
            </div>
            <div style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: 'var(--radius-sm)', 
              background: 'rgba(244, 63, 94, 0.15)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'var(--accent-danger)'
            }}>
              <Heart size={22} className="animate-pulse" />
            </div>
          </div>
          <div style={{ marginTop: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            Resting & Calm • No stress spike
          </div>
        </div>
      </div>

      {/* Main Core Modules Gateway */}
      <div className="section-header">
        <div>
          <h3 className="section-title">Essential Care Portals</h3>
          <p className="section-subtitle">Direct access to safety, communication and sensory regulation modules</p>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginTop: 0 }}>
        {/* Portal 1: Live Radar */}
        <div 
          className="col-6 glass-card"
          style={{ cursor: 'pointer' }}
          onClick={() => {
            audioService.playClick();
            onNavigate('safety');
          }}
        >
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: 'var(--radius-md)', 
              background: 'var(--gradient-brand)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white',
              boxShadow: 'var(--shadow-glow)'
            }}>
              <Compass size={28} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>Live GPS Radar & Geofences</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Track live location on interactive radar, configure 4 safe zones and configure separation alerts.
              </p>
            </div>
            <ArrowRight size={20} color="var(--accent-cyan)" />
          </div>
        </div>

        {/* Portal 2: AAC Communicator */}
        <div 
          className="col-6 glass-card"
          style={{ cursor: 'pointer' }}
          onClick={() => {
            audioService.playClick();
            onNavigate('aac');
          }}
        >
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: 'var(--radius-md)', 
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.35)'
            }}>
              <MessageSquareHeart size={28} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>AAC Picture & Speech Board</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                High-contrast communication cards with real Web Speech synthesis and multi-word sentence builder.
              </p>
            </div>
            <ArrowRight size={20} color="var(--accent-success)" />
          </div>
        </div>

        {/* Portal 3: Sensory Calming Room */}
        <div 
          className="col-6 glass-card"
          style={{ cursor: 'pointer' }}
          onClick={() => {
            audioService.playClick();
            onNavigate('sensory');
          }}
        >
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: 'var(--radius-md)', 
              background: 'linear-gradient(135deg, #A855F7 0%, #6366F1 100%)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 0 20px rgba(168, 85, 247, 0.35)'
            }}>
              <Sparkles size={28} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>Sensory Calming Room</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Guided 4-4-4-4 box breathing bubble, procedural rain & ocean soundscapes, and sensory overload relief.
              </p>
            </div>
            <ArrowRight size={20} color="var(--accent-purple)" />
          </div>
        </div>

        {/* Portal 4: Visual Routine Tracker */}
        <div 
          className="col-6 glass-card"
          style={{ cursor: 'pointer' }}
          onClick={() => {
            audioService.playClick();
            onNavigate('routines');
          }}
        >
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: 'var(--radius-md)', 
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 0 20px rgba(245, 158, 11, 0.35)'
            }}>
              <CheckCircle2 size={28} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>Daily Visual Routines & Rewards</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Interactive checklists for Morning, Afternoon, and Bedtime with reward tokens and confetti celebration.
              </p>
            </div>
            <ArrowRight size={20} color="var(--accent-warning)" />
          </div>
        </div>
      </div>
    </div>
  );
}
