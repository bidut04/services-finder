import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleProp,
  ViewStyle,
  Platform,
} from 'react-native';
import { GsapEasings } from './SlideUpTransition';
import { useReduceMotion } from './useReduceMotion';

export interface ScrollRevealItemProps {
  id: string | number;
  isRevealed: boolean;
  children: React.ReactNode;
  staggerIndex?: number;
  staggerMs?: number;
  initialOffsetY?: number;
  durationMs?: number;
  style?: StyleProp<ViewStyle>;
}

export const ScrollRevealItem: React.FC<ScrollRevealItemProps> = ({
  isRevealed,
  children,
  staggerIndex = 0,
  staggerMs = 40,
  initialOffsetY = 24,
  durationMs = 600,
  style,
}) => {
  const reduceMotion = useReduceMotion();
  const hasAnimatedRef = useRef(false);

  const translateY = useRef(
    new Animated.Value(reduceMotion || isRevealed ? 0 : initialOffsetY)
  ).current;
  const opacity = useRef(
    new Animated.Value(reduceMotion || isRevealed ? 1 : 0)
  ).current;

  useEffect(() => {
    if (reduceMotion) {
      translateY.setValue(0);
      opacity.setValue(1);
      hasAnimatedRef.current = true;
      return;
    }

    // Trigger entrance animation only once
    if (isRevealed && !hasAnimatedRef.current) {
      hasAnimatedRef.current = true;
      const delay = Math.min(staggerIndex * staggerMs, 200);

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 0,
            duration: durationMs,
            easing: GsapEasings.power3Out,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: durationMs * 0.85,
            easing: GsapEasings.power3Out,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]).start();
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [isRevealed, reduceMotion, staggerIndex, staggerMs, durationMs, translateY, opacity]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

