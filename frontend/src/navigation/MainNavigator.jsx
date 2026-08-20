import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/home/HomeScreen';
import CommunityNavigator from './CommunityNavigator';
import SafetyNavigator from './SafetyNavigator';

import LiveLocationScreen from '../screens/safety/LiveLocationScreen';
import SafeZonesScreen from '../screens/safety/SafeZonesScreen';
import AddSafeZoneScreen from '../screens/safety/AddSafeZoneScreen';
import GPSBandScreen from '../screens/safety/GPSBandScreen';
import EmergencyScreen from '../screens/safety/EmergencyScreen';
import EmergencyContactsScreen from '../screens/safety/EmergencyContactsScreen';
import SafetyEventDetailsScreen from '../screens/safety/SafetyEventDetailsScreen';
import CaregiverDashboard from '../screens/caregiver/CaregiverDashboard';
import ChildProfileScreen from '../screens/caregiver/ChildProfileScreen';
import ChildStatusScreen from '../screens/caregiver/ChildStatusScreen';
import DeviceStatusScreen from '../screens/caregiver/DeviceStatusScreen';
import SafetyOverviewScreen from '../screens/caregiver/SafetyOverviewScreen';
import SupportCenterScreen from '../screens/caregiver/SupportCenterScreen';

const Stack = createNativeStackNavigator();

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Home">
      {/* 1. Flagship Unified Home Dashboard (Safety + Community Combined) */}
      <Stack.Screen name="Home" component={HomeScreen} />

      {/* 2. Main Portals */}
      <Stack.Screen name="CommunityTab" component={CommunityNavigator} />
      <Stack.Screen name="SafetyTab" component={SafetyNavigator} />

      {/* 3. Direct Safety & GPS Tracking Routes */}
      <Stack.Screen name="CaregiverDashboard" component={CaregiverDashboard} />
      <Stack.Screen name="LiveLocation" component={LiveLocationScreen} />
      <Stack.Screen name="SafeZones" component={SafeZonesScreen} />
      <Stack.Screen name="AddSafeZone" component={AddSafeZoneScreen} />
      <Stack.Screen name="GPSBand" component={GPSBandScreen} />
      <Stack.Screen name="Emergency" component={EmergencyScreen} />
      <Stack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} />
      <Stack.Screen name="SafetyEventDetails" component={SafetyEventDetailsScreen} />
      <Stack.Screen name="ChildProfile" component={ChildProfileScreen} />
      <Stack.Screen name="ChildStatus" component={ChildStatusScreen} />
      <Stack.Screen name="DeviceStatus" component={DeviceStatusScreen} />
      <Stack.Screen name="SafetyOverview" component={SafetyOverviewScreen} />
      <Stack.Screen name="SupportCenter" component={SupportCenterScreen} />
    </Stack.Navigator>
  );
}
