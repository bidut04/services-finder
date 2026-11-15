import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import {
  userApi,
  AuthResponse,
  UpdateProfileRequest,
  GetProfileResponse,
} from '../api/user.api';
import { getAuthToken } from '../api/client';

export const USER_KEYS = {
  all: ['user'] as const,
  profile: () => [...USER_KEYS.all, 'profile'] as const,
  session: () => [...USER_KEYS.all, 'session'] as const,
};

/**
 * Hook to retrieve and cache the current user profile with TanStack Query
 */
export function useUserProfile(
  options?: Omit<UseQueryOptions<GetProfileResponse['data'], Error>, 'queryKey' | 'queryFn'>
) {
  const token = getAuthToken();

  return useQuery({
    queryKey: USER_KEYS.profile(),
    queryFn: () => userApi.getProfile(),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnReconnect: true,
    ...options,
  });
}

/**
 * Mutation hook to log in with mobile number/email and password (NO OTP)
 */
export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error, { identifier: string; password: string }>({
    mutationFn: (creds) => userApi.login(creds),
    onSuccess: (data) => {
      queryClient.setQueryData(USER_KEYS.profile(), data.user);
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
    },
  });
}

/**
 * Mutation hook to register a new customer with password (NO OTP)
 */
export function useRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    AuthResponse,
    Error,
    { name: string; phoneNumber: string; password: string; email?: string }
  >({
    mutationFn: (data) => userApi.register(data),
    onSuccess: (data) => {
      queryClient.setQueryData(USER_KEYS.profile(), data.user);
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
    },
  });
}

/**
 * Mutation hook for profile updates with optimistic TanStack cache updates
 */
export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    any,
    Error,
    UpdateProfileRequest,
    { previousProfile?: any }
  >({
    mutationFn: (data: UpdateProfileRequest) => userApi.updateProfile(data),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: USER_KEYS.profile() });
      const previousProfile = queryClient.getQueryData(USER_KEYS.profile());
      queryClient.setQueryData(USER_KEYS.profile(), (old: any) => ({
        ...old,
        ...newData,
      }));
      return { previousProfile };
    },
    onError: (_err, _newData, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(USER_KEYS.profile(), context.previousProfile);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.profile() });
    },
  });
}

/**
 * Mutation hook to log out and purge all cached user data
 */
export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation<any, Error, string | undefined>({
    mutationFn: (refreshToken?: string) => userApi.logout(refreshToken),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: USER_KEYS.all });
      queryClient.clear();
    },
  });
}
