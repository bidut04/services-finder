import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  PanResponder,
  Platform,
  LayoutChangeEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/core/theme/colors';
import { Typography } from '../../src/core/theme/typography';
import { useLocationStore } from '../../src/modules/location/store/locationStore';
import {
  SlideUpTransition,
  GsapEasings,
} from '../../src/core/animations/SlideUpTransition';
import { useReduceMotion } from '../../src/core/animations/useReduceMotion';
import { ScrubberItem } from '../../src/core/animations/PageScrubberTransition';
import {
  SmoothScreenWrapper,
  useScreenTransition,
} from '../../src/core/animations/SmoothScreenWrapper';

export default function LocationPermissionScreen() {
  const router = useRouter();
  const { requestPermission } = useLocationStore();
  const reduceMotion = useReduceMotion();

  // Radar Pulse Animation for the Map Beacon
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (reduceMotion) return;
    const loop = Animated.loop(
      Animated.parallel([
        Animated.timing(pulseScale, {
          toValue: 1.35,
          duration: 2400,
          easing: GsapEasings.power3Out,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(pulseOpacity, {
          toValue: 0,
          duration: 2400,
          easing: GsapEasings.power3Out,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [reduceMotion, pulseScale, pulseOpacity]);

  // Chevrons pulse hint
  const chevronPulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(chevronPulse, {
          toValue: 4,
          duration: 900,
          easing: GsapEasings.power3Out,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(chevronPulse, {
          toValue: 0,
          duration: 900,
          easing: GsapEasings.power3Out,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [chevronPulse]);

  const { exitAnimStyle, navigateWithExit } = useScreenTransition();

  const handleAllowLocation = async () => {
    await requestPermission();
    navigateWithExit(() => router.push('/(location)/detecting'));
  };

  const handleManualLocation = () => {
    navigateWithExit(() => router.push('/(location)/confirm'));
  };

  // Slider Button Drag Mechanics
  const [sliderWidth, setSliderWidth] = useState(320);
  const THUMB_SIZE = 48;
  const PAD = 4;
  const maxDrag = Math.max(0, sliderWidth - THUMB_SIZE - PAD * 2);
  const dragX = useRef(new Animated.Value(0)).current;
  const isCompletedRef = useRef(false);

  const triggerComplete = () => {
    if (isCompletedRef.current) return;
    isCompletedRef.current = true;
    Animated.spring(dragX, {
      toValue: maxDrag,
      bounciness: 4,
      speed: 15,
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => {
      setTimeout(() => {
        handleAllowLocation();
        setTimeout(() => {
          dragX.setValue(0);
          isCompletedRef.current = false;
        }, 800);
      }, 150);
    });
  };

  const resetSlider = () => {
    Animated.spring(dragX, {
      toValue: 0,
      tension: 90,
      friction: 9,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isCompletedRef.current,
      onStartShouldSetPanResponderCapture: () => !isCompletedRef.current,
      onMoveShouldSetPanResponder: (_, g) =>
        !isCompletedRef.current && Math.abs(g.dx) > 3,
      onMoveShouldSetPanResponderCapture: (_, g) =>
        !isCompletedRef.current && Math.abs(g.dx) > 3,
      onPanResponderMove: (_, g) => {
        if (isCompletedRef.current || maxDrag <= 0) return;
        const clampedX = Math.max(0, Math.min(g.dx, maxDrag));
        dragX.setValue(clampedX);
      },
      onPanResponderRelease: (_, g) => {
        if (isCompletedRef.current || maxDrag <= 0) return;
        if (Math.abs(g.dx) < 6 || g.dx >= maxDrag * 0.4) {
          triggerComplete();
        } else {
          resetSlider();
        }
      },
      onPanResponderTerminate: () => {
        if (!isCompletedRef.current) resetSlider();
      },
    })
  ).current;

  const handleMouseDown = (e: any) => {
    if (Platform.OS !== 'web' || isCompletedRef.current || maxDrag <= 0) return;
    e.preventDefault();
    const startClientX = e.clientX;
    const initialDragX = (dragX as any)._value || 0;

    const onMouseMove = (moveEvt: MouseEvent) => {
      moveEvt.preventDefault();
      const delta = moveEvt.clientX - startClientX;
      const nextX = Math.max(0, Math.min(initialDragX + delta, maxDrag));
      dragX.setValue(nextX);
    };

    const onMouseUp = (upEvt: MouseEvent) => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      const delta = upEvt.clientX - startClientX;
      if (Math.abs(delta) < 6 || initialDragX + delta >= maxDrag * 0.4) {
        triggerComplete();
      } else {
        resetSlider();
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const arrowOpacity =
    maxDrag > 0
      ? dragX.interpolate({
          inputRange: [0, maxDrag * 0.6, maxDrag],
          outputRange: [1, 0.2, 0],
          extrapolate: 'clamp',
        })
      : 1;

  const webProps = Platform.OS === 'web' ? { onMouseDown: handleMouseDown } : {};

  return (
    <SmoothScreenWrapper>
      <Animated.View style={[{ flex: 1 }, exitAnimStyle]}>
        <SafeAreaView style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Top Header Bar: App Badge on left, Skip on right */}
        <ScrubberItem index={0} slideDistance={10}>
          <View style={styles.topBar}>
            <View style={styles.brandPill}>
              <View style={styles.brandLogoCircle}>
                <Ionicons name="sparkles" size={13} color="#FFFFFF" />
              </View>
              <Text style={styles.brandTitle}>HelpNear</Text>
            </View>

            <TouchableOpacity
              onPress={handleManualLocation}
              activeOpacity={0.7}
              style={styles.skipButton}
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </View>
        </ScrubberItem>

        {/* Center Hero Section: Map Street Grid + Beacon Radar Pin */}
        <SlideUpTransition preset="hero-reveal" delayMs={40} durationMs={600} style={styles.heroSection}>
          <View style={styles.mapContainer}>
            {/* Perspective tilted map road grid background */}
            <View style={styles.mapGrid} pointerEvents="none">
              <View style={[styles.mapRoad, styles.roadA]} />
              <View style={[styles.mapRoad, styles.roadB]} />
              <View style={[styles.mapRoad, styles.roadC]} />
              <View style={[styles.mapRoad, styles.roadD]} />
              <View style={[styles.mapRoad, styles.roadE]} />
              <View style={[styles.mapRoad, styles.roadF]} />
            </View>

            {/* Concentric Animated Radar Rings */}
            <Animated.View
              pointerEvents="none"
              style={[
                styles.pulseWave,
                {
                  transform: [{ scale: pulseScale }],
                  opacity: pulseOpacity,
                },
              ]}
            />
            <View style={styles.outerRadarRing} pointerEvents="none" />
            <View style={styles.innerRadarRing} pointerEvents="none" />

            {/* Center Beacon Map Marker Pin */}
            <View style={styles.centerPinWrapper}>
              <View style={styles.centerPinCard}>
                <View style={styles.avatarCircle}>
                  <Ionicons name="person" size={26} color="#14B8A6" />
                </View>
                {/* Teal Green Location Badge Pointer */}
                <View style={styles.pointerBadge}>
                  <Ionicons name="location" size={13} color="#FFFFFF" />
                </View>
              </View>
              {/* Teardrop Pointer Tip pointing down to the map */}
              <View style={styles.pinTip} />
            </View>
          </View>
        </SlideUpTransition>

        {/* Title, Subtitle & Dot Indicators */}
        <SlideUpTransition preset="fade-slide" delayMs={90} durationMs={600} style={styles.textSection}>
          <Text style={styles.title}>
            Where are <Text style={styles.titleHighlight}>you located?</Text>
          </Text>
          <Text style={styles.subtitle}>
            HelpNear is a <Text style={styles.bold}>location-first</Text> platform.
            We detect your coordinates to find verified home service professionals and
            rapid roadside mechanics within your immediate radius.
          </Text>

          {/* Dots Indicator: • • ▬ • */}
          <View style={styles.dotsContainer}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={[styles.dot, styles.activePillDot]} />
            <View style={styles.dot} />
          </View>
        </SlideUpTransition>

        {/* Feature Highlights Card */}
        <SlideUpTransition preset="card-slide" delayMs={140} durationMs={600} style={styles.featuresCard}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: '#CCFBF1' }]}>
              <Ionicons name="flash-outline" size={19} color="#14B8A6" />
            </View>
            <View style={styles.featureTextCol}>
              <Text style={styles.featureTitle}>Instant Pro Matching</Text>
              <Text style={styles.featureDesc}>
                Connect to specialists 5–15 mins from your doorstep
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="car-outline" size={19} color={Colors.emergency} />
            </View>
            <View style={styles.featureTextCol}>
              <Text style={styles.featureTitle}>Emergency Roadside SOS</Text>
              <Text style={styles.featureDesc}>
                Mechanics track your live breakdown location
              </Text>
            </View>
          </View>
        </SlideUpTransition>

        {/* Bottom Actions: Slider Button & Manual Fallback */}
        <SlideUpTransition preset="fade-slide" delayMs={180} durationMs={600} style={styles.bottomSection}>
          {/* Life360-Style Emerald Pill Slider Button */}
          <View
            onLayout={(e: LayoutChangeEvent) => {
              const w = e.nativeEvent.layout.width;
              if (w > 0 && w !== sliderWidth) setSliderWidth(w);
            }}
            style={styles.sliderTrack}
            {...panResponder.panHandlers}
            {...webProps}
          >
            {/* Centered Button Title */}
            <View style={styles.sliderTextContainer} pointerEvents="none">
              <Text style={styles.sliderLabel}>Detect My Location (GPS)</Text>
            </View>

            {/* Right Chevrons */}
            <Animated.View
              pointerEvents="none"
              style={[
                styles.chevronWrap,
                {
                  opacity: arrowOpacity,
                  transform: [{ translateX: chevronPulse }],
                },
              ]}
            >
              <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.75)" />
              <Ionicons
                name="chevron-forward"
                size={18}
                color="rgba(255,255,255,0.75)"
                style={styles.secondChevron}
              />
            </Animated.View>

            {/* Draggable Circular White Checkmark Thumb */}
            <Animated.View
              style={[
                styles.sliderThumb,
                { transform: [{ translateX: dragX }] },
              ]}
            >
              <Ionicons name="checkmark" size={24} color="#0F172A" />
            </Animated.View>
          </View>

          {/* Fallback Text Link */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handleManualLocation}
            style={styles.manualButton}
          >
            <Text style={styles.manualButtonText}>
              Set Location Manually Instead
            </Text>
          </TouchableOpacity>
        </SlideUpTransition>
      </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 28,
    justifyContent: 'space-between',
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    zIndex: 10,
  },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  brandLogoCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  brandTitle: {
    ...Typography.caption,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  skipButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  skipText: {
    ...Typography.button,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  mapContainer: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mapGrid: {
    position: 'absolute',
    width: 280,
    height: 280,
    transform: [{ rotate: '-18deg' }],
    opacity: 0.55,
  },
  mapRoad: {
    position: 'absolute',
    backgroundColor: '#E2E8F0',
  },
  roadA: { top: 40, left: -20, right: -20, height: 14, borderRadius: 7 },
  roadB: { top: 120, left: -20, right: -20, height: 18, borderRadius: 9, backgroundColor: '#CBD5E1' },
  roadC: { top: 200, left: -20, right: -20, height: 12, borderRadius: 6 },
  roadD: { left: 50, top: -20, bottom: -20, width: 14, borderRadius: 7 },
  roadE: { left: 150, top: -20, bottom: -20, width: 20, borderRadius: 10, backgroundColor: '#CBD5E1' },
  roadF: { left: 230, top: -20, bottom: -20, width: 12, borderRadius: 6 },
  pulseWave: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: 'rgba(20, 184, 166, 0.18)', // Teal Green #14B8A6 radar wave
  },
  outerRadarRing: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(20, 184, 166, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.20)',
  },
  innerRadarRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(20, 184, 166, 0.16)',
  },
  centerPinWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  centerPinCard: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    position: 'relative',
  },
  pinTip: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFFFFF',
    marginTop: -3,
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#CCFBF1', // Soft Teal light wash
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointerBadge: {
    position: 'absolute',
    bottom: -4,
    right: -2,
    backgroundColor: '#14B8A6', // Teal Green #14B8A6 pointer badge
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  textSection: {
    alignItems: 'center',
    marginVertical: 8,
  },
  title: {
    ...Typography.hero,
    fontSize: 26,
    lineHeight: 33,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  titleHighlight: {
    color: '#14B8A6', // Teal Green #14B8A6 highlight
  },
  subtitle: {
    ...Typography.body,
    fontSize: 13.5,
    lineHeight: 20,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 6,
  },
  bold: {
    fontWeight: '700',
    color: Colors.primary,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
  },
  activePillDot: {
    width: 18,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#14B8A6',
  },
  featuresCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  featureTextCol: {
    flex: 1,
  },
  featureTitle: {
    ...Typography.h3,
    fontSize: 14.5,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  featureDesc: {
    ...Typography.bodySmall,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 6,
  },
  bottomSection: {
    width: '100%',
    marginTop: 8,
    alignItems: 'center',
  },
  sliderTrack: {
    height: 56,
    width: '100%',
    borderRadius: 28,
    backgroundColor: '#0F172A', // #0f172a requested by user
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
    ...Platform.select({
      web: {
        cursor: 'grab' as any,
        userSelect: 'none' as any,
      },
    }),
  },
  sliderTextContainer: {
    position: 'absolute',
    left: 56,
    right: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderLabel: {
    ...Typography.button,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  chevronWrap: {
    position: 'absolute',
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  secondChevron: {
    marginLeft: -10,
  },
  sliderThumb: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF', // Circular white thumb matching reference
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  manualButton: {
    marginTop: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  manualButtonText: {
    ...Typography.body,
    fontSize: 13.5,
    color: Colors.textSecondary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
