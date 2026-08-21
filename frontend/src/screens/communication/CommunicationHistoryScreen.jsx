import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from 'react-native';

const MOCK_HISTORY = [
  { id: 'h1', text: 'I want Eat Apple', time: 'Today, 10:30 AM', category: 'Needs', color: '#FEF3C7', textColor: '#92400E' },
  { id: 'h2', text: 'Toilet Help', time: 'Today, 09:15 AM', category: 'Emergency', color: '#FEF2F2', textColor: '#991B1B' },
  { id: 'h3', text: 'Happy Home', time: 'Yesterday, 04:30 PM', category: 'Feelings', color: '#ECFDF5', textColor: '#065F46' },
  { id: 'h4', text: 'Go Park Play', time: 'Yesterday, 11:00 AM', category: 'Actions', color: '#EFF6FF', textColor: '#1E40AF' },
];

export default function CommunicationHistoryScreen({ navigation }) {
  const renderItem = ({ item }) => (
    <View style={styles.historyRow}>
      <View style={[styles.badge, { backgroundColor: item.color }]}>
        <Text style={[styles.badgeText, { color: item.textColor }]}>{item.category}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.historyText}>"{item.text}"</Text>
        <Text style={styles.timeText}>{item.time}</Text>
      </View>
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
          <Text style={styles.headerTitle}>Talker Logs</Text>
          <Text style={styles.headerSubtitle}>Review child's vocalized cards history</Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      <FlatList
        data={MOCK_HISTORY}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No phrase history logged yet.</Text>
          </View>
        }
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
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  body: {
    flex: 1,
  },
  historyText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  timeText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
  },
});
