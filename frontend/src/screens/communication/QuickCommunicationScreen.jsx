import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
const GRID_COLUMNS = width > 768 ? 3 : 2;

const QUICK_NEEDS = [
  { id: 'qn1', label: 'HELP ME', emoji: '🚨', color: '#FEF2F2', border: '#FECACA', text: '#991B1B' },
  { id: 'qn2', label: 'I AM HURT', emoji: '🩹', color: '#FEF2F2', border: '#FECACA', text: '#991B1B' },
  { id: 'qn3', label: 'GO HOME', emoji: '🏠', color: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF' },
  { id: 'qn4', label: 'THIRSTY', emoji: '🥤', color: '#E0F2FE', border: '#BAE6FD', text: '#0369A1' },
  { id: 'qn5', label: 'HUNGRY', emoji: '🍎', color: '#FEF3C7', border: '#FDE68A', text: '#92400E' },
  { id: 'qn6', label: 'LOUD NOISE', emoji: '🔊', color: '#FFF7ED', border: '#FFEDD5', text: '#C2410C' },
];

export default function QuickCommunicationScreen({ navigation }) {
  const [activeAlert, setActiveAlert] = useState(null);

  const handleSelectNeed = (item) => {
    setActiveAlert(item);
    // Auto-dismiss alert pop-up
    setTimeout(() => {
      setActiveAlert(null);
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Quick Needs</Text>
          <Text style={styles.headerSubtitle}>Tap large cards for immediate help</Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      {/* QUICK NEED CARDS */}
      <View style={styles.grid}>
        {QUICK_NEEDS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.card, { backgroundColor: item.color, borderColor: item.border }]}
            onPress={() => handleSelectNeed(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.cardEmoji}>{item.emoji}</Text>
            <Text style={[styles.cardLabel, { color: item.text }]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* FULL-SCREEN ALERT OVERLAY */}
      <Modal visible={activeAlert !== null} transparent={true} animationType="fade">
        <View style={[styles.overlay, { backgroundColor: activeAlert?.color || '#FEF2F2' }]}>
          <Text style={styles.overlayEmoji}>{activeAlert?.emoji}</Text>
          <Text style={[styles.overlayLabel, { color: activeAlert?.text || '#991B1B' }]}>
            {activeAlert?.label}
          </Text>
          <Text style={styles.overlaySub}>Simulating sound synthesis output...</Text>
        </View>
      </Modal>
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
  grid: {
    flex: 1,
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '45%',
    aspectRatio: 1,
    borderRadius: 24,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardEmoji: {
    fontSize: 54,
    marginBottom: 10,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  overlayEmoji: {
    fontSize: 120,
    marginBottom: 20,
  },
  overlayLabel: {
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1,
  },
  overlaySub: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 10,
    fontStyle: 'italic',
  },
});
