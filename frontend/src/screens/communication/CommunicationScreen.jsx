import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { ROUTES } from '../../navigation/routes';

const { width } = Dimensions.get('window');
const GRID_COLUMNS = width > 768 ? 5 : 3;

const VOCAB_DATA = [
  // Needs
  { id: '1', label: 'I want', emoji: '🙋‍♂️', category: 'Needs', color: '#EFF6FF', textColor: '#1E40AF' },
  { id: '2', label: 'Help', emoji: '🆘', category: 'Needs', color: '#FEF2F2', textColor: '#991B1B' },
  { id: '3', label: 'Drink', emoji: '🥛', category: 'Needs', color: '#EFF6FF', textColor: '#1E40AF' },
  { id: '4', label: 'Eat', emoji: '🍎', category: 'Needs', color: '#FEF3C7', textColor: '#92400E' },
  { id: '5', label: 'Toilet', emoji: '🚽', category: 'Needs', color: '#F0FDF4', textColor: '#166534' },
  // Actions
  { id: '6', label: 'Go', emoji: '🚶‍♂️', category: 'Actions', color: '#ECFDF5', textColor: '#065F46' },
  { id: '7', label: 'Stop', emoji: '🛑', category: 'Actions', color: '#FEF2F2', textColor: '#991B1B' },
  { id: '8', label: 'Sleep', emoji: '😴', category: 'Actions', color: '#F5F3FF', textColor: '#5B21B6' },
  { id: '9', label: 'Play', emoji: '🧸', category: 'Actions', color: '#FEF3C7', textColor: '#92400E' },
  { id: '10', label: 'Read', emoji: '📖', category: 'Actions', color: '#EFF6FF', textColor: '#1E40AF' },
  // Feelings
  { id: '11', label: 'Happy', emoji: '😊', category: 'Feelings', color: '#F0FDF4', textColor: '#166534' },
  { id: '12', label: 'Sad', emoji: '😢', category: 'Feelings', color: '#EFF6FF', textColor: '#1E40AF' },
  { id: '13', label: 'Angry', emoji: '😠', category: 'Feelings', color: '#FEF2F2', textColor: '#991B1B' },
  { id: '14', label: 'Tired', emoji: '🥱', category: 'Feelings', color: '#F5F3FF', textColor: '#5B21B6' },
  { id: '15', label: 'Scared', emoji: '😨', category: 'Feelings', color: '#FEF3C7', textColor: '#92400E' },
  // Places
  { id: '16', label: 'Home', emoji: '🏠', category: 'Places', color: '#F0FDF4', textColor: '#166534' },
  { id: '17', label: 'School', emoji: '🏫', category: 'Places', color: '#EFF6FF', textColor: '#1E40AF' },
  { id: '18', label: 'Park', emoji: '🌳', category: 'Places', color: '#ECFDF5', textColor: '#065F46' },
  { id: '19', label: 'Therapy', emoji: '🏥', category: 'Places', color: '#F5F3FF', textColor: '#5B21B6' },
  { id: '20', label: 'Shop', emoji: '🛒', category: 'Places', color: '#FEF3C7', textColor: '#92400E' },
];

const CATEGORIES = ['All', 'Needs', 'Actions', 'Feelings', 'Places'];

