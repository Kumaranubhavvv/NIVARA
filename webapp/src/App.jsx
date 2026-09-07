import React, { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import SosModal from './components/layout/SosModal';
import CallModal from './components/layout/CallModal';
import DashboardView from './views/DashboardView';
import SafetyView from './views/SafetyView';
import AacView from './views/AacView';
import SensoryView from './views/SensoryView';
import RoutineView from './views/RoutineView';
import CommunityView from './views/CommunityView';
import { api } from './services/api';
import { mockChild } from './mock/mockData';

export default function App() {
  const [theme, setTheme] = useState('light');
  const [activeView, setActiveView] = useState('dashboard');
  const [child, setChild] = useState(mockChild);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [callContact, setCallContact] = useState(null);

  // Sync theme with body class for instant dark/light styling
  useEffect(() => {
    document.body.className = `${theme}-theme`;
  }, [theme]);

  // Attempt live sync with backend, seamlessly fall back to mock telemetry
  useEffect(() => {
    async function loadData() {
      const data = await api.getChildStatus();
      if (data && data.name) {
        setChild((prev) => ({ ...prev, ...data }));
      }
    }
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleTheme = () => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  };

  const handleTriggerSos = async () => {
    setIsSosOpen(true);
    await api.triggerEmergency(child.id);
  };

  const handleResolveSos = async () => {
    await api.resolveEmergency('active-sos');
    setIsSosOpen(false);
  };

  const handleStartCall = (contact = null) => {
    setCallContact(contact);
    setIsCallOpen(true);
  };

  return (
    <div className="app-container">
      {/* Ambient Radial Background Glow */}
      <div className="ambient-glow" />

      {/* Navigation Sidebar Rail */}
      <Sidebar
        activeView={activeView}
        onViewChange={(view) => {
          setActiveView(view);
          setIsSidebarOpen(false);
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main App Content Viewport */}
      <div className="app-main">
        {/* Top Telemetry Header */}
        <Navbar
          child={child}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onTriggerSos={handleTriggerSos}
          onStartCall={() => handleStartCall(null)}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Dynamic Animated View Area */}
        <main className="content-viewport">
          {activeView === 'dashboard' && (
            <DashboardView
              child={child}
              onNavigate={(view) => setActiveView(view)}
              onTriggerSos={handleTriggerSos}
              onStartCall={handleStartCall}
            />
          )}
          {activeView === 'safety' && (
            <SafetyView
              child={child}
              onTriggerSos={handleTriggerSos}
              onStartCall={handleStartCall}
            />
          )}
          {activeView === 'aac' && <AacView />}
          {activeView === 'sensory' && <SensoryView />}
          {activeView === 'routines' && <RoutineView child={child} />}
          {activeView === 'community' && <CommunityView />}
        </main>
      </div>

      {/* Emergency SOS Modal Overlay */}
      <SosModal
        isOpen={isSosOpen}
        child={child}
        onClose={() => setIsSosOpen(false)}
        onResolve={handleResolveSos}
        onStartCall={handleStartCall}
      />

      {/* WebRTC Live Voice/Video Call Modal */}
      <CallModal
        isOpen={isCallOpen}
        contact={callContact}
        child={child}
        onClose={() => setIsCallOpen(false)}
      />
    </div>
  );
}

