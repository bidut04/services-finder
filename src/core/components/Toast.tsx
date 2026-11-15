import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { create } from 'zustand';
import { Typography } from '../theme/typography';
import { useTheme } from '../theme/themeStore';

const { width } = Dimensions.get('window');

// -------------------------------------------------------------
// TOAST TYPES & STORE
// -------------------------------------------------------------

export type ToastType = 'success' | 'failed' | 'warn' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // ms, default 3800
}

interface ToastState {
  currentToast: ToastMessage | null;
  show: (type: ToastType, title: string, message?: string, duration?: number) => void;
  dismiss: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  currentToast: null,
  show: (type, title, message, duration = 3800) => {
    set({
      currentToast: {
        id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type,
        title,
        message,
        duration,
      },
    });
  },
  dismiss: () => set({ currentToast: null }),
}));

// Global convenient imperative interface
export const toast = {
  success: (title: string, message?: string, duration?: number) => {
    useToastStore.getState().show('success', title, message, duration);
  },
  failed: (title: string, message?: string, duration?: number) => {
    useToastStore.getState().show('failed', title, message, duration);
  },
  error: (title: string, message?: string, duration?: number) => {
    useToastStore.getState().show('failed', title, message, duration);
  },
  warn: (title: string, message?: string, duration?: number) => {
    useToastStore.getState().show('warn', title, message, duration);
  },
  info: (title: string, message?: string, duration?: number) => {
    useToastStore.getState().show('info', title, message, duration);
  },
  dismiss: () => {
    useToastStore.getState().dismiss();
  },
};

// -------------------------------------------------------------
// TOAST CONTAINER COMPONENT (MOUNTED IN ROOT LAYOUT)
// -------------------------------------------------------------

export const ToastContainer: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { currentToast, dismiss } = useToastStore();

  const slideY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!currentToast) return;

    // Reset animations
    slideY.setValue(-100);
    opacity.setValue(0);
    progressAnim.setValue(1);

    // Entrance animation
    Animated.parallel([
      Animated.spring(slideY, {
        toValue: 0,
        tension: 80,
        friction: 9,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();

    // Progress bar animation
    const duration = currentToast.duration || 3800;
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: duration - 300,
      useNativeDriver: false,
    }).start();

    // Auto dismiss timer
    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [currentToast?.id]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideY, {
        toValue: -90,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      dismiss();
    });
  };

  if (!currentToast) return null;

  const getConfig = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          iconName: 'checkmark-circle' as const,
          accentColor: '#16A34A',
          bgColor: isDark ? '#064E3B' : '#ECFDF5',
          borderColor: isDark ? '#059669' : '#A7F3D0',
          titleColor: isDark ? '#A7F3D0' : '#065F46',
          msgColor: isDark ? '#D1FAE5' : '#047857',
          progressBarColor: '#10B981',
          tagLabel: 'SUCCESS',
        };
      case 'failed':
        return {
          iconName: 'alert-circle' as const,
          accentColor: '#DC2626',
          bgColor: isDark ? '#450A0A' : '#FEF2F2',
          borderColor: isDark ? '#DC2626' : '#FECACA',
          titleColor: isDark ? '#FECACA' : '#991B1B',
          msgColor: isDark ? '#FEE2E2' : '#B91C1C',
          progressBarColor: '#EF4444',
          tagLabel: 'FAILED',
        };
      case 'warn':
        return {
          iconName: 'warning' as const,
          accentColor: '#D97706',
          bgColor: isDark ? '#451A03' : '#FFFBEB',
          borderColor: isDark ? '#D97706' : '#FDE68A',
          titleColor: isDark ? '#FDE68A' : '#92400E',
          msgColor: isDark ? '#FEF3C7' : '#B45309',
          progressBarColor: '#F59E0B',
          tagLabel: 'WARNING',
        };
      case 'info':
      default:
        return {
          iconName: 'information-circle' as const,
          accentColor: '#2563EB',
          bgColor: isDark ? '#1E293B' : '#EFF6FF',
          borderColor: isDark ? '#3B82F6' : '#BFDBFE',
          titleColor: isDark ? '#BFDBFE' : '#1E40AF',
          msgColor: isDark ? '#DBEAFE' : '#1D4ED8',
          progressBarColor: '#3B82F6',
          tagLabel: 'INFO',
        };
    }
  };

  const config = getConfig(currentToast.type);

  return (
    <View
      style={[
        styles.container,
        { top: Math.max(insets.top, 14) + 8 },
      ]}
      pointerEvents="box-none"
    >
      <Animated.View
        style={[
          styles.toastCard,
          {
            backgroundColor: config.bgColor,
            borderColor: config.borderColor,
            transform: [{ translateY: slideY }],
            opacity,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleDismiss}
          style={styles.innerRow}
        >
          {/* Icon Box */}
          <View style={[styles.iconBox, { backgroundColor: config.accentColor }]}>
            <Ionicons name={config.iconName} size={20} color="#FFFFFF" />
          </View>

          {/* Text Content */}
          <View style={styles.textContainer}>
            <View style={styles.headerRow}>
              <Text style={[styles.tagBadge, { backgroundColor: config.accentColor }]}>
                {config.tagLabel}
              </Text>
              <Text
                style={[styles.toastTitle, { color: config.titleColor }]}
                numberOfLines={1}
              >
                {currentToast.title}
              </Text>
            </View>

            {currentToast.message ? (
              <Text
                style={[styles.toastMessage, { color: config.msgColor }]}
                numberOfLines={3}
              >
                {currentToast.message}
              </Text>
            ) : null}
          </View>

          {/* Close button */}
          <TouchableOpacity
            onPress={handleDismiss}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.closeBtn}
          >
            <Ionicons name="close" size={18} color={config.titleColor} />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Dynamic Progress Bar */}
        <View style={styles.progressBarTrack}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                backgroundColor: config.progressBarColor,
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      </Animated.View>
    </View>
  );
};

// -------------------------------------------------------------
// STYLES
// -------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 100000,
    alignItems: 'center',
  },
  toastCard: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 16,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 12,
  },
  innerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  tagBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  toastTitle: {
    ...Typography.h3,
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
  },
  toastMessage: {
    ...Typography.bodySmall,
    fontSize: 12.5,
    lineHeight: 17,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    marginLeft: 8,
  },
  progressBarTrack: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  progressBarFill: {
    height: '100%',
  },
});
