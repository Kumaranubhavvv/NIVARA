import React from 'react';
import { 
  LayoutDashboard, 
  Radio, 
  MessageSquareHeart, 
  Sparkles, 
  CheckCircle2, 
  Users2,
  Shield,
  HelpCircle
} from 'lucide-react';
import { audioService } from '../../services/audioService';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard, category: 'Core Hub' },
  { id: 'safety', label: 'Live GPS Radar', icon: Radio, category: 'Care & Safety', badge: 'Active' },
  { id: 'aac', label: 'AAC Communicator', icon: MessageSquareHeart, category: 'Assisted Speech' },
  { id: 'sensory', label: 'Sensory Calming Room', icon: Sparkles, category: 'Sensory Support' },
  { id: 'routines', label: 'Visual Routines', icon: CheckCircle2, category: 'Learning & Habit' },
  { id: 'community', label: 'Caregiver Forum', icon: Users2, category: 'Network' },
];

export default function Sidebar({ activeView, onViewChange, isOpen, onClose }) {
  let lastCategory = '';

  return (
    <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand-logo-badge">
          <Shield size={24} />
        </div>
        <div>
          <h1 className="brand-title">NIVARA</h1>
          <p className="brand-subtitle">Assistive Care Suite</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="nav-menu">
        {NAV_ITEMS.map((item) => {
          const showCategory = item.category !== lastCategory;
          lastCategory = item.category;

          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <React.Fragment key={item.id}>
              {showCategory && (
                <span className="nav-category-title">{item.category}</span>
              )}
              <button
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  audioService.playClick();
                  onViewChange(item.id);
                  if (onClose) onClose();
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </button>
            </React.Fragment>
          );
        })}
      </nav>

      {/* Sidebar Footer with Status */}
      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px' }}>
          <div className="beacon-dot" style={{ backgroundColor: 'var(--accent-success)' }} />
          <div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)' }}>NIVARA Engine</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>v2.4 Live Synchronized</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
