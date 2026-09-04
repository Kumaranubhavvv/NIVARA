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
} from 'react-native';
import { authApi } from '../../services/api/authApi';
import useResponsive from '../../theme/responsive';

export default function ForgotPasswordScreen({ navigation }) {
  const { isMobile, gutter, clampFont } = useResponsive();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async () => {
    setErrorMessage('');
    const emailTrim = email.trim();
    if (!emailTrim || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await authApi.forgotPassword({ email: emailTrim.toLowerCase() });
      setSubmitted(true);
    } catch (err) {
      setErrorMessage(
        err.detail || err.message || 'Failed to submit request. Please try again.'
      );
    } finally {
      setLoading(false);
    }
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
          <View style={[styles.card, { padding: isMobile ? 22 : 32 }]}>
            {/* Top Brand Header */}
            <View style={styles.brandRow}>
              <View style={styles.brandBadge}>
                <Text style={styles.sparkleIcon}>✦</Text>
              </View>
              <Text style={styles.brandTitle}>NIVARA</Text>
            </View>

            <View style={styles.headerBox}>
              <Text style={[styles.title, { fontSize: clampFont(22, 26, 28) }]}>
                Reset Password
              </Text>
              <Text style={styles.subtitle}>
                Enter your registered caregiver email address to receive reset instructions.
              </Text>
            </View>

            {errorMessage ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {submitted ? (
              <View style={styles.successBox}>
                <Text style={styles.successIcon}>✉️</Text>
                <Text style={styles.successTitle}>Check Your Inbox</Text>
                <Text style={styles.successDesc}>
                  If an account exists for {email}, we have sent instructions to reset your password.
                </Text>
                <TouchableOpacity
                  style={styles.returnBtn}
                  onPress={() => navigation.navigate('Login')}
                >
                  <Text style={styles.returnBtnText}>Return to Sign In</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.formContent}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="name@example.com"
                    placeholderTextColor="#94A3B8"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    loading && styles.submitButtonDisabled,
                  ]}
                  activeOpacity={0.85}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <View style={styles.loadingRow}>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                      <Text style={styles.submitButtonText}>Submitting...</Text>
                    </View>
                  ) : (
                    <Text style={styles.submitButtonText}>Send Reset Link</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.footerLinks}>
                  <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.backLink}>← Back to Sign In</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => navigation.navigate('Welcome')}>
                    <Text style={styles.homeLink}>Home Page</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
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
    alignItems: 'center',
    paddingVertical: 24,
    maxWidth: '100%',
  },
  card: {
    width: '100%',
    maxWidth: 480,
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
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  brandBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkleIcon: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 15,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 1.5,
  },
  headerBox: {
    marginBottom: 20,
    alignItems: 'center',
    textAlign: 'center',
  },
  title: {
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
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
  successBox: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  successIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#065F46',
    marginBottom: 4,
  },
  successDesc: {
    fontSize: 13,
    color: '#047857',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 19,
  },
  returnBtn: {
    width: '100%',
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  returnBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  formContent: {
    width: '100%',
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
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  backLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  homeLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
});
