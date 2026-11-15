import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

/**
 * OTP flow has been deprecated & removed across the platform.
 * Redirects automatically to the location permission flow.
 */
export default function OtpVerificationScreen() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/(location)/permission');
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
      <ActivityIndicator size="large" color="#4F46E5" />
    </View>
  );
}
