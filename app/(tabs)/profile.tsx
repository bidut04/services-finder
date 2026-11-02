import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/core/theme/colors';
import { Typography } from '../../src/core/theme/typography';
import { Spacing } from '../../src/core/theme/spacing';
import { useAuthStore } from '../../src/modules/auth/store/authStore';
import { useLocationStore } from '../../src/modules/location/store/locationStore';
import { useTheme } from '../../src/core/theme/themeStore';
import { ThemeSwitcher } from '../../src/core/components/ThemeSwitcher';

export default function ProfileTab() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { selectedAddress } = useLocationStore();
  const { isDark, colors } = useTheme();

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={styles.content}>
        <Image
          source={{
            uri:
              user?.avatarUrl ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
          }}
          style={[styles.avatar, { borderColor: colors.primary }]}
        />
        <Text style={[styles.name, { color: colors.textPrimary }]}>{user?.name || 'Palash'}</Text>
        <Text style={[styles.phone, { color: colors.textSecondary }]}>+91 {user?.phoneNumber || '9876543210'}</Text>

        {/* Theme Switcher Setting Row */}
        <ThemeSwitcher variant="row" style={{ marginBottom: Spacing.md }} />

        <View style={[styles.locationBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="location" size={18} color={colors.primary} />
          <Text style={[styles.locationText, { color: colors.textPrimary }]} numberOfLines={1}>
            {selectedAddress?.formattedAddress || 'Daspur, Paschim Medinipur'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.changeLocBtn}
          onPress={() => router.push('/(location)/confirm')}
        >
          <Text style={[styles.changeLocText, { color: colors.primary }]}>Adjust Confirmed Location</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.emergency} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: Colors.primary,
    marginBottom: Spacing.md,
  },
  name: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  phone: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: Spacing.md,
    borderRadius: Spacing.radiusMd,
    borderWidth: 1,
    borderColor: Colors.border,
    width: '100%',
    gap: 8,
    marginBottom: Spacing.md,
  },
  locationText: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    flex: 1,
  },
  changeLocBtn: {
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  changeLocText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.emergencyLight,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.radiusFull,
    gap: 8,
  },
  logoutText: {
    ...Typography.button,
    color: Colors.emergency,
    fontSize: 15,
  },
});

