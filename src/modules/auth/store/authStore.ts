import { create } from 'zustand';
import { AuthState } from '../types/auth.types';
import { AuthService } from '../services/authService';
import { eventMessenger } from '../../../core/components/EventMessenger';
import { toast } from '../../../core/components/Toast';

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

      eventMessenger.emit({
        title: 'Authentication Successful',
        message: `Welcome back, ${response.user.name || 'User'}! Connected with verified credentials.`,
        type: 'success',
        category: 'auth',
      });

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
      set({ error: errorMessage, isLoading: false });

      eventMessenger.emit({
        title: 'Login Attempt Failed',
        message: errorMessage,
        type: 'error',
        category: 'auth',
      });

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

      eventMessenger.emit({
        title: 'Account Registered',
        message: `Welcome to HelpNear, ${name}! Your account has been provisioned.`,
        type: 'success',
        category: 'auth',
      });

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Registration failed. Please try again.';
      set({ error: errorMessage, isLoading: false });

      eventMessenger.emit({
        title: 'Registration Error',
        message: errorMessage,
        type: 'error',
        category: 'auth',
      });

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
    toast.info('Signed Out', 'You have been signed out of your account.');
  },

  setLocationFlowCompleted: (completed: boolean) => {
    set({ hasCompletedLocationFlow: completed });
  },

  clearError: () => {
    set({ error: null });
  },
}));
