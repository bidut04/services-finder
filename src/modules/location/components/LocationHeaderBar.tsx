import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../core/theme/colors';
import { Spacing } from '../../../core/theme/spacing';
import { Typography } from '../../../core/theme/typography';
import { UserAddress } from '../types/location.types';

export interface LocationHeaderBarProps {
  address: UserAddress | null;
  onChangeLocation: () => void;
  onNotificationPress?: () => void;
}

export const LocationHeaderBar: React.FC<LocationHeaderBarProps> = ({
  address,
  onChangeLocation,
  onNotificationPress,
}) => {
  const primaryDisplay = address
    ? `${address.city}, ${address.district}`
    : 'Detecting Location...';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onChangeLocation}
        style={styles.locationButton}
      >
        <View style={styles.pinCircle}>
          <Ionicons name="location-sharp" size={18} color={Colors.primary} />
        </View>
        <View style={styles.textColumn}>
          <View style={styles.titleRow}>
            <Text style={styles.locationTitle} numberOfLines={1}>
              {primaryDisplay}
            </Text>
            <Ionicons name="chevron-down" size={16} color={Colors.textPrimary} />
          </View>
          <Text style={styles.changeSubtext}>Change Location</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onNotificationPress}
        style={styles.bellButton}
      >
        <Ionicons name="notifications-outline" size={22} color={Colors.textPrimary} />
        <View style={styles.notificationDot} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: '#FFFFFF',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.md,
  },
  pinCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primaryBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  textColumn: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginRight: 4,
  },
  changeSubtext: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 1,
  },
  bellButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.emergency,
    position: 'absolute',
    top: 10,
    right: 11,
  },
});

