import { useState, useEffect } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

let globalReduceMotion = false;

// Initial check on Web
if (Platform.OS === 'web' && typeof window !== 'undefined' && window.matchMedia) {
  try {
    globalReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    globalReduceMotion = false;
  }
}

/**
 * Hook that listens to system "Reduce Motion" accessibility settings.
 * Disables or simplifies animations when the user has requested reduced motion.
 */
export function useReduceMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState<boolean>(globalReduceMotion);

  useEffect(() => {
    let isMounted = true;

    // Check Native AccessibilityInfo
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (isMounted) {
          globalReduceMotion = enabled;
          setReduceMotion(enabled);
        }
      })
      .catch(() => { });

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled: boolean) => {
        globalReduceMotion = enabled;
        if (isMounted) setReduceMotion(enabled);
      }
    );

    // Web Media Query listener
    let mediaQuery: MediaQueryList | null = null;
    const handleMediaChange = (e: MediaQueryListEvent) => {
      globalReduceMotion = e.matches;
      if (isMounted) setReduceMotion(e.matches);
    };

    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.matchMedia) {
      try {
        mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        mediaQuery.addEventListener('change', handleMediaChange);
      } catch {
        // Fallback for older browsers
      }
    }

    return () => {
      isMounted = false;
      subscription.remove();
      if (mediaQuery) {
        try {
          mediaQuery.removeEventListener('change', handleMediaChange);
        } catch { }
      }
    };
  }, []);

  return reduceMotion;
}

export function isReduceMotionActive(): boolean {
  return globalReduceMotion;
}

