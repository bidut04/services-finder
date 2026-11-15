import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
  View,
} from 'react-native';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'emergency';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
}) => {
  const isOutline = variant === 'outline';
  const isEmergency = variant === 'emergency';
  const isGhost = variant === 'ghost';

  const getBackgroundColor = () => {
    if (disabled) return Colors.border;
    if (isOutline || isGhost) return 'transparent';
    if (isEmergency) return Colors.emergency;
    return '#0F172A'; // Deep Navy (#0f172a) primary button color
  };

  const getTextColor = () => {
    if (disabled) return Colors.textMuted;
    if (isOutline) return '#0F172A';
    if (isGhost) return Colors.textSecondary;
    return Colors.textInverse;
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      android_ripple={{
        color: 'rgba(255, 255, 255, 0.12)',
        borderless: false,
      }}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderWidth: isOutline ? 1.5 : 0,
          borderColor: isOutline ? '#0F172A' : 'transparent',
          opacity: disabled ? 0.6 : pressed ? 0.88 : 1,
          transform: [{ scale: pressed && !disabled && !loading ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <View style={styles.content}>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
            {title}
          </Text>
          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </View>
      )}
    </Pressable>
  );
};

export default Button;

const styles = StyleSheet.create({
  button: {
    height: 54,
    borderRadius: Spacing.radiusFull,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...Typography.button,
  },
  leftIcon: {
    marginRight: Spacing.sm,
  },
  rightIcon: {
    marginLeft: Spacing.sm,
  },
});
