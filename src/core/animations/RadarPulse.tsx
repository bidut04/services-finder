import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Colors } from '../theme/colors';

export interface RadarPulseProps {
  size?: number;
  pulseCount?: number;
  color?: string;
}

export const RadarPulse: React.FC<RadarPulseProps> = ({
  size = 220,
  color = Colors.primary,
}) => {
  const pulseAnim1 = useRef(new Animated.Value(0)).current;
  const pulseAnim2 = useRef(new Animated.Value(0)).current;
  const pulseAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createPulse = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const anim1 = createPulse(pulseAnim1, 0);
    const anim2 = createPulse(pulseAnim2, 800);
    const anim3 = createPulse(pulseAnim3, 1600);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [pulseAnim1, pulseAnim2, pulseAnim3]);

  const renderWave = (anim: Animated.Value, key: string) => {
    const scale = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1.4],
    });

    const opacity = anim.interpolate({
      inputRange: [0, 0.4, 1],
      outputRange: [0.7, 0.35, 0],
    });

    return (
      <Animated.View
        key={key}
        style={[
          styles.wave,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            opacity,
            transform: [{ scale }],
          },
        ]}
      />
    );
  };

  return (
    <View style={[styles.container, { width: size * 1.5, height: size * 1.5 }]}>
      {renderWave(pulseAnim1, 'pulse-1')}
      {renderWave(pulseAnim2, 'pulse-2')}
      {renderWave(pulseAnim3, 'pulse-3')}
      <View
        style={[
          styles.centerPin,
          {
            backgroundColor: color,
          },
        ]}
      >
        <View style={styles.centerDot} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  wave: {
    position: 'absolute',
  },
  centerPin: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  centerDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
});

