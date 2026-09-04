import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import useResponsive from '../theme/responsive';

export default function AppNavigator() {
  const { isMobile, clampFont } = useResponsive();
  const { token, initialAuthChecked, loadStoredAuth } = useAuthStore();

  useEffect(() => {
    loadStoredAuth();
  }, []);

  if (!initialAuthChecked) {
    return (
      <View style={styles.splashContainer}>
        <View style={styles.brandRow}>
          <View style={styles.brandBadge}>
            <Text style={styles.sparkleIcon}>✦</Text>
          </View>
          <Text style={[styles.brandTitle, { fontSize: clampFont(22, 24, 26) }]}>
            NIVARA
          </Text>
        </View>
        <ActivityIndicator size="large" color="#2563EB" style={styles.loader} />
        <Text style={styles.splashSubtitle}>Loading secure session...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {token ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 24,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  brandBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  sparkleIcon: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 20,
  },
  brandTitle: {
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 2,
  },
  loader: {
    marginVertical: 12,
  },
  splashSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
});
