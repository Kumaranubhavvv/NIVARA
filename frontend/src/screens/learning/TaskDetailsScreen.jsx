import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const TOPIC_STEPS = {
  't1': [ // Supermarket
    { id: 'ts1', title: 'Hold the shopping cart handles', emoji: '🛒', desc: 'Stay close to your caregiver and walk slowly.' },
    { id: 'ts2', title: 'Pick items on your list', emoji: '🍎', desc: 'Find apples, milk, and bread together.' },
    { id: 'ts3', title: 'Wait patiently in checkout line', emoji: '🚶‍♂️', desc: 'Take deep breaths if it feels crowded.' },
  ],
  't2': [ // Crossing Road
    { id: 'ts4', title: 'Stop at the curb', emoji: '🚶‍♂️', desc: 'Never step into the street without looking first.' },
    { id: 'ts5', title: 'Look left, right, and left again', emoji: '👀', desc: 'Make sure no cars are coming.' },
    { id: 'ts6', title: 'Listen for engine noises', emoji: '👂', desc: 'Keep your ears open for moving traffic.' },
    { id: 'ts7', title: 'Walk quickly across the road', emoji: '🚦', desc: 'Keep holding hands and cross when it is clear.' },
  ],
  't3': [ // Calming
    { id: 'ts8', title: 'Recognize the loud noise', emoji: '🔊', desc: 'It is just a temporary siren or machine.' },
    { id: 'ts9', title: 'Put on noise-canceling headphones', emoji: '🎧', desc: 'This makes the sound soft and quiet.' },
    { id: 'ts10', title: 'Count slowly to 5', emoji: '🖐️', desc: '1... 2... 3... 4... 5... I am calm.' },
  ],
};

export default function TaskDetailsScreen({ route, navigation }) {
  const { topic } = route.params || { topic: { id: 't2', title: 'Crossing the Road Safely' } };
  const steps = TOPIC_STEPS[topic.id] || [];

  const [activeStepIdx, setActiveStepIdx] = useState(0);

  const handleNext = () => {
    if (activeStepIdx < steps.length - 1) {
      setActiveStepIdx((prev) => prev + 1);
    } else {
      navigation.goBack();
    }
  };

  const handlePrev = () => {
    if (activeStepIdx > 0) {
      setActiveStepIdx((prev) => prev - 1);
    }
  };

  const currentStep = steps[activeStepIdx];

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>✕</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle} numberOfLines={1}>{topic.title}</Text>
          <Text style={styles.headerSubtitle}>
            Step {activeStepIdx + 1} of {steps.length}
          </Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      {/* STEP CONTENT CONTAINER */}
      {currentStep ? (
        <View style={styles.stepContainer}>
          <View style={styles.stepCard}>
            <Text style={styles.stepEmoji}>{currentStep.emoji}</Text>
            <Text style={styles.stepTitle}>{currentStep.title}</Text>
            <Text style={styles.stepDesc}>{currentStep.desc}</Text>
          </View>

          {/* PROGRESS NAVIGATION */}
          <View style={styles.navRow}>
            <TouchableOpacity
              style={[styles.navBtn, styles.navBtnPrev, activeStepIdx === 0 && styles.navBtnDisabled]}
              onPress={handlePrev}
              disabled={activeStepIdx === 0}
            >
              <Text style={styles.navBtnTextPrev}>‹ Back</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.navBtn, styles.navBtnNext]} onPress={handleNext}>
              <Text style={styles.navBtnTextNext}>
                {activeStepIdx === steps.length - 1 ? 'Finish ✓' : 'Next ›'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
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
    fontSize: 16,
    color: '#64748B',
    fontWeight: '900',
  },
  headerTitle: {
    maxWidth: 200,
    fontSize: 15,
    fontWeight: '950',
    color: '#0F172A',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
  stepContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 40,
  },
  stepEmoji: {
    fontSize: 90,
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 10,
  },
  stepDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  navRow: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 400,
    gap: 16,
  },
  navBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnPrev: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  navBtnNext: {
    backgroundColor: '#2563EB',
  },
  navBtnDisabled: {
    opacity: 0.5,
  },
  navBtnTextPrev: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '800',
  },
  navBtnTextNext: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
