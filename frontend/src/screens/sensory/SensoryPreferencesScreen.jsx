import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
} from 'react-native';

export default function SensoryPreferencesScreen({ navigation }) {
  const [prefSoundAlerts, setPrefSoundAlerts] = useState(true);
  const [prefLightAlerts, setPrefLightAlerts] = useState(false);
  const [prefCrowdAlerts, setPrefCrowdAlerts] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Sensory Preferences</Text>
          <Text style={styles.headerSubtitle}>Customize notifications for sensory comfort</Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* SETTINGS CARD */}
        <View style={styles.card}>
          {/* Auditory settings */}
          <View style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingTitle}>Loud Noise Notifications</Text>
              <Text style={styles.settingDesc}>Alert me if decibels exceed 85 dB threshold.</Text>
            </View>
            <Switch
              value={prefSoundAlerts}
              onValueChange={setPrefSoundAlerts}
              trackColor={{ false: '#E2E8F0', true: '#BFDBFE' }}
              thumbColor={prefSoundAlerts ? '#2563EB' : '#94A3B8'}
            />
          </View>

          {/* Light settings */}
          <View style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingTitle}>Bright Light Alerts</Text>
              <Text style={styles.settingDesc}>Alert if local lux sensors detect flash exposure.</Text>
            </View>
            <Switch
              value={prefLightAlerts}
              onValueChange={setPrefLightAlerts}
              trackColor={{ false: '#E2E8F0', true: '#BFDBFE' }}
              thumbColor={prefLightAlerts ? '#2563EB' : '#94A3B8'}
            />
          </View>

          {/* Crowd settings */}
          <View style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingTitle}>Crowded Space Alerts</Text>
              <Text style={styles.settingDesc}>Notify when surrounding crowd estimates are high.</Text>
            </View>
            <Switch
              value={prefCrowdAlerts}
              onValueChange={setPrefCrowdAlerts}
              trackColor={{ false: '#E2E8F0', true: '#BFDBFE' }}
              thumbColor={prefCrowdAlerts ? '#2563EB' : '#94A3B8'}
            />
          </View>
        </View>

        {/* REINFORCEMENTS MESSAGE */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 Note: These settings are stored locally and synced with child SafeBand sensors to trigger automatic local notification profiles.
          </Text>
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 16,
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    paddingBottom: 16,
    gap: 16,
  },
  settingTextCol: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  settingDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  infoBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoText: {
    fontSize: 11,
    color: '#1E40AF',
    lineHeight: 15,
  },
});
