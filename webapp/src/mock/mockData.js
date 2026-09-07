// ==========================================================================
// NIVARA High-Fidelity Domain Mock Data & Live Fallback
// Aligned with FastAPI backend models
// ==========================================================================

export const mockChild = {
  id: 'child-aarav-01',
  name: 'Aarav Sharma',
  age: 7,
  diagnosis: 'Autism Spectrum (Level 1) & Auditory Sensitivity',
  avatar: '👦🏽',
  status: 'SAFE',
  currentZone: 'Greenwood Elementary School',
  location: {
    latitude: 28.6139,
    longitude: 77.2090,
    address: 'Greenwood Elementary, Sector 14, New Delhi',
    updatedAt: 'Just now',
    accuracy: '4.2 meters',
  },
  telemetry: {
    battery: 92,
    batteryCharging: false,
    bleConnected: true,
    gpsActive: true,
    heartRate: 78,
    separationDistance: 4.2, // meters
    thresholdDistance: 15.0, // meters
    lastSync: '2 seconds ago',
  },
};

export const mockSafeZones = [
  {
    id: 'sz-1',
    name: 'Home Sanctuary',
    type: 'HOME',
    color: '#10B981',
    radius: 120, // meters
    address: 'B-402, Lotus Greens, New Delhi',
    status: 'ACTIVE',
    containment: 'OUTSIDE',
  },
  {
    id: 'sz-2',
    name: 'Greenwood Elementary School',
    type: 'SCHOOL',
    color: '#38BDF8',
    radius: 300,
    address: 'Block C, Greenwood Campus',
    status: 'ACTIVE',
    containment: 'INSIDE', // Aarav is currently here!
  },
  {
    id: 'sz-3',
    name: 'Bluebell Pediatric Therapy',
    type: 'CLINIC',
    color: '#A855F7',
    radius: 150,
    address: 'Suite 201, Harmony Medical Plaza',
    status: 'ACTIVE',
    containment: 'OUTSIDE',
  },
  {
    id: 'sz-4',
    name: 'Central Eco Nature Park',
    type: 'PARK',
    color: '#F59E0B',
    radius: 250,
    address: 'Heritage Park, Main Boulevard',
    status: 'ACTIVE',
    containment: 'OUTSIDE',
  },
];

export const mockEmergencyContacts = [
  { id: 'ec-1', name: 'Dr. Meera Sharma', relation: 'Mother (Primary)', phone: '+91 98765 43210', priority: 1, active: true },
  { id: 'ec-2', name: 'Rohit Sharma', relation: 'Father', phone: '+91 98765 43211', priority: 2, active: true },
  { id: 'ec-3', name: 'Ms. Sunita Roy', relation: 'Special Educator', phone: '+91 98765 43212', priority: 3, active: true },
  { id: 'ec-4', name: 'Emergency Services (112)', relation: 'Paramedics & Police', phone: '112', priority: 4, active: true },
];

export const mockAacCategories = [
  { id: 'needs', label: 'Basic Needs', icon: '🤲' },
  { id: 'emotions', label: 'Feelings', icon: '😊' },
  { id: 'food', label: 'Food & Drink', icon: '🍎' },
  { id: 'activities', label: 'Activities', icon: '🎨' },
  { id: 'places', label: 'Places', icon: '🏫' },
  { id: 'phrases', label: 'Quick Phrases', icon: '💬' },
];

export const mockAacCards = [
  // Basic Needs
  { id: 'c1', category: 'needs', label: 'I want water', icon: '💧', speech: 'I want water please' },
  { id: 'c2', category: 'needs', label: 'I am hungry', icon: '🥪', speech: 'I am hungry, I want to eat' },
  { id: 'c3', category: 'needs', label: 'Washroom / Toilet', icon: '🚻', speech: 'I need to go to the washroom' },
  { id: 'c4', category: 'needs', label: 'Help me', icon: '🆘', speech: 'Please help me' },
  { id: 'c5', category: 'needs', label: 'Too Loud / Break', icon: '🎧', speech: 'It is too loud, I need a quiet break' },
  { id: 'c6', category: 'needs', label: 'I am tired', icon: '🛌', speech: 'I am tired, I want to rest' },

  // Emotions
  { id: 'c7', category: 'emotions', label: 'Happy', icon: '😄', speech: 'I feel happy' },
  { id: 'c8', category: 'emotions', label: 'Calm', icon: '😌', speech: 'I feel calm and peaceful' },
  { id: 'c9', category: 'emotions', label: 'Overwhelmed', icon: '😵‍💫', speech: 'I feel overwhelmed and need calm' },
  { id: 'c10', category: 'emotions', label: 'Frustrated', icon: '😤', speech: 'I feel frustrated right now' },
  { id: 'c11', category: 'emotions', label: 'Sad', icon: '😢', speech: 'I feel sad' },
  { id: 'c12', category: 'emotions', label: 'Excited', icon: '🤩', speech: 'I am excited!' },

  // Food & Drink
  { id: 'c13', category: 'food', label: 'Apple Slice', icon: '🍏', speech: 'Can I have an apple slice' },
  { id: 'c14', category: 'food', label: 'Warm Milk', icon: '🥛', speech: 'I want warm milk' },
  { id: 'c15', category: 'food', label: 'Crunchy Snack', icon: '🥨', speech: 'I want a crunchy snack' },
  { id: 'c16', category: 'food', label: 'Rice & Dal', icon: '🍚', speech: 'I would like rice and dal' },
  { id: 'c17', category: 'food', label: 'Banana', icon: '🍌', speech: 'I want a banana' },
  { id: 'c18', category: 'food', label: 'Done eating', icon: '🍽️', speech: 'I am done eating' },

  // Activities
  { id: 'c19', category: 'activities', label: 'Play Drawing', icon: '🎨', speech: 'I want to draw with colors' },
  { id: 'c20', category: 'activities', label: 'Lego Bricks', icon: '🧱', speech: 'I want to build with Lego blocks' },
  { id: 'c21', category: 'activities', label: 'Listen to Music', icon: '🎵', speech: 'Can we listen to gentle music' },
  { id: 'c22', category: 'activities', label: 'Read Story', icon: '📖', speech: 'Please read a story book with me' },
  { id: 'c23', category: 'activities', label: 'Outdoor Walk', icon: '🌳', speech: 'I want to go for an outdoor walk' },
  { id: 'c24', category: 'activities', label: 'Sensory Swing', icon: '🪑', speech: 'I want to relax on the sensory swing' },

  // Places
  { id: 'c25', category: 'places', label: 'Go Home', icon: '🏠', speech: 'I want to go home now' },
  { id: 'c26', category: 'places', label: 'School', icon: '🏫', speech: 'We are going to school' },
  { id: 'c27', category: 'places', label: 'Therapy Room', icon: '🧸', speech: 'Time for therapy session' },
  { id: 'c28', category: 'places', label: 'Playground', icon: '🛝', speech: 'Let us go to the playground' },

  // Quick Phrases
  { id: 'c29', category: 'phrases', label: 'Yes', icon: '👍', speech: 'Yes' },
  { id: 'c30', category: 'phrases', label: 'No thank you', icon: '👎', speech: 'No thank you' },
  { id: 'c31', category: 'phrases', label: 'I like this', icon: '❤️', speech: 'I really like this' },
  { id: 'c32', category: 'phrases', label: 'Wait please', icon: '✋', speech: 'Please wait a moment' },
  { id: 'c33', category: 'phrases', label: 'Thank you', icon: '🙏', speech: 'Thank you very much' },
  { id: 'c34', category: 'phrases', label: 'All done', icon: '✨', speech: 'All done!' },
];

