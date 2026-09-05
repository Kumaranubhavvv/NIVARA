import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';

const CUES = [
  { id: 'c1', title: 'Happy Smile', emoji: '😊', desc: 'Mouth corners turned up. This means the person feels glad or friendly.' },
  { id: 'c2', title: 'Sad Frown', emoji: '😢', desc: 'Eyes looking down, mouth corners turned down. This means they need comfort or space.' },
  { id: 'c3', title: 'Angry Eyebrows', emoji: '😠', desc: 'Eyebrows squeezed together. This means something has upset them. Do not push.' },
  { id: 'c4', title: 'Surprised Eyes', emoji: '😲', desc: 'Mouth wide open and eyes wide. This means something unexpected happened!' },
];

export default function SocialCueScreen({ navigation }) {
  const [activeCueIdx, setActiveCueIdx] = useState(0);

  const handleNext = () => {
    if (activeCueIdx < CUES.length - 1) {
      setActiveCueIdx((prev) => prev + 1);
    } else {
      navigation.goBack();
    }
  };

  const handlePrev = () => {
    if (activeCueIdx > 0) {
      setActiveCueIdx((prev) => prev - 1);
    }
  };

  const currentCue = CUES[activeCueIdx];

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>✕</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Expression Decoder</Text>
          <Text style={styles.headerSubtitle}>
            Card {activeCueIdx + 1} of {CUES.length}
          </Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      {/* FLASH CARD */}
      {currentCue ? (
        <View style={styles.cardContainer}>
          <View style={styles.flashCard}>
            <Text style={styles.cardEmoji}>{currentCue.emoji}</Text>
            <Text style={styles.cardTitle}>{currentCue.title}</Text>
            <Text style={styles.cardDesc}>{currentCue.desc}</Text>
          </View>

          {/* PROGRESS NAVIGATION */}
          <View style={styles.navRow}>
            <TouchableOpacity
              style={[styles.navBtn, styles.navBtnPrev, activeCueIdx === 0 && styles.navBtnDisabled]}
              onPress={handlePrev}
              disabled={activeCueIdx === 0}
            >
              <Text style={styles.navBtnTextPrev}>‹ Previous</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.navBtn, styles.navBtnNext]} onPress={handleNext}>
              <Text style={styles.navBtnTextNext}>
                {activeCueIdx === CUES.length - 1 ? 'Finish ✓' : 'Next ›'}
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
  cardContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashCard: {
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
  cardEmoji: {
    fontSize: 98,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '950',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 10,
  },
  cardDesc: {
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
