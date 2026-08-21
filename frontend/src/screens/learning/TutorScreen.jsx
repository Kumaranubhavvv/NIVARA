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

const PRESETS = [
  { id: 'p1', question: 'Tell me a social story about sharing.', icon: '🧸' },
  { id: 'p2', question: 'How do I stay calm in a loud place?', icon: '🔊' },
  { id: 'p3', question: 'Let’s play a color matching game!', icon: '🎨' },
];

const NIVI_RESPONSES = {
  'p1': 'Once upon a time, Leo and his friend had one toy train. Leo shared the train, and they both had double the fun! Sharing makes friends smile. 😊',
  'p2': 'If it gets too loud, you can take 3 deep slow breaths, put on your soft headphones, or ask your caregiver: "Can we find a quiet space?" You are safe! 🎧',
  'p3': 'Great! What color is a sweet red apple? Is it Red 🍎, Green 🍏, or Blue 🔵? Tap your answer or tell me!',
};

export default function TutorScreen({ navigation }) {
  const [messages, setMessages] = useState([
    { id: 'm1', text: 'Hello! I am Nivi the AI Owl tutor. What would you like to practice today?', isOwn: false },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSelectPrompt = (preset) => {
    // 1. Add user message
    const userMsg = { id: `u-${Date.now()}`, text: `${preset.icon} ${preset.question}`, isOwn: true };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    // 2. Simulate Nivi typing and responding
    setTimeout(() => {
      const responseText = NIVI_RESPONSES[preset.id] || 'That sounds interesting! Let us learn more together.';
      const niviMsg = { id: `n-${Date.now()}`, text: `🦉 ${responseText}`, isOwn: false };
      setMessages((prev) => [...prev, niviMsg]);
      setLoading(false);
    }, 1200);
  };

  const renderMessageItem = ({ item }) => (
    <View style={[styles.msgContainer, item.isOwn ? styles.msgOwn : styles.msgNivi]}>
      <View style={[styles.bubble, item.isOwn ? styles.bubbleOwn : styles.bubbleNivi]}>
        <Text style={[styles.msgText, item.isOwn ? styles.msgTextOwn : styles.msgTextNivi]}>
          {item.text}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Nivi the Tutor Owl</Text>
          <Text style={styles.headerSubtitle}>AI Learning & Social Stories Assistant</Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      {/* MESSAGES LIST */}
      <FlatList
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatContent}
        ListFooterComponent={
          loading ? (
            <View style={styles.typingContainer}>
              <Text style={styles.typingText}>🦉 Nivi is thinking...</Text>
            </View>
          ) : null
        }
      />

      {/* PRESET PROMPTS PANELS */}
      <View style={styles.presetsPanel}>
        <Text style={styles.presetsHeader}>TAP A QUESTION FOR NIVI:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsScroll}>
          {PRESETS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.presetCard}
              onPress={() => handleSelectPrompt(item)}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.presetIcon}>{item.icon}</Text>
              <Text style={styles.presetText} numberOfLines={2}>{item.question}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
  chatContent: {
    padding: 20,
    gap: 12,
  },
  msgContainer: {
    flexDirection: 'row',
    width: '100%',
    marginVertical: 4,
  },
  msgOwn: {
    justifyContent: 'flex-end',
  },
  msgNivi: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
  },
  bubbleOwn: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  bubbleNivi: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  msgText: {
    fontSize: 13,
    lineHeight: 18,
  },
  msgTextOwn: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  msgTextNivi: {
    color: '#0F172A',
    fontWeight: '800',
  },
  typingContainer: {
    padding: 8,
    marginLeft: 8,
  },
  typingText: {
    fontSize: 11,
    color: '#64748B',
    fontStyle: 'italic',
  },
  presetsPanel: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  presetsHeader: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  presetsScroll: {
    gap: 10,
  },
  presetCard: {
    width: 140,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetIcon: {
    fontSize: 22,
    marginBottom: 6,
  },
  presetText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#334155',
    textAlign: 'center',
    lineHeight: 13,
  },
});
