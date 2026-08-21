import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LearningHomeScreen from '../screens/learning/LearningHomeScreen';
import RoutineScreen from '../screens/learning/RoutineScreen';
import RoutineDetailsScreen from '../screens/learning/RoutineDetailsScreen';
import LearningTopicsScreen from '../screens/learning/LearningTopicsScreen';
import TutorScreen from '../screens/learning/TutorScreen';
import RemindersScreen from '../screens/learning/RemindersScreen';
import TaskDetailsScreen from '../screens/learning/TaskDetailsScreen';
import { ROUTES } from './routes';

const Stack = createNativeStackNavigator();

export default function LearningNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={ROUTES.LEARNING_HOME}
    >
      <Stack.Screen name={ROUTES.LEARNING_HOME} component={LearningHomeScreen} />
      <Stack.Screen name={ROUTES.ROUTINE} component={RoutineScreen} />
      <Stack.Screen name={ROUTES.ROUTINE_DETAILS} component={RoutineDetailsScreen} />
      <Stack.Screen name={ROUTES.LEARNING_TOPICS} component={LearningTopicsScreen} />
      <Stack.Screen name={ROUTES.TUTOR} component={TutorScreen} />
      <Stack.Screen name={ROUTES.REMINDERS} component={RemindersScreen} />
      <Stack.Screen name={ROUTES.TASK_DETAILS} component={TaskDetailsScreen} />
    </Stack.Navigator>
  );
}
