import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/themeStore';
import { Typography } from '../theme/typography';
import { GsapEasings } from '../animations/SlideUpTransition';

export interface ThemeSwitcherProps {
  variant?: 'pill' | 'icon' | 'row';
  style?: StyleProp<ViewStyle>;
  showLabel?: boolean;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  variant = 'pill',
  style,
  showLabel = true,
}) => {
  const { isDark, toggleTheme, colors } = useTheme();

  const rotateAnim = useRef(new Animated.Value(isDark ? 1 : 0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue: isDark ? 1 : 0,
        duration: 380,
        easing: GsapEasings.power3Out,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.82,
          duration: 120,
          easing: GsapEasings.power3Out,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 260,
          easing: GsapEasings.backOut,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
    ]).start();
  }, [isDark, rotateAnim, scaleAnim]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Variant: Settings Row for Profile / Settings
  if (variant === 'row') {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={toggleTheme}
        style={[
          styles.rowContainer,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
          style,
        ]}
      >
        <View style={styles.rowLeftCol}>
          <View
            style={[
              styles.rowIconWrap,
              {
                backgroundColor: isDark
                  ? 'rgba(59, 130, 246, 0.16)'
                  : 'rgba(249, 115, 22, 0.14)',
              },
            ]}
          >
            <Ionicons
              name={isDark ? 'moon' : 'sunny'}
              size={20}
              color={isDark ? '#60A5FA' : '#F97316'}
            />
          </View>
          <View>
            <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </Text>
            <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>
              {isDark ? 'Switch to warm light theme' : 'Switch to sleek dark theme'}
            </Text>
          </View>
        </View>

        {/* Switch Pill Toggle */}
        <View
          style={[
            styles.switchTrack,
            {
              backgroundColor: isDark ? '#2563EB' : '#E2E8F0',
            },
          ]}
        >
          <View
            style={[
              styles.switchThumb,
              isDark ? styles.switchThumbDark : styles.switchThumbLight,
            ]}
          >
            <Ionicons
              name={isDark ? 'moon' : 'sunny'}
              size={12}
              color={isDark ? '#2563EB' : '#F59E0B'}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Variant: Icon Only Button
  if (variant === 'icon') {
    return (
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={toggleTheme}
        style={[
          styles.iconButton,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
          style,
        ]}
      >
        <Animated.View
          style={{
            transform: [{ rotate: rotation }, { scale: scaleAnim }],
          }}
        >
          <Ionicons
            name={isDark ? 'moon' : 'sunny'}
            size={20}
            color={isDark ? '#FACC15' : '#F97316'}
          />
        </Animated.View>
      </TouchableOpacity>
    );
  }

  // Variant: Pill Button (Default)
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={toggleTheme}
      style={[
        styles.pillContainer,
        {
          backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
          borderColor: isDark ? '#334155' : '#E2E8F0',
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          transform: [{ rotate: rotation }, { scale: scaleAnim }],
        }}
      >
        <Ionicons
          name={isDark ? 'moon' : 'sunny'}
          size={16}
          color={isDark ? '#FACC15' : '#F97316'}
        />
      </Animated.View>

      {showLabel && (
        <Text
          style={[
            styles.pillLabel,
            { color: isDark ? '#F8FAFC' : '#0F172A' },
          ]}
        >
          {isDark ? 'Dark' : 'Light'}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  pillLabel: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '700',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  rowLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  rowIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowTitle: {
    ...Typography.h3,
    fontSize: 15,
    fontWeight: '700',
  },
  rowSubtitle: {
    ...Typography.caption,
    fontSize: 12,
    marginTop: 2,
  },
  switchTrack: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  switchThumbLight: {
    alignSelf: 'flex-start',
  },
  switchThumbDark: {
    alignSelf: 'flex-end',
  },
});
