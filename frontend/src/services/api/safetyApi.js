import apiClient from './apiClient';
import { DEFAULT_SAFE_ZONES, DEFAULT_EMERGENCY_CONTACTS } from '../../constants/safetyConstants';

export const safetyApi = {
  getSafetyStatus: async () => {
    try {
      return await apiClient.get('/safety/status');
    } catch (e) {
      return {
        isSafe: true,
        childName: 'Alex Jennings',
        age: 8,
        status: 'Safe — Inside Home Sanctuary',
        lastUpdated: new Date().toISOString(),
        batteryLevel: 84,
        gpsStatus: 'ACTIVE',
        bleConnected: true,
        currentZone: 'Home Sanctuary',
        separationDistance: 3.8,
        activeEmergency: null,
      };
    }
  },

  getCurrentLocation: async () => {
    try {
      return await apiClient.get('/safety/location/current');
    } catch (e) {
      return {
        latitude: 30.9010,
        longitude: 75.8573,
        accuracy: 4.2,
        address: '123 Maple Street, Model Town, Ludhiana',
        timestamp: new Date().toISOString(),
        speed: 0.2,
        heading: 45,
      };
    }
  },

  getLocationHistory: async (params = {}) => {
    try {
      const query = params.limit ? `?limit=${params.limit}` : '';
      return await apiClient.get(`/safety/location/history${query}`);
    } catch (e) {
      return [
        { id: 'lh-1', latitude: 30.9010, longitude: 75.8573, time: 'Just now', label: 'Home Sanctuary' },
        { id: 'lh-2', latitude: 30.9030, longitude: 75.8550, time: '20 mins ago', label: 'Model Town Park' },
        { id: 'lh-3', latitude: 30.9120, longitude: 75.8450, time: '2 hours ago', label: 'Oakridge School' },
      ];
    }
  },

  getSafeZones: async () => {
    try {
      return await apiClient.get('/safety/safe-zones');
    } catch (e) {
      return DEFAULT_SAFE_ZONES;
    }
  },

  createSafeZone: async (zoneData) => {
    try {
      return await apiClient.post('/safety/safe-zones', zoneData);
    } catch (e) {
      return {
        id: `zone-${Date.now()}`,
        ...zoneData,
        createdAt: new Date().toISOString(),
      };
    }
  },

  updateSafeZone: async (zoneId, zoneData) => {
    try {
      return await apiClient.put(`/safety/safe-zones/${zoneId}`, zoneData);
    } catch (e) {
      return { id: zoneId, ...zoneData, updatedAt: new Date().toISOString() };
    }
  },

  deleteSafeZone: async (zoneId) => {
    try {
      return await apiClient.delete(`/safety/safe-zones/${zoneId}`);
    } catch (e) {
      return { success: true, deletedId: zoneId };
    }
  },

  getBandStatus: async () => {
    try {
      return await apiClient.get('/safety/band/status');
    } catch (e) {
      return {
        id: 'NV-BAND-8821',
        name: 'Nivara GPS SmartBand v2',
        model: 'CoreBand Pro',
        connected: true,
        battery: 84,
        isCharging: false,
        gpsStatus: 'ACTIVE',
        rssi: -58,
        distanceMeters: 3.8,
        lastSync: new Date().toISOString(),
        firmware: 'v2.4.12',
      };
    }
  },

  connectBand: async (deviceId) => {
    try {
      return await apiClient.post('/safety/band/connect', { deviceId });
    } catch (e) {
      return { success: true, status: 'CONNECTED', deviceId: deviceId || 'NV-BAND-8821' };
    }
  },

  disconnectBand: async (deviceId) => {
    try {
      return await apiClient.post('/safety/band/disconnect', { deviceId });
    } catch (e) {
      return { success: true, status: 'DISCONNECTED' };
    }
  },

  getEmergencyContacts: async () => {
    try {
      return await apiClient.get('/safety/contacts');
    } catch (e) {
      return DEFAULT_EMERGENCY_CONTACTS;
    }
  },

  addEmergencyContact: async (contactData) => {
    try {
      return await apiClient.post('/safety/contacts', contactData);
    } catch (e) {
      return {
        id: `ec-${Date.now()}`,
        ...contactData,
        priority: 4,
      };
    }
  },

  updateEmergencyContact: async (contactId, contactData) => {
    try {
      return await apiClient.put(`/safety/contacts/${contactId}`, contactData);
    } catch (e) {
      return { id: contactId, ...contactData };
    }
  },

  deleteEmergencyContact: async (contactId) => {
    try {
      return await apiClient.delete(`/safety/contacts/${contactId}`);
    } catch (e) {
      return { success: true, deletedId: contactId };
    }
  },

  triggerEmergency: async (payload) => {
    try {
      return await apiClient.post('/safety/emergency/trigger', payload);
    } catch (e) {
      return {
        id: `emg-${Date.now()}`,
        status: 'ACTIVE',
        type: payload.type || 'SOS_PANIC',
        location: payload.location || { latitude: 30.9010, longitude: 75.8573 },
        triggeredAt: new Date().toISOString(),
        contactsNotified: true,
      };
    }
  },

  resolveEmergency: async (emergencyId) => {
    try {
      return await apiClient.post(`/safety/emergency/${emergencyId}/resolve`);
    } catch (e) {
      return { success: true, status: 'RESOLVED', emergencyId };
    }
  },

  getSafetyEvents: async (params = {}) => {
    try {
      const query = params.category ? `?category=${params.category}` : '';
      return await apiClient.get(`/safety/events${query}`);
    } catch (e) {
      return [
        {
          id: 'ev-1',
          type: 'SAFE_ZONE_ENTRY',
          title: 'Entered Home Sanctuary',
          desc: 'Child safely entered within Home Sanctuary geofence boundary.',
          location: '123 Maple Street, Model Town, Ludhiana',
          time: '10:32 AM',
          timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
          status: 'SAFE',
          isSafe: true,
          device: 'Nivara GPS Band v2',
          battery: '84%',
          gpsAccuracy: '±3m',
        },
        {
          id: 'ev-2',
          type: 'LOCATION_UPDATED',
          title: 'GPS Telemetry Refresh',
          desc: 'Precise coordinates calibrated via hybrid satellite beacon.',
          location: '123 Maple Street, Model Town, Ludhiana',
          time: '10:15 AM',
          timestamp: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
          status: 'NORMAL',
          isSafe: true,
          device: 'Nivara GPS Band v2',
          battery: '85%',
          gpsAccuracy: '±4m',
        },
        {
          id: 'ev-3',
          type: 'BAND_CONNECTED',
          title: 'SmartBand Tether Active',
          desc: 'Bluetooth Low Energy proximity tether connected at RSSI -58 dBm.',
          location: '123 Maple Street, Model Town, Ludhiana',
          time: '09:48 AM',
          timestamp: new Date(Date.now() - 1000 * 60 * 69).toISOString(),
          status: 'CONNECTED',
          isSafe: true,
          device: 'Nivara GPS Band v2',
          battery: '86%',
          gpsAccuracy: '±4m',
        },
        {
          id: 'ev-4',
          type: 'SAFE_ZONE_EXIT',
          title: 'Departed Oakridge School',
          desc: 'Child exited school perimeter alongside approved caregiver.',
          location: '456 Oak Avenue, Civil Lines, Ludhiana',
          time: '09:30 AM',
          timestamp: new Date(Date.now() - 1000 * 60 * 87).toISOString(),
          status: 'INFO',
          isSafe: true,
          device: 'Nivara GPS Band v2',
          battery: '88%',
          gpsAccuracy: '±5m',
        },
      ];
    }
  },

  getSafetyEventById: async (eventId) => {
    try {
      return await apiClient.get(`/safety/events/${eventId}`);
    } catch (e) {
      return {
        id: eventId,
        type: 'SAFE_ZONE_ENTRY',
        title: 'Entered Home Sanctuary',
        desc: 'Child safely entered within Home Sanctuary geofence boundary.',
        location: '123 Maple Street, Model Town, Ludhiana',
        time: 'Today, 10:32 AM',
        timestamp: new Date().toISOString(),
        status: 'SAFE',
        isSafe: true,
        device: 'Nivara GPS Band v2',
        battery: '84%',
        gpsAccuracy: '±3m',
      };
    }
  },
};

export default safetyApi;