export const mockRoutines = {
  morning: [
    { id: 'm1', title: 'Wake up with gentle sunlight', icon: '☀️', completed: true, points: 10 },
    { id: 'm2', title: 'Brush teeth for 2 minutes', icon: '🪥', completed: true, points: 15 },
    { id: 'm3', title: 'Put on school uniform', icon: '👕', completed: true, points: 15 },
    { id: 'm4', title: 'Healthy sensory breakfast', icon: '🥣', completed: false, points: 20 },
    { id: 'm5', title: 'Put on GPS SmartBand', icon: '⌚', completed: false, points: 10 },
  ],
  afternoon: [
    { id: 'a1', title: 'Transition from school bus to home', icon: '🚌', completed: false, points: 10 },
    { id: 'a2', title: 'Sensory quiet time (15 mins)', icon: '🎧', completed: false, points: 15 },
    { id: 'a3', title: 'Nutritious snack & hydration', icon: '🍎', completed: false, points: 10 },
    { id: 'a4', title: 'Visual homework & puzzles', icon: '🧩', completed: false, points: 25 },
  ],
  evening: [
    { id: 'e1', title: 'Tidy up toys in color bins', icon: '🧸', completed: false, points: 15 },
    { id: 'e2', title: 'Warm calming bath', icon: '🛁', completed: false, points: 20 },
    { id: 'e3', title: 'Bedtime social story', icon: '📚', completed: false, points: 15 },
    { id: 'e4', title: 'Deep pressure blanket & sleep', icon: '🌙', completed: false, points: 20 },
  ],
};

export const mockCommunityFeed = [
  {
    id: 'post-101',
    author: {
      name: 'Dr. Sarah Mitchell, OTR/L',
      role: 'Occupational Therapist',
      avatar: '👩‍⚕️',
      verified: true,
    },
    tag: 'Sensory Regulation',
    title: 'Managing Auditory Sensory Overload in Public Malls & Supermarkets',
    content: 'Noise-canceling headphones combined with a predictable visual countdown card reduced sensory overwhelm meltdowns by 85% in our clinical cohort. What visual schedule apps are you all pairing with your outdoor visits?',
    timestamp: '28 mins ago',
    likes: 42,
    comments: 17,
    saved: true,
  },
  {
    id: 'post-102',
    author: {
      name: 'Vikram Joshi',
      role: 'Parent of 8yo with ASD',
      avatar: '👨‍💼',
      verified: false,
    },
    tag: 'Daily Routine',
    title: 'Visual morning checklists helped us stop the morning rush stress',
    content: 'Before Nivara routines, mornings used to take 2 hours with tears. Now Aarav checks off his own teeth brushing and bag packing to earn star tokens. Sharing our 5-step visual board here for anyone struggling with school prep!',
    timestamp: '2 hours ago',
    likes: 67,
    comments: 24,
    saved: false,
  },
  {
    id: 'post-103',
    author: {
      name: 'Ananya Deshmukh, SLP',
      role: 'Speech & Language Pathologist',
      avatar: '👩‍🏫',
      verified: true,
    },
    tag: 'AAC & Speech',
    title: 'Sentence strip modeling tips for non-verbal and emerging communicators',
    content: 'When using the AAC board, tap the card and speak the sentence aloud at normal conversational speed. Multi-modal reinforcement creates stronger motor and neural speech connections.',
    timestamp: '5 hours ago',
    likes: 91,
    comments: 31,
    saved: true,
  },
];
