import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Alert, Platform } from 'react-native';
import { ServiceProviderDetail } from '../src/modules/services/components/ServiceProviderDetail';
import {
  SmoothScreenWrapper,
  useScreenTransition,
} from '../src/core/animations/SmoothScreenWrapper';
import { useLocationStore } from '../src/modules/location/store/locationStore';

export default function ProviderDetailScreen() {
  const router = useRouter();
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
      : 'New York');

  const handleBack = () => {
    navigateWithExit(() => router.back());
  };

  const handleBookNow = (selectedServices: string[]) => {
    const serviceName = params.title || 'Home Cleaning';
    const message = `Booking initiated for ${serviceName} (${selectedServices.join(
      ', '
    )}) at ${params.price || '$65/Hr'}.`;

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
    <SmoothScreenWrapper backgroundColor="#0F1014">
      <ServiceProviderDetail
        title={params.title || 'Home Cleaning'}
        location={currentCity}
        rating={params.rating ? parseFloat(params.rating) : 4.9}
        hourlyRate={params.price || '$65/Hr'}
        imageUrl={params.imageUrl}
        onBack={handleBack}
        onBookNow={handleBookNow}
        accentColor="#7C3AED" // Matches the purple pill CTA in screenshot
      />
    </SmoothScreenWrapper>
  );
}

