import React, { useEffect, useRef, createContext } from 'react';
import {
  Animated,
  ViewStyle,
  StyleProp,
  Platform,
} from 'react-native';
import { ScrubberEasings } from './pageTransitions';
import { useReduceMotion } from './useReduceMotion';

interface ScrubberContextValue {
  isExiting: boolean;
  registerExitTrigger: (callback: () => void) => void;
}

const ScrubberContext = createContext<ScrubberContextValue>({
  isExiting: false,
  registerExitTrigger: () => {},
});

export interface PageScrubberViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  initialDelayMs?: number;
}

/**
 * Top-level screen wrapper providing the scrubber coordinate context
 */
export const PageScrubberView: React.FC<PageScrubberViewProps> = ({
  children,
  style,
  initialDelayMs = 0,
}) => {
  const reduceMotion = useReduceMotion();
  const screenOpacity = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  const screenTranslateY = useRef(new Animated.Value(reduceMotion ? 0 : 16)).current;

  useEffect(() => {
    if (reduceMotion) {
      screenOpacity.setValue(1);
      screenTranslateY.setValue(0);
      return;
    }

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(screenOpacity, {
          toValue: 1,
          duration: 480,
          easing: ScrubberEasings.scrubIn,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(screenTranslateY, {
          toValue: 0,
          duration: 520,
          easing: ScrubberEasings.scrubIn,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    }, initialDelayMs);

    return () => clearTimeout(timer);
  }, [reduceMotion, initialDelayMs, screenOpacity, screenTranslateY]);

  return (
    <ScrubberContext.Provider
      value={{
        isExiting: false,
        registerExitTrigger: () => {},
      }}
    >
      <Animated.View
        style={[
          style,
          {
            opacity: screenOpacity,
            transform: [{ translateY: screenTranslateY }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </ScrubberContext.Provider>
  );
};

export interface ScrubberItemProps {
  children: React.ReactNode;
  index?: number;
  delayMs?: number;
  staggerStepMs?: number;
  slideDistance?: number;
  durationMs?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Individual screen section that enters with a staggered scrubber-like delay
 */
export const ScrubberItem: React.FC<ScrubberItemProps> = ({
  children,
  index = 0,
  delayMs,
  staggerStepMs = 70, // 70ms cascade step
  slideDistance = 20,
  durationMs = 540,
  style,
}) => {
  const reduceMotion = useReduceMotion();
  const calculatedDelay = delayMs !== undefined ? delayMs : index * staggerStepMs;

  const translateY = useRef(new Animated.Value(reduceMotion ? 0 : slideDistance)).current;
  const opacity = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  const scale = useRef(new Animated.Value(reduceMotion ? 1 : 0.985)).current;

  useEffect(() => {
    if (reduceMotion) {
      translateY.setValue(0);
      opacity.setValue(1);
      scale.setValue(1);
      return;
    }

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: durationMs,
          easing: ScrubberEasings.scrubIn,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: Math.min(durationMs, 440),
          easing: ScrubberEasings.scrubIn,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: durationMs,
          easing: ScrubberEasings.smoothSpring,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    }, calculatedDelay);

    return () => clearTimeout(timer);
  }, [reduceMotion, calculatedDelay, durationMs, translateY, opacity, scale]);

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

/**
 * Hook to trigger a smooth exit transition before navigating
 */
export function useSmoothNavigation() {
  const reduceMotion = useReduceMotion();

  const navigateSmoothly = (navigateAction: () => void, exitDurationMs = 120) => {
    if (reduceMotion) {
      navigateAction();
      return;
    }

    // Brief tactile delay matching premium scrubber easing
    setTimeout(() => {
      navigateAction();
    }, exitDurationMs);
  };

  return { navigateSmoothly };
}
