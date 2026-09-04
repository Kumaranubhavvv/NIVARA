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

export default function LoginScreen({ navigation }) {
  const { width, isMobile, isTablet, isLaptop, isDesktop, gutter, clampFont } = useResponsive();
  const cardAnim = useFadeSlideIn(80, 20, 500);
  const { login, loading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    const emailTrim = email.trim();

    if (!emailTrim) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    setErrorMessage('');
    if (!validateForm()) {
      return;
    }

    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err) {
      const msg =
        err.detail ||
        err.message ||
        'Unable to sign in. Please check your credentials.';
      setErrorMessage(msg);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setFieldErrors({});
    setErrorMessage('');
  };

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
            {/* LEFT COLUMN: BRAND & VALUE SHOWCASE (Desktop & Laptop)  */}
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
                  Safe Harbor for Neurodivergent Families & Caregivers
                </Text>

                <Text style={styles.showcaseSubtext}>
                  Access live geofenced telemetry, picture-based AAC voice boards,
                  and verified peer support in a unified, secure sanctuary.
                </Text>

                {/* Telemetry Visual Preview */}
                <View style={styles.previewCard}>
                  <View style={styles.previewHeader}>
                    <View style={styles.statusRow}>
                      <View style={styles.greenDot} />
                      <Text style={styles.statusText}>LIVE CHILD SAFETY</Text>
                    </View>
                    <View style={styles.safeBadge}>
                      <Text style={styles.safeBadgeText}>🟢 Safe in Zone</Text>
                    </View>
                  </View>

                  <View style={styles.childPreviewRow}>
                    <View style={styles.childAvatar}>
                      <Text style={styles.childEmoji}>👦</Text>
                    </View>
                    <View style={styles.childDetails}>
                      <Text style={styles.childName}>Aarav Patel (Age 7)</Text>
                      <Text style={styles.childSub}>Home Sanctuary • Smartband Tethered (2.4m)</Text>
                    </View>
                  </View>

                  <View style={styles.metricTilesRow}>
                    <View style={styles.metricTile}>
                      <Text style={styles.metricLabel}>GPS ACCURACY</Text>
                      <Text style={styles.metricValue}>±3.8m</Text>
                    </View>
                    <View style={styles.metricTile}>
                      <Text style={styles.metricLabel}>BAND BATTERY</Text>
                      <Text style={styles.metricValue}>⚡ 94%</Text>
                    </View>
                    <View style={styles.metricTile}>
                      <Text style={styles.metricLabel}>PEERS ONLINE</Text>
                      <Text style={styles.metricValue}>👥 128</Text>
                    </View>
                  </View>
                </View>

                {/* Testimonial Quote */}
                <View style={styles.quoteCard}>
                  <Text style={styles.quoteText}>
                    “The AAC board and instant geofence updates have made daily transitions completely stress-free.”
                  </Text>
                  <Text style={styles.quoteAuthor}>— Jordan Patel, Verified Caregiver</Text>
                </View>
              </View>
            )}

            {/* ======================================================= */}
            {/* RIGHT COLUMN: MODERN RESPONSIVE WEB AUTH CARD           */}
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
                    Sign In
                  </Text>
                  <Text style={styles.formSubtitle}>
                    Welcome back! Please enter your caregiver credentials.
                  </Text>
                </View>

                {/* Error Banner */}
                {errorMessage ? (
                  <View style={styles.errorBanner}>
                    <Text style={styles.errorIcon}>⚠️</Text>
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  </View>
                ) : null}

                {/* Email Field */}
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

                {/* Password Field */}
                <View style={styles.inputGroup}>
                  <View style={styles.passwordLabelRow}>
                    <Text style={styles.inputLabel}>Password</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                      <Text style={styles.forgotPasswordLink}>Forgot password?</Text>
                    </TouchableOpacity>
                  </View>

                  <View
                    style={[
                      styles.passwordInputWrapper,
                      fieldErrors.password && styles.textInputError,
                    ]}
                  >
                    <TextInput
                      style={styles.passwordTextInput}
                      placeholder="Enter your password"
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
                </View>

                {/* Submit Sign In Button */}
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    loading && styles.submitButtonDisabled,
                  ]}
                  activeOpacity={0.85}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <View style={styles.loadingRow}>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                      <Text style={styles.submitButtonText}>Signing in...</Text>
                    </View>
                  ) : (
                    <Text style={styles.submitButtonText}>Sign In to Dashboard</Text>
                  )}
                </TouchableOpacity>

                {/* 1-Click Demo Logins */}
                <View style={styles.demoBox}>
                  <Text style={styles.demoTitle}>⚡ ONE-CLICK DEMO LOGINS</Text>
                  <View style={[styles.demoButtonsRow, { flexDirection: width < 380 ? 'column' : 'row' }]}>
                    <TouchableOpacity
                      style={styles.demoButton}
                      onPress={() => handleQuickLogin('sarah@nivara.app', 'password123')}
                    >
                      <Text style={styles.demoButtonText}>👩‍⚕️ Sarah (Verified)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.demoButton}
                      onPress={() => handleQuickLogin('lisa@nivara.app', 'password123')}
                    >
                      <Text style={styles.demoButtonText}>👤 Lisa (Caregiver)</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Divider */}
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or continue with</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Social Login Buttons */}
                <View style={[styles.socialRow, { flexDirection: width < 380 ? 'column' : 'row' }]}>
                  <TouchableOpacity
                    style={styles.socialBtn}
                    onPress={() => handleQuickLogin('sarah@nivara.app', 'password123')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.googleIcon}>G</Text>
                    <Text style={styles.socialText}>Google</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.socialBtn}
                    onPress={() => handleQuickLogin('david@nivara.app', 'password123')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.facebookIcon}>f</Text>
                    <Text style={styles.socialText}>Facebook</Text>
                  </TouchableOpacity>
                </View>

                {/* Redirect to Register */}
                <View style={styles.redirectRow}>
                  <Text style={styles.redirectText}>Don't have an account? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text style={styles.redirectLink}>Create an account</Text>
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
    marginBottom: 24,
  },
  previewCard: {
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
    marginBottom: 20,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  statusText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  safeBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  safeBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#065F46',
  },
  childPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  childAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  childEmoji: {
    fontSize: 22,
  },
  childDetails: {
    flex: 1,
  },
  childName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  childSub: {
    fontSize: 12,
    color: '#64748B',
  },
  metricTilesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metricTile: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  quoteCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  quoteText: {
    fontSize: 13,
    color: '#1E3A8A',
    fontStyle: 'italic',
    marginBottom: 4,
    lineHeight: 18,
  },
  quoteAuthor: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
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
    marginBottom: 20,
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
    marginBottom: 16,
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
    marginBottom: 16,
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
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  forgotPasswordLink: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#2563EB',
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
  demoBox: {
    marginTop: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  demoTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  demoButtonsRow: {
    gap: 8,
  },
  demoButton: {
    flex: 1,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    minHeight: 38,
    justifyContent: 'center',
  },
  demoButtonText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
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
    marginBottom: 16,
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