export default function CommunicationScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [phrase, setPhrase] = useState([]);
  const [speakingText, setSpeakingText] = useState('');

  const filteredVocab = VOCAB_DATA.filter(
    (item) => selectedCategory === 'All' || item.category === selectedCategory
  );

  const handleSelectWord = (word) => {
    setPhrase((prev) => [...prev, word]);
    triggerTextToSpeech(word.label);
  };

  const handleClear = () => {
    setPhrase([]);
    setSpeakingText('');
  };

  const triggerTextToSpeech = (text) => {
    setSpeakingText(text);
    // Simulating speaking delay
    setTimeout(() => {
      setSpeakingText('');
    }, 1500);
  };

  const speakFullPhrase = () => {
    if (phrase.length === 0) return;
    const fullText = phrase.map((w) => w.label).join(' ');
    triggerTextToSpeech(fullText);
  };

  const renderVocabCard = ({ item }) => (
    <TouchableOpacity
      style={[styles.vocabCard, { backgroundColor: item.color }]}
      onPress={() => handleSelectWord(item)}
      activeOpacity={0.8}
    >
      <Text style={styles.cardEmoji}>{item.emoji}</Text>
      <Text style={[styles.cardLabel, { color: item.textColor }]}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>AAC Talker</Text>
          <Text style={styles.headerSubtitle}>Tap cards to speak thoughts</Text>
        </View>
        <TouchableOpacity
          style={styles.historyBtn}
          onPress={() => navigation.navigate(ROUTES.COMMUNICATION_HISTORY)}
        >
          <Text style={styles.historyIcon}>🕒</Text>
        </TouchableOpacity>
      </View>

      {/* SPEAKING SPEAKER BANNER */}
      {speakingText ? (
        <View style={styles.speakingBanner}>
          <Text style={styles.speakingText}>🗣️ "{speakingText}"</Text>
        </View>
      ) : null}

      {/* PHRASE BUILDER BAR */}
      <View style={styles.phraseBarContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.phraseList}>
          {phrase.length === 0 ? (
            <Text style={styles.phrasePlaceholder}>Tapped words will build a sentence here...</Text>
          ) : (
            phrase.map((item, index) => (
              <View key={`${item.id}-${index}`} style={[styles.phraseChip, { backgroundColor: item.color }]}>
                <Text style={styles.chipEmoji}>{item.emoji}</Text>
                <Text style={[styles.chipText, { color: item.textColor }]}>{item.label}</Text>
              </View>
            ))
          )}
        </ScrollView>
        {phrase.length > 0 && (
          <View style={styles.phraseActions}>
            <TouchableOpacity style={styles.speakBtn} onPress={speakFullPhrase}>
              <Text style={styles.actionBtnText}>🔊 Speak</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
              <Text style={styles.actionBtnText}>✕ Clear</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* CATEGORY TABS */}
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryTab, selectedCategory === cat && styles.categoryTabActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.categoryTabText, selectedCategory === cat && styles.categoryTabTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* VOCABULARY GRID */}
      <FlatList
        data={filteredVocab}
        renderItem={renderVocabCard}
        keyExtractor={(item) => item.id}
        numColumns={GRID_COLUMNS}
        key={GRID_COLUMNS}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.gridRow}
      />

      {/* FLOATING ACTION PANELS */}
      <View style={styles.bottomTabShortcuts}>
        <TouchableOpacity
          style={[styles.shortcutBtn, { backgroundColor: '#FDF2F8' }]}
          onPress={() => navigation.navigate(ROUTES.AAC)}
        >
          <Text style={styles.shortcutIcon}>🎨</Text>
          <Text style={styles.shortcutLabel}>Custom Board</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.shortcutBtn, { backgroundColor: '#EFF6FF' }]}
          onPress={() => navigation.navigate(ROUTES.EMOTION)}
        >
          <Text style={styles.shortcutIcon}>🎭</Text>
          <Text style={styles.shortcutLabel}>Mood Check</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.shortcutBtn, { backgroundColor: '#FEF2F2' }]}
          onPress={() => navigation.navigate(ROUTES.QUICK_COMMUNICATION)}
        >
          <Text style={styles.shortcutIcon}>🚨</Text>
          <Text style={styles.shortcutLabel}>Quick Needs</Text>
        </TouchableOpacity>
      </View>
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
  historyBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyIcon: {
    fontSize: 18,
  },
  speakingBanner: {
    backgroundColor: '#1E293B',
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  speakingText: {
    color: '#38BDF8',
    fontWeight: '800',
    fontSize: 16,
  },
  phraseBarContainer: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  phraseList: {
    alignItems: 'center',
    paddingVertical: 4,
    minHeight: 50,
  },
  phrasePlaceholder: {
    color: '#94A3B8',
    fontSize: 12,
    fontStyle: 'italic',
  },
  phraseChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  chipEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '800',
  },
  phraseActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 10,
  },
  speakBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  clearBtn: {
    backgroundColor: '#64748B',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  categoryContainer: {
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  categoryList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  categoryTabActive: {
    backgroundColor: '#2563EB',
  },
  categoryTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  categoryTabTextActive: {
    color: '#FFFFFF',
  },
  gridContent: {
    padding: 16,
  },
  gridRow: {
    justifyContent: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  vocabCard: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  cardEmoji: {
    fontSize: 32,
    marginBottom: 6,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  bottomTabShortcuts: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'space-around',
    gap: 10,
  },
  shortcutBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  shortcutIcon: {
    fontSize: 16,
  },
  shortcutLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#334155',
  },
});
