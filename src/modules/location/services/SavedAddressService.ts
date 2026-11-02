import { UserAddress } from '../types/location.types';

export class SavedAddressService {
  private static initialSavedAddresses: UserAddress[] = [
    {
      id: 'saved_home_1',
      formattedAddress: 'Near Daspur Bus Stand, Paschim Medinipur, West Bengal 721211',
      street: 'Hospital Road',
      locality: 'Bus Stand Area',
      city: 'Daspur',
      district: 'Paschim Medinipur',
      state: 'West Bengal',
      postalCode: '721211',
      country: 'India',
      coordinates: { latitude: 22.6055, longitude: 87.7195 },
      label: 'Home',
    },
    {
      id: 'saved_work_2',
      formattedAddress: 'Ghatal Central Plaza, Paschim Medinipur, West Bengal 721212',
      street: 'Station Road',
      locality: 'Commercial Complex',
      city: 'Ghatal',
      district: 'Paschim Medinipur',
      state: 'West Bengal',
      postalCode: '721212',
      country: 'India',
      coordinates: { latitude: 22.6667, longitude: 87.7222 },
      label: 'Work',
    },
  ];

  public static async getSavedAddresses(): Promise<UserAddress[]> {
    return this.initialSavedAddresses;
  }
}

