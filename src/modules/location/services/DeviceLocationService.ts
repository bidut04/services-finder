import * as Location from 'expo-location';
import { LocationCoordinates } from '../types/location.types';

export interface LocationDetectionOptions {
  maxAgeMs?: number;           // Max allowed age of cached position (default: 5 mins)
  desiredAccuracyMeters?: number; // Acceptable cached accuracy (default: 200m)
  timeoutMs?: number;          // Timeout for fresh GPS fix (default: 8000ms)
}

export class DeviceLocationService {
  private static cachedCoordinates: LocationCoordinates | null = null;
  private static lastFetchTimestamp = 0;

  /**
   * Cached-First, Fresh-Location-Second Detection Strategy
   * 1. Returns valid cached/last-known position in 0ms (no UI block)
   * 2. Asynchronously requests a fresh GPS fix and calls onFreshLocation
   */
  public static async getOptimizedLocation(
    onFreshLocation?: (freshCoords: LocationCoordinates) => void,
    options: LocationDetectionOptions = {}
  ): Promise<LocationCoordinates> {
    const maxAgeMs = options.maxAgeMs || 5 * 60 * 1000; // 5 minutes
    const desiredAccuracy = options.desiredAccuracyMeters || 200;

    // 1. Check if location services (GPS hardware) are enabled
    const isServiceEnabled = await Location.hasServicesEnabledAsync().catch(() => false);
    if (!isServiceEnabled) {
      // Fallback default coordinates (Daspur, Paschim Medinipur) if GPS is turned off
      return this.getDefaultCoordinates();
    }

    // 2. Step 1: Fast Path - Retrieve Last Known Position (0-10ms)
    try {
      const lastKnown = await Location.getLastKnownPositionAsync({
        maxAge: maxAgeMs,
        requiredAccuracy: desiredAccuracy,
      });

      if (lastKnown && lastKnown.coords) {
        const cached: LocationCoordinates = {
          latitude: lastKnown.coords.latitude,
          longitude: lastKnown.coords.longitude,
          accuracy: lastKnown.coords.accuracy,
          speedKmh: lastKnown.coords.speed ? lastKnown.coords.speed * 3.6 : null,
          headingDeg: lastKnown.coords.heading,
          timestamp: lastKnown.timestamp,
        };

        this.cachedCoordinates = cached;
        this.lastFetchTimestamp = Date.now();

        // 3. Step 2: Trigger fresh GPS fix in background without blocking caller
        this.fetchFreshPositionAsync(onFreshLocation);

        return cached;
      }
    } catch {
      // Last known failed, proceed to fresh fix
    }

    // If no valid cached location was available, fetch fresh position with Balanced accuracy
    return await this.fetchFreshPosition(options.timeoutMs);
  }

  /**
   * Fresh GPS acquisition with Balanced accuracy to protect battery life
   */
  private static async fetchFreshPosition(timeoutMs = 7000): Promise<LocationCoordinates> {
    try {
      const fresh = await Promise.race([
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced, // Fused Location Provider on Android / CoreLocation on iOS
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('GPS location timeout')), timeoutMs)
        ),
      ]);

      const coords: LocationCoordinates = {
        latitude: fresh.coords.latitude,
        longitude: fresh.coords.longitude,
        accuracy: fresh.coords.accuracy,
        speedKmh: fresh.coords.speed ? fresh.coords.speed * 3.6 : null,
        headingDeg: fresh.coords.heading,
        timestamp: fresh.timestamp,
      };

      this.cachedCoordinates = coords;
      this.lastFetchTimestamp = Date.now();
      return coords;
    } catch {
      return this.cachedCoordinates || this.getDefaultCoordinates();
    }
  }

  /**
   * Background fresh GPS listener (calls onFreshLocation callback when lock arrives)
   */
  private static async fetchFreshPositionAsync(
    onFreshLocation?: (freshCoords: LocationCoordinates) => void
  ) {
    if (!onFreshLocation) return;
    try {
      const fresh = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords: LocationCoordinates = {
        latitude: fresh.coords.latitude,
        longitude: fresh.coords.longitude,
        accuracy: fresh.coords.accuracy,
        speedKmh: fresh.coords.speed ? fresh.coords.speed * 3.6 : null,
        headingDeg: fresh.coords.heading,
        timestamp: fresh.timestamp,
      };

      this.cachedCoordinates = coords;
      this.lastFetchTimestamp = Date.now();
      onFreshLocation(coords);
    } catch {
      // Silently handle background GPS lock error
    }
  }

  public static getDefaultCoordinates(): LocationCoordinates {
    return {
      latitude: 22.6047,
      longitude: 87.7188,
      accuracy: 15,
      timestamp: Date.now(),
    };
  }
}
