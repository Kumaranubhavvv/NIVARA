import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  SafeAreaView,
} from 'react-native';

const EMOTIONS = [
  { id: 'e1', label: 'Happy', emoji: '😊', desc: 'I feel good and cheerful', color: '#ECFDF5', border: '#A7F3D0', text: '#065F46' },
  { id: 'e2', label: 'Sad', emoji: '😢', desc: 'I feel a bit down or lonely', color: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF' },
  { id: 'e3', label: 'Angry', emoji: '😠', desc: 'Something has upset me', color: '#FEF2F2', border: '#FECACA', text: '#991B1B' },
  { id: 'e4', label: 'Anxious', emoji: '😰', desc: 'I feel nervous or worried', color: '#FFF7ED', border: '#FFEDD5', text: '#C2410C' },
  { id: 'e5', label: 'Excited', emoji: '🤩', desc: 'I have high energy and joy', color: '#FEF3C7', border: '#FDE68A', text: '#92400E' },
  { id: 'e6', label: 'Tired', emoji: '🥱', desc: 'I am sleepy or out of energy', color: '#F5F3FF', border: '#DDD6FE', text: '#5B21B6' },
];

export default function EmotionScreen({ navigation }) {
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [moodLogs, setMoodLogs] = useState([
    { id: 'l1', emotion: 'Happy 😊', time: 'Today, 08:30 AM', reason: 'Had breakfast' },
    { id: 'l2', emotion: 'Tired 🥱', time: 'Yesterday, 09:15 PM', reason: 'Bedtime routine complete' },
  ]);

  const handleSelectEmotion = (emo) => {
    setSelectedEmotion(emo);
  };

  const handleLogReason = (reason) => {
    if (!selectedEmotion) return;
    const newLog = {
      id: `log-${Date.now()}`,
      emotion: `${selectedEmotion.label} ${selectedEmotion.emoji}`,
      time: 'Just now',
      reason: reason,
    };
    setMoodLogs((prev) => [newLog, ...prev]);
    setSelectedEmotion(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Mood Check-In</Text>
          <Text style={styles.headerSubtitle}>Identify and express current feelings</Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* EMOTION SELECTION GRID */}
        {!selectedEmotion ? (
          <View>
            <Text style={styles.sectionTitle}>How do you feel right now?</Text>
            <View style={styles.grid}>
              {EMOTIONS.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.emoCard, { backgroundColor: item.color, borderColor: item.border }]}
                  onPress={() => handleSelectEmotion(item)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.emoEmoji}>{item.emoji}</Text>
                  <Text style={[styles.emoLabel, { color: item.text }]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          /* CONTEXT REASON CHECK-IN FLOW */
          <View style={styles.reasonCard}>
            <Text style={styles.reasonEmoji}>{selectedEmotion.emoji}</Text>
            <Text style={styles.reasonTitle}>I feel {selectedEmotion.label}</Text>
            <Text style={styles.reasonSubtitle}>{selectedEmotion.desc}</Text>

            <Text style={styles.reasonQuestion}>Why do you feel this way?</Text>
            <View style={styles.reasonButtons}>
              {['School 🏫', 'Home 🏠', 'Hungry 🍎', 'Sleepy 🛌', 'Noise 🔊', 'Play 🧸'].map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={styles.reasonOptionBtn}
                  onPress={() => handleLogReason(reason)}
                >
                  <Text style={styles.reasonOptionText}>{reason}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.cancelReasonBtn} onPress={() => setSelectedEmotion(null)}>
              <Text style={styles.cancelReasonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* RECENT MOOD HISTORY LOG */}
        <Text style={styles.sectionTitle}>Mood History</Text>
        <View style={styles.logsCard}>
          {moodLogs.map((log) => (
            <View key={log.id} style={styles.logRow}>
              <View style={styles.logBadge}>
                <Text style={styles.logBadgeText}>{log.emotion}</Text>
              </View>
              <View style={styles.logBody}>
                <Text style={styles.logReason}>Reason: {log.reason}</Text>
                <Text style={styles.logTime}>{log.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
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
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 14,
    marginTop: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  emoCard: {
    flex: 1,
    minWidth: '45%',
    aspectRatio: 1.15,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  emoEmoji: {
    fontSize: 44,
    marginBottom: 8,
  },
  emoLabel: {
    fontSize: 13,
    fontWeight: '800',
  },
  reasonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    marginBottom: 24,
  },
  reasonEmoji: {
    fontSize: 64,
    marginBottom: 10,
  },
  reasonTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  reasonSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 20,
  },
  reasonQuestion: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  reasonButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginBottom: 20,
  },
  reasonOptionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reasonOptionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  cancelReasonBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelReasonText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '700',
  },
  logsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    paddingBottom: 10,
    gap: 12,
  },
  logBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  logBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
  },
  logBody: {
    flex: 1,
  },
  logReason: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  logTime: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
});
