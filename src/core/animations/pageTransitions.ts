import { StackCardStyleInterpolator } from '@react-navigation/stack';
import { gsap } from 'gsap';
import { GsapEasings } from './SlideUpTransition';
import { isReduceMotionActive } from './useReduceMotion';

export { gsap };

export const ScrubberEasings = {
  scrubIn: GsapEasings.power4InOut,
  scrubOut: GsapEasings.power3In,
  smoothSpring: GsapEasings.power3Out,
};

/**
 * GSAP Transition Specifications:
 * - Forward: 650ms with GsapEasings.power4InOut
 * - Back: 450ms with GsapEasings.power3In (deep slide to fade)
 */
export const gsapTransitionSpec = {
  open: {
    animation: 'timing' as const,
    config: {
      duration: isReduceMotionActive() ? 0 : 650,
      easing: GsapEasings.power4InOut,
    },
  },
  close: {
    animation: 'timing' as const,
    config: {
      duration: isReduceMotionActive() ? 0 : 450,
      easing: GsapEasings.power3In,
    },
  },
};

/**
 * Custom Card Style Interpolator:
 * - Forward: New screen fades in + slides up 28px over 650ms (power4InOut)
 * - Back: Deep slide to fade reverse over 450ms (power3In)
 * - Under-screen: Deep parallax shift of -20px with subtle dim
 * - Reduced motion: Clean instantaneous cut
 */
export const gsapCardStyleInterpolator: StackCardStyleInterpolator = ({
  current,
  next,
}) => {
  if (isReduceMotionActive()) {
    return {
      cardStyle: {
        opacity: current.progress,
      },
    };
  }

  // Forward transition: new screen fades in + slides up 28px
  const translateY = current.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [28, 0],
    extrapolate: 'clamp',
  });

  const opacity = current.progress.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [0, 0.7, 1],
    extrapolate: 'clamp',
  });

  // Outgoing / under-screen parallax retreat: slides -20px deep to fade
  const nextTranslateY = next
    ? next.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -20],
        extrapolate: 'clamp',
      })
    : 0;

  const nextOpacity = next
    ? next.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0.82],
        extrapolate: 'clamp',
      })
    : 1;

  return {
    cardStyle: {
      opacity: next ? nextOpacity : opacity,
      transform: [{ translateY: next ? nextTranslateY : translateY }],
    },
  };
};

/**
 * Reusable screenOptions for Expo Router Stack / React Navigation
 * Includes both JS Stack properties (cardStyleInterpolator, transitionSpec)
 * and NativeStack properties (animation: 'fade_from_bottom', animationDuration: 650)
 */
export const gsapScreenOptions: any = {
  headerShown: false,
  gestureEnabled: true,
  transitionSpec: gsapTransitionSpec,
  cardStyleInterpolator: gsapCardStyleInterpolator,
  animation: 'fade_from_bottom',
  animationDuration: 650,
  contentStyle: { backgroundColor: '#F8F9FA' },
};
