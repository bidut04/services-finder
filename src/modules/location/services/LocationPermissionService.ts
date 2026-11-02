import * as Location from 'expo-location';
import { PermissionStatusType } from '../types/location.types';

export class LocationPermissionService {
  /**
   * Checks current permission status without prompting
   */
  public static async checkPermission(): Promise<PermissionStatusType> {
    try {
      const { status, canAskAgain } =
        await Location.getForegroundPermissionsAsync();

      if (status === Location.PermissionStatus.GRANTED) {
        return 'granted';
      }

      if (status === Location.PermissionStatus.DENIED && !canAskAgain) {
        return 'permanently_denied';
      }

      if (status === Location.PermissionStatus.DENIED) {
        return 'denied';
      }

      return 'undetermined';
    } catch {
      return 'undetermined';
    }
  }

  /**
   * Requests foreground location permission from device
   */
  public static async requestPermission(): Promise<PermissionStatusType> {
    try {
      const { status, canAskAgain } =
        await Location.requestForegroundPermissionsAsync();

      if (status === Location.PermissionStatus.GRANTED) {
        return 'granted';
      }

      if (status === Location.PermissionStatus.DENIED && !canAskAgain) {
        return 'permanently_denied';
      }

      return 'denied';
    } catch {
      return 'denied';
    }
  }
}

