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
import { OtpInput } from '../../src/modules/auth/components/OtpInput';
import { useAuthStore } from '../../src/modules/auth/store/authStore';
import { ScrubberItem } from '../../src/core/animations/PageScrubberTransition';
import {
  SmoothScreenWrapper,
  useScreenTransition,
} from '../../src/core/animations/SmoothScreenWrapper';

export default function OtpVerificationScreen() {
  const router = useRouter();
  const [otp, setOtp] = useState('1234');
  const { verifyOtp, isLoading, error, pendingPhoneNumber, clearError } =
    useAuthStore();
  const { exitAnimStyle, navigateWithExit } = useScreenTransition();

  const handleVerify = async () => {
    clearError();
    const success = await verifyOtp(otp);
    if (success) {
      // RULE: Smoothly route to Location flow with GSAP exit transition
      navigateWithExit(() => router.push('/(location)/permission'));
    }
  };

  const handleBack = () => {
    navigateWithExit(() => router.back(), 20);
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
                  <Text style={styles.headerTitle}>Verification</Text>
                  <View style={styles.placeholder} />
                </View>
              </ScrubberItem>

              {/* Verification Content with Scrubber Cascade */}
              <View style={styles.content}>
                <ScrubberItem index={1} slideDistance={18}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="keypad" size={32} color={Colors.primary} />
                  </View>

                  <Text style={styles.title}>Enter 4-Digit Code</Text>
                  <Text style={styles.subtitle}>
                    Code sent to{' '}
                    <Text style={styles.phoneHighlight}>
                      +91 {pendingPhoneNumber || '9876543210'}
                    </Text>
                    . Enter it below to verify your account.
                  </Text>
                </ScrubberItem>

                <ScrubberItem index={2} slideDistance={22}>
                  <OtpInput value={otp} onChange={setOtp} length={4} />

                  {error ? <Text style={styles.errorText}>{error}</Text> : null}
                </ScrubberItem>

                <ScrubberItem index={3} slideDistance={26}>
                  <Button
                    title="Verify & Continue"
                    onPress={handleVerify}
                    loading={isLoading}
                    disabled={otp.length !== 4}
                    style={styles.verifyButton}
                  />

                  <View style={styles.resendContainer}>
                    <Text style={styles.resendText}>Didn&apos;t receive the code? </Text>
                    <TouchableOpacity activeOpacity={0.7}>
                      <Text style={styles.resendLink}>Resend OTP</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.devHintBox}>
                    <Ionicons name="information-circle-outline" size={18} color={Colors.primary} />
                    <Text style={styles.devHintText}>
                      Demo Mode: Default OTP is prefilled as 1234
                    </Text>
                  </View>
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
  phoneHighlight: {
    fontWeight: '700',
    color: Colors.primary,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.emergency,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  verifyButton: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  resendText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  resendLink: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: '700',
  },
  devHintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryBackground,
    padding: Spacing.sm,
    borderRadius: Spacing.radiusMd,
    gap: Spacing.xs,
  },
  devHintText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
    flex: 1,
  },
});
