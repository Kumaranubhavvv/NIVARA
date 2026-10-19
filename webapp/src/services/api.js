// ==========================================================================
// NIVARA API Client with Automatic Live-to-Mock Fallback
// Connects to FastAPI backend (/api) or falls back to high-fidelity mocks
// ==========================================================================

import { mockChild, mockSafeZones, mockAacCards, mockAacCategories, mockRoutines, mockCommunityFeed } from '../mock/mockData';

const RAW_API_URL = import.meta.env.VITE_API_URL;
const BASE_URL = RAW_API_URL
  ? (RAW_API_URL.endsWith('/api') ? RAW_API_URL : `${RAW_API_URL.replace(/\/$/, '')}/api`)
  : '/api';

export const api = {
  async getChildStatus() {
    try {
      const res = await fetch(`${BASE_URL}/safety/overview`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (e) {
      // Backend not running or timeout; return fallback
    }
    return mockChild;
  },

  async getSafeZones() {
    try {
      const res = await fetch(`${BASE_URL}/safe-zones/`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}
    return mockSafeZones;
  },

  async getAacCards() {
    try {
      const res = await fetch(`${BASE_URL}/v1/aac/cards`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}
    return { categories: mockAacCategories, cards: mockAacCards };
  },

  async getRoutines() {
    try {
      const res = await fetch(`${BASE_URL}/v1/learning/routines`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}
    return mockRoutines;
  },

  async getCommunityFeed() {
    try {
      const res = await fetch(`${BASE_URL}/v1/community/feed`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}
    return mockCommunityFeed;
  },

  async triggerEmergency(childId, notes = 'SOS Button Pressed on Web Dashboard') {
    try {
      const res = await fetch(`${BASE_URL}/emergencies/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ child_id: childId, trigger_type: 'WEB_SOS', notes }),
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return { status: 'DISPATCHED', emergency_id: 'emg-' + Date.now(), timestamp: new Date().toISOString() };
  },

  async resolveEmergency(emergencyId) {
    try {
      const res = await fetch(`${BASE_URL}/emergencies/${emergencyId}/resolve`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch (e) {}
    return { status: 'RESOLVED', timestamp: new Date().toISOString() };
  },

  // GPS Real-Time Telemetry APIs (Connected to FastAPI /api/safety/gps/...)
  async getLiveGps(childId = 'child-aarav-01') {
    try {
      const res = await fetch(`${BASE_URL}/safety/gps/live?child_id=${childId}`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // fallback
    }
    return {
      child_id: 'child-aarav-01',
      child_name: 'Aarav Sharma',
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
    };
  },

  async updateGpsTelemetry(payload) {
    try {
      const res = await fetch(`${BASE_URL}/safety/gps/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(2500)
      });
      if (res.ok) {
        const data = await res.json();
        return data.telemetry;
      }
    } catch (e) {}
    return null;
  },

  async resetGpsTelemetry() {
    try {
      const res = await fetch(`${BASE_URL}/safety/gps/reset`, { method: 'POST', signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const data = await res.json();
        return data.telemetry;
      }
    } catch (e) {}
    return null;
  }
};
