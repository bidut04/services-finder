import React, { useEffect, useRef } from 'react';
import {
  Animated,
  ViewStyle,
  StyleProp,
  Easing,
  Platform,
} from 'react-native';
import { useReduceMotion } from './useReduceMotion';

/**
 * GSAP Easing Equivalents for React Native
 * Derived directly from GreenSock Animation Platform (GSAP 3)
 */
export const GsapEasings = {
  // GSAP power3.out - ultra-smooth deceleration curve
  power3Out: Easing.bezier(0.215, 0.61, 0.355, 1),
  // GSAP power3.in - smooth accelerating curve for deep slide-out / fade-out
  power3In: Easing.bezier(0.7, 0, 0.84, 0),
  // GSAP power3.inOut - silky symmetric acceleration / deceleration
  power3InOut: Easing.bezier(0.645, 0.045, 0.355, 1),
  // GSAP power4.out - dramatic ease out
  power4Out: Easing.bezier(0.165, 0.84, 0.44, 1),
  // GSAP power4.inOut - smooth cinematic reveal (600ms page transitions)
  power4InOut: Easing.bezier(0.77, 0, 0.175, 1),
  // GSAP power2.in - snappy exit
  power2In: Easing.bezier(0.55, 0.085, 0.68, 0.53),
  // GSAP back.out(1.8) - elastic pop for tags, chips, buttons
  backOut: Easing.back(1.8),
  // GSAP back.out(2.2) - energetic overshoot
  backOutStrong: Easing.back(2.2),
};

export type GsapAnimationPreset =
  | 'card-slide'     // y: 36 -> 0, opacity: 0 -> 1 (GSAP power3.out, 800ms)
  | 'hero-reveal'    // scale: 1.16 -> 1, opacity: 0 -> 1 (GSAP power3.out, 1100ms)
  | 'tag-pop'        // scale: 0.35 -> 1, y: 16 -> 0 (GSAP back.out(1.8), 520ms)
  | 'fade-slide'     // y: 24 -> 0, opacity: 0 -> 1 (GSAP power3.out, 650ms)
  | 'slide-down'     // y: -22 -> 0, opacity: 0 -> 1 (GSAP power3.out, 600ms)
  | 'scale-in'       // scale: 0.7 -> 1, opacity: 0 -> 1 (GSAP back.out, 550ms)
  | 'smooth-reveal'; // subtle scale 0.94 -> 1, y: 20 -> 0, buttery smooth power3.out, 750ms

export interface SlideUpTransitionProps {
  children: React.ReactNode;
  delayMs?: number;
  durationMs?: number;
  initialOffsetY?: number;
  preset?: GsapAnimationPreset;
  staggerIndex?: number;
  staggerDelayMs?: number;
  style?: StyleProp<ViewStyle>;
}

export const SlideUpTransition: React.FC<SlideUpTransitionProps> = ({
  children,
  delayMs = 0,
  durationMs,
  initialOffsetY,
  preset = 'card-slide',
  staggerIndex = 0,
  staggerDelayMs = 80, // Taxidiaa 80ms stagger cadence
  style,
}) => {
  const reduceMotion = useReduceMotion();

  // Compute preset defaults matching the scraped GSAP specifications
  const config = React.useMemo(() => {
    switch (preset) {
      case 'hero-reveal':
        return {
          duration: durationMs ?? 1100,
          yOffset: initialOffsetY ?? 0,
          initialScale: 1.16,
          targetScale: 1,
          easing: GsapEasings.power3Out,
        };
      case 'tag-pop':
        return {
          duration: durationMs ?? 520,
          yOffset: initialOffsetY ?? 16,
          initialScale: 0.35,
          targetScale: 1,
          easing: GsapEasings.backOut,
        };
      case 'scale-in':
        return {
          duration: durationMs ?? 550,
          yOffset: initialOffsetY ?? 8,
          initialScale: 0.7,
          targetScale: 1,
          easing: GsapEasings.backOutStrong,
        };
      case 'slide-down':
        return {
          duration: durationMs ?? 600,
          yOffset: initialOffsetY ?? -22,
          initialScale: 1,
          targetScale: 1,
          easing: GsapEasings.power3Out,
        };
      case 'fade-slide':
        return {
          duration: durationMs ?? 650,
          yOffset: initialOffsetY ?? 24,
          initialScale: 1,
          targetScale: 1,
          easing: GsapEasings.power3Out,
        };
      case 'smooth-reveal':
        return {
          duration: durationMs ?? 750,
          yOffset: initialOffsetY ?? 20,
          initialScale: 0.94,
          targetScale: 1,
          easing: GsapEasings.power3Out,
        };
      case 'card-slide':
      default:
        return {
          duration: durationMs ?? 800,
          yOffset: initialOffsetY ?? 36,
          initialScale: 1,
          targetScale: 1,
          easing: GsapEasings.power3Out,
        };
    }
  }, [preset, durationMs, initialOffsetY]);

  const translateY = useRef(new Animated.Value(reduceMotion ? 0 : config.yOffset)).current;
  const scale = useRef(new Animated.Value(reduceMotion ? 1 : config.initialScale)).current;
  const opacity = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;

  useEffect(() => {
    if (reduceMotion) {
      translateY.setValue(0);
      scale.setValue(1);
      opacity.setValue(1);
      return;
    }

    const totalDelay = delayMs + staggerIndex * staggerDelayMs;

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: config.duration,
          easing: config.easing,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(scale, {
          toValue: config.targetScale,
          duration: config.duration,
          easing: config.easing,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: config.duration,
          easing: GsapEasings.power3Out,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    }, totalDelay);

    return () => clearTimeout(timer);
  }, [reduceMotion, delayMs, staggerIndex, staggerDelayMs, config, translateY, scale, opacity]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [
            { translateY },
            { scale },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

export interface GsapStaggerProps {
  children: React.ReactNode[];
  staggerDelayMs?: number;
  initialDelayMs?: number;
  preset?: GsapAnimationPreset;
  style?: StyleProp<ViewStyle>;
}

export const GsapStagger: React.FC<GsapStaggerProps> = ({
  children,
  staggerDelayMs = 80,
  initialDelayMs = 100,
  preset = 'fade-slide',
  style,
}) => {
  return (
    <Animated.View style={style}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        return (
          <SlideUpTransition
            key={child.key ?? index}
            delayMs={initialDelayMs}
            staggerIndex={index}
            staggerDelayMs={staggerDelayMs}
            preset={preset}
          >
            {child}
          </SlideUpTransition>
        );
      })}
    </Animated.View>
  );
};
