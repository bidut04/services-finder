import * as Location from 'expo-location';
import { Linking, Platform } from 'react-native';
import { PermissionStatusType } from '../types/location.types';

export class LocationPermissionService {
  /**
   * Checks current permission status without prompting user
   */
  public static async checkPermission(): Promise<PermissionStatusType> {
    try {
      const res = await Location.getForegroundPermissionsAsync();

      if (res.status === Location.PermissionStatus.GRANTED) {
        if ((res as any).android?.accuracy === 'coarse' || (res as any).scope === 'approximate') {
          return 'approximate';
        }
        return 'granted';
      }

      if (res.status === Location.PermissionStatus.DENIED && !res.canAskAgain) {
        return 'permanently_denied';
      }

      if (res.status === Location.PermissionStatus.DENIED) {
        return 'denied';
      }

      return 'undetermined';
    } catch {
      return 'undetermined';
    }
  }

  /**
   * Requests foreground location permission from device with explanation handling
   */
  public static async requestPermission(): Promise<PermissionStatusType> {
    try {
      const res = await Location.requestForegroundPermissionsAsync();

      if (res.status === Location.PermissionStatus.GRANTED) {
        if ((res as any).android?.accuracy === 'coarse' || (res as any).scope === 'approximate') {
          return 'approximate';
        }
        return 'granted';
      }

      if (res.status === Location.PermissionStatus.DENIED && !res.canAskAgain) {
        return 'permanently_denied';
      }

      return 'denied';
    } catch {
      return 'denied';
    }
  }

  /**
   * Guides user to OS system settings if permission was permanently denied
   */
  public static async openAppSettings(): Promise<void> {
    try {
      if (Platform.OS === 'ios') {
        await Linking.openURL('app-settings:');
      } else {
        await Linking.openSettings();
      }
    } catch (err: any) {
      console.warn('[LocationPermissionService.openAppSettings]:', err.message);
    }
  }
}
