import { create } from 'zustand';
import {
  LocationState,
  PermissionStatusType,
  UserAddress,
} from '../types/location.types';
import { LocationPermissionService } from '../services/LocationPermissionService';
import { CurrentLocationService } from '../services/CurrentLocationService';
import { ReverseGeocodingService } from '../services/ReverseGeocodingService';
import { SavedAddressService } from '../services/SavedAddressService';

export const useLocationStore = create<LocationState>((set, get) => ({
  currentCoordinates: null,
  selectedAddress: null,
  savedAddresses: [],
  permissionStatus: 'undetermined',
  isDetecting: false,
  error: null,

  requestPermission: async (): Promise<PermissionStatusType> => {
    const status = await LocationPermissionService.requestPermission();
    set({ permissionStatus: status });
    return status;
  },

  detectCurrentPosition: async (): Promise<UserAddress | null> => {
    set({ isDetecting: true, error: null });
    try {
      // 1. Check or ask for permission
      const perm = await LocationPermissionService.requestPermission();
      set({ permissionStatus: perm });

      // 2. Fetch coordinates
      const coords = await CurrentLocationService.getCurrentCoordinates();
      set({ currentCoordinates: coords });

      // 3. Reverse geocode to address
      const address = await ReverseGeocodingService.getAddressFromCoordinates(coords);
      const saved = await SavedAddressService.getSavedAddresses();

      set({
        selectedAddress: address,
        savedAddresses: saved,
        isDetecting: false,
      });

      return address;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unable to acquire location.';
      set({ error: errorMessage, isDetecting: false });
      return null;
    }
  },

  confirmAddress: (address: UserAddress) => {
    set({ selectedAddress: address });
  },

  selectManualAddress: (address: UserAddress) => {
    set({
      selectedAddress: address,
      currentCoordinates: address.coordinates,
      error: null,
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));

