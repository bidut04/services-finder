import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/core/theme/colors';
import { Spacing } from '../../src/core/theme/spacing';
import { Typography } from '../../src/core/theme/typography';
import { useAuthStore } from '../../src/modules/auth/store/authStore';
import { ScrubberItem } from '../../src/core/animations/PageScrubberTransition';
import {
  SmoothScreenWrapper,
  useScreenTransition,
} from '../../src/core/animations/SmoothScreenWrapper';

export default function LoginScreen() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login, register, isLoading, error, clearError } = useAuthStore();
  const { exitAnimStyle, navigateWithExit } = useScreenTransition();

  const handleSubmit = async () => {
    clearError();

    if (isSignUp) {
      if (!name.trim()) {
        alert('Please enter your name.');
        return;
      }
      if (phone.replace(/\D/g, '').length < 10) {
        alert('Please enter a valid 10-digit mobile number.');
        return;
      }
      if (password.length < 6) {
        alert('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
      }
      const success = await register(name, phone, password);
      if (success) {
        navigateWithExit(() => router.push('/(location)/permission'));
      }
    } else {
      if (!phone.trim()) {
        alert('Please enter your mobile number.');
        return;
      }
      if (!password) {
        alert('Please enter your password.');
        return;
      }
      const success = await login(phone, password);
      if (success) {
        navigateWithExit(() => router.push('/(location)/permission'));
      }
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
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
                  <Text style={styles.headerTitle}>{isSignUp ? 'Create Account' : 'Sign In'}</Text>
                  <View style={styles.placeholder} />
                </View>
              </ScrubberItem>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
              >
                {/* Intro Hero */}
                <ScrubberItem index={1} slideDistance={16}>
                  <View style={styles.introHero}>
                    <View style={styles.iconCircle}>
                      <Ionicons name="shield-checkmark" size={30} color={Colors.primary} />
                    </View>
                    <Text style={styles.title}>
                      {isSignUp ? 'Join HelpNear' : 'Welcome to HelpNear'}
                    </Text>
                    <Text style={styles.subtitle}>
                      {isSignUp
                        ? 'Create your account using your mobile number and password.'
                        : 'Sign in to access verified nearby home services and bookings.'}
                    </Text>
                  </View>
                </ScrubberItem>

                {/* Mode Switch Tabs */}
                <ScrubberItem index={2} slideDistance={18}>
                  <View style={styles.toggleRow}>
                    <TouchableOpacity
                      style={[styles.toggleBtn, !isSignUp && styles.toggleBtnActive]}
                      onPress={() => {
                        setIsSignUp(false);
                        clearError();
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.toggleText, !isSignUp && styles.toggleTextActive]}>
                        Sign In
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.toggleBtn, isSignUp && styles.toggleBtnActive]}
                      onPress={() => {
                        setIsSignUp(true);
                        clearError();
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.toggleText, isSignUp && styles.toggleTextActive]}>
                        Create Account
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ScrubberItem>

                {/* Error Banner */}
                {error ? (
                  <View style={styles.errorBox}>
                    <Ionicons name="alert-circle" size={18} color={Colors.emergency} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                {/* Form Fields */}
                <ScrubberItem index={3} slideDistance={20}>
                  <View style={styles.formContainer}>
                    {/* Full Name (Sign Up only) */}
                    {isSignUp ? (
                      <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Full Name</Text>
                        <View style={styles.inputWrapper}>
                          <Ionicons name="person-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                          <TextInput
                            style={styles.input}
                            placeholder="e.g. Ramesh Kumar"
                            placeholderTextColor={Colors.textMuted}
                            value={name}
                            onChangeText={setName}
                          />
                        </View>
                      </View>
                    ) : null}

                    {/* Mobile Number */}
                    <View style={styles.fieldGroup}>
                      <Text style={styles.fieldLabel}>Mobile Number</Text>
                      <View style={styles.inputWrapper}>
                        <Ionicons name="call-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="10-digit mobile number"
                          placeholderTextColor={Colors.textMuted}
                          keyboardType="phone-pad"
                          value={phone}
                          onChangeText={setPhone}
                          maxLength={10}
                        />
                      </View>
                    </View>

                    {/* Password */}
                    <View style={styles.fieldGroup}>
                      <Text style={styles.fieldLabel}>Password</Text>
                      <View style={styles.inputWrapper}>
                        <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="At least 6 characters"
                          placeholderTextColor={Colors.textMuted}
                          secureTextEntry={!showPassword}
                          value={password}
                          onChangeText={setPassword}
                        />
                        <TouchableOpacity
                          onPress={() => setShowPassword(!showPassword)}
                          style={styles.eyeBtn}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons
                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={18}
                            color={Colors.textMuted}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Confirm Password (Sign Up only) */}
                    {isSignUp ? (
                      <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Confirm Password</Text>
                        <View style={styles.inputWrapper}>
                          <Ionicons name="checkmark-done-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                          <TextInput
                            style={styles.input}
                            placeholder="Re-enter password"
                            placeholderTextColor={Colors.textMuted}
                            secureTextEntry={!showPassword}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                          />
                        </View>
                      </View>
                    ) : null}
                  </View>
                </ScrubberItem>

                {/* Submit Button */}
                <ScrubberItem index={4} slideDistance={22}>
                  <TouchableOpacity
                    style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
                    onPress={handleSubmit}
                    activeOpacity={0.88}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Text style={styles.submitBtnText}>
                          {isSignUp ? 'Create My Account' : 'Sign In'}
                        </Text>
                        <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
                      </>
                    )}
                  </TouchableOpacity>
                </ScrubberItem>
              </ScrollView>
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
    backgroundColor: '#F8FAFC',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...Typography.h2,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },
  introHero: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    ...Typography.h2,
    fontSize: 22,
    color: Colors.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 3,
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  toggleBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  toggleText: {
    ...Typography.button,
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.emergency,
    marginLeft: 8,
    flex: 1,
  },
  formContainer: {
    marginBottom: 24,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    ...Typography.caption,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    ...Typography.body,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  eyeBtn: {
    padding: 4,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    ...Typography.button,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
