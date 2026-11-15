import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/core/theme/colors';
import { Typography } from '../../src/core/theme/typography';
import { Spacing } from '../../src/core/theme/spacing';
import { useTheme } from '../../src/core/theme/themeStore';
import { userApi, ApiBooking } from '../../src/api/user.api';

export default function BookingsTab() {
  const router = useRouter();
  const { isDark, colors } = useTheme();
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      const data = await userApi.getMyBookings();
      setBookings(data || []);
    } catch (err: any) {
      console.warn('[Fetch Bookings Error]:', err.message);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'PAID':
        return { bg: '#ECFDF5', text: '#059669', icon: 'checkmark-circle' };
      case 'IN_PROGRESS':
        return { bg: '#EFF6FF', text: '#2563EB', icon: 'hammer' };
      case 'ASSIGNED':
      case 'CAPTAIN_EN_ROUTE':
        return { bg: '#FEF3C7', text: '#D97706', icon: 'bicycle' };
      case 'CANCELLED':
        return { bg: '#FEE2E2', text: '#DC2626', icon: 'close-circle' };
      default:
        return { bg: '#F3F4F6', text: '#4B5563', icon: 'time' };
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>My Bookings</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading bookings...</Text>
        </View>
      ) : bookings.length === 0 ? (
        /* Empty State */
        <ScrollView
          contentContainerStyle={styles.centerContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={[styles.iconCircle, { backgroundColor: colors.primaryBackground }]}>
            <Ionicons name="calendar-outline" size={38} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Bookings Found</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            You haven't requested any services yet. Explore popular cleaning, plumbing & electrical services today!
          </Text>
          <TouchableOpacity
            style={[styles.browseBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(tabs)')}
            activeOpacity={0.88}
          >
            <Text style={styles.browseBtnText}>Explore Services</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </ScrollView>
      ) : (
        /* Active Bookings List */
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {bookings.map((booking) => {
            const statusConfig = getStatusColor(booking.status);
            return (
              <View
                key={booking.id}
                style={[
                  styles.bookingCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                {/* Card Top Row */}
                <View style={styles.cardHeader}>
                  <View style={styles.codeWrapper}>
                    <Ionicons name="receipt-outline" size={16} color={colors.primary} />
                    <Text style={[styles.bookingCode, { color: colors.textPrimary }]}>
                      {booking.bookingCode}
                    </Text>
                  </View>

                  <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                    <Ionicons name={statusConfig.icon as any} size={13} color={statusConfig.text} style={{ marginRight: 4 }} />
                    <Text style={[styles.statusBadgeText, { color: statusConfig.text }]}>
                      {booking.status}
                    </Text>
                  </View>
                </View>

                {/* Service Details */}
                <Text style={[styles.serviceTitle, { color: colors.textPrimary }]}>
                  {booking.problemDescription || booking.category?.name || 'General Home Service'}
                </Text>

                {/* Scheduled Time & Price Row */}
                <View style={styles.metaRow}>
                  <View style={styles.metaCol}>
                    <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Scheduled For</Text>
                    <Text style={[styles.metaValue, { color: colors.textSecondary }]}>
                      {new Date(booking.scheduledFor).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>

                  <View style={[styles.metaCol, { alignItems: 'flex-end' }]}>
                    <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Estimated Total</Text>
                    <Text style={[styles.priceValue, { color: colors.primary }]}>
                      ₹{booking.finalTotal || booking.estimatedTotal}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    ...Typography.h2,
    fontSize: 20,
  },
  refreshBtn: {
    padding: 6,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  loadingText: {
    ...Typography.body,
    marginTop: 12,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    ...Typography.h2,
    fontSize: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    ...Typography.body,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  browseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 24,
  },
  browseBtnText: {
    ...Typography.button,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  bookingCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  codeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookingCode: {
    ...Typography.caption,
    fontWeight: '700',
    marginLeft: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusBadgeText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '700',
  },
  serviceTitle: {
    ...Typography.h3,
    fontSize: 15,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
  },
  metaCol: {
    flex: 1,
  },
  metaLabel: {
    ...Typography.caption,
    fontSize: 11,
    marginBottom: 2,
  },
  metaValue: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  priceValue: {
    ...Typography.h3,
    fontSize: 16,
    fontWeight: '800',
  },
});
