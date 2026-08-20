import { create } from 'zustand';
import storage from '../services/storage/asyncStorage';
import { communityApi } from '../services/api/communityApi';
import { authApi } from '../services/api/authApi';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isVerified: false,
  verificationStatus: 'pending',
  accessMessage: '',
  loading: false,
  initialAuthChecked: false,

  loadStoredAuth: async () => {
    try {
      const token = await storage.getItem('userToken');
      const user = await storage.getItem('userData');
      if (token && user) {
        set({
          token,
          user,
          isVerified: user?.is_verified ?? false,
          verificationStatus: user?.verification_status || 'pending',
          initialAuthChecked: true,
        });
        // Check community access status with backend
        try {
          const res = await communityApi.checkCommunityAccess();
          set({
            isVerified: res.is_verified,
            verificationStatus: res.verification_status,
            accessMessage: res.message,
          });
        } catch (e) {
          console.warn('Initial access check failed:', e);
        }
      } else {
        set({ initialAuthChecked: true, token: null, user: null });
      }
    } catch (err) {
      console.error('Error loading stored auth:', err);
      set({ initialAuthChecked: true, token: null, user: null });
    }
  },

  setAuth: async (user, token) => {
    await storage.setItem('userToken', token);
    await storage.setItem('userData', user);
    set({
      user,
      token,
      isVerified: user?.is_verified ?? false,
      verificationStatus: user?.verification_status || 'pending',
      initialAuthChecked: true,
    });
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const res = await authApi.login({ email, password });
      const user = {
        id: res.user_id,
        email: res.email,
        full_name: res.full_name,
        role: res.role,
        is_verified: res.is_verified,
        verification_status: res.verification_status,
      };
      await get().setAuth(user, res.access_token);
      await get().checkCommunityAccess();
      set({ loading: false });
      return user;
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  register: async ({ full_name, email, password, bio = 'Parent caregiver' }) => {
    set({ loading: true });
    try {
      const res = await authApi.register({ full_name, email, password, bio });
      const user = {
        id: res.user_id,
        email: res.email,
        full_name: res.full_name,
        role: res.role,
        is_verified: res.is_verified,
        verification_status: res.verification_status,
      };
      await get().setAuth(user, res.access_token);
      await get().checkCommunityAccess();
      set({ loading: false });
      return user;
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  checkCommunityAccess: async () => {
    try {
      const res = await communityApi.checkCommunityAccess();
      set({
        isVerified: res.is_verified,
        verificationStatus: res.verification_status,
        accessMessage: res.message,
      });
      return res.has_access;
    } catch (err) {
      set({ isVerified: false, accessMessage: err.message });
      return false;
    }
  },

  logout: async () => {
    await storage.removeItem('userToken');
    await storage.removeItem('userData');
    set({
      user: null,
      token: null,
      isVerified: false,
      verificationStatus: 'pending',
      accessMessage: '',
    });
  },
}));
