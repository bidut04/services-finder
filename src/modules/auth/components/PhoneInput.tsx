import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Colors } from '../../../core/theme/colors';
import { Spacing } from '../../../core/theme/spacing';
import { Typography } from '../../../core/theme/typography';

export interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string | null;
  style?: StyleProp<ViewStyle>;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChangeText,
  placeholder = 'Enter 10-digit mobile number',
  error,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.inputWrapper,
          error ? styles.inputError : null,
        ]}
      >
        <View style={styles.countryCodeBadge}>
          <Text style={styles.flag}>🇮🇳</Text>
          <Text style={styles.countryCodeText}>+91</Text>
          <View style={styles.divider} />
        </View>

        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={(text) => {
            // Keep digits only, max 10
            const cleaned = text.replace(/[^0-9]/g, '').slice(0, 10);
            onChangeText(cleaned);
          }}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          keyboardType="number-pad"
          maxLength={10}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: Spacing.radiusMd,
    borderWidth: 1.5,
    borderColor: Colors.border,
    height: 56,
    paddingHorizontal: Spacing.md,
  },
  inputError: {
    borderColor: Colors.emergency,
  },
  countryCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: Spacing.sm,
  },
  flag: {
    fontSize: 18,
    marginRight: 6,
  },
  countryCodeText: {
    ...Typography.bodyLarge,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
    marginLeft: Spacing.sm,
  },
  textInput: {
    flex: 1,
    ...Typography.bodyLarge,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.sm,
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.emergency,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});

