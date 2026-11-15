export interface UserProfile {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  hasCompletedLocationFlow: boolean;
  isHydrated: boolean;

  // Actions (Username/Phone & Password - NO OTP)
  login: (identifier: string, password: string) => Promise<boolean>;
  register: (name: string, phoneNumber: string, password: string, email?: string) => Promise<boolean>;
  logout: () => void;
  setLocationFlowCompleted: (completed: boolean) => void;
  clearError: () => void;
  setHydrated: (hydrated: boolean) => void;
}
