import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../core/theme/colors';
import { Spacing } from '../../../core/theme/spacing';
import { Typography } from '../../../core/theme/typography';

export interface EmergencyBannerProps {
  cityName?: string;
  onPressFindMechanic: () => void;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({
  cityName = 'Daspur',
  onPressFindMechanic,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name="warning" size={24} color="#FFFFFF" />
      </View>
      <View style={styles.textCol}>
        <Text style={styles.title}>Vehicle Broke Down?</Text>
        <Text style={styles.subtitle}>
          Find a nearby mechanic in {cityName} and get help wherever you are.
        </Text>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.actionBtn}
          onPress={onPressFindMechanic}
        >
          <Text style={styles.actionText}>Find Mechanic Now</Text>
          <Ionicons name="flash" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: Spacing.radiusLg,
    padding: Spacing.md,
    marginVertical: Spacing.sm,
    alignItems: 'center',
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.emergency,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  textCol: {
    flex: 1,
  },
  title: {
    ...Typography.h3,
    color: '#FFFFFF',
  },
  subtitle: {
    ...Typography.caption,
    color: '#CBD5E1',
    marginVertical: 4,
    lineHeight: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.emergency,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 4,
    gap: 4,
  },
  actionText: {
    ...Typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

