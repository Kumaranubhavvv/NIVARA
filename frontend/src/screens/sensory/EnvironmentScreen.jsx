import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';

export default function EnvironmentScreen({ navigation }) {
  const [decibels, setDecibels] = useState(50);
  const [brightness, setBrightness] = useState(320); // lux

  // Simulating small environment sensor fluctuations
  useEffect(() => {
    const timer = setInterval(() => {
      setDecibels((prev) => {
        const offset = Math.floor(Math.random() * 9) - 4; // -4 to +4
        return Math.max(30, Math.min(95, prev + offset));
      });
      setBrightness((prev) => {
        const offset = Math.floor(Math.random() * 21) - 10;
        return Math.max(100, Math.min(800, prev + offset));
      });
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const getDbColor = (db) => {
    if (db < 60) return '#059669'; // Green (Safe)
    if (db < 80) return '#D97706'; // Yellow (Moderate)
    return '#DC2626'; // Red (Loud)
  };

  const getDbLabel = (db) => {
    if (db < 60) return 'Quiet & Safe';
    if (db < 80) return 'Moderate Activity';
    return 'Loud Environment (Caution)';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Environment Monitor</Text>
          <Text style={styles.headerSubtitle}>Real-time decibels and brightness sensors</Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* DECIBEL METER CHART GAUGE */}
        <View style={styles.gaugeCard}>
          <Text style={styles.gaugeLabel}>AUDITORY EXPOSURE</Text>
          <View style={[styles.gaugeCircle, { borderColor: getDbColor(decibels) }]}>
            <Text style={[styles.gaugeVal, { color: getDbColor(decibels) }]}>{decibels}</Text>
            <Text style={styles.gaugeUnit}>dB</Text>
          </View>
          <Text style={[styles.gaugeStatus, { color: getDbColor(decibels) }]}>
            {getDbLabel(decibels)}
          </Text>
        </View>

        {/* BRIGHTNESS METRIC */}
        <View style={styles.sensorCard}>
          <Text style={styles.sensorLabel}>LIGHT LEVELS (LUX)</Text>
          <View style={styles.sensorValRow}>
            <Text style={styles.sensorVal}>💡 {brightness} lx</Text>
            <View style={styles.sensorStatusBadge}>
              <Text style={styles.sensorStatusText}>Comfortable</Text>
            </View>
          </View>
          <Text style={styles.sensorSub}>Optimal levels for child comfort inside school.</Text>
        </View>

        {/* RECENT ENVIRONMENTAL AUDIT LOGS */}
        <Text style={styles.sectionHeader}>RECENT ENVIRONMENTAL LOGS</Text>
        <View style={styles.logsCard}>
          <View style={styles.logRow}>
            <Text style={styles.logTime}>10:00 AM</Text>
            <Text style={styles.logType}>🔊 Sound spikes to 78dB</Text>
            <Text style={styles.logMeta}>Loud cafe</Text>
          </View>
          <View style={styles.logRow}>
            <Text style={styles.logTime}>09:30 AM</Text>
            <Text style={styles.logType}>🌤️ Brightness: 450 lx</Text>
            <Text style={styles.logMeta}>Outdoors</Text>
          </View>
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
  gaugeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    marginBottom: 20,
  },
  gaugeLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  gaugeCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  gaugeVal: {
    fontSize: 38,
    fontWeight: '900',
  },
  gaugeUnit: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    marginTop: -2,
  },
  gaugeStatus: {
    fontSize: 13,
    fontWeight: '800',
  },
  sensorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  sensorLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#64748B',
    marginBottom: 8,
  },
  sensorValRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sensorVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  sensorStatusBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sensorStatusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
  },
  sensorSub: {
    fontSize: 11,
    color: '#64748B',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 12,
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
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    paddingBottom: 10,
  },
  logTime: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '700',
  },
  logType: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    marginLeft: 12,
  },
  logMeta: {
    fontSize: 11,
    color: '#64748B',
  },
});
