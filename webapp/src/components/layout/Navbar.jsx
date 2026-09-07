import React from 'react';
import { 
  ShieldCheck, 
  BatteryMedium, 
  Heart, 
  Bluetooth, 
  Radio, 
  AlertTriangle, 
  Sun, 
  Moon, 
  Menu,
  PhoneCall
} from 'lucide-react';
import { audioService } from '../../services/audioService';

export default function Navbar({ 
  child, 
  theme, 
  onToggleTheme, 
  onTriggerSos,
  onStartCall,
  onToggleSidebar 
}) {
  const isSafe = child.status === 'SAFE';

  return (
    <header className="app-navbar">
      {/* Mobile Menu Toggle & Child Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          className="theme-toggle-btn hide-on-desktop" 
          onClick={onToggleSidebar}
          aria-label="Toggle menu"
          style={{ display: 'none' }}
        >
          <Menu size={20} />
        </button>

        <div className="child-selector">
          <div className="child-avatar">
            {child.avatar || '👦🏽'}
          </div>
          <div className="child-info-text">
            <h4>{child.name}</h4>
            <p>{child.currentZone || 'Greenwood Elementary'}</p>
          </div>
        </div>
      </div>

      {/* Telemetry Status Strip */}
      <div className="telemetry-strip">
        {/* Safety Zone Status */}
        <div className={`telemetry-pill ${isSafe ? 'safe' : 'danger'}`}>
          <div className="beacon-dot animate-pulse" />
          <ShieldCheck size={16} />
          <span>{isSafe ? 'Inside Safe Zone' : 'Zone Breach Alert'}</span>
        </div>

        {/* GPS Band Battery */}
        <div className="telemetry-pill">
          <BatteryMedium size={16} color="var(--accent-cyan)" />
          <span style={{ fontFamily: 'var(--font-mono)' }}>{child.telemetry?.battery || 92}%</span>
        </div>

        {/* Heart Rate */}
        <div className="telemetry-pill">
          <Heart size={16} color="var(--accent-danger)" className="animate-pulse" />
          <span style={{ fontFamily: 'var(--font-mono)' }}>{child.telemetry?.heartRate || 78} bpm</span>
        </div>

        {/* BLE SmartBand & Proximity */}
        <div className="telemetry-pill">
          <Bluetooth size={16} color="var(--accent-primary)" />
          <span>{child.telemetry?.separationDistance || 4.2}m Proximity</span>
        </div>
      </div>

      {/* Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Dark/Light Mode Switcher */}
        <button 
          className="theme-toggle-btn"
          onClick={() => {
            audioService.playClick();
            onToggleTheme();
          }}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Live 2-Way HD Call */}
        <button
          className="glass-card"
          onClick={() => {
            audioService.playClick();
            onStartCall && onStartCall();
          }}
          style={{
            padding: '8px 14px',
            borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(135deg, rgba(74, 144, 226, 0.25) 0%, rgba(111, 207, 151, 0.2) 100%)',
            border: '1px solid var(--accent-cyan)',
            color: 'var(--text-primary)',
            fontSize: '12px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
          }}
          title="Start 2-Way Encrypted Voice/Video Call with Child Band"
        >
          <PhoneCall size={14} color="var(--accent-cyan)" />
          <span>Live Call</span>
        </button>

        {/* SOS Emergency Dispatcher */}
        <button 
          className="sos-quick-btn animate-sos-flash"
          onClick={() => {
            audioService.playSiren();
            onTriggerSos();
          }}
          title="Emergency Dispatch & Proximity Alert"
        >
          <AlertTriangle size={16} />
          <span>SOS EMERGENCY</span>
        </button>
      </div>
    </header>
  );
}
