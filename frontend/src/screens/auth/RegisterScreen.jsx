import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  Animated,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import useResponsive from '../../theme/responsive';
import { useFadeSlideIn } from '../../utils/animations';

export default function RegisterScreen({ navigation }) {
  const { width, isMobile, isTablet, isLaptop, isDesktop, gutter, clampFont } = useResponsive();
  const cardAnim = useFadeSlideIn(80, 20, 500);
  const { register, loading } = useAuthStore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    const emailTrim = email.trim();
    const nameTrim = fullName.trim();

    if (!nameTrim) {
      errors.fullName = 'Full name is required.';
    } else if (nameTrim.length < 2) {
      errors.fullName = 'Full name must be at least 2 characters.';
    }

    if (!emailTrim) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Confirm your password.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    setErrorMessage('');
    if (!validateForm()) {
      return;
    }

    try {
      await register({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        bio: 'Parent caregiver in NIVARA community',
      });
    } catch (err) {
      const msg = err.detail || err.message || 'Registration failed. Please try again.';
      setErrorMessage(msg);
    }
  };

  const getPasswordStrength = () => {
    if (!password) return null;
    if (password.length < 6) return { label: 'Too short', color: '#EF4444', width: '25%' };
    if (password.length < 8) return { label: 'Moderate', color: '#F59E0B', width: '50%' };
    const hasNum = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    if (hasNum && hasSpecial) return { label: 'Strong', color: '#10B981', width: '100%' };
    return { label: 'Good', color: '#3B82F6', width: '75%' };
  };

  const strength = getPasswordStrength();

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContainer, { paddingHorizontal: gutter }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.containerGrid,
              {
                flexDirection: isDesktop || isLaptop ? 'row' : 'column',
                gap: isDesktop || isLaptop ? 48 : 24,
              },
            ]}
          >
            {/* ======================================================= */}
            {/* LEFT COLUMN: BRAND BENEFITS (Desktop & Laptop)          */}
            {/* ======================================================= */}
            {(isDesktop || isLaptop) && (
              <View style={styles.leftCol}>
                <TouchableOpacity
                  style={styles.backHomeBtn}
                  onPress={() => navigation.navigate('Welcome')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.backHomeText}>← Back to Home</Text>
                </TouchableOpacity>

                <View style={styles.brandRow}>
                  <View style={styles.brandBadge}>
                    <Text style={styles.sparkleIcon}>✦</Text>
                  </View>
                  <Text style={styles.brandTitle}>NIVARA</Text>
                </View>

                <Text style={styles.showcaseHeading}>
                  Join the Leading Neurodivergent Care & Safety Network
                </Text>

                <Text style={styles.showcaseSubtext}>
                  Create your caregiver sanctuary in under 2 minutes. Full geofence
                  protection, AAC communication boards, and 100% encrypted records.
                </Text>

                {/* Benefits List */}
                <View style={styles.benefitsCard}>
                  <View style={styles.benefitItem}>
                    <Text style={styles.checkIcon}>✓</Text>
                    <View style={styles.benefitTextCol}>
                      <Text style={styles.benefitTitle}>Real-time GPS Safe Zones</Text>
                      <Text style={styles.benefitSub}>Instant boundary entry & exit SMS/push alerts</Text>
                    </View>
                  </View>

                  <View style={styles.benefitItem}>
                    <Text style={styles.checkIcon}>✓</Text>
                    <View style={styles.benefitTextCol}>
                      <Text style={styles.benefitTitle}>Custom AAC Voice Board</Text>
                      <Text style={styles.benefitSub}>Picture cards with real-time speech engine</Text>
                    </View>
                  </View>

                  <View style={styles.benefitItem}>
                    <Text style={styles.checkIcon}>✓</Text>
                    <View style={styles.benefitTextCol}>
                      <Text style={styles.benefitTitle}>Verified Caregiver Community</Text>
                      <Text style={styles.benefitSub}>Safe discussions with therapists & parents</Text>
                    </View>
                  </View>

                  <View style={styles.benefitItem}>
                    <Text style={styles.checkIcon}>✓</Text>
                    <View style={styles.benefitTextCol}>
                      <Text style={styles.benefitTitle}>Visual Daily Routines</Text>
                      <Text style={styles.benefitSub}>Step-by-step checklist to reduce sensory overload</Text>
                    </View>
                  </View>
                </View>

                {/* Privacy Badge */}
                <View style={styles.privacyBadge}>
                  <Text style={styles.privacyIcon}>🛡️</Text>
                  <Text style={styles.privacyText}>
                    Strictly encrypted & child safety compliant. Your family's data is never shared.
                  </Text>
                </View>
              </View>
            )}

            {/* ======================================================= */}
            {/* RIGHT COLUMN: RESPONSIVE REGISTRATION CARD              */}
            {/* ======================================================= */}
            <Animated.View
              style={[
                styles.rightCol,
                cardAnim,
                { maxWidth: isDesktop || isLaptop ? 460 : 500 },
              ]}
            >
              <View style={[styles.authCard, { padding: isMobile ? 20 : 32 }]}>
                {/* Mobile top brand bar */}
                {!(isDesktop || isLaptop) && (
                  <View style={styles.mobileTopBar}>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('Welcome')}
                      style={styles.mobileBackBtn}
                    >
                      <Text style={styles.mobileBackText}>← Home</Text>
                    </TouchableOpacity>
                    <View style={styles.brandRowCompact}>
                      <Text style={styles.sparkleIconSmall}>✦</Text>
                      <Text style={styles.brandTitleSmall}>NIVARA</Text>
                    </View>
                  </View>
                )}

                <View style={styles.formHeader}>
                  <Text style={[styles.formTitle, { fontSize: clampFont(22, 26, 28) }]}>
                    Create Account
                  </Text>
                  <Text style={styles.formSubtitle}>
                    Get started with your free caregiver account today.
                  </Text>
                </View>

                {/* Error Banner */}
                {errorMessage ? (
                  <View style={styles.errorBanner}>
                    <Text style={styles.errorIcon}>⚠️</Text>
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  </View>
                ) : null}

                {/* Full Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      fieldErrors.fullName && styles.textInputError,
                    ]}
                    placeholder="e.g. Jordan Patel"
                    placeholderTextColor="#94A3B8"
                    value={fullName}
                    onChangeText={(val) => {
                      setFullName(val);
                      if (fieldErrors.fullName) {
                        setFieldErrors((prev) => ({ ...prev, fullName: null }));
                      }
                    }}
                    autoCapitalize="words"
                    editable={!loading}
                  />
                  {fieldErrors.fullName && (
                    <Text style={styles.fieldErrorText}>{fieldErrors.fullName}</Text>
                  )}
                </View>

                {/* Email */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      fieldErrors.email && styles.textInputError,
                    ]}
                    placeholder="name@example.com"
                    placeholderTextColor="#94A3B8"
                    value={email}
                    onChangeText={(val) => {
                      setEmail(val);
                      if (fieldErrors.email) {
                        setFieldErrors((prev) => ({ ...prev, email: null }));
                      }
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                  {fieldErrors.email && (
                    <Text style={styles.fieldErrorText}>{fieldErrors.email}</Text>
                  )}
                </View>

                {/* Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View
                    style={[
                      styles.passwordInputWrapper,
                      fieldErrors.password && styles.textInputError,
                    ]}
                  >
                    <TextInput
                      style={styles.passwordTextInput}
                      placeholder="Min. 6 characters"
                      placeholderTextColor="#94A3B8"
                      value={password}
                      onChangeText={(val) => {
                        setPassword(val);
                        if (fieldErrors.password) {
                          setFieldErrors((prev) => ({ ...prev, password: null }));
                        }
                      }}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      editable={!loading}
                    />
                    <TouchableOpacity
                      style={styles.eyeBtn}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Text style={styles.eyeEmoji}>{showPassword ? '🙈' : '👁️'}</Text>
                    </TouchableOpacity>
                  </View>
                  {fieldErrors.password && (
                    <Text style={styles.fieldErrorText}>{fieldErrors.password}</Text>
                  )}

                  {/* Password strength */}
                  {strength && (
                    <View style={styles.strengthRow}>
                      <View style={styles.strengthBarBg}>
                        <View
                          style={{
                            height: '100%',
                            width: strength.width,
                            backgroundColor: strength.color,
                            borderRadius: 2,
                          }}
                        />
                      </View>
                      <Text style={[styles.strengthLabel, { color: strength.color }]}>
                        {strength.label}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Confirm Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Confirm Password</Text>
                  <View
                    style={[
                      styles.passwordInputWrapper,
                      fieldErrors.confirmPassword && styles.textInputError,
                    ]}
                  >
                    <TextInput
                      style={styles.passwordTextInput}
                      placeholder="Repeat your password"
                      placeholderTextColor="#94A3B8"
                      value={confirmPassword}
                      onChangeText={(val) => {
                        setConfirmPassword(val);
                        if (fieldErrors.confirmPassword) {
                          setFieldErrors((prev) => ({
                            ...prev,
                            confirmPassword: null,
                          }));
                        }
                      }}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      editable={!loading}
                    />
                    <TouchableOpacity
                      style={styles.eyeBtn}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <Text style={styles.eyeEmoji}>{showConfirmPassword ? '🙈' : '👁️'}</Text>
                    </TouchableOpacity>
                  </View>
                  {fieldErrors.confirmPassword && (
                    <Text style={styles.fieldErrorText}>{fieldErrors.confirmPassword}</Text>
                  )}
                </View>

                {/* Submit Register Button */}
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    loading && styles.submitButtonDisabled,
                  ]}
                  activeOpacity={0.85}
                  onPress={handleRegister}
                  disabled={loading}
                >
                  {loading ? (
                    <View style={styles.loadingRow}>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                      <Text style={styles.submitButtonText}>Creating account...</Text>
                    </View>
                  ) : (
                    <Text style={styles.submitButtonText}>Create Free Account</Text>
                  )}
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or sign up with</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Social Login Buttons */}
                <View style={[styles.socialRow, { flexDirection: width < 380 ? 'column' : 'row' }]}>
                  <TouchableOpacity
                    style={styles.socialBtn}
                    onPress={() => {
                      setFullName('New Caregiver');
                      setEmail(`caregiver_${Date.now()}@nivara.app`);
                      setPassword('NivaraPass123!');
                      setConfirmPassword('NivaraPass123!');
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.googleIcon}>G</Text>
                    <Text style={styles.socialText}>Google</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.socialBtn}
                    onPress={() => {
                      setFullName('Verified Guardian');
                      setEmail(`guardian_${Date.now()}@nivara.app`);
                      setPassword('NivaraPass123!');
                      setConfirmPassword('NivaraPass123!');
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.facebookIcon}>f</Text>
                    <Text style={styles.socialText}>Facebook</Text>
                  </TouchableOpacity>
                </View>

                {/* Sign In Redirect */}
                <View style={styles.redirectRow}>
                  <Text style={styles.redirectText}>Already registered? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.redirectLink}>Sign In here</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 24,
    maxWidth: '100%',
  },
  containerGrid: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Left Column
  leftCol: {
    flex: 1,
    paddingRight: 16,
    alignItems: 'flex-start',
  },
  backHomeBtn: {
    marginBottom: 20,
  },
  backHomeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  brandBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkleIcon: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 18,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 1.5,
  },
  showcaseHeading: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: 36,
    marginBottom: 14,
  },
  showcaseSubtext: {
    fontSize: 15.5,
    lineHeight: 24,
    color: '#475569',
    marginBottom: 20,
  },
  benefitsCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    gap: 14,
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkIcon: {
    fontSize: 12,
    fontWeight: '900',
    color: '#059669',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  benefitTextCol: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  benefitSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 10,
  },
  privacyIcon: {
    fontSize: 18,
  },
  privacyText: {
    fontSize: 12.5,
    color: '#1E40AF',
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
  },

  // Right Column (Auth Card)
  rightCol: {
    width: '100%',
  },
  authCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  mobileTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  mobileBackBtn: {
    paddingVertical: 4,
  },
  mobileBackText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  brandRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sparkleIconSmall: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '900',
  },
  brandTitleSmall: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 1,
  },
  formHeader: {
    marginBottom: 18,
  },
  formTitle: {
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#F87171',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  errorIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  errorText: {
    fontSize: 13,
    color: '#B91C1C',
    fontWeight: '600',
    flex: 1,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
    minHeight: 46,
  },
  textInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  fieldErrorText: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 4,
    marginLeft: 2,
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    minHeight: 46,
  },
  passwordTextInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  eyeBtn: {
    padding: 6,
  },
  eyeEmoji: {
    fontSize: 16,
  },
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 2,
  },
  strengthBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    marginRight: 8,
  },
  strengthLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
    minHeight: 48,
    marginTop: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '800',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 12,
    color: '#94A3B8',
    paddingHorizontal: 10,
    fontWeight: '500',
  },
  socialRow: {
    gap: 10,
    marginBottom: 14,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    minHeight: 44,
  },
  googleIcon: {
    fontSize: 15,
    fontWeight: '900',
    color: '#EA4335',
    marginRight: 6,
  },
  facebookIcon: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1877F2',
    marginRight: 6,
  },
  socialText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  redirectRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  redirectText: {
    fontSize: 13,
    color: '#64748B',
  },
  redirectLink: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2563EB',
  },
});
