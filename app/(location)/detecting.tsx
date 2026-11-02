import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/core/theme/colors';
import { Spacing } from '../../src/core/theme/spacing';
import { Typography } from '../../src/core/theme/typography';
import { RadarPulse } from '../../src/core/animations/RadarPulse';
import { useLocationStore } from '../../src/modules/location/store/locationStore';
import { SlideUpTransition } from '../../src/core/animations/SlideUpTransition';
import { Button } from '../../src/core/components/Button';
import {
  SmoothScreenWrapper,
  useScreenTransition,
} from '../../src/core/animations/SmoothScreenWrapper';

const { width } = Dimensions.get('window');

export default function DetectingLocationScreen() {
  const router = useRouter();
  const { detectCurrentPosition, selectedAddress, currentCoordinates } =
    useLocationStore();
  const [detectionStep, setDetectionStep] = useState<
    'probing_gps' | 'reverse_geocoding' | 'located'
  >('probing_gps');

  useEffect(() => {
    let isMounted = true;

    const runDetection = async () => {
      setDetectionStep('probing_gps');
      await new Promise((r) => setTimeout(r, 1200));

      if (isMounted) {
        setDetectionStep('reverse_geocoding');
      }

      const address = await detectCurrentPosition();
      await new Promise((r) => setTimeout(r, 1000));

      if (isMounted && address) {
        setDetectionStep('located');
      }
    };

    runDetection();

    return () => {
      isMounted = false;
    };
  }, [detectCurrentPosition]);

  const { exitAnimStyle, navigateWithExit } = useScreenTransition();

  const handleProceedToConfirm = () => {
    navigateWithExit(() => router.replace('/(location)/confirm'));
  };

  const isLocated = detectionStep === 'located' && selectedAddress;

  return (
    <SmoothScreenWrapper>
      <Animated.View style={[{ flex: 1 }, exitAnimStyle]}>
        <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Radar Animation Area */}
        <View style={styles.radarContainer}>
          <RadarPulse size={width * 0.45} color={Colors.primary} />
        </View>

        {/* Dynamic Status Messaging */}
        <View style={styles.statusSection}>
          <Text style={styles.statusTitle}>
            {detectionStep === 'probing_gps' && 'Acquiring GPS Satellites...'}
            {detectionStep === 'reverse_geocoding' && 'Identifying Address...'}
            {detectionStep === 'located' && 'Location Found!'}
          </Text>

          <Text style={styles.statusSubtitle}>
            {detectionStep === 'probing_gps' &&
              'Calibrating precision coordinates for accurate doorstep service'}
            {detectionStep === 'reverse_geocoding' &&
              'Matching coordinates with local service zones'}
            {detectionStep === 'located' &&
              'Coordinates locked. Ready to inspect nearby pros.'}
          </Text>
        </View>

        {/* Live Detected Position Card */}
        {isLocated ? (
          <SlideUpTransition durationMs={400} style={styles.detectedCard}>
            <View style={styles.detectedHeader}>
              <View style={styles.gpsLivePill}>
                <View style={styles.liveGreenDot} />
                <Text style={styles.liveGpsText}>GPS LOCKED</Text>
              </View>
              <Text style={styles.coordsText}>
                {currentCoordinates?.latitude.toFixed(4)}° N,{' '}
                {currentCoordinates?.longitude.toFixed(4)}° E
              </Text>
            </View>

            <View style={styles.addressRow}>
              <View style={[styles.pinIconBox, { backgroundColor: Colors.successLight }]}>
                <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
              </View>
              <View style={styles.addressTextCol}>
                <Text style={styles.cityName}>
                  {selectedAddress.city}, {selectedAddress.district}
                </Text>
                <Text style={styles.fullAddress} numberOfLines={2}>
                  {selectedAddress.formattedAddress}
                </Text>
              </View>
            </View>

            <Button
              title="Review & Confirm Pin"
              onPress={handleProceedToConfirm}
              rightIcon={<Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
              style={styles.confirmBtn}
            />
          </SlideUpTransition>
        ) : (
          <View style={styles.loadingSkeleton}>
            <Text style={styles.detectingHint}>
              Please hold on while we triangulate your location...
            </Text>
            <TouchableOpacity
              onPress={handleProceedToConfirm}
              style={styles.manualFallbackBtn}
            >
              <Text style={styles.manualFallbackText}>Skip and select manually</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
      </Animated.View>
    </SmoothScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'space-between',
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  radarContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  statusSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  statusTitle: {
    ...Typography.hero,
    fontSize: 22,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  statusSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  detectedCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: Spacing.radiusLg,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.primaryLight,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  detectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  gpsLivePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success, // Teal Green #14B8A6
    marginRight: 6,
  },
  liveGpsText: {
    ...Typography.caption,
    color: Colors.success, // Teal Green #14B8A6 GPS locked
    fontWeight: '700',
  },
  coordsText: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  pinIconBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primaryBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  addressTextCol: {
    flex: 1,
  },
  cityName: {
    ...Typography.h2,
    fontSize: 18,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  fullAddress: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  confirmBtn: {
    width: '100%',
  },
  loadingSkeleton: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: Spacing.lg,
  },
  detectingHint: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
  manualFallbackBtn: {
    paddingVertical: Spacing.xs,
  },
  manualFallbackText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

