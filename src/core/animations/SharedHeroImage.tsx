import React, { useEffect, useRef } from 'react';
import {
  Animated,
  ImageProps,
  StyleProp,
  ImageStyle,
  Platform,
} from 'react-native';
import { GsapEasings } from './SlideUpTransition';
import { useReduceMotion } from './useReduceMotion';

export interface SharedHeroImageProps extends Omit<ImageProps, 'style'> {
  initialScale?: number;
  durationMs?: number;
  delayMs?: number;
  style?: StyleProp<ImageStyle>;
}

/**
 * Shared Hero Image Component:
 * Performs the signature Taxidiaa scale-down reveal when entering a new screen
 * (Scale: 1.15 -> 1.0, Opacity: 0 -> 1, 600ms with power4InOut).
 */
export const SharedHeroImage: React.FC<SharedHeroImageProps> = ({
  initialScale = 1.15,
  durationMs = 600,
  delayMs = 40,
  style,
  ...imageProps
}) => {
  const reduceMotion = useReduceMotion();

  const scale = useRef(new Animated.Value(reduceMotion ? 1 : initialScale)).current;
  const opacity = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;

  useEffect(() => {
    if (reduceMotion) {
      scale.setValue(1);
      opacity.setValue(1);
      return;
    }

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1,
          duration: durationMs,
          easing: GsapEasings.power4InOut,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: durationMs * 0.9,
          easing: GsapEasings.power4InOut,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    }, delayMs);

    return () => clearTimeout(timer);
  }, [reduceMotion, durationMs, delayMs, scale, opacity]);

  return (
    <Animated.Image
      {...imageProps}
      style={[
        style,
        {
          opacity,
          transform: [{ scale }],
        },
      ]}
    />
  );
};
