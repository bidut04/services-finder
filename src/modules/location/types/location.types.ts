export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  speedKmh?: number | null;
  headingDeg?: number | null;
  timestamp?: number;
}

export interface UserAddress {
  id: string;
  formattedAddress: string;
  street?: string;
  locality?: string;
  city: string;
  district: string;
  state: string;
  postalCode: string;
  country: string;
  coordinates: LocationCoordinates;
  isCurrentLocation?: boolean;
  label?: 'Home' | 'Work' | 'Other';
}

export interface NearbyCaptain {
  captainId: string;
  displayName: string;
  avatarUrl?: string;
  rating: number;
  distanceKm: number;
  coordinates: LocationCoordinates;
  categories: string[];
  skills: string[];
  isOnline: boolean;
}

export type PermissionStatusType =
  | 'undetermined'
  | 'granted'
  | 'approximate'
  | 'denied'
  | 'permanently_denied';

export interface LocationState {
  currentCoordinates: LocationCoordinates | null;
  selectedAddress: UserAddress | null;
  savedAddresses: UserAddress[];
  nearbyCaptains: NearbyCaptain[];
  permissionStatus: PermissionStatusType;
  isDetecting: boolean;
  error: string | null;

  // Actions
  requestPermission: () => Promise<PermissionStatusType>;
  detectCurrentPosition: () => Promise<UserAddress | null>;
  confirmAddress: (address: UserAddress) => void;
  selectManualAddress: (address: UserAddress) => void;
  loadNearbyCaptains: (lat?: number, lng?: number, radiusKm?: number) => Promise<void>;
  saveAddressToBackend: (address: UserAddress) => Promise<void>;
  clearError: () => void;
}
