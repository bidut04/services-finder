import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  LayoutChangeEvent,
  StyleProp,
  ViewStyle,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GsapEasings } from '../animations/SlideUpTransition';
import { Typography } from '../theme/typography';
import { Colors } from '../theme/colors';

export interface DragToStartButtonProps {
  onComplete: () => void;
  title?: string;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  trackColor?: string;
  thumbColor?: string;
  textColor?: string;
  arrowColor?: string;
}

const TRACK_H = 58;
const PAD = 4;
const THUMB_H = TRACK_H - PAD * 2; // 50px
const THUMB_WIDTH = 136; // Constant fixed width so it never stretches or sticks

export const DragToStartButton: React.FC<DragToStartButtonProps> = ({
  onComplete,
  title = 'Get Started',
  style,
  disabled = false,
  trackColor = '#FFFFFF',
  thumbColor = Colors.primary,
  textColor = '#FFFFFF',
  arrowColor = Colors.textSecondary,
}) => {
  const [trackWidth, setTrackWidth] = useState(320);
  const [isDragging, setIsDragging] = useState(false);

  const dragX = useRef(new Animated.Value(0)).current;
  const chevronPulse = useRef(new Animated.Value(0)).current;

  // Maximum distance the green thumb can travel inside the track
  const maxDrag = Math.max(0, trackWidth - THUMB_WIDTH - PAD * 2);

  // Always-fresh references for gesture handlers
  const maxDragRef = useRef(maxDrag);
  const disabledRef = useRef(disabled);
  const onCompleteRef = useRef(onComplete);
  const completedRef = useRef(false);
  const isDraggingRef = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  maxDragRef.current = maxDrag;
  disabledRef.current = disabled;
  onCompleteRef.current = onComplete;

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Chevron breathing hint
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(chevronPulse, {
          toValue: 5,
          duration: 900,
          easing: GsapEasings.power3Out,
          useNativeDriver: false,
        }),
        Animated.timing(chevronPulse, {
          toValue: 0,
          duration: 900,
          easing: GsapEasings.power3Out,
          useNativeDriver: false,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [chevronPulse]);

  const resetThumb = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
    Animated.spring(dragX, {
      toValue: 0,
      tension: 90,
      friction: 9,
      useNativeDriver: false,
    }).start();
  };

  const triggerComplete = () => {
    if (completedRef.current || disabledRef.current) return;
    completedRef.current = true;
    isDraggingRef.current = false;
    setIsDragging(false);

    Animated.spring(dragX, {
      toValue: maxDragRef.current,
      bounciness: 3,
      speed: 15,
      useNativeDriver: false,
    }).start(() => {
      timers.current.push(
        setTimeout(() => {
          onCompleteRef.current();
          // Reset after navigation so back-button restores a clean state
          timers.current.push(
            setTimeout(() => {
              dragX.setValue(0);
              completedRef.current = false;
            }, 800)
          );
        }, 150)
      );
    });
  };

  // Mobile Touch PanResponder (iOS & Android)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () =>
        !disabledRef.current && !completedRef.current,
      onStartShouldSetPanResponderCapture: () =>
        !disabledRef.current && !completedRef.current,
      onMoveShouldSetPanResponder: (_, g) =>
        !disabledRef.current && !completedRef.current && Math.abs(g.dx) > 3,
      onMoveShouldSetPanResponderCapture: (_, g) =>
        !disabledRef.current && !completedRef.current && Math.abs(g.dx) > 3,
      onPanResponderGrant: () => {
        if (completedRef.current || disabledRef.current) return;
        isDraggingRef.current = true;
        setIsDragging(true);
      },
      onPanResponderMove: (_, g) => {
        if (completedRef.current || maxDragRef.current <= 0) return;
        const clampedX = Math.max(0, Math.min(g.dx, maxDragRef.current));
        dragX.setValue(clampedX);
      },
      onPanResponderRelease: (_, g) => {
        if (completedRef.current || maxDragRef.current <= 0) return;

        // Quick tap without dragging -> trigger slide
        if (Math.abs(g.dx) < 6) {
          triggerComplete();
          return;
        }

        // Drag completion threshold: 40%
        if (g.dx >= maxDragRef.current * 0.4) {
          triggerComplete();
        } else {
          resetThumb();
        }
      },
      onPanResponderTerminate: () => {
        if (!completedRef.current) resetThumb();
      },
    })
  ).current;

  // Web Mouse Drag Handler (Guarantees silky smooth 1:1 mouse drag on desktop browsers)
  const handleMouseDown = (e: any) => {
    if (Platform.OS !== 'web' || disabledRef.current || completedRef.current || maxDragRef.current <= 0) return;
    if (typeof window === 'undefined') return;

    e.preventDefault();
    isDraggingRef.current = true;
    setIsDragging(true);

    const startClientX = e.clientX;
    const initialDragX = (dragX as any)._value || 0;

    const onMouseMove = (moveEvt: MouseEvent) => {
      moveEvt.preventDefault();
      const delta = moveEvt.clientX - startClientX;
      const nextX = Math.max(0, Math.min(initialDragX + delta, maxDragRef.current));
      dragX.setValue(nextX);
    };

    const onMouseUp = (upEvt: MouseEvent) => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      const delta = upEvt.clientX - startClientX;

      // Tap / Click fallback
      if (Math.abs(delta) < 6) {
        triggerComplete();
        return;
      }

      // Drag completion threshold: 40%
      if (initialDragX + delta >= maxDragRef.current * 0.4) {
        triggerComplete();
      } else {
        resetThumb();
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleTrackLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && w !== trackWidth) setTrackWidth(w);
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
    <View
      onLayout={handleTrackLayout}
      style={[styles.trackContainer, { backgroundColor: trackColor }, style]}
      {...panResponder.panHandlers}
      {...webProps}
    >
      {/* Double chevrons on the right side of the white track */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.arrowContainer,
          { opacity: arrowOpacity, transform: [{ translateX: chevronPulse }] },
        ]}
      >
        <Ionicons name="chevron-forward" size={19} color={arrowColor} />
        <Ionicons
          name="chevron-forward"
          size={19}
          color={arrowColor}
          style={styles.secondChevron}
        />
      </Animated.View>

      {/* 
        Standalone Draggable Pill ("Get Started"):
        Maintains fixed width and slides smoothly across the white track with your finger
      */}
      <Animated.View
        style={[
          styles.draggableThumb,
          { backgroundColor: thumbColor },
          { transform: [{ translateX: dragX }] },
          isDragging && styles.draggingState,
        ]}
      >
        <Text style={[styles.thumbText, { color: textColor }]} numberOfLines={1}>
          {title}
        </Text>
      </Animated.View>
    </View>
  );
};

