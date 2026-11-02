import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../core/theme/colors';
import { Spacing } from '../../../core/theme/spacing';
import { Typography } from '../../../core/theme/typography';
import { UserAddress } from '../types/location.types';

export interface AddressCardProps {
  address: UserAddress;
  isSelected?: boolean;
  onSelect?: (address: UserAddress) => void;
}

export const AddressCard: React.FC<AddressCardProps> = ({
  address,
  isSelected = false,
  onSelect,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onSelect?.(address)}
      style={[
        styles.card,
        isSelected ? styles.cardSelected : null,
      ]}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={address.label === 'Work' ? 'briefcase' : 'location'}
          size={22}
          color={Colors.primary}
        />
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.cityText}>{address.city}, {address.district}</Text>
          {address.label && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{address.label}</Text>
            </View>
          )}
        </View>
        <Text style={styles.addressText} numberOfLines={2}>
          {address.formattedAddress}
        </Text>
      </View>

      {isSelected && (
        <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: Spacing.radiusLg,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryBackground,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  infoContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cityText: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  badge: {
    backgroundColor: Colors.borderLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  badgeText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  addressText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});

