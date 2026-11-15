import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { gsapScreenOptions } from '../src/core/animations/pageTransitions';
import { ToastContainer } from '../src/core/components/Toast';
import { useAuthStore } from '../src/modules/auth/store/authStore';

const queryClient = new QueryClient();

function AuthBootstrapRedirect() {
  const segments = useSegments();
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.token);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  useEffect(() => {
    if (!isHydrated) return;

    // Check if user is currently at the root or auth screens
    const firstSegment = segments[0] as string | undefined;
    const inAuthGroup = firstSegment === '(auth)';
    const isRoot = !firstSegment || firstSegment === 'index';

    // WhatsApp / Zomato experience: If user is already logged in, bypass welcome/login and jump directly to tabs
    if (isAuthenticated && token && (inAuthGroup || isRoot)) {
      router.replace('/(tabs)');
    }
  }, [isHydrated, isAuthenticated, token, segments, router]);

  return null;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <AuthBootstrapRedirect />
        <Stack screenOptions={gsapScreenOptions}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)/login" />
          <Stack.Screen name="(auth)/otp" />
          <Stack.Screen
            name="(location)/permission"
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen
            name="(location)/detecting"
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen name="(location)/confirm" />
          <Stack.Screen name="provider-detail" />
          <Stack.Screen name="(tabs)" />
        </Stack>

        {/* Global Floating Toast Notifications (Success, Failed, Warn) */}
        <ToastContainer />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
