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

const TOPICS = [
  { id: 't1', title: 'Going to the Supermarket', category: 'Social Stories', emoji: '🛒', duration: '5 mins', difficulty: 'Easy', color: '#EFF6FF', text: '#1E40AF' },
  { id: 't2', title: 'Crossing the Road Safely', emoji: '🚦', category: 'Life Skills', duration: '8 mins', difficulty: 'Medium', color: '#ECFDF5', text: '#065F46' },
  { id: 't3', title: 'Calming in Loud Places', emoji: '🎧', category: 'Sensory Help', duration: '6 mins', difficulty: 'Easy', color: '#F5F3FF', text: '#5B21B6' },
];

export default function LearningTopicsScreen({ navigation }) {
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: item.text }]}
      onPress={() => navigation.navigate(ROUTES.TASK_DETAILS, { topic: item })}
      activeOpacity={0.85}
    >
      <View style={[styles.iconCircle, { backgroundColor: item.color }]}>
        <Text style={styles.iconText}>{item.emoji}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.category}>{item.category.toUpperCase()}</Text>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.meta}>
          {item.duration} • {item.difficulty}
        </Text>
      </View>
      <Text style={styles.arrow}>›</Text>
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
          <Text style={styles.headerTitle}>Learning Library</Text>
          <Text style={styles.headerSubtitle}>Select a social story or skill guide</Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      <FlatList
        data={TOPICS}
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
  category: {
    fontSize: 9,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  meta: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  arrow: {
    fontSize: 24,
    color: '#94A3B8',
    fontWeight: '300',
  },
});
