import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield,
  ShieldCheck, 
  MapPin, 
  Radio, 
  AlertTriangle, 
  Plus, 
  Sliders, 
  Compass, 
  Navigation, 
  Eye, 
  Check, 
  X,
  PhoneCall,
  Crosshair,
  ZoomIn,
  ZoomOut,
  Volume2,
  Activity,
  BatteryCharging,
  Wifi,
  Sparkles,
  Layers,
  Heart,
  Home,
  GraduationCap,
  Hospital,
  Maximize2,
  ShieldAlert,
  UserCheck,
  Play,
  Pause,
  RotateCcw,
  Satellite,
  Navigation2
} from 'lucide-react';
import { audioService } from '../services/audioService';
import { api } from '../services/api';
import { mockSafeZones, mockEmergencyContacts } from '../mock/mockData';

export default function SafetyView({ child, onTriggerSos, onStartCall }) {
  const [zones, setZones] = useState(mockSafeZones);
  const [simulatedBreach, setSimulatedBreach] = useState(false);
  const [separationThreshold, setSeparationThreshold] = useState(15);
  const [currentSeparation, setCurrentSeparation] = useState(4.2);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneType, setNewZoneType] = useState('HOME');
  const [newZoneRadius, setNewZoneRadius] = useState(150);
  const [showAddZone, setShowAddZone] = useState(false);
  
  // Interactive HUD States
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showVitalsCard, setShowVitalsCard] = useState(true);
  const [pingActive, setPingActive] = useState(false);
  const [radarBeamEnabled, setRadarBeamEnabled] = useState(true);

  // Live GPS Telemetry from Backend
  const [telemetry, setTelemetry] = useState({
    latitude: 28.61392,
    longitude: 77.20904,
    altitude: 216.4,
    speed: 1.2,
    heading: 34,
    accuracy: 3.2,
    heart_rate: 78,
    battery: 92,
    signal_rssi: -58,
    is_safe: true,
    status_mode: 'SAFE',
    active_zone: 'Greenwood School',
    zone_type: 'SCHOOL',
    separation_distance: 4.2,
    threshold_distance: 15.0,
    satellite_count: 12,
    map_x: 545,
    map_y: 335,
    last_updated: new Date().toISOString(),
    history: [
      { lat: 28.61350, lng: 77.20840, map_x: 510, map_y: 360, time: '3 mins ago' },
      { lat: 28.61372, lng: 77.20875, map_x: 530, map_y: 348, time: '2 mins ago' },
      { lat: 28.61392, lng: 77.20904, map_x: 545, map_y: 335, time: 'Just now' }
    ]
  });

  const [backendConnected, setBackendConnected] = useState(false);
  const [isPatrolWalking, setIsPatrolWalking] = useState(false);
  const patrolIntervalRef = useRef(null);
  const patrolStepRef = useRef(0);

  // Patrol route simulation waypoints
  const patrolWaypoints = [
    { map_x: 545, map_y: 335, lat: 28.61392, lng: 77.20904, heading: 45, speed: 1.2, dist: 4.2, is_safe: true },
    { map_x: 600, map_y: 320, lat: 28.61440, lng: 77.20970, heading: 75, speed: 1.4, dist: 7.8, is_safe: true },
    { map_x: 640, map_y: 300, lat: 28.61510, lng: 77.21040, heading: 60, speed: 2.1, dist: 13.5, is_safe: true },
    { map_x: 720, map_y: 260, lat: 28.61680, lng: 77.21200, heading: 40, speed: 3.2, dist: 24.5, is_safe: false },
    { map_x: 820, map_y: 230, lat: 28.61850, lng: 77.21400, heading: 25, speed: 3.6, dist: 38.0, is_safe: false },
    { map_x: 760, map_y: 190, lat: 28.61780, lng: 77.21320, heading: 300, speed: 2.8, dist: 31.0, is_safe: false },
    { map_x: 620, map_y: 220, lat: 28.61550, lng: 77.21060, heading: 220, speed: 2.0, dist: 14.8, is_safe: true },
    { map_x: 545, map_y: 335, lat: 28.61392, lng: 77.20904, heading: 180, speed: 1.1, dist: 4.2, is_safe: true }
  ];

  // Poll backend GPS Telemetry API every 2.5 seconds
  useEffect(() => {
    let isMounted = true;

    const fetchGps = async () => {
      try {
        const data = await api.getLiveGps(child?.id || 'child-aarav-01');
        if (data && isMounted) {
          setBackendConnected(true);
          setTelemetry(prev => ({
            ...prev,
            ...data,
            map_x: data.map_x ?? (data.is_safe ? 545 : 830),
            map_y: data.map_y ?? (data.is_safe ? 335 : 240)
          }));
          setSimulatedBreach(!data.is_safe);
          setCurrentSeparation(data.separation_distance ?? 4.2);
          if (data.threshold_distance) {
            setSeparationThreshold(data.threshold_distance);
          }
        }
      } catch (err) {
        if (isMounted) setBackendConnected(false);
      }
    };

    fetchGps();
    const interval = setInterval(fetchGps, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [child?.id]);

  // Route Patrol simulation walk
  useEffect(() => {
    if (isPatrolWalking) {
      patrolIntervalRef.current = setInterval(async () => {
        patrolStepRef.current = (patrolStepRef.current + 1) % patrolWaypoints.length;
        const pt = patrolWaypoints[patrolStepRef.current];

        if (!pt.is_safe && !simulatedBreach) {
          audioService.playSiren();
        } else if (pt.is_safe && simulatedBreach) {
          audioService.playSuccessChime();
        }

        const newHistory = [
          ...telemetry.history,
          { lat: pt.lat, lng: pt.lng, map_x: pt.map_x, map_y: pt.map_y, time: 'Just now' }
        ].slice(-8);

        const updated = {
          latitude: pt.lat,
          longitude: pt.lng,
          map_x: pt.map_x,
          map_y: pt.map_y,
          heading: pt.heading,
          speed: pt.speed,
          separation_distance: pt.dist,
          is_safe: pt.is_safe,
          status_mode: pt.is_safe ? 'SAFE' : 'BREACH',
          history: newHistory
        };

        setTelemetry(prev => ({ ...prev, ...updated }));
        setSimulatedBreach(!pt.is_safe);
        setCurrentSeparation(pt.dist);

        // Sync with FastAPI backend
        await api.updateGpsTelemetry(updated);
      }, 2200);
    } else {
      if (patrolIntervalRef.current) clearInterval(patrolIntervalRef.current);
    }

    return () => {
      if (patrolIntervalRef.current) clearInterval(patrolIntervalRef.current);
    };
  }, [isPatrolWalking, simulatedBreach, telemetry.history]);

  // Toggle simulate breach (Unsafe Red Signal vs Safe Yellow State)
  const handleToggleBreach = async () => {
    audioService.playClick();
    const nextBreach = !simulatedBreach;
    const nextDist = nextBreach ? 22.5 : 4.2;
    const nextX = nextBreach ? 830 : 545;
    const nextY = nextBreach ? 240 : 335;
    const nextLat = nextBreach ? 28.61850 : 28.61392;
    const nextLng = nextBreach ? 28.61850 : 77.20904;

    if (nextBreach) {
      setSimulatedBreach(true);
      setCurrentSeparation(nextDist);
      audioService.playSiren();
    } else {
      setSimulatedBreach(false);
      setCurrentSeparation(nextDist);
      audioService.playSuccessChime();
    }

    const payload = {
      is_safe: !nextBreach,
      status_mode: nextBreach ? 'BREACH' : 'SAFE',
      separation_distance: nextDist,
      map_x: nextX,
      map_y: nextY,
      latitude: nextLat,
      longitude: nextLng,
      speed: nextBreach ? 3.4 : 1.2,
      heart_rate: nextBreach ? 108 : 78
    };

    setTelemetry(prev => ({ ...prev, ...payload }));
    await api.updateGpsTelemetry(payload);
  };

  // Reset GPS to default safe home position
  const handleResetGps = async () => {
    audioService.playSuccessChime();
    setIsPatrolWalking(false);
    patrolStepRef.current = 0;
    const resetData = await api.resetGpsTelemetry();
    if (resetData) {
      setTelemetry(prev => ({ ...prev, ...resetData }));
      setSimulatedBreach(false);
      setCurrentSeparation(resetData.separation_distance || 4.2);
    } else {
      setSimulatedBreach(false);
      setCurrentSeparation(4.2);
      setTelemetry(prev => ({
        ...prev,
        map_x: 545,
        map_y: 335,
        latitude: 28.61392,
        longitude: 77.20904,
        is_safe: true,
        status_mode: 'SAFE',
        separation_distance: 4.2
      }));
    }
  };

  // Interactive Click Anywhere on Map to Reposition Child & Test Geofence
  const handleMapClick = async (e) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const clickX = Math.round(((e.clientX - rect.left) / rect.width) * 1000);
    const clickY = Math.round(((e.clientY - rect.top) / rect.height) * 680);

    // Calculate distance from Greenwood School active safe center (545, 335)
    const dx = clickX - 545;
    const dy = clickY - 335;
    const distPixels = Math.hypot(dx, dy);
    // 115px SVG radius represents ~15.0m threshold
    const distMeters = +(distPixels * 0.13).toFixed(1);
    const isSafe = distMeters <= separationThreshold;

    const newLat = +(28.61392 + (335 - clickY) * 0.000035).toFixed(5);
    const newLng = +(77.20904 + (clickX - 545) * 0.000035).toFixed(5);
    const newHeading = Math.round((Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360);

    audioService.playClick();
    if (!isSafe && !simulatedBreach) {
      audioService.playSiren();
    } else if (isSafe && simulatedBreach) {
      audioService.playSuccessChime();
    }

    const newHist = [
      ...telemetry.history,
      { lat: newLat, lng: newLng, map_x: clickX, map_y: clickY, time: 'Just now' }
    ].slice(-8);

    const payload = {
      latitude: newLat,
      longitude: newLng,
      map_x: clickX,
      map_y: clickY,
      heading: newHeading,
      speed: isSafe ? 1.2 : 3.1,
      separation_distance: distMeters,
      is_safe: isSafe,
      status_mode: isSafe ? 'SAFE' : 'BREACH',
      history: newHist
    };

    setTelemetry(prev => ({ ...prev, ...payload }));
    setSimulatedBreach(!isSafe);
    setCurrentSeparation(distMeters);

    await api.updateGpsTelemetry(payload);
  };

  // Ping wearable band
  const handlePingBand = () => {
    audioService.playClick();
    setPingActive(true);
    setTimeout(() => {
      audioService.playSuccessChime();
      setTimeout(() => setPingActive(false), 2000);
    }, 400);
  };

  const handleAddZone = (e) => {
    e.preventDefault();
    if (!newZoneName.trim()) return;
    audioService.playClick();
    
    const colorMap = {
      HOME: '#F59E0B',
      SCHOOL: '#10B981',
      CLINIC: '#8B5CF6',
      PARK: '#10B981',
      CUSTOM: '#3B82F6'
    };

    const newZone = {
      id: 'sz-' + Date.now(),
      name: newZoneName,
      type: newZoneType,
      color: colorMap[newZoneType] || '#10B981',
      radius: Number(newZoneRadius) || 150,
      address: `${newZoneName}, Monitored Perimeter`,
      status: 'ACTIVE',
      containment: 'OUTSIDE',
    };
    setZones([...zones, newZone]);
    setNewZoneName('');
    setShowAddZone(false);
  };

  const currentX = telemetry.map_x ?? (simulatedBreach ? 830 : 545);
  const currentY = telemetry.map_y ?? (simulatedBreach ? 240 : 335);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '24px' }}>
      {/* Top Header & Live Telemetry Controls Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 className="section-title" style={{ margin: 0, fontSize: '22px' }}>Live GPS Radar & Geofence Map</h2>
            {/* Backend Connectivity Pill */}
            <span style={{ 
              fontSize: '11px', 
              fontWeight: '800', 
              padding: '3px 10px', 
              borderRadius: 'var(--radius-full)', 
              background: backendConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              color: backendConnected ? '#059669' : '#D97706',
              border: `1px solid ${backendConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <span style={{ 
                width: '7px', 
                height: '7px', 
                borderRadius: '50%', 
                background: backendConnected ? '#10B981' : '#F59E0B', 
                animation: 'satelliteBlink 1.4s infinite' 
              }} />
              {backendConnected ? 'FASTAPI GPS SYNC OK' : 'LOCAL TELEMETRY SYNC'}
            </span>
          </div>
          <p className="section-subtitle" style={{ margin: '4px 0 0 0', fontSize: '13px' }}>
            Interactive GPS telemetry • Click anywhere on map to relocate target • Safe Yellow perimeter & Red breach signal
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Zoom Controls */}
          <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-card)', padding: '4px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)' }}>
            <button 
              className="theme-toggle-btn"
              style={{ width: '32px', height: '32px', border: 'none', background: 'transparent' }}
              title="Zoom Out"
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.15, 0.85))}
            >
              <ZoomOut size={15} />
            </button>
            <button 
              className="theme-toggle-btn"
              style={{ width: '32px', height: '32px', border: 'none', background: 'transparent' }}
              title="Zoom In"
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.15, 1.35))}
            >
              <ZoomIn size={15} />
            </button>
          </div>

          {/* Toggle Radar Sweep Beam */}
          <button
            onClick={() => setRadarBeamEnabled(prev => !prev)}
            style={{ 
              padding: '8px 14px', 
              borderRadius: 'var(--radius-full)', 
              fontWeight: '700', 
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              background: radarBeamEnabled ? 'rgba(79, 70, 229, 0.15)' : 'var(--bg-card)',
              color: radarBeamEnabled ? '#4F46E5' : 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)'
            }}
            title="Toggle rotating radar sweep animation"
          >
            <Radio size={14} />
            <span>{radarBeamEnabled ? 'Radar Sweep: ON' : 'Radar Sweep: OFF'}</span>
          </button>

          {/* Simulate Route Patrol Walking */}
          <button
            onClick={() => {
              audioService.playClick();
              setIsPatrolWalking(!isPatrolWalking);
            }}
            style={{ 
              padding: '8px 16px', 
              borderRadius: 'var(--radius-full)', 
              fontWeight: '800', 
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              background: isPatrolWalking ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'var(--bg-card)',
              color: isPatrolWalking ? '#FFFFFF' : 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              boxShadow: isPatrolWalking ? '0 4px 14px rgba(16, 185, 129, 0.4)' : 'none'
            }}
          >
            {isPatrolWalking ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPatrolWalking ? 'Pause Walk' : 'Simulate Walk Route'}</span>
          </button>

          {/* Reset to Safe Center */}
          <button
            onClick={handleResetGps}
            style={{ 
              padding: '8px 14px', 
              borderRadius: 'var(--radius-full)', 
              fontWeight: '700', 
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)'
            }}
            title="Reset position to Greenwood School center"
          >
            <RotateCcw size={13} />
            <span>Reset Position</span>
          </button>

          {/* Ping Wearable Band */}
          <button
            onClick={handlePingBand}
            style={{ 
              padding: '8px 14px', 
              borderRadius: 'var(--radius-full)', 
              fontWeight: '700', 
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              background: pingActive ? 'rgba(56, 189, 248, 0.25)' : 'var(--bg-card)',
              color: pingActive ? '#0284C7' : 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <Volume2 size={14} color={pingActive ? '#0284C7' : 'var(--text-secondary)'} />
            <span>{pingActive ? 'Pinging Band...' : 'Ping Band'}</span>
          </button>

          {/* Toggle Simulated Breach Button */}
          <button
            onClick={handleToggleBreach}
            style={{ 
              padding: '8px 18px', 
              borderRadius: 'var(--radius-full)', 
              fontWeight: '800', 
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              background: simulatedBreach ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              color: '#FFFFFF',
              border: 'none',
              boxShadow: simulatedBreach ? '0 6px 20px rgba(239, 68, 68, 0.5)' : '0 6px 20px rgba(245, 158, 11, 0.4)',
              transition: 'all 0.2s ease'
            }}
          >
            <AlertTriangle size={16} />
            {simulatedBreach ? 'Reset to Safe (Yellow)' : 'Simulate Red Signal Breach'}
          </button>
        </div>
      </div>

      {/* Breach Alert Notice if Active */}
      {simulatedBreach && (
        <div 
          className="animate-sos-flash" 
          style={{ 
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.96) 0%, rgba(220, 38, 38, 0.96) 100%)', 
            color: 'white',
            marginBottom: '16px',
            padding: '14px 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(239, 68, 68, 0.45)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShieldAlert size={26} color="white" />
            <div>
              <div style={{ fontSize: '15px', fontWeight: '900' }}>
                CRITICAL RED ALERT: {child?.name || telemetry.child_name} has moved OUTSIDE designated safe perimeter!
              </div>
              <div style={{ fontSize: '12px', opacity: 0.95, marginTop: '2px' }}>
                Distance: {currentSeparation}m (Exceeds threshold of {separationThreshold}m) • Telemetry: {telemetry.latitude}° N, {telemetry.longitude}° E • Dispatched alerts to 3 caregivers
              </div>
            </div>
          </div>
          <button 
            className="sos-quick-btn"
            onClick={onTriggerSos}
            style={{ padding: '8px 20px', fontSize: '12px', fontWeight: '900', background: 'white', color: '#DC2626' }}
          >
            DISPATCH SOS
          </button>
        </div>
      )}

      {/* ==================================================================== */}
      {/* NIVARA PASTEL CITY MAP VIEWPORT WITH ANIMATED RADAR & GPS ENGINE     */}
      {/* ==================================================================== */}
      <div 
        className="nivara-map-frame"
        style={{ 
          width: '100%', 
          height: '570px', 
          position: 'relative',
          borderRadius: '24px',
          overflow: 'hidden',
          marginBottom: '20px',
          cursor: 'crosshair',
          boxShadow: simulatedBreach 
            ? '0 20px 50px rgba(239, 68, 68, 0.28), 0 0 0 3px #EF4444' 
            : '0 20px 50px rgba(245, 158, 11, 0.16), 0 0 0 2px rgba(245, 158, 11, 0.65)'
        }}
      >
        {/* Corner Neon Brackets */}
        <div style={{ position: 'absolute', top: 12, left: 12, width: 18, height: 18, borderTop: `3px solid ${simulatedBreach ? '#EF4444' : '#F59E0B'}`, borderLeft: `3px solid ${simulatedBreach ? '#EF4444' : '#F59E0B'}`, borderTopLeftRadius: '6px', zIndex: 8, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 12, right: 12, width: 18, height: 18, borderTop: `3px solid ${simulatedBreach ? '#EF4444' : '#F59E0B'}`, borderRight: `3px solid ${simulatedBreach ? '#EF4444' : '#F59E0B'}`, borderTopRightRadius: '6px', zIndex: 8, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 12, left: 12, width: 18, height: 18, borderBottom: '3px solid #38BDF8', borderLeft: '3px solid #38BDF8', borderBottomLeftRadius: '6px', zIndex: 8, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 12, right: 12, width: 18, height: 18, borderBottom: '3px solid #38BDF8', borderRight: '3px solid #38BDF8', borderBottomRightRadius: '6px', zIndex: 8, pointerEvents: 'none' }} />

        {/* FLOATING TOP-LEFT CARD: "SAFE TARGET VITALS & GPS TELEMETRY" */}
        {showVitalsCard && (
          <div 
            className="nivara-vitals-card animate-fade-in"
            style={{ 
              position: 'absolute', 
              top: '18px', 
              left: '18px', 
              width: '390px',
              maxWidth: 'calc(100% - 36px)',
              borderColor: simulatedBreach ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.35)',
              zIndex: 10
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Live Coordinates */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '10px', 
                  background: simulatedBreach ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.15)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: simulatedBreach ? '#EF4444' : '#D97706'
                }}>
                  <Shield size={18} fill={simulatedBreach ? '#EF4444' : '#F59E0B'} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '900', color: simulatedBreach ? '#DC2626' : '#B45309', letterSpacing: '0.3px' }}>
                    {simulatedBreach ? 'ALERT: OUT OF BOUNDS' : 'YELLOW SAFE TARGET VITALS'}
                  </h4>
                  <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'var(--font-mono)', marginTop: '1px' }}>
                    GPS: {telemetry.latitude}° N, {telemetry.longitude}° E
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setShowVitalsCard(false)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* 2x2 Grid of Metrics + Satellite HUD */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 14px' }}>
              {/* Heart Rate */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <Heart size={16} color="#4F46E5" fill="#4F46E5" style={{ marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>Heart Rate:</div>
                  <div style={{ fontSize: '15px', fontWeight: '900', color: simulatedBreach ? '#EF4444' : '#059669' }}>
                    {simulatedBreach ? '108 BPM' : `${telemetry.heart_rate} BPM`}
                  </div>
                </div>
              </div>

              {/* Speed */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <Activity size={16} color="#3B82F6" style={{ marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>Speed:</div>
                  <div style={{ fontSize: '13px', fontWeight: '900', color: '#1E293B' }}>
                    {telemetry.speed} m/s {simulatedBreach ? '(Running)' : '(Walking)'}
                  </div>
                </div>
              </div>

              {/* Radio Signal & Satellite */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <Wifi size={16} color={simulatedBreach ? '#EF4444' : '#10B981'} style={{ marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>Radio & Sats:</div>
                  <div style={{ fontSize: '12px', fontWeight: '900', color: simulatedBreach ? '#EF4444' : '#059669' }}>
                    {telemetry.signal_rssi}dBm • {telemetry.satellite_count} Sats
                  </div>
                </div>
              </div>

              {/* Wearable Battery */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <BatteryCharging size={16} color="#10B981" style={{ marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>Wearable Batt:</div>
                  <div style={{ fontSize: '13px', fontWeight: '900', color: '#10B981' }}>
                    {telemetry.battery}% 🔋
                  </div>
                </div>
              </div>
            </div>

            {/* Click-to-reposition notice banner */}
            <div style={{ 
              marginTop: '10px', 
              padding: '6px 10px', 
              borderRadius: '8px', 
              background: 'rgba(241, 245, 249, 0.8)', 
              fontSize: '10px', 
              color: '#475569', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px' 
            }}>
              <Crosshair size={12} color="#4F46E5" />
              <span>Click anywhere on the map to relocate target & sync GPS API</span>
            </div>
          </div>
        )}

        {/* FLOATING TOP-RIGHT PILL: "BEARING & COMPASS HEADING" */}
        <div 
          className="nivara-bearing-pill"
          style={{ 
            position: 'absolute', 
            top: '18px', 
            right: '18px',
            background: simulatedBreach 
              ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' 
              : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            boxShadow: simulatedBreach ? '0 6px 18px rgba(239, 68, 68, 0.4)' : '0 6px 18px rgba(245, 158, 11, 0.35)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            transform: `rotate(${telemetry.heading}deg)`,
            transition: 'transform 0.4s ease'
          }}>
            <Navigation2 size={18} color="white" fill="white" />
          </div>
          <span>BEARING: {String(telemetry.heading).padStart(3, '0')}° NNE</span>
        </div>

        {/* FLOATING BOTTOM-LEFT BANNER: "Target: Aarav Sharma | YELLOW SAFE ZONE PROTECTED / RED BREACH" */}
        <div 
          className="nivara-bottom-pill"
          style={{ 
            position: 'absolute', 
            bottom: '18px', 
            left: '18px',
            borderColor: simulatedBreach ? 'rgba(239, 68, 68, 0.45)' : 'rgba(245, 158, 11, 0.45)',
            boxShadow: simulatedBreach ? '0 10px 30px rgba(239, 68, 68, 0.2)' : '0 10px 30px rgba(245, 158, 11, 0.15)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Circular Navigation Icon */}
          <div style={{ 
            width: '34px', 
            height: '34px', 
            borderRadius: '50%', 
            background: simulatedBreach ? '#EF4444' : '#F59E0B', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white',
            boxShadow: simulatedBreach ? '0 4px 12px rgba(239, 68, 68, 0.4)' : '0 4px 12px rgba(245, 158, 11, 0.4)'
          }}>
            <Navigation size={16} fill="white" style={{ transform: 'rotate(45deg)' }} />
          </div>

          <span style={{ fontSize: '13px', color: '#1E293B', fontWeight: '700' }}>
            Target: <strong>{child?.name || telemetry.child_name}</strong>
          </span>

          <span style={{ color: '#CBD5E1' }}>|</span>

          {simulatedBreach ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '900', color: '#EF4444' }}>
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#EF4444', animation: 'redBeaconWave 1.4s infinite' }} />
              RED SIGNAL: OUTSIDE SAFE ZONE ({currentSeparation}m)
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '900', color: '#D97706' }}>
              <ShieldCheck size={18} color="#D97706" />
              YELLOW SAFE ZONE PROTECTED ({currentSeparation}m)
            </span>
          )}
        </div>

        {/* BOTTOM-RIGHT PETAL GRAPHIC MOTIF */}
        <div style={{ position: 'absolute', bottom: 10, right: 10, pointerEvents: 'none', zIndex: 9, opacity: 0.9 }}>
          <svg width="64" height="64" viewBox="0 0 100 100" fill="none">
            <path d="M 60 40 C 40 10, 80 0, 90 20 C 100 40, 80 60, 60 40 Z" fill="#F59E0B" opacity="0.85" />
            <path d="M 45 65 C 15 50, 20 85, 40 90 C 60 95, 65 75, 45 65 Z" fill="#818CF8" opacity="0.8" />
            <path d="M 75 75 C 65 55, 95 50, 95 70 C 95 90, 85 90, 75 75 Z" fill="#38BDF8" opacity="0.75" />
          </svg>
        </div>

        {/* ==================================================================== */}
        {/* SVG PASTEL CITY MAP CANVAS (Interactive & Animated)                  */}
        {/* ==================================================================== */}
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 1000 680" 
          preserveAspectRatio="xMidYMid slice"
          onClick={handleMapClick}
          style={{ 
            position: 'absolute', 
            inset: 0,
            transform: `scale(${zoomLevel})`,
            transformOrigin: '55% 45%',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <defs>
            {/* Canal Water Gradient */}
            <linearGradient id="canalWaterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>

            {/* Soft Green Botanical Gradient */}
            <linearGradient id="botanicalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(220, 252, 231, 0.85)" />
              <stop offset="100%" stopColor="rgba(187, 247, 208, 0.65)" />
            </linearGradient>

            {/* Radar Beam Sweep Gradient */}
            <radialGradient id="radarSweepGrad" cx="0%" cy="0%" r="100%">
              <stop offset="0%" stopColor={simulatedBreach ? "rgba(239, 68, 68, 0.45)" : "rgba(245, 158, 11, 0.4)"} />
              <stop offset="70%" stopColor={simulatedBreach ? "rgba(239, 68, 68, 0.15)" : "rgba(245, 158, 11, 0.15)"} />
              <stop offset="100%" stopColor="rgba(245, 158, 11, 0)" />
            </radialGradient>
          </defs>

          {/* Map Base Canvas */}
          <rect width="1000" height="680" fill="#EDF3F8" />

          {/* ================================================================ */}
          {/* CITY BLOCKS & RESIDENTIAL PARCELS                                */}
          {/* ================================================================ */}
          <rect x="30" y="40" width="110" height="140" rx="10" fill="#FFFFFF" opacity="0.9" />
          <rect x="160" y="40" width="120" height="120" rx="10" fill="#FFFFFF" opacity="0.9" />
          <rect x="300" y="40" width="160" height="110" rx="10" fill="#FFFFFF" opacity="0.9" />

          <rect x="30" y="200" width="90" height="120" rx="10" fill="#FFFFFF" opacity="0.85" />
          <rect x="140" y="180" width="80" height="80" rx="8" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
          <rect x="70" y="340" width="120" height="130" rx="10" fill="#FFFFFF" opacity="0.9" />
          <rect x="210" y="350" width="110" height="110" rx="10" fill="#FFFFFF" opacity="0.9" />

          <rect x="350" y="170" width="120" height="130" rx="10" fill="#FFFFFF" opacity="0.9" />
          <rect x="540" y="40" width="120" height="100" rx="10" fill="#FFFFFF" opacity="0.9" />
          <rect x="350" y="360" width="120" height="120" rx="10" fill="#FFFFFF" opacity="0.9" />
          <rect x="540" y="390" width="80" height="100" rx="10" fill="#FFFFFF" opacity="0.9" />

          <rect x="790" y="380" width="80" height="120" rx="10" fill="#FFFFFF" opacity="0.9" />
          <rect x="890" y="370" width="90" height="140" rx="10" fill="#FFFFFF" opacity="0.9" />
          <rect x="860" y="210" width="120" height="110" rx="10" fill="#FFFFFF" opacity="0.9" />

          {/* Botanical Reserve in Upper Right */}
          <g transform="rotate(8 760 160)">
            <rect 
              x="690" 
              y="110" 
              width="155" 
              height="115" 
              rx="16" 
              fill="url(#botanicalGrad)" 
              stroke="#86EFAC" 
              strokeWidth="1.5" 
            />
            <circle cx="720" cy="140" r="10" fill="#86EFAC" opacity="0.7" />
            <circle cx="750" cy="180" r="14" fill="#4ADE80" opacity="0.5" />
            <circle cx="810" cy="160" r="12" fill="#86EFAC" opacity="0.7" />
            <text x="768" y="172" fill="#15803D" fontSize="11" fontWeight="800" textAnchor="middle">
              🍃 Botanical Reserve
            </text>
          </g>

          {/* Tree Clusters */}
          <circle cx="590" cy="80" r="16" fill="#BBF7D0" opacity="0.7" />
          <circle cx="610" cy="95" r="12" fill="#86EFAC" opacity="0.8" />
          <circle cx="410" cy="570" r="14" fill="#BBF7D0" opacity="0.6" />
          <circle cx="435" cy="580" r="18" fill="#86EFAC" opacity="0.7" />
          <circle cx="730" cy="575" r="16" fill="#86EFAC" opacity="0.7" />

          {/* ================================================================ */}
          {/* ROAD NETWORK & HIGHWAYS                                          */}
          {/* ================================================================ */}
          <line x1="510" y1="-20" x2="510" y2="700" stroke="#FFFFFF" strokeWidth="26" />
          <line x1="510" y1="-20" x2="510" y2="700" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="6 6" />
          <text x="515" y="120" fill="#64748B" fontSize="9" fontFamily="var(--font-mono)" fontWeight="700" letterSpacing="2" transform="rotate(90 515 120)">
            ◀ ▲ SECTOR 42 ROAD
          </text>
          <text x="525" y="630" fill="#64748B" fontSize="11" fontFamily="var(--font-mono)" fontWeight="800">
            S ▼
          </text>

          {/* RING HIGHWAY (NH-44) */}
          <path 
            d="M -20 370 C 220 360, 480 340, 1020 310" 
            fill="none" 
            stroke="#FFFFFF" 
            strokeWidth="32" 
            strokeLinecap="round"
          />
          <path 
            d="M -20 370 C 220 360, 480 340, 1020 310" 
            fill="none" 
            stroke="#E2E8F0" 
            strokeWidth="2" 
            strokeDasharray="8 6"
          />
          <text x="300" y="352" fill="#64748B" fontSize="10" fontFamily="var(--font-mono)" fontWeight="800" letterSpacing="1.5">
            RING HIGHWAY (NH-44)
          </text>
          <text x="925" y="298" fill="#10B981" fontSize="11" fontWeight="800" fontFamily="var(--font-mono)">
            E
          </text>

          <line x1="-20" y1="180" x2="1020" y2="180" stroke="#FFFFFF" strokeWidth="14" />
          <line x1="280" y1="-20" x2="280" y2="700" stroke="#FFFFFF" strokeWidth="16" />
          <line x1="740" y1="-20" x2="740" y2="700" stroke="#FFFFFF" strokeWidth="16" />
          <line x1="880" y1="-20" x2="880" y2="700" stroke="#FFFFFF" strokeWidth="14" />

          {/* Canal Waterway */}
          <path 
            d="M -20 530 C 180 470, 360 520, 510 570 C 680 620, 840 600, 1020 630 L 1020 700 L -20 700 Z" 
            fill="url(#canalWaterGrad)" 
            opacity="0.88"
          />
          <path 
            d="M -20 550 C 180 490, 360 540, 510 590 C 680 640, 840 620, 1020 650" 
            fill="none" 
            stroke="#93C5FD" 
            strokeWidth="2" 
            opacity="0.6"
          />
          <text x="420" y="525" fill="#1E40AF" fontSize="10" fontFamily="var(--font-mono)" fontWeight="800" letterSpacing="1.2">
            CANAL WATERWAY & GREEN WAY
          </text>

          {/* Bridge Overpass */}
          <rect x="495" y="555" width="30" height="24" rx="4" fill="#334155" stroke="#94A3B8" strokeWidth="1.5" />
          <text x="510" y="570" fill="#FFFFFF" fontSize="8" fontWeight="800" textAnchor="middle">
            BRIDGE
          </text>

          {/* ================================================================ */}
          {/* ZONE 1: HOME SANCTUARY                                           */}
          {/* ================================================================ */}
          <g transform="translate(310, 250)">
            <circle 
              cx="0" 
              cy="0" 
              r="76" 
              fill="rgba(254, 243, 199, 0.4)" 
              stroke="#F59E0B" 
              strokeWidth="2" 
              strokeDasharray="6 4" 
            />
            <rect x="-56" y="-14" width="112" height="28" rx="14" fill="#D97706" />
            <text x="-40" y="5" fontSize="12">🏠</text>
            <text x="-20" y="5" fill="#FFFFFF" fontSize="11" fontWeight="800">
              Home (120m)
            </text>
          </g>

          {/* ================================================================ */}
          {/* ZONE 2: GREENWOOD SCHOOL (CENTER ACTIVE SAFE ZONE)                */}
          {/* USER REQUIREMENT: SAVE ME YELLOW ADD KARO & UNSAVE ME RED SIGNAL */}
          {/* ================================================================ */}
          <g transform="translate(545, 335)">
            {/* Active Radar Sweep Beam Animation */}
            {radarBeamEnabled && (
              <g style={{ transformOrigin: '0 0', animation: 'radarSweepSmooth 4s linear infinite', pointerEvents: 'none' }}>
                <path 
                  d="M 0 0 L 135 -35 A 140 140 0 0 1 140 10 Z" 
                  fill="url(#radarSweepGrad)" 
                />
                <line x1="0" y1="0" x2="140" y2="10" stroke={simulatedBreach ? '#EF4444' : '#F59E0B'} strokeWidth="1.5" opacity="0.8" />
              </g>
            )}

            {/* Safe Yellow Translucent Perimeter vs Unsafe Flashing Red */}
            <circle 
              cx="0" 
              cy="0" 
              r="115" 
              fill={simulatedBreach ? 'rgba(254, 202, 202, 0.45)' : 'rgba(254, 243, 199, 0.45)'} 
              stroke={simulatedBreach ? '#EF4444' : '#F59E0B'} 
              strokeWidth={simulatedBreach ? '3.5' : '3'} 
              strokeDasharray={simulatedBreach ? '8 4' : '7 5'} 
              style={{ 
                filter: simulatedBreach ? 'drop-shadow(0 0 16px rgba(239, 68, 68, 0.6))' : 'drop-shadow(0 0 12px rgba(245, 158, 11, 0.5))',
                transition: 'all 0.4s ease'
              }}
            />

            {/* Concentric Amber / Yellow Pulse Beacon Waves when Safe */}
            {!simulatedBreach && (
              <>
                <circle cx="0" cy="0" r="45" fill="none" stroke="#F59E0B" strokeWidth="2" opacity="0.5" />
                <circle cx="0" cy="0" r="85" fill="none" stroke="#FBBF24" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
              </>
            )}

            {/* Distance Tick Line */}
            <line x1="0" y1="0" x2="0" y2="-58" stroke={simulatedBreach ? '#EF4444' : '#D97706'} strokeWidth="1.5" />
            <rect x="-20" y="-38" width="40" height="18" rx="4" fill="#FFFFFF" stroke={simulatedBreach ? '#EF4444' : '#F59E0B'} strokeWidth="1.2" />
            <text x="0" y="-25" fill={simulatedBreach ? '#EF4444' : '#B45309'} fontSize="9" fontWeight="900" textAnchor="middle">
              15.0m
            </text>

            {/* Top Pill 1: "YELLOW SAFE ZONE / RED BREACHED ZONE" */}
            <g transform="translate(0, -118)">
              <rect 
                x="-125" 
                y="-14" 
                width="250" 
                height="28" 
                rx="14" 
                fill={simulatedBreach ? '#DC2626' : '#D97706'} 
                style={{ filter: simulatedBreach ? 'drop-shadow(0 4px 12px rgba(220, 38, 38, 0.5))' : 'drop-shadow(0 4px 12px rgba(217, 119, 6, 0.4))' }}
              />
              <text x="-105" y="4" fontSize="13">{simulatedBreach ? '🚨' : '🛡️'}</text>
              <text 
                x="-85" 
                y="5" 
                fill="#FFFFFF" 
                fontSize="11" 
                fontWeight="900" 
                letterSpacing="0.4px"
              >
                {simulatedBreach ? 'BREACHED: Greenwood School' : 'YELLOW SAFE ZONE: Greenwood School'}
              </text>
            </g>

            {/* Top Pill 2: "✓ YELLOW SAFE & PROTECTED / 🔴 RED SIGNAL" */}
            <g transform="translate(0, -82)">
              <rect 
                x="-85" 
                y="-12" 
                width="170" 
                height="24" 
                rx="12" 
                fill={simulatedBreach ? '#EF4444' : '#F59E0B'} 
              />
              <text 
                x="0" 
                y="4" 
                fill="#FFFFFF" 
                fontSize="10" 
                fontWeight="900" 
                textAnchor="middle"
                letterSpacing="0.5px"
              >
                {simulatedBreach ? '🔴 RED SIGNAL: OUT OF BOUNDS' : '🟡 SAFE & MONITORED'}
              </text>
            </g>
          </g>

          {/* ================================================================ */}
          {/* ZONE 3: THERAPY CLINIC                                           */}
          {/* ================================================================ */}
          <g transform="translate(705, 435)">
            <circle 
              cx="0" 
              cy="0" 
              r="68" 
              fill="rgba(243, 232, 255, 0.55)" 
              stroke="#8B5CF6" 
              strokeWidth="2" 
              strokeDasharray="5 4" 
            />
            <line x1="20" y1="-20" x2="70" y2="-35" stroke="#7C3AED" strokeWidth="2" strokeDasharray="3 2" />
            <circle cx="70" cy="-35" r="4" fill="#7C3AED" />
            <rect x="-60" y="-14" width="120" height="28" rx="14" fill="#7C3AED" />
            <text x="-46" y="5" fontSize="12">🏥</text>
            <text x="-24" y="5" fill="#FFFFFF" fontSize="11" fontWeight="800">
              Therapy Clinic
            </text>
          </g>

          {/* ================================================================ */}
          {/* ANIMATED BREADCRUMB MOVEMENT TRAIL (Movement Path History)       */}
          {/* ================================================================ */}
          {telemetry.history && telemetry.history.length > 1 && (
            <g>
              <polyline 
                points={telemetry.history.map(h => `${h.map_x || 545},${h.map_y || 335}`).join(' ')} 
                fill="none" 
                stroke={simulatedBreach ? '#EF4444' : '#F59E0B'} 
                strokeWidth="3" 
                strokeDasharray="6 4" 
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ 
                  animation: 'breadcrumbDash 1.2s linear infinite',
                  opacity: 0.85
                }} 
              />
              {/* Waypoint Dots */}
              {telemetry.history.map((pt, idx) => (
                <circle 
                  key={idx} 
                  cx={pt.map_x || 545} 
                  cy={pt.map_y || 335} 
                  r={idx === telemetry.history.length - 1 ? 5 : 3.5} 
                  fill={simulatedBreach ? '#EF4444' : '#F59E0B'} 
                  opacity={0.7 + (idx / telemetry.history.length) * 0.3}
                />
              ))}
            </g>
          )}

          {/* ================================================================ */}
          {/* CHILD LIVE POSITION TARGET MARKER (AARAV TARGET PILL)            */}
          {/* ================================================================ */}
          <g 
            transform={`translate(${currentX}, ${currentY})`} 
            style={{ 
              transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
              cursor: 'pointer'
            }}
          >
            {/* If Unsafe: 3 Concentric Flashing Red Emergency Signal Waves */}
            {simulatedBreach ? (
              <>
                <circle cx="0" cy="0" r="18" fill="none" stroke="#EF4444" strokeWidth="3.5" style={{ animation: 'redBeaconWave 1.4s infinite' }} />
                <circle cx="0" cy="0" r="34" fill="none" stroke="#EF4444" strokeWidth="2.5" style={{ animation: 'redBeaconWave 1.4s 0.45s infinite' }} />
                <circle cx="0" cy="0" r="54" fill="none" stroke="#EF4444" strokeWidth="1.5" style={{ animation: 'redBeaconWave 1.4s 0.9s infinite' }} />
                <circle cx="0" cy="0" r="14" fill="#EF4444" />
                <circle cx="0" cy="0" r="6" fill="#FFFFFF" />
              </>
            ) : (
              /* If Safe: Concentric Yellow Beacon Waves */
              <>
                <circle cx="0" cy="0" r="22" fill="none" stroke="#F59E0B" strokeWidth="3" style={{ animation: 'yellowBeaconWave 1.8s infinite' }} />
                <circle cx="0" cy="0" r="42" fill="none" stroke="#FBBF24" strokeWidth="2" style={{ animation: 'yellowBeaconWave 1.8s 0.6s infinite' }} />
                <circle cx="0" cy="0" r="14" fill="#F59E0B" />
                <circle cx="0" cy="0" r="6" fill="#FFFFFF" />
              </>
            )}

            {/* Target Aarav Pill Badge */}
            <g transform="translate(24, -17)">
              <rect 
                x="0" 
                y="0" 
                width="140" 
                height="34" 
                rx="17" 
                fill={simulatedBreach ? '#DC2626' : '#D97706'} 
                style={{ 
                  filter: simulatedBreach ? 'drop-shadow(0 6px 18px rgba(220, 38, 38, 0.5))' : 'drop-shadow(0 6px 18px rgba(217, 119, 6, 0.45))' 
                }}
              />
              <text x="10" y="23" fontSize="16">👦🏽</text>
              <text 
                x="40" 
                y="22" 
                fill="#FFFFFF" 
                fontSize="13" 
                fontWeight="900"
              >
                {child?.name || 'Aarav'}
              </text>
              {/* Status Beacon Dot */}
              <circle 
                cx="120" 
                cy="17" 
                r="5" 
                fill={simulatedBreach ? '#FCA5A5' : '#FDE68A'} 
                style={{ animation: 'pulseBeacon 1s infinite' }}
              />
            </g>
          </g>
        </svg>
      </div>

      {/* ==================================================================== */}
      {/* SEPARATION CONTROLS & SAFE ZONES MANAGEMENT CARDS                    */}
      {/* ==================================================================== */}
      <div className="dashboard-grid" style={{ marginTop: 0 }}>
        {/* Left Column: Proximity Range & Sensor Deck */}
        <div className="col-8 glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={18} color="#F59E0B" />
              <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>Separation Alarm Threshold & Distance Telemetry</h3>
            </div>
            <span style={{ 
              fontSize: '13px', 
              fontWeight: '800', 
              fontFamily: 'var(--font-mono)', 
              color: simulatedBreach ? '#EF4444' : '#D97706',
              background: simulatedBreach ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.15)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)'
            }}>
              Threshold: {separationThreshold} meters
            </span>
          </div>

          {/* Custom Range Slider */}
          <input 
            type="range" 
            min="5" 
            max="50" 
            value={separationThreshold}
            onChange={(e) => {
              const val = Number(e.target.value);
              setSeparationThreshold(val);
              api.updateGpsTelemetry({ threshold_distance: val });
            }}
            className="radar-slider"
          />

          {/* Presets & Active Distance Cards */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Presets:</span>
              {[
                { label: 'Close (10m)', val: 10 },
                { label: 'Standard (15m)', val: 15 },
                { label: 'Playground (25m)', val: 25 },
                { label: 'Park (40m)', val: 40 }
              ].map(preset => (
                <button 
                  key={preset.val}
                  className={`preset-chip ${separationThreshold === preset.val ? 'active' : ''}`}
                  onClick={() => {
                    audioService.playClick();
                    setSeparationThreshold(preset.val);
                    api.updateGpsTelemetry({ threshold_distance: preset.val });
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Distance Readout */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              background: 'var(--bg-tertiary)', 
              padding: '8px 16px', 
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)'
            }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: '800', color: 'var(--text-muted)' }}>
                Active Distance:
              </span>
              <span style={{ 
                fontSize: '18px', 
                fontWeight: '900', 
                fontFamily: 'var(--font-mono)',
                color: currentSeparation > separationThreshold ? '#EF4444' : '#D97706'
              }}>
                {currentSeparation}m
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Safe Zones & Emergency Contacts */}
        <div className="col-4" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Safe Zones List */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0 }}>Designated Safe Zones ({zones.length})</h3>
              <button
                onClick={() => setShowAddZone(!showAddZone)}
                style={{ 
                  background: 'var(--accent-primary)', 
                  color: 'white', 
                  padding: '5px 12px', 
                  borderRadius: 'var(--radius-full)', 
                  fontSize: '11px', 
                  fontWeight: '700',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Plus size={13} /> Add Zone
              </button>
            </div>

            {/* Quick Add Form */}
            {showAddZone && (
              <form onSubmit={handleAddZone} style={{ marginBottom: '12px', display: 'flex', gap: '6px' }}>
                <input 
                  type="text"
                  placeholder="Zone name..."
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  style={{ flex: 1, padding: '6px 10px', fontSize: '12px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}
                />
                <button type="submit" style={{ background: '#F59E0B', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 'var(--radius-xs)', fontSize: '12px', fontWeight: '700' }}>
                  Save
                </button>
              </form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {zones.map((zone) => (
                <div 
                  key={zone.id}
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '10px 12px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-sm)',
                    borderLeft: `4px solid ${zone.color}`
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '12px', color: 'var(--text-primary)' }}>{zone.name}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Radius: {zone.radius}m • {zone.type}</div>
                  </div>
                  <span style={{ 
                    fontSize: '10px', 
                    fontWeight: '800', 
                    padding: '2px 8px', 
                    borderRadius: 'var(--radius-full)',
                    background: zone.containment === 'INSIDE' ? (simulatedBreach ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.18)') : 'rgba(255, 255, 255, 0.08)',
                    color: zone.containment === 'INSIDE' ? (simulatedBreach ? '#EF4444' : '#D97706') : 'var(--text-muted)'
                  }}>
                    {zone.containment === 'INSIDE' ? (simulatedBreach ? 'BREACHED' : 'CONTAINED') : 'OUTSIDE'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Alert Chain */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '12px' }}>Caregiver Alert Chain</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {mockEmergencyContacts.slice(0, 3).map((contact) => (
                <div 
                  key={contact.id} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '12px'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '700' }}>{contact.name}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{contact.relation}</div>
                  </div>
                  <button 
                    onClick={() => onStartCall && onStartCall(contact)}
                    style={{ 
                      background: 'var(--accent-primary)', 
                      color: 'white', 
                      border: 'none', 
                      padding: '4px 10px', 
                      borderRadius: 'var(--radius-full)', 
                      fontSize: '11px', 
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <PhoneCall size={12} /> Call
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
