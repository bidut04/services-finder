import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  ViewStyle,
  StyleProp,
  Platform,
} from 'react-native';
import { gsap } from 'gsap';
import { useReduceMotion } from './useReduceMotion';
import { GsapEasings } from './SlideUpTransition';

export interface SmoothScreenWrapperProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  initialOffsetY?: number; // 28px default
  durationMs?: number; // 650ms default
  backgroundColor?: string;
}

/**
 * Screen-Level Transition Wrapper:
 * Eliminates sudden screen jumps ("certen coming") across Web and Mobile.
 * - On Web: Uses official GSAP timeline with power3.out / power4.inOut (650ms)
 * - On Mobile: Uses Native Driver (useNativeDriver: true) with exact GsapEasings.power3Out
 */
export const SmoothScreenWrapper: React.FC<SmoothScreenWrapperProps> = ({
  children,
  style,
  initialOffsetY = 28,
  durationMs = 650,
  backgroundColor = '#F8F9FA',
}) => {
  const reduceMotion = useReduceMotion();
  const containerRef = useRef<any>(null);

  // Native driver animated values (used for mobile and universal fallback)
  const animOpacity = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  const animTranslateY = useRef(
    new Animated.Value(reduceMotion ? 0 : initialOffsetY)
  ).current;

  useEffect(() => {
    if (reduceMotion) {
      animOpacity.setValue(1);
      animTranslateY.setValue(0);
      return;
    }

    // Web: Official GSAP animation
    if (Platform.OS === 'web' && containerRef.current) {
      try {
        gsap.fromTo(
          containerRef.current,
          { opacity: 0, y: initialOffsetY },
          {
            opacity: 1,
            y: 0,
            duration: durationMs / 1000,
            ease: 'power3.out',
            overwrite: 'auto',
          }
        );
        return;
      } catch {
        // Fall back to React Native Animated
      }
    }

    // Native: 60fps Native Driver with GsapEasings.power3Out
    Animated.parallel([
      Animated.timing(animOpacity, {
        toValue: 1,
        duration: durationMs * 0.9,
        easing: GsapEasings.power3Out,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(animTranslateY, {
        toValue: 0,
        duration: durationMs,
        easing: GsapEasings.power3Out,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, [reduceMotion, durationMs, initialOffsetY, animOpacity, animTranslateY]);

  return (
    <Animated.View
      ref={containerRef}
      style={[
        styles.root,
        { backgroundColor },
        style,
        {
          opacity: animOpacity,
          transform: [{ translateY: animTranslateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

/**
 * Hook for executing a smooth GSAP exit before navigating to the next page
 * (Opacity: 1 -> 0, TranslateY: 0 -> -32, Scale: 1 -> 0.96, power3In, 450ms)
 * Delivers the requested deep-slide-to-fade transition across screens.
 */
export function useScreenTransition() {
  const reduceMotion = useReduceMotion();
  const exitOpacity = useRef(new Animated.Value(1)).current;
  const exitTranslateY = useRef(new Animated.Value(0)).current;
  const exitScale = useRef(new Animated.Value(1)).current;

  const navigateWithExit = (
    navigationAction: () => void,
    exitDistance = -32, // deeper slide to fade
    duration = 450 // smooth 450ms power3In
  ) => {
    if (reduceMotion) {
      navigationAction();
      return;
    }

    Animated.parallel([
      Animated.timing(exitOpacity, {
        toValue: 0,
        duration,
        easing: GsapEasings.power3In,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(exitTranslateY, {
        toValue: exitDistance,
        duration,
        easing: GsapEasings.power3In,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(exitScale, {
        toValue: 0.96,
        duration,
        easing: GsapEasings.power3In,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(() => {
      navigationAction();
      // Restore opacity, scale and position for back transitions
      setTimeout(() => {
        exitOpacity.setValue(1);
        exitTranslateY.setValue(0);
        exitScale.setValue(1);
      }, 550);
    });
  };

  return {
    exitAnimStyle: {
      opacity: exitOpacity,
      transform: [
        { translateY: exitTranslateY },
        { scale: exitScale },
      ],
    },
    navigateWithExit,
  };
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
