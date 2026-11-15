import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
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
import { userApi } from '../../src/api/user.api';

export default function ProfileTab() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { selectedAddress } = useLocationStore();
  const { isDark, colors } = useTheme();
  const [profile, setProfile] = useState<any>(user);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const data = await userApi.getProfile();
        if (data) {
          setProfile(data);
        }
      } catch (err: any) {
        console.warn('[Profile Fetch Warning]:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await userApi.logout();
    } catch {
      // ignore
    }
    logout();
    router.replace('/');
  };

  const displayName = profile?.name || user?.name || 'HelpNear Customer';
  const displayPhone = profile?.phoneNumber || user?.phoneNumber || '';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={styles.content}>
        <Image
          source={{
            uri:
              profile?.avatar ||
              profile?.avatarUrl ||
              user?.avatarUrl ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
          }}
          style={[styles.avatar, { borderColor: colors.primary }]}
        />
        <Text style={[styles.name, { color: colors.textPrimary }]}>{displayName}</Text>
        <Text style={[styles.phone, { color: colors.textSecondary }]}>
          {displayPhone ? `+91 ${displayPhone}` : 'Verified Partner Account'}
        </Text>

        {/* Theme Switcher Setting Row */}
        <ThemeSwitcher variant="row" style={{ marginBottom: Spacing.md }} />

        {/* Confirmed Location Box */}
        <View style={[styles.locationBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="location" size={18} color={colors.primary} />
          <Text style={[styles.locationText, { color: colors.textPrimary }]} numberOfLines={1}>
            {selectedAddress?.formattedAddress || 'No address set yet'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.changeLocBtn}
          onPress={() => router.push('/(location)/confirm')}
        >
          <Text style={[styles.changeLocText, { color: colors.primary }]}>Adjust Confirmed Location</Text>
        </TouchableOpacity>

        {/* Sign Out Button */}
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
    borderColor: '#E2E8F0',
    width: '100%',
    marginBottom: Spacing.sm,
  },
  locationText: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    marginLeft: Spacing.xs,
    flex: 1,
  },
  changeLocBtn: {
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.xxl,
  },
  changeLocText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Spacing.radiusFull,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  logoutText: {
    ...Typography.bodySmall,
    color: Colors.emergency,
    fontWeight: '600',
    marginLeft: Spacing.xs,
  },
});
