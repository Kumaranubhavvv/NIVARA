import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
  SafeAreaView,
  Modal,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
const GRID_COLUMNS = width > 768 ? 5 : 3;

const INITIAL_BOARD = [
  { id: 'c1', label: 'More', emoji: '➕', color: '#ECFDF5', textColor: '#065F46' },
  { id: 'c2', label: 'Finished', emoji: '🏁', color: '#FEE2E2', textColor: '#991B1B' },
  { id: 'c3', label: 'Wash hands', emoji: '🧼', color: '#EFF6FF', textColor: '#1E40AF' },
  { id: 'c4', label: 'Bathroom', emoji: '🚽', color: '#F0FDF4', textColor: '#166534' },
  { id: 'c5', label: 'All done', emoji: '✨', color: '#F5F3FF', textColor: '#5B21B6' },
];

export default function AACScreen({ navigation }) {
  const [board, setBoard] = useState(INITIAL_BOARD);
  const [phrase, setPhrase] = useState([]);
  const [speakingText, setSpeakingText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  // Form states for custom card creator
  const [newLabel, setNewLabel] = useState('');
  const [newEmoji, setNewEmoji] = useState('💬');

  const handleSelectWord = (word) => {
    setPhrase((prev) => [...prev, word]);
    speak(word.label);
  };

  const speak = (text) => {
    setSpeakingText(text);
    setTimeout(() => setSpeakingText(''), 1500);
  };

  const speakFull = () => {
    if (phrase.length === 0) return;
    const text = phrase.map((w) => w.label).join(' ');
    speak(text);
  };

  const handleAddCard = () => {
    if (!newLabel.trim()) return;
    const randomColors = [
      { color: '#EFF6FF', textColor: '#1E40AF' },
      { color: '#FEF3C7', textColor: '#92400E' },
      { color: '#ECFDF5', textColor: '#065F46' },
      { color: '#F5F3FF', textColor: '#5B21B6' },
    ];
    const picked = randomColors[Math.floor(Math.random() * randomColors.length)];
    const card = {
      id: `custom-${Date.now()}`,
      label: newLabel,
      emoji: newEmoji,
      ...picked,
    };
    setBoard((prev) => [...prev, card]);
    setNewLabel('');
    setNewEmoji('💬');
    setModalVisible(false);
  };

  const handleDeleteCard = (id) => {
    setBoard((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Custom AAC Board</Text>
          <Text style={styles.headerSubtitle}>Personalize visual tiles and actions</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>➕ Add</Text>
        </TouchableOpacity>
      </View>

      {/* SPEAK SPEAKER */}
      {speakingText ? (
        <View style={styles.speakBanner}>
          <Text style={styles.speakText}>🔊 "{speakingText}"</Text>
        </View>
      ) : null}

      {/* PHRASE STRIP */}
      <View style={styles.phraseContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.phraseScroll}>
          {phrase.length === 0 ? (
            <Text style={styles.placeholder}>Sentence queue is empty...</Text>
          ) : (
            phrase.map((item, index) => (
              <View key={`${item.id}-${index}`} style={[styles.chip, { backgroundColor: item.color }]}>
                <Text style={styles.chipEmoji}>{item.emoji}</Text>
                <Text style={[styles.chipLabel, { color: item.textColor }]}>{item.label}</Text>
              </View>
            ))
          )}
        </ScrollView>
        {phrase.length > 0 && (
          <View style={styles.phraseButtons}>
            <TouchableOpacity style={styles.actionBtnSpeak} onPress={speakFull}>
              <Text style={styles.btnText}>Speak</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtnClear} onPress={() => setPhrase([])}>
              <Text style={styles.btnText}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* BOARD CARDS LIST */}
      <FlatList
        data={board}
        renderItem={({ item }) => (
          <View style={[styles.cardWrapper, { backgroundColor: item.color }]}>
            {item.id.startsWith('custom-') && (
              <TouchableOpacity style={styles.deleteBadge} onPress={() => handleDeleteCard(item.id)}>
                <Text style={styles.deleteBadgeText}>✕</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.cardTouch}
              onPress={() => handleSelectWord(item)}
              activeOpacity={0.8}
            >
              <Text style={styles.cardEmoji}>{item.emoji}</Text>
              <Text style={[styles.cardLabel, { color: item.textColor }]}>{item.label}</Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item) => item.id}
        numColumns={GRID_COLUMNS}
        key={GRID_COLUMNS}
        contentContainerStyle={styles.gridContainer}
        columnWrapperStyle={styles.gridRow}
      />

      {/* ADD CARD MODAL */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Custom Tile</Text>
            <TextInput
              style={styles.input}
              placeholder="Tile Label (e.g. Toilet, Apple)"
              value={newLabel}
              onChangeText={setNewLabel}
              placeholderTextColor="#94A3B8"
            />
            <Text style={styles.sectionLabel}>Select Emoji Symbol:</Text>
            <View style={styles.emojiRow}>
              {['🥛', '🍎', '🧩', '🎨', '🚶‍♂️', '🛌', '🛀', '🧸'].map((em) => (
                <TouchableOpacity
                  key={em}
                  style={[styles.emojiPick, newEmoji === em && styles.emojiPickActive]}
                  onPress={() => setNewEmoji(em)}
                >
                  <Text style={styles.emojiText}>{em}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleAddCard}>
                <Text style={styles.modalBtnText}>Add Tile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalBtnTextCancel}>Cancel</Text>
              </TouchableOpacity>
            </View>
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
  addBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  speakBanner: {
    backgroundColor: '#1E293B',
    paddingVertical: 10,
    alignItems: 'center',
  },
  speakText: {
    color: '#10B981',
    fontWeight: '800',
    fontSize: 15,
  },
  phraseContainer: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  phraseScroll: {
    alignItems: 'center',
    minHeight: 50,
  },
  placeholder: {
    color: '#94A3B8',
    fontStyle: 'italic',
    fontSize: 12,
  },
  chip: {
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
  chipLabel: {
    fontSize: 12,
    fontWeight: '800',
  },
  phraseButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 10,
  },
  actionBtnSpeak: {
    backgroundColor: '#10B981',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  actionBtnClear: {
    backgroundColor: '#64748B',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  gridContainer: {
    padding: 16,
  },
  gridRow: {
    justifyContent: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  cardWrapper: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    position: 'relative',
  },
  deleteBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#EF4444',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  deleteBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  cardTouch: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
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
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 10,
  },
  emojiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  emojiPick: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiPickActive: {
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#D1FAE5',
  },
  emojiText: {
    fontSize: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  modalBtnTextCancel: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
  },
});
