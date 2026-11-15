import { UserAddress } from '../types/location.types';
import { userApi } from '../../../api/user.api';

export class SavedAddressService {
  public static async getSavedAddresses(): Promise<UserAddress[]> {
    try {
      const addresses = await userApi.getAddresses();
      return addresses;
    } catch {
      return [];
    }
  }

  public static async saveAddress(address: Partial<UserAddress>): Promise<UserAddress> {
    return userApi.saveAddress(address);
  }
}
