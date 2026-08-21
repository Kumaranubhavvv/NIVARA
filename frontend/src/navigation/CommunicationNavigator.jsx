import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CommunicationScreen from '../screens/communication/CommunicationScreen';
import AACScreen from '../screens/communication/AACScreen';
import EmotionScreen from '../screens/communication/EmotionScreen';
import QuickCommunicationScreen from '../screens/communication/QuickCommunicationScreen';
import CommunicationHistoryScreen from '../screens/communication/CommunicationHistoryScreen';
import { ROUTES } from './routes';

const Stack = createNativeStackNavigator();

export default function CommunicationNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={ROUTES.COMMUNICATION}
    >
      <Stack.Screen name={ROUTES.COMMUNICATION} component={CommunicationScreen} />
      <Stack.Screen name={ROUTES.AAC} component={AACScreen} />
      <Stack.Screen name={ROUTES.EMOTION} component={EmotionScreen} />
      <Stack.Screen name={ROUTES.QUICK_COMMUNICATION} component={QuickCommunicationScreen} />
      <Stack.Screen name={ROUTES.COMMUNICATION_HISTORY} component={CommunicationHistoryScreen} />
    </Stack.Navigator>
  );
}
