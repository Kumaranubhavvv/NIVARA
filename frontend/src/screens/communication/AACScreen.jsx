import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useCommunication } from '../../hooks/useCommunication';
import SentenceStrip from '../../components/communication/SentenceStrip';
import AACGrid from '../../components/communication/AACGrid';
import useResponsive from '../../theme/responsive';

export default function AACScreen({ navigation }) {
  const { isMobile, gutter, clampFont } = useResponsive();
  const {
    categories,
    selectedCategory,
    setSelectedCategory,
    sentenceTokens,
    generatedSentence,
    addToken,
    removeToken,
    clearTokens,
    speakSentence,
    saveCurrentPhrase,
    speaking,
    loading,
  } = useCommunication();

  const activeCat = categories.find((c) => c.name === selectedCategory) || categories[0];
  const activeCards = activeCat?.cards || [];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 1. TOP HEADER BRANDING */}
      <View style={styles.topHeader}>
        <View style={[styles.topHeaderInner, { paddingHorizontal: gutter }]}>
          <TouchableOpacity
            style={styles.brandRow}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.8}
          >
            <View style={styles.avatarBox}>
              <Text style={styles.avatarEmoji}>🧒</Text>
            </View>
            <Text style={styles.brandTitle}>NIVARA</Text>
          </TouchableOpacity>

          <View style={styles.aiBadge}>
            <Text style={styles.aiBadgeText}>AI ACTIVE</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={[styles.mainScrollContent, { paddingHorizontal: gutter }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. SCREEN TITLE & INTRO */}
        <View style={styles.titleSection}>
          <Text style={[styles.mainTitle, { fontSize: clampFont(22, 26, 28) }]}>
            Picture Communication
          </Text>
          <Text style={styles.subtitle}>
            Tap picture cards to build phrases and communicate.
          </Text>
        </View>

        {/* 3. BUILD YOUR SENTENCE CARD */}
        <SentenceStrip
          tokens={sentenceTokens}
          onRemoveToken={removeToken}
          onClear={clearTokens}
          onSave={saveCurrentPhrase}
          onSpeak={() => speakSentence()}
          speaking={speaking}
          generatedSentence={generatedSentence}
        />

        {/* 4. CATEGORIES SELECTOR */}
        <Text style={styles.categoriesHeader}>CATEGORIES</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScrollContent}
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <TouchableOpacity
                key={cat.id || cat.name}
                style={[
                  styles.categoryPill,
                  isSelected && styles.categoryPillActive,
                ]}
                onPress={() => setSelectedCategory(cat.name)}
                activeOpacity={0.8}
              >
                <Text style={styles.categoryIcon}>{cat.icon || '⭐'}</Text>
                <Text
                  style={[
                    styles.categoryText,
                    isSelected && styles.categoryTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 5. AAC PICTURE CARDS GRID */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Loading picture symbols...</Text>
          </View>
        ) : (
          <AACGrid cards={activeCards} onSelectCard={addToken} />
        )}
      </ScrollView>

      {/* 6. BOTTOM NAVIGATION BAR */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.7}
        >
          <Text style={styles.navEmoji}>🏠</Text>
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('CommunicationTab')}
          activeOpacity={0.7}
        >
          <Text style={styles.navEmoji}>💬</Text>
          <Text style={[styles.navLabel, styles.navLabelActive]}>Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('LearningTab')}
          activeOpacity={0.7}
        >
          <Text style={styles.navEmoji}>🎓</Text>
          <Text style={styles.navLabel}>Learn</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('CaregiverDashboard')}
          activeOpacity={0.7}
        >
          <Text style={styles.navEmoji}>🛡️</Text>
          <Text style={styles.navLabel}>Safety</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topHeader: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  topHeaderInner: {
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 20,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 1.5,
  },
  aiBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  aiBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1D4ED8',
    letterSpacing: 0.5,
  },
  mainScroll: {
    flex: 1,
  },
  mainScrollContent: {
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
    paddingVertical: 20,
    paddingBottom: 40,
  },
  titleSection: {
    marginBottom: 16,
  },
  mainTitle: {
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  categoriesHeader: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.8,
    marginTop: 10,
    marginBottom: 10,
  },
  categoriesScrollContent: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 16,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryPillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryIcon: {
    fontSize: 15,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#334155',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  loadingBox: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#64748B',
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: 44,
  },
  navEmoji: {
    fontSize: 18,
    marginBottom: 2,
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  navLabelActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
});
