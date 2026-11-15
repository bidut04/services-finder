import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getDevHost = () => {
  // 1. If running in Expo Go on physical device, auto-resolve computer LAN IP
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest?.debuggerHost;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:4000/api`;
    }
  }

  // 2. Android Emulator standard gateway
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:4000/api';
  }

  // 3. Web or Desktop
  return 'http://localhost:4000/api';
};

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || getDevHost();

let inMemoryToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  inMemoryToken = token;
};

export const getAuthToken = (): string | null => {
  return inMemoryToken;
};

export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  const token = getAuthToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  console.log(`[Customer API Request] ${options.method || 'GET'} ${url}`);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage =
        data?.message || data?.error || `Request failed with status ${response.status}`;
      throw new ApiError(errorMessage, response.status, data);
    }

    return data as T;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      err?.message || `Unable to reach backend server at ${API_BASE_URL}. Ensure your backend server is running.`,
      0
    );
  }
}
