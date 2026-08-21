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

export default function SensoryHomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Sensory Hub</Text>
          <Text style={styles.headerSubtitle}>Environment monitoring and adjustments</Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* CURRENT STATUS CARD */}
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>ENVIRONMENT STATUS</Text>
          <Text style={styles.statusVal}>Calm & Comfortable</Text>
          <Text style={styles.statusSub}>Noise levels are within safety limits (45 dB)</Text>
        </View>

        {/* METRICS ROW */}
        <View style={styles.metricsRow}>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>SOUND LEVEL</Text>
            <Text style={styles.metricVal}>🔊 45 dB</Text>
            <Text style={styles.metricStatus}>Quiet</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>CROWD ESTIMATE</Text>
            <Text style={styles.metricVal}>👥 Low</Text>
            <Text style={styles.metricStatus}>Comfortable</Text>
          </View>
        </View>

        {/* PORTALS LIST */}
        <Text style={styles.sectionHeader}>PORTALS</Text>
        <View style={styles.portalsList}>
          {/* Environment Monitor */}
          <TouchableOpacity
            style={styles.portalCard}
            onPress={() => navigation.navigate(ROUTES.ENVIRONMENT)}
            activeOpacity={0.85}
          >
            <Text style={styles.portalIcon}>📊</Text>
            <View style={styles.portalText}>
              <Text style={styles.portalTitle}>Environment Monitor</Text>
              <Text style={styles.portalDesc}>Real-time logs of decibels and brightness levels</Text>
            </View>
            <Text style={styles.portalArrow}>›</Text>
          </TouchableOpacity>

          {/* Preferences */}
          <TouchableOpacity
            style={styles.portalCard}
            onPress={() => navigation.navigate(ROUTES.SENSORY_PREFERENCES)}
            activeOpacity={0.85}
          >
            <Text style={styles.portalIcon}>⚙️</Text>
            <View style={styles.portalText}>
              <Text style={styles.portalTitle}>Sensory Preferences</Text>
              <Text style={styles.portalDesc}>Configure volume limits and visual alerts</Text>
            </View>
            <Text style={styles.portalArrow}>›</Text>
          </TouchableOpacity>

          {/* Social Cue decoder cards */}
          <TouchableOpacity
            style={styles.portalCard}
            onPress={() => navigation.navigate(ROUTES.SOCIAL_CUE)}
            activeOpacity={0.85}
          >
            <Text style={styles.portalIcon}>🎭</Text>
            <View style={styles.portalText}>
              <Text style={styles.portalTitle}>Expression Decoder</Text>
              <Text style={styles.portalDesc}>Practice decoding expressions with flashcards</Text>
            </View>
            <Text style={styles.portalArrow}>›</Text>
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
  statusCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 20,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#059669',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statusVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#065F46',
  },
  statusSub: {
    fontSize: 11,
    color: '#047857',
    marginTop: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#64748B',
    marginBottom: 4,
  },
  metricVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  metricStatus: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '700',
    marginTop: 4,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  portalsList: {
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
    gap: 14,
  },
  portalIcon: {
    fontSize: 24,
  },
  portalText: {
    flex: 1,
  },
  portalTitle: {
    fontSize: 13,
    fontWeight: '850',
    color: '#0F172A',
  },
  portalDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  portalArrow: {
    fontSize: 24,
    color: '#94A3B8',
    fontWeight: '300',
  },
});
