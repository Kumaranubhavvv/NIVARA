import React, { useState } from 'react';
import { 
  Volume2, 
  Trash2, 
  Play, 
  Sparkles, 
  Search, 
  Smile, 
  HeartHandshake,
  RotateCcw
} from 'lucide-react';
import { speechService } from '../services/speechService';
import { audioService } from '../services/audioService';
import { mockAacCategories, mockAacCards } from '../mock/mockData';

export default function AacView() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sentenceStrip, setSentenceStrip] = useState([]);
  const [speakingIndex, setSpeakingIndex] = useState(-1);
  const [currentEmotionFeedback, setCurrentEmotionFeedback] = useState(null);

  // Filter cards by category and search
  const filteredCards = mockAacCards.filter((card) => {
    const matchesCat = selectedCategory === 'all' || card.category === selectedCategory;
    const matchesSearch = !searchQuery || card.label.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Tap a card: Speaks immediately and appends to sentence strip
  const handleCardClick = (card) => {
    audioService.playClick();
    speechService.speak(card.speech || card.label);
    setSentenceStrip((prev) => [...prev, card]);
  };

  // Speak full sentence strip
  const handleSpeakSentence = () => {
    if (sentenceStrip.length === 0) return;
    const fullText = sentenceStrip.map((c) => c.speech || c.label).join(', ');

    audioService.playClick();
    speechService.speak(
      fullText,
      (charIdx) => {
        // approximate word highlighting
      },
      () => {
        setSpeakingIndex(-1);
      }
    );
  };

  const handleClearStrip = () => {
    audioService.playClick();
    setSentenceStrip([]);
    setSpeakingIndex(-1);
  };

  const handleEmotionCheckIn = (emotion) => {
    audioService.playSuccessChime();
    speechService.speak(`I feel ${emotion.name}. ${emotion.advice}`);
    setCurrentEmotionFeedback(emotion);
  };

  const emotionsList = [
    { name: 'Happy', emoji: '😄', color: '#10B981', advice: 'Great to see! Keep doing what brings you joy today.' },
    { name: 'Calm', emoji: '😌', color: '#38BDF8', advice: 'Peaceful body and mind. A great time for learning or resting.' },
    { name: 'Overwhelmed', emoji: '😵‍💫', color: '#A855F7', advice: 'Let us take 3 deep breaths and put on noise-cancelling headphones.' },
    { name: 'Frustrated', emoji: '😤', color: '#F59E0B', advice: 'It is okay to feel angry. Take a pause and ask for a quick break.' },
    { name: 'Sad', emoji: '😢', color: '#6366F1', advice: 'Caregivers are right here for you. We can hold a soft plush toy.' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header Banner */}
      <div className="section-header">
        <div>
          <h2 className="section-title">AAC Augmentative Speech Communicator</h2>
          <p className="section-subtitle">
            Visual picture grid with natural voice synthesizer and multi-word sentence builder
          </p>
        </div>
      </div>

      {/* Sentence Strip Builder */}
      <div className="sentence-strip-container glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Volume2 size={22} color="var(--accent-primary)" />
          <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Sentence Strip
          </span>
        </div>

        <div className="sentence-tiles-wrapper">
          {sentenceStrip.length === 0 ? (
            <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontStyle: 'italic' }}>
              Tap any picture card below to build a spoken message...
            </span>
          ) : (
            sentenceStrip.map((card, idx) => (
              <div 
                key={idx} 
                className={`aac-strip-pill ${speakingIndex === idx ? 'speaking' : ''}`}
              >
                <span>{card.icon}</span>
                <span>{card.label}</span>
              </div>
            ))
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleSpeakSentence}
            disabled={sentenceStrip.length === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: sentenceStrip.length > 0 ? 'var(--gradient-brand)' : 'var(--bg-tertiary)',
              color: 'white',
              padding: '10px 18px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: '800',
              fontSize: '13px',
              boxShadow: sentenceStrip.length > 0 ? 'var(--shadow-glow)' : 'none',
              opacity: sentenceStrip.length > 0 ? 1 : 0.4,
              cursor: sentenceStrip.length > 0 ? 'pointer' : 'not-allowed',
            }}
          >
            <Play size={16} fill="white" />
            Speak Sentence
          </button>
          <button
            onClick={handleClearStrip}
            disabled={sentenceStrip.length === 0}
            style={{
              padding: '10px 14px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-secondary)',
              cursor: sentenceStrip.length > 0 ? 'pointer' : 'not-allowed',
              opacity: sentenceStrip.length > 0 ? 1 : 0.4,
            }}
            title="Clear strip"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Category Tabs & Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              audioService.playClick();
              setSelectedCategory('all');
            }}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              fontSize: '13px',
              fontWeight: '700',
              background: selectedCategory === 'all' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
              color: selectedCategory === 'all' ? 'white' : 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            🌟 All Picture Cards
          </button>
          {mockAacCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                audioService.playClick();
                setSelectedCategory(cat.id);
              }}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                fontSize: '13px',
                fontWeight: '700',
                background: selectedCategory === cat.id ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: selectedCategory === cat.id ? 'white' : 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Search input */}
        <div style={{ position: 'relative', width: '220px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search words..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: 'var(--radius-full)',
              fontSize: '13px',
              background: 'var(--bg-tertiary)',
            }}
          />
        </div>
      </div>

      {/* AAC Picture Cards Grid */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))', 
          gap: '16px', 
          marginBottom: '32px' 
        }}
      >
        {filteredCards.map((card) => (
          <div
            key={card.id}
            className="aac-tile"
            onClick={() => handleCardClick(card)}
          >
            <span className="aac-tile-icon">{card.icon}</span>
            <span className="aac-tile-label">{card.label}</span>
          </div>
        ))}
      </div>

      {/* Emotion Check-in Matrix */}
      <div className="glass-card" style={{ marginTop: '16px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Smile size={20} color="var(--accent-cyan)" />
          <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Child Emotion Check-in Matrix</h3>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {emotionsList.map((emo) => (
            <button
              key={emo.name}
              onClick={() => handleEmotionCheckIn(emo)}
              style={{
                flex: '1',
                minWidth: '130px',
                padding: '14px',
                borderRadius: 'var(--radius-sm)',
                background: currentEmotionFeedback?.name === emo.name ? emo.color : 'var(--bg-tertiary)',
                color: currentEmotionFeedback?.name === emo.name ? 'white' : 'var(--text-primary)',
                border: `1px solid ${emo.color}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{ fontSize: '28px' }}>{emo.emoji}</span>
              <strong style={{ fontSize: '14px' }}>{emo.name}</strong>
            </button>
          ))}
        </div>

        {currentEmotionFeedback && (
          <div 
            className="animate-fade-in"
            style={{ 
              background: 'rgba(255,255,255,0.05)', 
              padding: '14px 20px', 
              borderRadius: 'var(--radius-sm)',
              borderLeft: `4px solid ${currentEmotionFeedback.color}`,
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <HeartHandshake size={22} color={currentEmotionFeedback.color} />
            <div>
              <strong style={{ color: currentEmotionFeedback.color }}>{currentEmotionFeedback.name} Response: </strong>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{currentEmotionFeedback.advice}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
