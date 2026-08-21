import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { ROUTES } from '../../navigation/routes';

export default function LearningHomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Routines & Tutor</Text>
          <Text style={styles.headerSubtitle}>Visual schedules and learning stories</Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* STATS OVERVIEW CARD */}
        <View style={styles.overviewCard}>
          <Text style={styles.overviewTitle}>Today's Schedule Progress</Text>
          <Text style={styles.overviewVal}>2 / 3 Routines Done</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '66%' }]} />
          </View>
        </View>

        {/* CORE PORTALS */}
        <Text style={styles.sectionTitle}>LEARNING SECTIONS</Text>
        <View style={styles.grid}>
          {/* Visual Routines */}
          <TouchableOpacity
            style={[styles.portalCard, { borderLeftColor: '#2563EB' }]}
            onPress={() => navigation.navigate(ROUTES.ROUTINE)}
            activeOpacity={0.85}
          >
            <View style={styles.portalIconCircleBlue}>
              <Text style={styles.portalIcon}>📅</Text>
            </View>
            <View style={styles.portalTextCol}>
              <Text style={styles.portalTitle}>Visual Routines</Text>
              <Text style={styles.portalSub}>Hygiene, bedtime, and school checklists</Text>
            </View>
          </TouchableOpacity>

          {/* AI Tutor Chat */}
          <TouchableOpacity
            style={[styles.portalCard, { borderLeftColor: '#8B5CF6' }]}
            onPress={() => navigation.navigate(ROUTES.TUTOR)}
            activeOpacity={0.85}
          >
            <View style={styles.portalIconCirclePurple}>
              <Text style={styles.portalIcon}>🦉</Text>
            </View>
            <View style={styles.portalTextCol}>
              <Text style={styles.portalTitle}>Nivi the Tutor Owl</Text>
              <Text style={styles.portalSub}>Interactive lessons and social stories chat</Text>
            </View>
          </TouchableOpacity>

          {/* Lesson Library */}
          <TouchableOpacity
            style={[styles.portalCard, { borderLeftColor: '#10B981' }]}
            onPress={() => navigation.navigate(ROUTES.LEARNING_TOPICS)}
            activeOpacity={0.85}
          >
            <View style={styles.portalIconCircleGreen}>
              <Text style={styles.portalIcon}>📚</Text>
            </View>
            <View style={styles.portalTextCol}>
              <Text style={styles.portalTitle}>Social Stories Library</Text>
              <Text style={styles.portalSub}>Browse customized modules & flashcards</Text>
            </View>
          </TouchableOpacity>

          {/* Reminders List */}
          <TouchableOpacity
            style={[styles.portalCard, { borderLeftColor: '#F59E0B' }]}
            onPress={() => navigation.navigate(ROUTES.REMINDERS)}
            activeOpacity={0.85}
          >
            <View style={styles.portalIconCircleYellow}>
              <Text style={styles.portalIcon}>⏰</Text>
            </View>
            <View style={styles.portalTextCol}>
              <Text style={styles.portalTitle}>Reminders & Alerts</Text>
              <Text style={styles.portalSub}>Visual alerts and transition notifications</Text>
            </View>
          </TouchableOpacity>
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
  overviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  overviewTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  overviewVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 12,
  },
  progressBarBg: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#EEF2F6',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#2563EB',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  grid: {
    gap: 12,
  },
  portalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
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
  portalIconCircleBlue: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  portalIconCirclePurple: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F5F3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  portalIconCircleGreen: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  portalIconCircleYellow: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  portalIcon: {
    fontSize: 22,
  },
  portalTextCol: {
    flex: 1,
  },
  portalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  portalSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
});
