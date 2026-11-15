import { create } from 'zustand';
import {
  LocationState,
  LocationCoordinates,
  PermissionStatusType,
  UserAddress,
} from '../types/location.types';
import { LocationPermissionService } from '../services/LocationPermissionService';
import { DeviceLocationService } from '../services/DeviceLocationService';
import { userApi } from '../../../api/user.api';

export const useLocationStore = create<LocationState>((set, get) => ({
  currentCoordinates: null,
  selectedAddress: null,
  savedAddresses: [],
  nearbyCaptains: [],
  permissionStatus: 'undetermined',
  isDetecting: false,
  error: null,

  requestPermission: async (): Promise<PermissionStatusType> => {
    const status = await LocationPermissionService.requestPermission();
    set({ permissionStatus: status });
    return status;
  },

  /**
   * Cached-First, Fresh-Location-Second Detection Pipeline
   */
  detectCurrentPosition: async (): Promise<UserAddress | null> => {
    set({ isDetecting: true, error: null });
    try {
      // 1. Verify Permission
      const perm = await LocationPermissionService.requestPermission();
      set({ permissionStatus: perm });

      if (perm === 'denied' || perm === 'permanently_denied') {
        set({ isDetecting: false });
        return get().selectedAddress;
      }

      // 2. Cached-First Location retrieval (0ms UI freeze)
      const initialCoords = await DeviceLocationService.getOptimizedLocation(
        // Asynchronous callback when higher accuracy GPS lock arrives
        async (freshCoords: LocationCoordinates) => {
          set({ currentCoordinates: freshCoords });
          try {
            const freshAddr = await userApi.reverseGeocode(freshCoords.latitude, freshCoords.longitude);
            if (freshAddr) {
              set({
                selectedAddress: {
                  id: `addr_${Date.now()}`,
                  formattedAddress: freshAddr.formattedAddress,
                  street: freshAddr.street,
                  locality: freshAddr.locality,
                  city: freshAddr.city,
                  district: freshAddr.district || '',
                  state: freshAddr.state,
                  postalCode: freshAddr.postalCode,
                  country: freshAddr.country,
                  coordinates: freshCoords,
                  isCurrentLocation: true,
                },
              });
            }
          } catch {}
        }
      );

      set({ currentCoordinates: initialCoords });

      // 3. Resolve readable address via backend OpenStreetMap/Nominatim provider
      let resolvedAddress: UserAddress;
      try {
        const geo = await userApi.reverseGeocode(initialCoords.latitude, initialCoords.longitude);
        resolvedAddress = {
          id: `addr_${Date.now()}`,
          formattedAddress: geo.formattedAddress,
          street: geo.street,
          locality: geo.locality,
          city: geo.city,
          district: geo.district || '',
          state: geo.state,
          postalCode: geo.postalCode,
          country: geo.country,
          coordinates: initialCoords,
          isCurrentLocation: true,
        };
      } catch {
        // Fallback default address
        resolvedAddress = {
          id: `addr_fallback_${Date.now()}`,
          formattedAddress: 'Daspur Bazar, Paschim Medinipur, West Bengal 721211',
          street: 'Daspur Main Road',
          city: 'Daspur',
          district: 'Paschim Medinipur',
          state: 'West Bengal',
          postalCode: '721211',
          country: 'India',
          coordinates: initialCoords,
          isCurrentLocation: true,
        };
      }

      // 4. Fetch saved customer addresses
      let saved: UserAddress[] = [];
      try {
        const rawSaved = await userApi.getCustomerAddresses();
        saved = (rawSaved || []).map((s: any) => ({
          id: s.id,
          formattedAddress: s.addressLine1 + (s.city ? `, ${s.city}` : ''),
          street: s.addressLine1,
          city: s.city,
          district: s.district || '',
          state: s.state,
          postalCode: s.postalCode,
          country: 'India',
          coordinates: { latitude: s.latitude, longitude: s.longitude },
          label: s.tag,
        }));
      } catch {}

      set({
        selectedAddress: resolvedAddress,
        savedAddresses: saved,
        isDetecting: false,
      });

      // 5. Query nearby Redis GEO captains
      get().loadNearbyCaptains(initialCoords.latitude, initialCoords.longitude);

      return resolvedAddress;
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
    get().loadNearbyCaptains(address.coordinates.latitude, address.coordinates.longitude);
  },

  loadNearbyCaptains: async (lat?: number, lng?: number, radiusKm = 15) => {
    const coords = get().currentCoordinates;
    const targetLat = lat ?? coords?.latitude;
    const targetLng = lng ?? coords?.longitude;

    if (targetLat === undefined || targetLng === undefined) return;

    try {
      const captains = await userApi.getNearbyCaptains(targetLat, targetLng, radiusKm);
      set({ nearbyCaptains: captains || [] });
    } catch {
      // Keep previous list
    }
  },

  saveAddressToBackend: async (address: UserAddress) => {
    try {
      await userApi.saveCustomerAddress({
        tag: address.label || 'Home',
        addressLine1: address.street || address.formattedAddress,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        latitude: address.coordinates.latitude,
        longitude: address.coordinates.longitude,
        isDefault: true,
      });

      set((state) => ({
        savedAddresses: [address, ...state.savedAddresses.filter((a) => a.id !== address.id)],
      }));
    } catch (err: any) {
      console.warn('[saveAddressToBackend]:', err.message);
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
