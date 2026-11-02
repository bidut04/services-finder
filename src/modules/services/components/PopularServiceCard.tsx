import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../core/theme/colors';
import { Spacing } from '../../../core/theme/spacing';
import { Typography } from '../../../core/theme/typography';
import { useTheme } from '../../../core/theme/themeStore';
import { PopularServiceItem } from '../types/service.types';

export interface PopularServiceCardProps {
  service: PopularServiceItem;
  onBookNow: (service: PopularServiceItem) => void;
}

export const PopularServiceCard: React.FC<PopularServiceCardProps> = ({
  service,
  onBookNow,
}) => {
  const { colors, isDark } = useTheme();
  const imageSource =
    typeof service.imageUrl === 'string'
      ? { uri: service.imageUrl }
      : service.imageUrl;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <Image source={imageSource} style={styles.image} resizeMode="cover" />
      <View style={styles.infoCol}>
        <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
          {service.title}
        </Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={13} color="#FBBF24" />
          <Text style={[styles.ratingText, { color: colors.textPrimary }]}>{service.rating}</Text>
          <Text style={[styles.verifiedText, { color: colors.textMuted }]}>• Verified</Text>
        </View>
        <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
          Starting <Text style={[styles.priceBold, { color: colors.primary }]}>{service.price}</Text>
        </Text>
      </View>
      <TouchableOpacity
        style={[
          styles.bookBtn,
          isDark ? { borderWidth: 1, borderColor: '#334155' } : null,
        ]}
        activeOpacity={0.8}
        onPress={() => onBookNow(service)}
      >
        <Text style={styles.bookBtnText}>Book Now</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  image: {
    width: 66,
    height: 66,
    borderRadius: 14,
    marginRight: 12,
    backgroundColor: '#F3F4F6',
  },
  infoCol: {
    flex: 1,
  },
  title: {
    ...Typography.h3,
    fontSize: 14.5,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
    gap: 3,
  },
  ratingText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  verifiedText: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textMuted,
  },
  priceLabel: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  priceBold: {
    fontWeight: '700',
    color: Colors.primary,
  },
  bookBtn: {
    backgroundColor: '#0F172A', // #0f172a requested by user
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Spacing.radiusFull,
  },
  bookBtnText: {
    ...Typography.caption,
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
