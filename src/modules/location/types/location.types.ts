export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
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

export type PermissionStatusType =
  | 'undetermined'
  | 'granted'
  | 'denied'
  | 'permanently_denied';

export interface LocationState {
  currentCoordinates: LocationCoordinates | null;
  selectedAddress: UserAddress | null;
  savedAddresses: UserAddress[];
  permissionStatus: PermissionStatusType;
  isDetecting: boolean;
  error: string | null;

  // Actions
  requestPermission: () => Promise<PermissionStatusType>;
  detectCurrentPosition: () => Promise<UserAddress | null>;
  confirmAddress: (address: UserAddress) => void;
  selectManualAddress: (address: UserAddress) => void;
  clearError: () => void;
}

