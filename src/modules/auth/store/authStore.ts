import { create } from 'zustand';
import { AuthState } from '../types/auth.types';
import { AuthService } from '../services/authService';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  hasCompletedLocationFlow: false,
  pendingPhoneNumber: null,

  sendOtp: async (phoneNumber: string): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      await AuthService.sendOtp(phoneNumber);
      set({ pendingPhoneNumber: phoneNumber, isLoading: false });
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to send OTP';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  verifyOtp: async (code: string): Promise<boolean> => {
    const { pendingPhoneNumber } = get();
    if (!pendingPhoneNumber) {
      set({ error: 'Session expired. Please request OTP again.' });
      return false;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await AuthService.verifyOtp(pendingPhoneNumber, code);
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        hasCompletedLocationFlow: false, // Ensure location flow is forced immediately after login!
      });
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Invalid OTP entered.';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  logout: () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      hasCompletedLocationFlow: false,
      pendingPhoneNumber: null,
      error: null,
    });
  },

  setLocationFlowCompleted: (completed: boolean) => {
    set({ hasCompletedLocationFlow: completed });
  },

  clearError: () => {
    set({ error: null });
  },
}));

