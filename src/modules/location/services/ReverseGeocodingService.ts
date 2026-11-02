import * as Location from 'expo-location';
import { LocationCoordinates, UserAddress } from '../types/location.types';

export class ReverseGeocodingService {
  /**
   * Converts coordinates into a human-readable structured UserAddress
   */
  public static async getAddressFromCoordinates(
    coords: LocationCoordinates
  ): Promise<UserAddress> {
    try {
      const geocoded = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      if (geocoded && geocoded.length > 0) {
        const place = geocoded[0];
        const street = place.street || place.name || '';
        const locality = place.district || place.subregion || '';
        const city = place.city || place.subregion || 'Daspur';
        const district = place.district || place.subregion || 'Paschim Medinipur';
        const state = place.region || 'West Bengal';
        const postalCode = place.postalCode || '721211';
        const country = place.country || 'India';

        const formattedAddress = [
          street,
          locality,
          city,
          district,
          state,
          postalCode,
        ]
          .filter(Boolean)
          .join(', ');

        return {
          id: `addr_${Date.now()}`,
          formattedAddress: formattedAddress || `${city}, ${district}`,
          street,
          locality,
          city,
          district,
          state,
          postalCode,
          country,
          coordinates: coords,
          isCurrentLocation: true,
        };
      }
    } catch {
      // Reverse geocoding fallback
    }

    // Default fallback address (e.g. Daspur, Paschim Medinipur)
    return {
      id: `addr_fallback_${Date.now()}`,
      formattedAddress: 'Daspur Bazar, Paschim Medinipur, West Bengal 721211',
      street: 'Daspur Main Road',
      locality: 'Daspur Bazar',
      city: 'Daspur',
      district: 'Paschim Medinipur',
      state: 'West Bengal',
      postalCode: '721211',
      country: 'India',
      coordinates: coords,
      isCurrentLocation: true,
    };
  }
}

