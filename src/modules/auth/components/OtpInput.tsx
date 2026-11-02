import React, { useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  StyleProp,
  ViewStyle,
  NativeSyntheticEvent,
} from 'react-native';
import { Colors } from '../../../core/theme/colors';
import { Spacing } from '../../../core/theme/spacing';
import { Typography } from '../../../core/theme/typography';

export interface OtpInputProps {
  value: string;
  length?: number;
  onChange: (otp: string) => void;
  style?: StyleProp<ViewStyle>;
  borderColor?: string;
}

type TextInputRef = React.ElementRef<typeof TextInput>;

export const OtpInput: React.FC<OtpInputProps> = ({
  value,
  length = 4,
  onChange,
  style,
  borderColor = 'rgb(24, 177, 37)',
}) => {
  const inputsRef = useRef<(TextInputRef | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    const char = text.slice(-1);
    const otpArray = value.padEnd(length, ' ').split('');
    otpArray[index] = char || ' ';
    const newOtp = otpArray.join('').trimEnd();
    onChange(newOtp);

    // Auto-focus next input if character typed
    if (char && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<{ key: string }>,
    index: number
  ) => {
    if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <View style={[styles.container, style]}>
      {Array.from({ length }).map((_, index) => {
        const char = value[index] || '';
        const isFocused = value.length === index;

        return (
          <TextInput
            key={index}
            ref={(ref) => {
              inputsRef.current[index] = ref;
            }}
            style={[
              styles.box,
              { borderColor },
              char ? [styles.boxFilled, { borderColor }] : null,
              isFocused ? [styles.boxActive, { borderColor }] : null,
            ]}
            keyboardType="number-pad"
            maxLength={1}
            value={char}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            selectTextOnFocus
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: Spacing.md,
  },
  box: {
    width: 64,
    height: 64,
    borderRadius: Spacing.radiusMd,
    borderWidth: 1.5,
    borderColor: 'rgb(24, 177, 37)',
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
    ...Typography.hero,
    color: Colors.textPrimary,
  },
  boxFilled: {
    borderColor: 'rgb(24, 177, 37)',
    backgroundColor: 'rgba(24, 177, 37, 0.05)',
  },
  boxActive: {
    borderColor: 'rgb(24, 177, 37)',
    borderWidth: 2,
    shadowColor: 'rgb(24, 177, 37)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
});
