import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Alert, Platform } from 'react-native';
import { ServiceProviderDetail } from '../src/modules/services/components/ServiceProviderDetail';
import {
  SmoothScreenWrapper,
  useScreenTransition,
} from '../src/core/animations/SmoothScreenWrapper';
import { useLocationStore } from '../src/modules/location/store/locationStore';
import { useTheme } from '../src/core/theme/themeStore';
import { userApi } from '../src/api/user.api';
import { eventMessenger } from '../src/core/components/EventMessenger';

export default function ProviderDetailScreen() {
  const router = useRouter();
  const { isDark, colors } = useTheme();
  const params = useLocalSearchParams<{
    id?: string;
    title?: string;
    price?: string;
    rating?: string;
    location?: string;
    imageUrl?: string;
  }>();

  const { selectedAddress } = useLocationStore();
  const { navigateWithExit } = useScreenTransition();

  const currentCity =
    params.location ||
    (selectedAddress?.city
      ? `${selectedAddress.city}, ${selectedAddress.district || 'West Bengal'}`
      : '47 Dubai circuit, UAE');

  const handleBack = () => {
    navigateWithExit(() => router.back());
  };

  const handleBookNow = async (selectedServices: string[]) => {
    const serviceName = params.title || 'Home Service';
    const numPrice = parseFloat((params.price || '499').replace(/[^0-9.]/g, '')) || 499;

    try {
      const res = await userApi.createBooking({
        categoryId: 'cat_cleaning',
        addressId: selectedAddress?.id || 'addr_default',
        problemDescription: `Customer booked: ${serviceName} (${selectedServices.join(', ')})`,
        estimatedTotal: numPrice,
        items: (selectedServices.length > 0 ? selectedServices : [serviceName]).map((s, idx) => ({
          skillId: `sk_${idx}`,
          title: s,
          quantity: 1,
          unitPrice: numPrice / (selectedServices.length || 1),
          totalPrice: numPrice / (selectedServices.length || 1),
        })),
      });

      const message = `Booking confirmed! Reference: ${res.booking.bookingCode}. A nearby partner has been assigned.`;

      eventMessenger.emit({
        title: 'Booking Confirmed!',
        message: `Reference #${res.booking.bookingCode} for ${serviceName}. Captain dispatched.`,
        type: 'success',
        category: 'booking',
      });

      if (Platform.OS === 'web') {
        window.alert(message);
        router.push('/(tabs)/bookings');
      } else {
        Alert.alert('Booking Confirmed!', message, [
          {
            text: 'View My Bookings',
            onPress: () => router.push('/(tabs)/bookings'),
          },
        ]);
      }
    } catch (err: any) {
      if (Platform.OS === 'web') {
        window.alert(err.message || 'Failed to submit booking request.');
      } else {
        Alert.alert('Booking Error', err.message || 'Failed to submit booking request.');
      }
    }
  };

  return (
    <SmoothScreenWrapper backgroundColor={isDark ? colors.background : '#FFFFFF'}>
      <ServiceProviderDetail
        title={params.title || 'Plumbing Service'}
        location={currentCity}
        rating={params.rating || '6.8'}
        weeklyRate="$367.00"
        hourlyRate={params.price || '$32.00'}
        imageUrl={params.imageUrl}
        onBack={handleBack}
        onBookNow={handleBookNow}
        accentColor="#0F172A"
      />
    </SmoothScreenWrapper>
  );
}
