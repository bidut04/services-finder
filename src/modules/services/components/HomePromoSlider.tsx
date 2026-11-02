import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  LayoutChangeEvent,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../core/theme/colors';
import { Typography } from '../../../core/theme/typography';
import { GsapEasings } from '../../../core/animations/SlideUpTransition';
import { useReduceMotion } from '../../../core/animations/useReduceMotion';

const smartHomeCleaners = require('../../../../assets/smart-home-cleaners.png');

export interface HomePromoSliderProps {
  cityName?: string;
  onPressSmartHome?: () => void;
  onPressVehicleBreakdown?: () => void;
}

export const HomePromoSlider: React.FC<HomePromoSliderProps> = ({
  cityName = 'Daspur',
  onPressSmartHome,
  onPressVehicleBreakdown,
}) => {
  const [sliderWidth, setSliderWidth] = useState(340);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<any>(null);
  const isUserTouchingRef = useRef(false);
  const reduceMotion = useReduceMotion();

  // Animated dot indicator value
  const dotAnim = useRef(new Animated.Value(0)).current;

  // Auto-slide timer
  useEffect(() => {
    if (reduceMotion) return;

    const interval = setInterval(() => {
      if (isUserTouchingRef.current || sliderWidth <= 0) return;
      setActiveIndex((prev) => {
        const next = prev === 0 ? 1 : 0;
        scrollRef.current?.scrollTo({
          x: next * sliderWidth,
          animated: true,
        });
        return next;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [sliderWidth, reduceMotion]);

  // Sync dot animation with active index
  useEffect(() => {
    Animated.timing(dotAnim, {
      toValue: activeIndex,
      duration: 320,
      easing: GsapEasings.power3Out,
      useNativeDriver: false,
    }).start();
  }, [activeIndex, dotAnim]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    if (sliderWidth > 0) {
      const idx = Math.round(offsetX / sliderWidth);
      if (idx !== activeIndex && (idx === 0 || idx === 1)) {
        setActiveIndex(idx);
      }
    }
  };

  const handleDotPress = (index: number) => {
    setActiveIndex(index);
    scrollRef.current?.scrollTo({
      x: index * sliderWidth,
      animated: true,
    });
  };

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && Math.abs(w - sliderWidth) > 2) {
      setSliderWidth(w);
    }
  }, [sliderWidth]);

  return (
    <View style={styles.wrapper} onLayout={onLayout}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={sliderWidth}
        snapToAlignment="center"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onTouchStart={() => {
          isUserTouchingRef.current = true;
        }}
        onTouchEnd={() => {
          setTimeout(() => {
            isUserTouchingRef.current = false;
          }, 1200);
        }}
        onScrollBeginDrag={() => {
          isUserTouchingRef.current = true;
        }}
        onScrollEndDrag={() => {
          setTimeout(() => {
            isUserTouchingRef.current = false;
          }, 1200);
        }}
        style={{ width: sliderWidth }}
        contentContainerStyle={{ width: sliderWidth * 2 }}
      >
        {/* SLIDE 1: Smart Home Service (Royal Blue Theme) */}
        <View style={[styles.slideCard, styles.smartHomeBg, { width: sliderWidth }]}>
          {/* Ambient decorative glow */}
          <View style={styles.ambientGlowBlue} pointerEvents="none" />

          {/* Left Text & CTA */}
          <View style={styles.promoTextCol}>
            <View style={styles.promoBadgeRow}>
              <View style={styles.promoBadge}>
                <View style={styles.amberSpark} />
                <Text style={styles.promoBadgeText}>Limited offer</Text>
              </View>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={10} color="#FBBF24" />
                <Text style={styles.ratingBadgeText}>4.9</Text>
              </View>
            </View>

            <View>
              <Text style={styles.promoTitle}>Smart Home{'\n'}Service</Text>
              <Text style={styles.promoSubtitle} numberOfLines={1}>
                Cleaning & Automation
              </Text>
            </View>

            <TouchableOpacity
              style={styles.bookNowPill}
              activeOpacity={0.85}
              onPress={onPressSmartHome}
            >
              <Ionicons name="calendar-outline" size={13} color="#FFFFFF" />
              <Text style={styles.bookNowText}>Book Now</Text>
              <Ionicons name="arrow-forward" size={11} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Floating 30% OFF Circle Badge */}
          <View style={styles.discountBadge}>
            <Text style={styles.discountNumber}>30%</Text>
            <Text style={styles.discountSub}>OFF</Text>
          </View>

          {/* Cleaners Team Photo */}
          <Image
            source={smartHomeCleaners}
            style={styles.cleanersPhoto}
            resizeMode="cover"
          />
        </View>

        {/* SLIDE 2: Vehicle Breakdown (Navy Slate & Crimson Emergency Theme) */}
        <View style={[styles.slideCard, styles.breakdownBg, { width: sliderWidth }]}>
          {/* Subtle emergency background glow */}
          <View style={styles.emergencyGlow} pointerEvents="none" />

          {/* Left Text & CTA */}
          <View style={styles.breakdownTextCol}>
            <View style={styles.emergencyBadge}>
              <View style={styles.pulseDot} />
              <Text style={styles.emergencyBadgeText}>Emergency SOS • 24/7</Text>
            </View>

            <Text style={styles.breakdownTitle}>Vehicle Broke Down?</Text>

            <Text style={styles.breakdownSubtitle} numberOfLines={2}>
              Find a nearby mechanic in {cityName} &amp; get help on the spot.
            </Text>

            <TouchableOpacity
              style={styles.mechanicActionBtn}
              activeOpacity={0.85}
              onPress={onPressVehicleBreakdown}
            >
              <Text style={styles.mechanicActionText}>Find Mechanic Now</Text>
              <Ionicons name="flash" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Right Floating ETA & Icon Shield */}
          <View style={styles.breakdownRightGraphic}>
            <View style={styles.warningCircle}>
              <Ionicons name="car-sport" size={28} color="#FFFFFF" />
              <View style={styles.alertBadgeTip}>
                <Ionicons name="warning" size={12} color="#FFFFFF" />
              </View>
            </View>
            <View style={styles.etaPill}>
              <Text style={styles.etaText}>5–15 MIN</Text>
              <Text style={styles.etaSub}>ARRIVAL</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Pagination Dot Indicators */}
      <View style={styles.dotsRow}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleDotPress(0)}
          style={styles.dotTouchable}
        >
          <View
            style={[
              styles.dot,
              activeIndex === 0 ? styles.activePillDot : styles.inactiveDot,
            ]}
          />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleDotPress(1)}
          style={styles.dotTouchable}
        >
          <View
            style={[
              styles.dot,
              activeIndex === 1 ? styles.activePillDotEmergency : styles.inactiveDot,
            ]}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginVertical: 12,
  },
  slideCard: {
    height: 146,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },
  smartHomeBg: {
    backgroundColor: '#1E3A8A', // Deep Royal Navy Blue matching Clean_space theme
  },
  ambientGlowBlue: {
    position: 'absolute',
    left: -20,
    top: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  breakdownBg: {
    backgroundColor: '#1E293B', // Deep navy slate
  },
  promoTextCol: {
    flex: 1,
    paddingLeft: 18,
    paddingVertical: 14,
    justifyContent: 'space-between',
    height: '100%',
    zIndex: 2,
  },
  promoBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  promoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  amberSpark: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
    marginRight: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  ratingBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  promoBadgeText: {
    ...Typography.caption,
    fontSize: 10.5,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  promoTitle: {
    ...Typography.h2,
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 22,
  },
  promoSubtitle: {
    ...Typography.caption,
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.75)',
    fontWeight: '600',
    marginTop: 2,
  },
  bookNowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A', // #0f172a requested by user
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  bookNowText: {
    ...Typography.caption,
    fontSize: 11.5,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  discountBadge: {
    position: 'absolute',
    left: '49%',
    top: '26%',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  discountNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
    lineHeight: 15,
  },
  discountSub: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  cleanersPhoto: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 148,
    height: 146,
    borderTopRightRadius: 22,
    borderBottomRightRadius: 22,
  },

  /* Breakdown Slide Styles */
  emergencyGlow: {
    position: 'absolute',
    right: -20,
    top: -20,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(220, 38, 38, 0.14)',
  },
  breakdownTextCol: {
    flex: 1,
    paddingLeft: 18,
    paddingVertical: 14,
    paddingRight: 10,
    justifyContent: 'space-between',
    height: '100%',
    zIndex: 2,
  },
  emergencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.28)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.4)',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  emergencyBadgeText: {
    ...Typography.caption,
    fontSize: 10.5,
    color: '#FECACA',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  breakdownTitle: {
    ...Typography.h2,
    fontSize: 17.5,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 22,
  },
  breakdownSubtitle: {
    ...Typography.caption,
    fontSize: 11,
    color: '#CBD5E1',
    lineHeight: 15,
  },
  mechanicActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 5,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  mechanicActionText: {
    ...Typography.caption,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11.5,
  },
  breakdownRightGraphic: {
    width: 100,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 16,
    zIndex: 2,
    gap: 8,
  },
  warningCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  alertBadgeTip: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#1E293B',
  },
  etaPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  etaText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  etaSub: {
    fontSize: 7.5,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },

  /* Dots */
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  dotTouchable: {
    padding: 3,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  inactiveDot: {
    width: 6,
    backgroundColor: '#D1D5DB',
  },
  activePillDot: {
    width: 20,
    backgroundColor: Colors.primary, // Emerald Green active dot
  },
  activePillDotEmergency: {
    width: 20,
    backgroundColor: '#DC2626', // Red active dot for Emergency SOS slide
  },
});
