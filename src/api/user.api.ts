import { apiClient, setAuthToken } from './client';
import { UserProfile } from '../modules/auth/types/auth.types';
import { UserAddress } from '../modules/location/types/location.types';

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  refreshToken?: string;
  user: UserProfile & {
    emergencyName?: string | null;
    emergencyPhone?: string | null;
    preferredLocale?: string;
  };
}

export interface GetProfileResponse {
  success: boolean;
  data: UserProfile & {
    emergencyName?: string | null;
    emergencyPhone?: string | null;
    preferredLocale?: string;
    defaultAddress?: any;
  };
}

export interface UpdateProfileRequest {
  name?: string;
  avatar?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  preferredLocale?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data: Partial<UserProfile>;
}

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  imageUrl?: string;
  description?: string;
  baseFee: number;
  skills: { id: string; name: string; price: number; durationMin: number }[];
}

export interface ApiPopularService {
  id: string;
  title: string;
  category: string;
  rating: number;
  reviews: number;
  price: string;
  hourlyRate: number;
  imageUrl: any;
  location: string;
  skills: string[];
}

export interface ApiBooking {
  id: string;
  bookingCode: string;
  status: string;
  problemDescription?: string;
  scheduledFor: string;
  estimatedTotal: number;
  finalTotal?: number;
  category?: { name: string; iconName?: string };
  captain?: { displayName?: string; phoneNumber?: string; avatarUrl?: string };
  items?: { title: string; quantity: number; unitPrice: number; totalPrice: number }[];
  createdAt: string;
}

export const userApi = {
  /**
   * Register customer with Name, Mobile Number & Password (NO OTP)
   */
  async register(data: {
    name: string;
    phoneNumber: string;
    password: string;
    email?: string;
  }): Promise<AuthResponse> {
    const response = await apiClient<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response?.token) {
      setAuthToken(response.token);
    }

    return response;
  },

  /**
   * Log in customer with Mobile/Email & Password (NO OTP)
   */
  async login(data: {
    identifier: string;
    password: string;
  }): Promise<AuthResponse> {
    const response = await apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response?.token) {
      setAuthToken(response.token);
    }

    return response;
  },

  /**
   * Get current authenticated user profile
   */
  async getProfile(): Promise<GetProfileResponse['data']> {
    const res = await apiClient<GetProfileResponse>('/auth/me', {
      method: 'GET',
    });
    return res.data;
  },

  /**
   * Update user and customer profile attributes
   */
  async updateProfile(data: UpdateProfileRequest): Promise<UpdateProfileResponse['data']> {
    const res = await apiClient<UpdateProfileResponse>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  /**
   * Get saved addresses for current customer
   */
  async getAddresses(): Promise<UserAddress[]> {
    const res = await apiClient<{ success: boolean; data: any[] }>('/auth/addresses', {
      method: 'GET',
    });
    return (res.data || []).map((a) => ({
      id: a.id,
      formattedAddress: a.addressLine1 || a.formattedAddress,
      street: a.landmark || a.street || '',
      locality: a.addressLine2 || a.locality || '',
      city: a.city || 'City',
      district: a.state || a.district || '',
      state: a.state || '',
      postalCode: a.postalCode || '',
      country: a.country || 'India',
      coordinates: {
        latitude: Number(a.latitude) || 22.6055,
        longitude: Number(a.longitude) || 87.7195,
      },
      label: a.tag || a.label || 'Home',
    }));
  },

  /**
   * Save a newly confirmed customer address
   */
  async saveAddress(address: Partial<UserAddress>): Promise<UserAddress> {
    const res = await apiClient<{ success: boolean; data: any }>('/auth/addresses', {
      method: 'POST',
      body: JSON.stringify({
        formattedAddress: address.formattedAddress,
        street: address.street,
        locality: address.locality,
        city: address.city,
        district: address.district,
        state: address.state,
        postalCode: address.postalCode,
        latitude: address.coordinates?.latitude,
        longitude: address.coordinates?.longitude,
        label: address.label || 'Home',
        isDefault: true,
      }),
    });
    const a = res.data;
    return {
      id: a.id,
      formattedAddress: a.addressLine1 || a.formattedAddress,
      street: a.landmark || a.street || '',
      locality: a.addressLine2 || a.locality || '',
      city: a.city || '',
      district: a.state || a.district || '',
      state: a.state || '',
      postalCode: a.postalCode || '',
      country: a.country || 'India',
      coordinates: {
        latitude: Number(a.latitude) || 22.6055,
        longitude: Number(a.longitude) || 87.7195,
      },
      label: a.tag || a.label || 'Home',
    };
  },

  /**
   * Catalog: Get service categories
   */
  async getCategories(): Promise<ApiCategory[]> {
    const res = await apiClient<{ success: boolean; data: ApiCategory[] }>('/services/categories', {
      method: 'GET',
    });
    return res.data;
  },

  /**
   * Catalog: Get popular services
   */
  async getPopularServices(): Promise<ApiPopularService[]> {
    const res = await apiClient<{ success: boolean; data: ApiPopularService[] }>('/services/popular', {
      method: 'GET',
    });
    return res.data;
  },

  /**
   * Catalog: Get service details
   */
  async getServiceById(id: string): Promise<ApiPopularService> {
    const res = await apiClient<{ success: boolean; data: ApiPopularService }>(`/services/${id}`, {
      method: 'GET',
    });
    return res.data;
  },

  /**
   * Bookings: Get customer's booking list
   */
  async getMyBookings(): Promise<ApiBooking[]> {
    const res = await apiClient<{ success: boolean; data: ApiBooking[] }>('/bookings/my', {
      method: 'GET',
    });
    return res.data || [];
  },

  /**
   * Bookings: Create new service booking (Direct partner action - NO OTP)
   */
  async createBooking(data: {
    categoryId: string;
    addressId: string;
    problemDescription?: string;
    scheduledFor?: string;
    estimatedTotal: number;
    items: { skillId: string; title: string; quantity: number; unitPrice: number; totalPrice: number }[];
  }): Promise<{ booking: ApiBooking }> {
    const res = await apiClient<{ success: boolean; data: any }>('/bookings', {
      method: 'POST',
      headers: {
        'Idempotency-Key': `idemp_bk_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      },
      body: JSON.stringify(data),
    });
    return res.data;
  },

  /**
   * Terminate active user session
   */
  async logout(refreshToken?: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await apiClient<{ success: boolean; message: string }>('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
      return res;
    } finally {
      setAuthToken(null);
    }
  },
};
