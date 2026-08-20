import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#0F172A" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
