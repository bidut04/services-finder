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

  const handleBookNow = (selectedServices: string[]) => {
    const serviceName = params.title || 'Plumbing Service';
    const message = `Booking initiated for ${serviceName} (${selectedServices.join(
      ', '
    )}) at ${params.price || '$32.00/hr'}.`;

    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert('Booking Request Sent', message, [
        {
          text: 'View Bookings',
          onPress: () => router.push('/(tabs)/bookings'),
        },
        { text: 'OK', style: 'cancel' },
      ]);
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