export default DragToStartButton;

const styles = StyleSheet.create({
  trackContainer: {
    height: TRACK_H,
    width: '100%',
    borderRadius: TRACK_H / 2,
    backgroundColor: '#FFFFFF', // Pure solid white track matching target UI
    justifyContent: 'center',
    alignItems: 'flex-start',   // Positions the thumb on the left
    paddingHorizontal: PAD,
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: { elevation: 3 },
      web: {
        boxShadow: '0px 2px 10px rgba(0,0,0,0.14)',
        cursor: 'grab' as any,
        userSelect: 'none' as any,
        WebkitUserSelect: 'none' as any,
      },
    }),
  },
  arrowContainer: {
    position: 'absolute',
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  secondChevron: {
    marginLeft: -11,
    opacity: 0.85,
  },
  draggableThumb: {
    height: THUMB_H,
    width: THUMB_WIDTH,         // Fixed width: stays the same width, never stretches
    borderRadius: THUMB_H / 2,  // Perfectly rounded pill
    backgroundColor: Colors.primary, // Brand theme royal blue
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 2px 6px rgba(0,0,0,0.25)',
        cursor: 'grab' as any,
      },
    }),
  },
  draggingState: {
    ...Platform.select({
      web: {
        cursor: 'grabbing' as any,
      },
    }),
  },
  thumbText: {
    ...Typography.button,
    color: '#FFFFFF',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
});
