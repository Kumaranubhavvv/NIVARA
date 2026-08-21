import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
} from 'react-native';

const STEPS_DATA = {
  'r1': [ // Morning Hygiene
    { id: 's1', title: 'Put toothpaste on toothbrush', emoji: '🧴' },
    { id: 's2', title: 'Brush teeth for 2 minutes', emoji: '🪥' },
    { id: 's3', title: 'Rinse mouth with water', emoji: '💧' },
    { id: 's4', title: 'Wash face and dry with towel', emoji: '🧼' },
  ],
  'r2': [ // Bedtime Transition
    { id: 's5', title: 'Put on comfortable pajamas', emoji: '👕' },
    { id: 's6', title: 'Brush teeth', emoji: '🪥' },
    { id: 's7', title: 'Read a favorite storybook', emoji: '📖' },
    { id: 's8', title: 'Turn on white noise machine', emoji: '🔊' },
    { id: 's9', title: 'Get into bed and turn off lights', emoji: '🛌' },
  ],
  'r3': [ // Classroom Schedule
    { id: 's10', title: 'Hang backpack on coat hook', emoji: '🎒' },
    { id: 's11', title: 'Check in on visual mood card board', emoji: '🎭' },
    { id: 's12', title: 'Sit at desk and open workbook', emoji: '📝' },
  ],
};

export default function RoutineDetailsScreen({ route, navigation }) {
  const { routine } = route.params || { routine: { id: 'r1', name: 'Morning Hygiene' } };
  const steps = STEPS_DATA[routine.id] || [];

  const [checkedSteps, setCheckedSteps] = useState({});
  const [completeModalVisible, setCompleteModalVisible] = useState(false);

  const handleToggleStep = (stepId) => {
    const updated = { ...checkedSteps, [stepId]: !checkedSteps[stepId] };
    setCheckedSteps(updated);

    // Check if all steps are completed
    const completedCount = Object.keys(updated).filter((k) => updated[k]).length;
    if (completedCount === steps.length) {
      setTimeout(() => {
        setCompleteModalVisible(true);
      }, 500);
    }
  };

  const completedCount = Object.keys(checkedSteps).filter((k) => checkedSteps[k]).length;
  const progressPercent = steps.length ? Math.round((completedCount / steps.length) * 100) : 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>{routine.name}</Text>
          <Text style={styles.headerSubtitle}>Follow the steps below</Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      {/* PROGRESS TRACKER */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTextRow}>
          <Text style={styles.progressLabel}>Steps Completed</Text>
          <Text style={styles.progressVal}>{completedCount} / {steps.length} ({progressPercent}%)</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>
      </View>

      {/* CHECKLIST */}
      <ScrollView contentContainerStyle={styles.listContent}>
        {steps.map((item, index) => {
          const isDone = !!checkedSteps[item.id];
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.stepCard, isDone && styles.stepCardDone]}
              onPress={() => handleToggleStep(item.id)}
              activeOpacity={0.8}
            >
              <View style={styles.stepNumCircle}>
                <Text style={styles.stepNumText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepEmoji}>{item.emoji}</Text>
              <Text style={[styles.stepTitle, isDone && styles.stepTitleDone]}>
                {item.title}
              </Text>
              <View style={[styles.checkbox, isDone && styles.checkboxChecked]}>
                {isDone && <Text style={styles.checkMark}>✓</Text>}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* COMPLETE MODAL */}
      <Modal animationType="fade" transparent={true} visible={completeModalVisible}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalEmoji}>🎉</Text>
            <Text style={styles.modalTitle}>Awesome Job!</Text>
            <Text style={styles.modalDesc}>
              You finished the "{routine.name}" routine! Give yourself a high five.
            </Text>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => {
                setCompleteModalVisible(false);
                navigation.goBack();
              }}
            >
              <Text style={styles.modalCloseText}>Done</Text>
            </TouchableOpacity>
          </View>
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
  progressContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
  },
  progressVal: {
    fontSize: 12,
    fontWeight: '900',
    color: '#2563EB',
  },
  progressBarBg: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#EEF2F6',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#10B981',
  },
  listContent: {
    padding: 20,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  stepCardDone: {
    borderColor: '#A7F3D0',
    backgroundColor: '#F0FDF4',
  },
  stepNumCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EEF2F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748B',
  },
  stepEmoji: {
    fontSize: 22,
  },
  stepTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  stepTitleDone: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  modalEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  modalCloseBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
