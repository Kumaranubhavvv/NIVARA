import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { ROUTES } from '../../navigation/routes';

const ROUTINES = [
  { id: 'r1', name: 'Morning Hygiene', emoji: '🪥', stepsCount: 4, duration: '15 mins', completed: true, color: '#EFF6FF', text: '#1E40AF' },
  { id: 'r2', name: 'Bedtime Transition', emoji: '🛌', stepsCount: 5, duration: '20 mins', completed: false, color: '#F5F3FF', text: '#5B21B6' },
  { id: 'r3', name: 'Classroom Schedule', emoji: '🏫', stepsCount: 3, duration: '30 mins', completed: false, color: '#ECFDF5', text: '#065F46' },
];

export default function RoutineScreen({ navigation }) {
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: item.textColor || '#2563EB' }]}
      onPress={() => navigation.navigate(ROUTES.ROUTINE_DETAILS, { routine: item })}
      activeOpacity={0.85}
    >
      <View style={[styles.iconCircle, { backgroundColor: item.color }]}>
        <Text style={styles.iconText}>{item.emoji}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.meta}>
          {item.stepsCount} visual steps • {item.duration}
        </Text>
      </View>
      <View style={[styles.statusBadge, item.completed ? styles.statusBadgeDone : styles.statusBadgePending]}>
        <Text style={item.completed ? styles.statusTextDone : styles.statusTextPending}>
          {item.completed ? '✓ Done' : 'Pending'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Visual Routines</Text>
          <Text style={styles.headerSubtitle}>Daily task listings and visual triggers</Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      <FlatList
        data={ROUTINES}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#0F172A',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
  listContent: {
    padding: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 5,
    gap: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 22,
  },
  body: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  meta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeDone: {
    backgroundColor: '#ECFDF5',
  },
  statusBadgePending: {
    backgroundColor: '#F1F5F9',
  },
  statusTextDone: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  statusTextPending: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
});
