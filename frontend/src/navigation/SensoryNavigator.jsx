import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SensoryHomeScreen from '../screens/sensory/SensoryHomeScreen';
import EnvironmentScreen from '../screens/sensory/EnvironmentScreen';
import SensoryPreferencesScreen from '../screens/sensory/SensoryPreferencesScreen';
import SocialCueScreen from '../screens/sensory/SocialCueScreen';
import { ROUTES } from './routes';

const Stack = createNativeStackNavigator();

export default function SensoryNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={ROUTES.SENSORY_HOME}
    >
      <Stack.Screen name={ROUTES.SENSORY_HOME} component={SensoryHomeScreen} />
      <Stack.Screen name={ROUTES.ENVIRONMENT} component={EnvironmentScreen} />
      <Stack.Screen name={ROUTES.SENSORY_PREFERENCES} component={SensoryPreferencesScreen} />
      <Stack.Screen name={ROUTES.SOCIAL_CUE} component={SocialCueScreen} />
    </Stack.Navigator>
  );
}
