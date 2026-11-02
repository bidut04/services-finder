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
  pendingPhoneNumber: string | null;

  // Actions
  sendOtp: (phoneNumber: string) => Promise<boolean>;
  verifyOtp: (code: string) => Promise<boolean>;
  logout: () => void;
  setLocationFlowCompleted: (completed: boolean) => void;
  clearError: () => void;
}

