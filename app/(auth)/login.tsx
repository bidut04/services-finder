import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/core/theme/colors';
import { Spacing } from '../../src/core/theme/spacing';
import { Typography } from '../../src/core/theme/typography';
import { Button } from '../../src/core/components/Button';
import { PhoneInput } from '../../src/modules/auth/components/PhoneInput';
import { useAuthStore } from '../../src/modules/auth/store/authStore';
import { ScrubberItem } from '../../src/core/animations/PageScrubberTransition';
import {
  SmoothScreenWrapper,
  useScreenTransition,
} from '../../src/core/animations/SmoothScreenWrapper';

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('9876543210');
  const { sendOtp, isLoading, error, clearError } = useAuthStore();
  const { exitAnimStyle, navigateWithExit } = useScreenTransition();

  const handleSendCode = async () => {
    clearError();
    const success = await sendOtp(phone);
    if (success) {
      navigateWithExit(() => router.push('/(auth)/otp'));
    }
  };

  const handleBack = () => {
    navigateWithExit(() => router.back(), 18);
  };

  return (
    <SmoothScreenWrapper>
      <Animated.View style={[{ flex: 1 }, exitAnimStyle]}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardAvoid}
            >
              {/* Header Bar */}
              <ScrubberItem index={0} slideDistance={12}>
                <View style={styles.header}>
                  <TouchableOpacity
                    onPress={handleBack}
                    style={styles.backButton}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
                  </TouchableOpacity>
                  <Text style={styles.headerTitle}>Sign In</Text>
                  <View style={styles.placeholder} />
                </View>
              </ScrubberItem>

              {/* Form Content with Scrubber Cascade */}
              <View style={styles.content}>
                <ScrubberItem index={1} slideDistance={18}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="shield-checkmark" size={32} color={Colors.primary} />
                  </View>

                  <Text style={styles.title}>Welcome to HelpNear</Text>
                  <Text style={styles.subtitle}>
                    Enter your mobile number to get access to nearby verified home services
                    and rapid roadside assistance.
                  </Text>
                </ScrubberItem>

                <ScrubberItem index={2} slideDistance={22}>
                  <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>Mobile Number</Text>
                    <PhoneInput
                      value={phone}
                      onChangeText={(text) => {
                        setPhone(text);
                        if (error) clearError();
                      }}
                      error={error}
                    />
                  </View>
                </ScrubberItem>

                <ScrubberItem index={3} slideDistance={26}>
                  <Button
                    title="Send Verification Code"
                    onPress={handleSendCode}
                    loading={isLoading}
                    disabled={phone.length < 10}
                    style={styles.submitButton}
                  />

                  <Text style={styles.termsText}>
                    By continuing, you agree to HelpNear’s{' '}
                    <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                    <Text style={styles.termsLink}>Privacy Policy</Text>.
                  </Text>
                </ScrubberItem>
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </Animated.View>
    </SmoothScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primaryBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  inputSection: {
    marginBottom: Spacing.xl,
  },
  inputLabel: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  submitButton: {
    marginBottom: Spacing.lg,
  },
  termsText: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: Spacing.md,
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
