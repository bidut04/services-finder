import { create } from 'zustand';
import { AuthState } from '../types/auth.types';
import { AuthService } from '../services/authService';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  hasCompletedLocationFlow: false,

  login: async (identifier: string, password: string): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      const response = await AuthService.login(identifier, password);
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        hasCompletedLocationFlow: false,
      });
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  register: async (name: string, phoneNumber: string, password: string, email?: string): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      const response = await AuthService.register({ name, phoneNumber, password, email });
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        hasCompletedLocationFlow: false,
      });
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Registration failed. Please try again.';
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
