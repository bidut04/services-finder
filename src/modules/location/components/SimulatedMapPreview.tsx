import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../core/theme/colors';
import { Typography } from '../../../core/theme/typography';

export interface SimulatedMapPreviewProps {
  onRecenterPress: () => void;
}

export const SimulatedMapPreview: React.FC<SimulatedMapPreviewProps> = ({
  onRecenterPress,
}) => {
  return (
    <View style={styles.mapArea}>
      <View style={styles.mapGridLine1} />
      <View style={styles.mapGridLine2} />
      <View style={styles.mapRoad1} />
      <View style={styles.mapRoad2} />

      {/* Pin Marker with Radar Ring */}
      <View style={styles.mapPinContainer}>
        <View style={styles.pinRadarRing} />
        <View style={styles.pinShadow} />
        <View style={styles.pinIcon}>
          <Ionicons name="location" size={36} color={Colors.primary} />
        </View>
        <View style={styles.pinCallout}>
          <Text style={styles.pinCalloutText}>GPS Detected</Text>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.recenterButton}
        onPress={onRecenterPress}
      >
        <Ionicons name="locate" size={22} color={Colors.success} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  mapArea: {
    height: 230,
    backgroundColor: '#E5E7EB',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapGridLine1: {
    position: 'absolute',
    width: '100%',
    height: 30,
    backgroundColor: '#D1D5DB',
    top: 50,
  },
  mapGridLine2: {
    position: 'absolute',
    width: '100%',
    height: 20,
    backgroundColor: '#D1D5DB',
    bottom: 40,
  },
  mapRoad1: {
    position: 'absolute',
    width: 40,
    height: '100%',
    backgroundColor: '#FFFFFF',
    left: '30%',
    transform: [{ rotate: '15deg' }],
  },
  mapRoad2: {
    position: 'absolute',
    width: 28,
    height: '100%',
    backgroundColor: '#FFFFFF',
    right: '25%',
    transform: [{ rotate: '-25deg' }],
  },
  mapPinContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  pinRadarRing: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(20, 184, 166, 0.22)', // Teal Green #14B8A6 GPS radar ring
  },
  pinShadow: {
    position: 'absolute',
    bottom: -4,
    width: 16,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  pinIcon: {
    marginBottom: 4,
  },
  pinCallout: {
    backgroundColor: Colors.success, // Teal Green #14B8A6 GPS detected callout
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pinCalloutText: {
    ...Typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  recenterButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
});

