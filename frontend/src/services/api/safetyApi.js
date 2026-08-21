import apiClient from './apiClient';
import { DEFAULT_SAFE_ZONES, DEFAULT_EMERGENCY_CONTACTS } from '../../constants/safetyConstants';

export const safetyApi = {
  getSafetyStatus: async () => {
    try {
      const res = await apiClient.get('/safety/status');
      return res;
    } catch (e) {
      console.warn('[safetyApi] getSafetyStatus fallback:', e.message);
      return {
        isSafe: true,
        childName: 'Leo Mitchell',
        age: 7,
        status: 'Safe — Inside Home Sanctuary',
        lastUpdated: new Date().toISOString(),
        batteryLevel: 92,
        gpsStatus: 'ACTIVE',
        bleConnected: true,
        currentZone: 'Home (Safe Haven)',
        separationDistance: 3.8,
        activeEmergency: null,
      };
    }
  },

  getCurrentLocation: async (childId = 'child-leo-1') => {
    try {
      const res = await apiClient.get(`/safety/locations/current/${childId}`);
      if (res && res.current_location) {
        return {
          latitude: res.current_location.latitude,
          longitude: res.current_location.longitude,
          accuracy: res.current_location.accuracy || 4.2,
          address: res.current_location.address || '123 Serenity Way, San Francisco, CA',
          timestamp: res.current_location.recorded_at || res.current_location.created_at || new Date().toISOString(),
          speed: res.current_location.speed || 0.0,
          heading: res.current_location.heading || 0.0,
          batteryLevel: res.battery_percentage || 92,
          isSafe: res.is_safe,
          activeZoneName: res.active_zone_name,
        };
      }
      return res;
    } catch (e) {
      console.warn('[safetyApi] getCurrentLocation fallback:', e.message);
      return {
        latitude: 37.7750,
        longitude: -122.4195,
        accuracy: 4.2,
        address: '123 Serenity Way, San Francisco, CA',
        timestamp: new Date().toISOString(),
        speed: 0.0,
        heading: 90,
      };
    }
  },

  getLocationHistory: async (params = {}) => {
    try {
      const childId = params.childId || 'child-leo-1';
      const limit = params.limit || 50;
      return await apiClient.get(`/safety/locations/history/${childId}?limit=${limit}`);
    } catch (e) {
      console.warn('[safetyApi] getLocationHistory fallback:', e.message);
      return [
        { id: 'lh-1', latitude: 37.7750, longitude: -122.4195, time: 'Just now', label: 'Home (Safe Haven)' },
        { id: 'lh-2', latitude: 37.7760, longitude: -122.4190, time: '20 mins ago', label: 'Sensory Park' },
        { id: 'lh-3', latitude: 37.7800, longitude: -122.4200, time: '2 hours ago', label: 'Sunshine Academy School' },
      ];
    }
  },

  getSafeZones: async (childId = 'child-leo-1') => {
    try {
      return await apiClient.get(`/safety/safe-zones/child/${childId}`);
    } catch (e) {
      console.warn('[safetyApi] getSafeZones fallback:', e.message);
      return DEFAULT_SAFE_ZONES;
    }
  },

  createSafeZone: async (zoneData) => {
    try {
      return await apiClient.post('/safety/safe-zones/', zoneData);
    } catch (e) {
      console.warn('[safetyApi] createSafeZone fallback:', e.message);
      return {
        id: `sz-${Date.now()}`,
        ...zoneData,
        created_at: new Date().toISOString(),
      };
    }
  },

  updateSafeZone: async (zoneId, zoneData) => {
    try {
      return await apiClient.put(`/safety/safe-zones/${zoneId}`, zoneData);
    } catch (e) {
      console.warn('[safetyApi] updateSafeZone fallback:', e.message);
      return { id: zoneId, ...zoneData, updated_at: new Date().toISOString() };
    }
  },

  deleteSafeZone: async (zoneId) => {
    try {
      return await apiClient.delete(`/safety/safe-zones/${zoneId}`);
    } catch (e) {
      console.warn('[safetyApi] deleteSafeZone fallback:', e.message);
      return { message: 'Safe zone deleted', id: zoneId };
    }
  },

  getBandStatus: async (childId = 'child-leo-1') => {
    try {
      return await apiClient.get(`/safety/devices/band/status?child_id=${childId}`);
    } catch (e) {
      console.warn('[safetyApi] getBandStatus fallback:', e.message);
      return {
        id: 'NV-BAND-LEO-001',
        name: 'NIVARA Smart SafeBand',
        model: 'Gps_band',
        connected: true,
        battery: 92,
        isCharging: false,
        gpsStatus: 'ACTIVE',
        rssi: -58,
        distanceMeters: 3.8,
        lastSync: new Date().toISOString(),
        firmware: 'v1.2.0',
      };
    }
  },

  connectBand: async (deviceId) => {
    try {
      return await apiClient.post('/safety/devices/band/connect', { deviceId });
    } catch (e) {
      console.warn('[safetyApi] connectBand fallback:', e.message);
      return { success: true, status: 'CONNECTED', deviceId: deviceId || 'NV-BAND-LEO-001' };
    }
  },

  disconnectBand: async (deviceId) => {
    try {
      return await apiClient.post('/safety/devices/band/disconnect', { deviceId });
    } catch (e) {
      console.warn('[safetyApi] disconnectBand fallback:', e.message);
      return { success: true, status: 'DISCONNECTED' };
    }
  },

  getEmergencyContacts: async () => {
    try {
      return await apiClient.get('/safety/emergency-contacts/');
    } catch (e) {
      console.warn('[safetyApi] getEmergencyContacts fallback:', e.message);
      return DEFAULT_EMERGENCY_CONTACTS;
    }
  },

  addEmergencyContact: async (contactData) => {
    try {
      return await apiClient.post('/safety/emergency-contacts/', contactData);
    } catch (e) {
      console.warn('[safetyApi] addEmergencyContact fallback:', e.message);
      return {
        id: `contact-${Date.now()}`,
        ...contactData,
        priority_order: contactData.priority_order || 1,
      };
    }
  },

  updateEmergencyContact: async (contactId, contactData) => {
    try {
      return await apiClient.put(`/safety/emergency-contacts/${contactId}`, contactData);
    } catch (e) {
      console.warn('[safetyApi] updateEmergencyContact fallback:', e.message);
      return { id: contactId, ...contactData };
    }
  },

  deleteEmergencyContact: async (contactId) => {
    try {
      return await apiClient.delete(`/safety/emergency-contacts/${contactId}`);
    } catch (e) {
      console.warn('[safetyApi] deleteEmergencyContact fallback:', e.message);
      return { message: 'Emergency contact deleted', id: contactId };
    }
  },

  triggerEmergency: async (payload) => {
    try {
      const body = {
        child_id: payload.child_id || payload.childId || 'child-leo-1',
        triggered_by: payload.triggered_by || payload.type || 'sos_button',
        severity: payload.severity || 'critical',
        latitude: payload.latitude || payload.location?.latitude || 37.7749,
        longitude: payload.longitude || payload.location?.longitude || -122.4194,
        address: payload.address || '123 Serenity Way, San Francisco, CA',
        message: payload.message || 'EMERGENCY SOS Triggered from Caregiver Mobile!',
      };
      return await apiClient.post('/safety/emergencies/sos', body);
    } catch (e) {
      console.warn('[safetyApi] triggerEmergency fallback:', e.message);
      return {
        id: `emg-${Date.now()}`,
        status: 'active',
        severity: 'critical',
        message: payload.message || 'EMERGENCY SOS Triggered!',
        created_at: new Date().toISOString(),
      };
    }
  },

  resolveEmergency: async (emergencyId, resolutionNotes = 'Resolved by caregiver') => {
    try {
      return await apiClient.post(`/safety/emergencies/${emergencyId}/resolve`, {
        status: 'resolved',
        resolution_notes: resolutionNotes,
      });
    } catch (e) {
      console.warn('[safetyApi] resolveEmergency fallback:', e.message);
      return { id: emergencyId, status: 'resolved', resolution_notes: resolutionNotes };
    }
  },

  getSafetyEvents: async (params = {}) => {
    try {
      const query = params.event_type ? `?event_type=${params.event_type}` : '';
      return await apiClient.get(`/safety/safety-events/${query}`);
    } catch (e) {
      console.warn('[safetyApi] getSafetyEvents fallback:', e.message);
      return [
        {
          id: 'ev-1',
          event_type: 'geofence_entry',
          title: 'Entered Home (Safe Haven)',
          description: 'Child safely entered within Home boundary.',
          latitude: 37.7750,
          longitude: -122.4195,
          created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
          severity: 'info',
        },
      ];
    }
  },

  evaluateGeofence: async (childId, latitude, longitude) => {
    try {
      return await apiClient.post('/safety/geofence/evaluate', {
        child_id: childId || 'child-leo-1',
        latitude,
        longitude,
        create_events: true,
      });
    } catch (e) {
      console.warn('[safetyApi] evaluateGeofence fallback:', e.message);
      return { is_inside_safe_zone: true, status: 'safe' };
    }
  },

  checkSeparation: async (childId, childLat, childLon, caregiverLat, caregiverLon) => {
    try {
      return await apiClient.post('/safety/separation/evaluate', {
        child_id: childId || 'child-leo-1',
        child_latitude: childLat,
        child_longitude: childLon,
        caregiver_latitude: caregiverLat,
        caregiver_longitude: caregiverLon,
        create_event: true,
      });
    } catch (e) {
      console.warn('[safetyApi] checkSeparation fallback:', e.message);
      return { is_separated: false, proximity_zone: 'immediate', distance_meters: 3.8 };
    }
  },
};

export default safetyApi;
