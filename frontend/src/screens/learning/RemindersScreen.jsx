import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Switch,
} from 'react-native';

const MOCK_REMINDERS = [
  { id: 'rem-1', title: 'Morning Medication', time: '08:00 AM', active: true, emoji: '💊', days: 'Mon, Tue, Wed, Thu, Fri' },
  { id: 'rem-2', title: 'Pack Backpack', time: '08:30 AM', active: true, emoji: '🎒', days: 'Mon, Tue, Wed, Thu, Fri' },
  { id: 'rem-3', title: 'Calming Breathing Practice', time: '02:00 PM', active: false, emoji: '🎧', days: 'Every day' },
  { id: 'rem-4', title: 'Bedtime teeth brush', time: '09:00 PM', active: true, emoji: '🪥', days: 'Every day' },
];

export default function RemindersScreen({ navigation }) {
  const [reminders, setReminders] = useState(MOCK_REMINDERS);

  const handleToggleReminder = (id) => {
    setReminders((prev) =>
      prev.map((item) => (item.id === id ? { ...item, active: !item.active } : item))
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <Text style={styles.icon}>{item.emoji}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.time}>{item.time} • {item.days}</Text>
      </View>
      <Switch
        value={item.active}
        onValueChange={() => handleToggleReminder(item.id)}
        trackColor={{ false: '#E2E8F0', true: '#BFDBFE' }}
        thumbColor={item.active ? '#2563EB' : '#94A3B8'}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Reminders & Schedules</Text>
          <Text style={styles.headerSubtitle}>Set visual notifications and triggers</Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      <FlatList
        data={reminders}
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
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 22,
  },
  body: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  time: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
});
