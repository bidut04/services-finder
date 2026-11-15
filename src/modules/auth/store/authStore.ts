import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState } from '../types/auth.types';
import { AuthService } from '../services/authService';
import { toast } from '../../../core/components/Toast';
import { setAuthToken } from '../../../api/client';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      hasCompletedLocationFlow: false,
      isHydrated: false,

      login: async (identifier: string, password: string): Promise<boolean> => {
        set({ isLoading: true, error: null });
        try {
          const response = await AuthService.login(identifier, password);
          setAuthToken(response.token);
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
          setAuthToken(response.token);
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
        setAuthToken(null);
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

      setHydrated: (hydrated: boolean) => {
        set({ isHydrated: hydrated });
      },
    }),
    {
      name: 'helpnear-customer-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        hasCompletedLocationFlow: state.hasCompletedLocationFlow,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
          if (state.token) {
            setAuthToken(state.token);
          }
        }
      },
    }
  )
);
