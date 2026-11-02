import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { gsap } from 'gsap';
import { Typography } from '../src/core/theme/typography';
import {
  SlideUpTransition,
  GsapEasings,
} from '../src/core/animations/SlideUpTransition';
import { DragToStartButton } from '../src/core/components/DragToStartButton';
import { useReduceMotion } from '../src/core/animations/useReduceMotion';
import { useTheme } from '../src/core/theme/themeStore';
import { ThemeSwitcher } from '../src/core/components/ThemeSwitcher';

const { width, height } = Dimensions.get('window');

// Responsive sizing for the hero section:
// Container max width is 480 (for tablets/web desktop)
const containerWidth = Math.min(width, 480);
const heroWidth = containerWidth;
// Aspect ratio of assets/technician-hero.png is 896 / 1200 = 0.7466
const HERO_ASPECT_RATIO = 896 / 1200;
// Full natural height without any letterbox:
const heroHeight = Math.min(heroWidth / HERO_ASPECT_RATIO, height * 0.64);

const technicianImg = require('../assets/technician-hero.png');

export default function WelcomeScreen() {
  const router = useRouter();
  const reduceMotion = useReduceMotion();
  const { isDark, colors } = useTheme();
  const screenRef = useRef<any>(null);

  // Deep entrance and exit animated values:
  // - Entrance: Deep slide (44px -> 0px) + Deep fade (0 -> 1)
  // - Exit: Deep slide (0px -> -72px) + Deep fade (1 -> 0) + Scale (1 -> 0.93) with power3In
  const screenTranslateY = useRef(
    new Animated.Value(reduceMotion ? 0 : 44)
  ).current;
  const screenOpacity = useRef(
    new Animated.Value(reduceMotion ? 1 : 0)
  ).current;
  const screenScale = useRef(
    new Animated.Value(reduceMotion ? 1 : 1.04)
  ).current;

  // Real-time interactive drag progress (0 -> 1)
  const dragProgress = useRef(new Animated.Value(0)).current;

  // Real-time interactive deep slide-to-fade linked 1:1 to drag progress (0 -> 1)
  const dragOpacity = dragProgress.interpolate({
    inputRange: [0, 0.85, 1],
    outputRange: [1, 0.15, 0],
    extrapolate: 'clamp',
  });
  const dragTranslateY = dragProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -72],
    extrapolate: 'clamp',
  });
  const dragScale = dragProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.93],
    extrapolate: 'clamp',
  });

  // Combine entrance mount animation with interactive drag progress
  const activeOpacity = Animated.multiply(screenOpacity, dragOpacity);
  const activeTranslateY = Animated.add(screenTranslateY, dragTranslateY);
  const activeScale = Animated.multiply(screenScale, dragScale);

  // Sync real-time drag progress with web GSAP on desktop browsers
  useEffect(() => {
    if (Platform.OS === 'web' && screenRef.current) {
      const sub = dragProgress.addListener(({ value }) => {
        try {
          gsap.set(screenRef.current, {
            opacity: Math.max(0, 1 - value),
            y: -value * 72,
            scale: 1 - value * 0.07,
          });
        } catch {}
      });
      return () => dragProgress.removeListener(sub);
    }
  }, [dragProgress]);

  // Mount entrance animation
  useEffect(() => {
    if (reduceMotion) {
      screenTranslateY.setValue(0);
      screenOpacity.setValue(1);
      screenScale.setValue(1);
      return;
    }

    if (Platform.OS === 'web' && screenRef.current) {
      try {
        gsap.fromTo(
          screenRef.current,
          { opacity: 0, y: 44, scale: 1.04 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.72,
            ease: 'power3.out',
            overwrite: 'auto',
          }
        );
        return;
      } catch {
        // Fallback to Native Animated
      }
    }

    Animated.parallel([
      Animated.timing(screenTranslateY, {
        toValue: 0,
        duration: 720,
        easing: GsapEasings.power3Out,
        useNativeDriver: false,
      }),
      Animated.timing(screenOpacity, {
        toValue: 1,
        duration: 650,
        easing: GsapEasings.power3Out,
        useNativeDriver: false,
      }),
      Animated.timing(screenScale, {
        toValue: 1,
        duration: 720,
        easing: GsapEasings.power3Out,
        useNativeDriver: false,
      }),
    ]).start();
  }, [reduceMotion, screenTranslateY, screenOpacity, screenScale]);

  const handleGetStarted = () => {
    if (reduceMotion) {
      router.push('/(auth)/login');
      return;
    }

    // Web GSAP deep slide to fade
    if (Platform.OS === 'web' && screenRef.current) {
      try {
        gsap.to(screenRef.current, {
          y: -72,
          opacity: 0,
          scale: 0.93,
          duration: 0.35,
          ease: 'power3.in',
        });
      } catch {}
    }

    // Native Animated: complete deep slide to fade with power3In
    Animated.timing(dragProgress, {
      toValue: 1,
      duration: 260,
      easing: GsapEasings.power3In,
      useNativeDriver: false,
    }).start(() => {
      router.push('/(auth)/login');
      // Reset transition state for when the user navigates back
      setTimeout(() => {
        dragProgress.setValue(0);
        screenTranslateY.setValue(0);
        screenOpacity.setValue(1);
        screenScale.setValue(1);
        if (Platform.OS === 'web' && screenRef.current) {
          try {
            gsap.set(screenRef.current, { opacity: 1, y: 0, scale: 1 });
          } catch {}
        }
      }, 600);
    });
  };

  return (
    <View style={[styles.outerContainer, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Animated.View
        ref={screenRef}
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            opacity: activeOpacity,
            transform: [
              { translateY: activeTranslateY },
              { scale: activeScale },
            ],
          },
        ]}
      >
        {/* Background Organic Blue Curved Shape: fills the entire bottom behind drag button */}
        <View
          style={[
            styles.organicBlueWave,
            { backgroundColor: isDark ? '#1E3A8A' : '#1E40AF' },
          ]}
          pointerEvents="none"
        />

        <SafeAreaView edges={['top']} style={styles.topSafeArea}>
          {/* 1. Header Bar: CS Logo + Brand Name + Theme Switcher */}
          <SlideUpTransition preset="fade-slide" delayMs={60} durationMs={500} style={styles.headerRow}>
            <View style={styles.headerInnerRow}>
              <View style={styles.brandRow}>
                <View style={[styles.logoBadge, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                  <Text style={[styles.logoTextC, { color: colors.textPrimary }]}>C</Text>
                  <Text style={styles.logoTextS}>S</Text>
                </View>
                <Text style={[styles.brandName, { color: colors.textPrimary }]}>Clean_space</Text>
              </View>

              <ThemeSwitcher variant="pill" />
            </View>
          </SlideUpTransition>

          {/* 2. Eyebrow Tag + Main Heading + Subtitle */}
          <View style={styles.heroTextSection}>
            <SlideUpTransition preset="fade-slide" delayMs={120} durationMs={520}>
              <Text style={styles.eyebrowTag}>TRUSTED EXPARTS</Text>
            </SlideUpTransition>

            <SlideUpTransition preset="fade-slide" delayMs={180} durationMs={560}>
              <Text style={[styles.mainTitle, { color: colors.textPrimary }]}>
                Best Helping{'\n'}Hand for You
              </Text>
            </SlideUpTransition>

            <SlideUpTransition preset="fade-slide" delayMs={240} durationMs={560}>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                We make sure excellent services thought our expart worker.
              </Text>
            </SlideUpTransition>
          </View>
        </SafeAreaView>

        {/* 3. Center Section: Technician Image + Curved Trail + Floating Metric Cards */}
        <View style={styles.technicianSection}>
          {/* Dashed Loop Trajectory Pathway with Arrow */}
          <View style={styles.dashedLoopWrap} pointerEvents="none">
            <View style={styles.dashedLoopCurve} />
            <View style={styles.arrowPointer}>
              <Ionicons name="arrow-up" size={16} color="#DC7552" style={{ transform: [{ rotate: '45deg' }] }} />
            </View>
          </View>

          {/* Technician Hero Photo - Full-screen edge-to-edge */}
          <SlideUpTransition
            preset="hero-reveal"
            delayMs={160}
            durationMs={850}
            style={styles.technicianImageWrapper}
          >
            <Image
              source={technicianImg}
              style={styles.technicianImage}
              resizeMode="contain"
            />
          </SlideUpTransition>

          {/* Floating Metric Card 1: 25+ Service Category (Top Left) */}
          <SlideUpTransition
            preset="smooth-reveal"
            delayMs={360}
            durationMs={750}
            style={[
              styles.floatingCard,
              styles.cardCategory,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.cardContentRow}>
              <View style={styles.categoryIconSquare}>
                <Ionicons name="grid-outline" size={15} color="#8B5CF6" />
              </View>
              <View>
                <Text style={[styles.cardValue, { color: colors.textPrimary }]}>25+</Text>
                <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Service Category</Text>
              </View>
            </View>
          </SlideUpTransition>

          {/* Floating Metric Card 2: 3999+ User Review (Middle Right) */}
          <SlideUpTransition
            preset="smooth-reveal"
            delayMs={480}
            durationMs={750}
            style={[
              styles.floatingCard,
              styles.cardReview,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.cardContentRow}>
              <View style={styles.starIconSquare}>
                <Ionicons name="star" size={16} color="#F97316" />
              </View>
              <View>
                <Text style={[styles.cardValue, { color: colors.textPrimary }]}>3999+</Text>
                <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>User Review</Text>
              </View>
            </View>
          </SlideUpTransition>

          {/* Floating Metric Card 3: 2000+ Expert Worker (Bottom Left) */}
          <SlideUpTransition
            preset="smooth-reveal"
            delayMs={600}
            durationMs={750}
            style={[
              styles.floatingCard,
              styles.cardWorker,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.cardContentRow}>
              <View style={styles.checkIconSquare}>
                <Ionicons name="checkmark-circle" size={17} color="#14B8A6" />
              </View>
              <View>
                <Text style={[styles.cardValue, { color: colors.textPrimary }]}>2000+</Text>
                <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Expert Worker</Text>
              </View>
            </View>
          </SlideUpTransition>
        </View>

        {/* 4. Bottom Actions: User's Recent "Drag to Start" Button */}
        <SafeAreaView edges={['bottom']} style={styles.bottomBarContainer}>
          <SlideUpTransition preset="smooth-reveal" delayMs={520} durationMs={700} style={styles.buttonWrapper}>
            <DragToStartButton
              title="Get Started"
              onComplete={handleGetStarted}
              dragProgressAnimated={dragProgress}
              trackColor={isDark ? colors.surface : '#FFFFFF'}
              thumbColor={isDark ? colors.primaryLight : '#0F172A'}
              textColor="#FFFFFF"
              arrowColor={isDark ? '#CBD5E1' : '#94A3B8'}
              style={[
                styles.dragButton,
                { borderColor: isDark ? colors.border : 'rgba(255, 255, 255, 0.4)' },
              ]}
            />
          </SlideUpTransition>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#FDFBF9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FDFBF9',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  topSafeArea: {
    paddingHorizontal: 22,
    paddingTop: Platform.OS === 'ios' ? 8 : 14,
    zIndex: 10,
  },

  /* Header */
  headerRow: {
    marginBottom: 12,
  },
  headerInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  logoTextC: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },
  logoTextS: {
    fontSize: 14,
    fontWeight: '900',
    color: '#F97316',
  },
  brandName: {
    ...Typography.h3,
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },

  /* Hero Typography */
  heroTextSection: {
    marginBottom: 4,
    zIndex: 5,
  },
  eyebrowTag: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '800',
    color: '#B45309', // Golden amber/brown
    letterSpacing: 1.2,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  mainTitle: {
    ...Typography.hero,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    color: '#0F172A', // Deep navy
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.body,
    fontSize: 13.5,
    lineHeight: 20,
    color: '#475569',
    maxWidth: '92%',
  },

  /* Center Technician Section - Full Screen Hero */
  technicianSection: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
    overflow: 'visible',
    marginTop: -4,
    zIndex: 5,
  },
  organicBlueWave: {
    position: 'absolute',
    bottom: 0,
    left: -30,
    right: -30,
    height: Math.min(height * 0.32, 270),
    backgroundColor: '#1E40AF', // Vivid royal blue organic base
    borderTopLeftRadius: 240,
    borderTopRightRadius: 160,
    opacity: 0.98,
    zIndex: 0,
  },
  dashedLoopWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  dashedLoopCurve: {
    width: Math.min(width * 0.82, 380),
    height: Math.min(heroHeight * 0.62, 320),
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(220, 117, 82, 0.45)', // Soft terracotta dashed line
    borderRadius: 150,
    transform: [{ rotate: '-18deg' }, { scaleX: 1.15 }],
  },
  arrowPointer: {
    position: 'absolute',
    top: '10%',
    left: '16%',
    zIndex: 3,
  },
  technicianImageWrapper: {
    width: heroWidth,
    height: heroHeight,
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 4,
  },
  technicianImage: {
    width: heroWidth,
    height: heroHeight,
    marginBottom: Platform.OS === 'ios' ? -8 : -4,
  },

  /* Floating Metric Cards */
  floatingCard: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    zIndex: 10,
  },
  cardContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardValue: {
    ...Typography.h3,
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 17,
  },
  cardLabel: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    lineHeight: 12,
  },

  /* Specific Card Positions flanking the full-screen technician */
  cardCategory: {
    top: Math.round(heroHeight * 0.12),
    left: 14,
  },
  categoryIconSquare: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardReview: {
    top: Math.round(heroHeight * 0.38),
    right: 14,
  },
  starIconSquare: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardWorker: {
    bottom: Math.round(heroHeight * 0.20),
    left: 14,
  },
  checkIconSquare: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#CCFBF1', // Teal wash matching #14B8A6
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Bottom Action Bar */
  bottomBarContainer: {
    width: '100%',
    paddingHorizontal: 22,
    paddingBottom: Platform.OS === 'ios' ? 14 : 20,
    paddingTop: 6,
    zIndex: 20,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  buttonWrapper: {
    width: '100%',
  },
  dragButton: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 6,
  },
});
