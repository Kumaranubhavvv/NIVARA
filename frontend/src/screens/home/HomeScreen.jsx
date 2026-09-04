import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useSafety } from '../../hooks/useSafety';
import { useLocation } from '../../hooks/useLocation';
import { dashboardApi } from '../../services/api/dashboardApi';
import { communityApi } from '../../services/api/communityApi';
import Avatar from '../../components/common/Avatar';
import StatusIndicator from '../../components/common/StatusIndicator';
import ConfirmModal from '../../components/common/ConfirmModal';
import useResponsive from '../../theme/responsive';
import { useFadeSlideIn, usePulseAnimation } from '../../utils/animations';

export default function HomeScreen({ navigation }) {
  const { isMobile, isTablet, isLaptop, isDesktop, gutter, clampFont } = useResponsive();
  const { user, logout } = useAuthStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const leftColumnAnim = useFadeSlideIn(80, 16, 450);
  const rightColumnAnim = useFadeSlideIn(200, 16, 450);
  const sosPulseAnim = usePulseAnimation(0.96, 1.05, 1800);

  const {
    childName,
    childAge,
    isSafe,
    currentZone,
    batteryLevel,
    gpsStatus,
    bleConnected,
    separationDistance,
    isEmergencyActive,
    triggerEmergency,
    safetyEvents,
  } = useSafety();

  const { currentLocation } = useLocation();

  const [communityPosts, setCommunityPosts] = useState([]);
  const [communityStats, setCommunityStats] = useState({
    my_groups: 3,
    new_messages: 2,
    notifications: 4,
    community_online: 128,
  });
  const [loadingCommunity, setLoadingCommunity] = useState(true);
  const [sosModalVisible, setSosModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('HOME');

  useEffect(() => {
    loadCommunitySummary();
  }, []);

  const loadCommunitySummary = async () => {
    setLoadingCommunity(true);
    try {
      const data = await dashboardApi.getDashboardData();
      if (data && Array.isArray(data.feed)) {
        setCommunityPosts(data.feed.slice(0, 3));
      } else {
        const feedData = await communityApi.getFeed(1, 3);
        if (feedData && Array.isArray(feedData.posts)) {
          setCommunityPosts(feedData.posts.slice(0, 3));
        }
      }
      if (data && data.stats) {
        setCommunityStats(data.stats);
      }
    } catch (e) {
      setCommunityPosts([
        {
          id: 'post-1',
          author_name: 'Dr. Sarah Mitchell',
          category: 'Sensory Support',
          content: 'Effective de-escalation strategies during auditory sensory overload in public spaces. What visual cues work best for your child?',
          like_count: 24,
          comment_count: 15,
          created_at: '25 mins ago',
        },
        {
          id: 'post-2',
          author_name: 'David Nguyen',
          category: 'Daily Routine',
          content: 'Free printable visual schedule templates for morning transitions before school. Shared in the resource library!',
          like_count: 38,
          comment_count: 9,
          created_at: '1 hour ago',
        },
      ]);
    } finally {
      setLoadingCommunity(false);
    }
  };

  const handleConfirmSOS = async () => {
    setSosModalVisible(false);
    await triggerEmergency({
      location: currentLocation,
      initiatedFrom: 'HomeDashboard',
    });
    navigation.navigate('Emergency');
  };

  const navigateToTab = (tabKey) => {
    setActiveTab(tabKey);
    setMobileMenuOpen(false);
    switch (tabKey) {
      case 'COMMUNITY':
        navigation.navigate('CommunityTab');
        break;
      case 'AAC':
        navigation.navigate('AAC');
        break;
      case 'LEARNING':
        navigation.navigate('LearningTab');
        break;
      case 'SENSORY':
        navigation.navigate('SensoryHome');
        break;
      case 'GAMES':
        navigation.navigate('GamesHome');
        break;
      case 'LOCATION':
        navigation.navigate('LiveLocation');
        break;
      case 'SAFETY':
        navigation.navigate('CaregiverDashboard');
        break;
      case 'PROFILE':
        navigation.navigate('ChildProfile');
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ========================================================= */}
      {/* 1. TOP RESPONSIVE NAVBAR                                  */}
      {/* ========================================================= */}
      <View style={styles.navbarWrapper}>
        <View style={[styles.navbarInner, { paddingHorizontal: gutter }]}>
          {/* Brand Logo & Name */}
          <View style={styles.brandRow}>
            <View style={styles.brandBadge}>
              <Text style={styles.sparkleIcon}>✦</Text>
            </View>
            <View>
              <Text style={styles.brandTitle}>NIVARA</Text>
              {!isMobile && (
                <Text style={styles.brandTagline}>Caregiver & Safety Portal</Text>
              )}
            </View>
          </View>

          {/* Desktop & Laptop Navigation Tabs */}
          {(isDesktop || isLaptop) && (
            <View style={styles.navTabsGroup}>
              <TouchableOpacity
                style={[styles.navTabItem, activeTab === 'HOME' && styles.navTabItemActive]}
                onPress={() => navigateToTab('HOME')}
              >
                <Text style={[styles.navTabLabel, activeTab === 'HOME' && styles.navTabLabelActive]}>
                  🏠 Dashboard
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.navTabItem, activeTab === 'LOCATION' && styles.navTabItemActive]}
                onPress={() => navigateToTab('LOCATION')}
              >
                <Text style={[styles.navTabLabel, activeTab === 'LOCATION' && styles.navTabLabelActive]}>
                  📍 Live GPS
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.navTabItem, activeTab === 'AAC' && styles.navTabItemActive]}
                onPress={() => navigateToTab('AAC')}
              >
                <Text style={[styles.navTabLabel, activeTab === 'AAC' && styles.navTabLabelActive]}>
                  🖼️ AAC Board
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.navTabItem, activeTab === 'LEARNING' && styles.navTabItemActive]}
                onPress={() => navigateToTab('LEARNING')}
              >
                <Text style={[styles.navTabLabel, activeTab === 'LEARNING' && styles.navTabLabelActive]}>
                  🎓 Routines
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.navTabItem, activeTab === 'COMMUNITY' && styles.navTabItemActive]}
                onPress={() => navigateToTab('COMMUNITY')}
              >
                <Text style={[styles.navTabLabel, activeTab === 'COMMUNITY' && styles.navTabLabelActive]}>
                  👥 Community
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.navTabItem, activeTab === 'SENSORY' && styles.navTabItemActive]}
                onPress={() => navigateToTab('SENSORY')}
              >
                <Text style={[styles.navTabLabel, activeTab === 'SENSORY' && styles.navTabLabelActive]}>
                  🎧 Sensory
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.navTabItem, activeTab === 'SAFETY' && styles.navTabItemActive]}
                onPress={() => navigateToTab('SAFETY')}
              >
                <Text style={[styles.navTabLabel, activeTab === 'SAFETY' && styles.navTabLabelActive]}>
                  🛡️ Safety
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Right Action Controls */}
          <View style={styles.navRightRow}>
            <Animated.View style={sosPulseAnim}>
              <TouchableOpacity
                style={styles.sosButton}
                onPress={() => setSosModalVisible(true)}
                activeOpacity={0.85}
              >
                <Text style={styles.sosButtonText}>
                  {isMobile ? '🚨 SOS' : '🚨 BROADCAST SOS'}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity
              style={styles.avatarButton}
              onPress={() => navigation.navigate('ChildProfile')}
              activeOpacity={0.85}
            >
              <Avatar name={user?.full_name || user?.name || 'Jordan Patel'} emoji="👩‍⚕️" size={isMobile ? 34 : 38} />
            </TouchableOpacity>

            {!isMobile ? (
              <TouchableOpacity
                style={styles.signOutBtn}
                onPress={logout}
                activeOpacity={0.8}
              >
                <Text style={styles.signOutText}>Sign Out</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.mobileHamburgerBtn}
                onPress={() => setMobileMenuOpen(!mobileMenuOpen)}
                activeOpacity={0.7}
              >
                <Text style={styles.mobileHamburgerIcon}>{mobileMenuOpen ? '✕' : '☰'}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Mobile Dropdown Menu for Top Navigation */}
        {isMobile && mobileMenuOpen && (
          <View style={[styles.mobileMenuDropdown, { paddingHorizontal: gutter }]}>
            <TouchableOpacity style={styles.mobileDropdownItem} onPress={() => navigateToTab('HOME')}>
              <Text style={styles.mobileDropdownText}>🏠 Home Dashboard</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mobileDropdownItem} onPress={() => navigateToTab('LOCATION')}>
              <Text style={styles.mobileDropdownText}>📍 Live GPS Tracking & Safe Zones</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mobileDropdownItem} onPress={() => navigateToTab('AAC')}>
              <Text style={styles.mobileDropdownText}>🖼️ AAC Picture Communication Board</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mobileDropdownItem} onPress={() => navigateToTab('LEARNING')}>
              <Text style={styles.mobileDropdownText}>🎓 Visual Routines & Daily Schedules</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mobileDropdownItem} onPress={() => navigateToTab('COMMUNITY')}>
              <Text style={styles.mobileDropdownText}>👥 Caregiver Peer Community</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mobileDropdownItem} onPress={() => navigateToTab('SENSORY')}>
              <Text style={styles.mobileDropdownText}>🎧 Sensory Regulation & Social Cues</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mobileDropdownItem} onPress={() => navigateToTab('SAFETY')}>
              <Text style={styles.mobileDropdownText}>🛡️ Caregiver Safety Center</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mobileSignOutItem} onPress={logout}>
              <Text style={styles.mobileSignOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ========================================================= */}
      {/* 2. MAIN DASHBOARD CONTENT                                 */}
      {/* ========================================================= */}
      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={[
          styles.mainScrollContent,
          { paddingHorizontal: gutter, paddingBottom: isMobile ? 80 : 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Active Emergency Alert Banner */}
        {isEmergencyActive && (
          <TouchableOpacity
            style={styles.emergencyBanner}
            onPress={() => navigation.navigate('Emergency')}
            activeOpacity={0.85}
          >
            <Text style={styles.emergencyIcon}>🚨</Text>
            <View style={styles.emergencyContent}>
              <Text style={styles.emergencyTitle}>EMERGENCY BROADCAST ACTIVE</Text>
              <Text style={styles.emergencySubtitle}>
                Coordinates and alerts broadcasted to caregivers • Tap for Emergency Response
              </Text>
            </View>
            <Text style={styles.emergencyArrow}>›</Text>
          </TouchableOpacity>
        )}

        {/* Dashboard Responsive Grid */}
        <View
          style={[
            styles.dashboardGrid,
            { flexDirection: isDesktop || isLaptop ? 'row' : 'column', gap: gutter },
          ]}
        >
          {/* ======================================================= */}
          {/* LEFT COLUMN: CHILD SAFETY & QUICK TOOLS                 */}
          {/* ======================================================= */}
          <Animated.View
            style={[
              styles.leftColumn,
              leftColumnAnim,
              { width: isDesktop || isLaptop ? '58%' : '100%' },
            ]}
          >
            {/* Welcome Greeting Banner */}
            <View style={styles.greetingCard}>
              <View style={styles.greetingDetails}>
                <Text style={[styles.greetingTitle, { fontSize: clampFont(18, 20, 22) }]}>
                  Welcome back, {user?.full_name?.split(' ')[0] || user?.name?.split(' ')[0] || 'Caregiver'} 👋
                </Text>
                <Text style={styles.greetingSubtitle}>
                  Monitoring {childName} (Age {childAge}) • System normal
                </Text>
              </View>
              <View style={styles.statusPill}>
                <StatusIndicator
                  status={isSafe ? 'safe' : 'danger'}
                  label={isSafe ? 'Child Safe' : 'Alert'}
                  size={10}
                />
              </View>
            </View>

            {/* Pillar 1: Child Safety & Live GPS Card */}
            <View style={styles.safetyCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIconBox}>
                  <Text style={styles.cardIconEmoji}>🛡️</Text>
                </View>
                <View style={styles.cardHeaderContent}>
                  <Text style={styles.cardHeaderTitle}>Child Safety & Live GPS</Text>
                  <Text style={styles.cardHeaderSubtext}>{childName} • Age {childAge} • Geofence Active</Text>
                </View>
                <View style={styles.safePillSmall}>
                  <Text style={styles.safePillSmallText}>🟢 {isSafe ? 'Safe' : 'Alert'}</Text>
                </View>
              </View>

              {/* Live Telemetry Matrix */}
              <View
                style={[
                  styles.telemetryMatrix,
                  { flexDirection: isMobile ? 'column' : 'row' },
                ]}
              >
                <View style={styles.telemetryTile}>
                  <Text style={styles.telemetryLabel}>CURRENT ZONE</Text>
                  <Text style={styles.telemetryValue}>{currentZone || 'Home Sanctuary'}</Text>
                  <Text style={styles.telemetryStatusActive}>Geofence Active</Text>
                </View>
                <View style={styles.telemetryTile}>
                  <Text style={styles.telemetryLabel}>GPS STATUS</Text>
                  <Text style={styles.telemetryValue}>✓ {gpsStatus || 'Connected'}</Text>
                  <Text style={styles.telemetryStatusActive}>±3.8m Accuracy</Text>
                </View>
                <View style={styles.telemetryTile}>
                  <Text style={styles.telemetryLabel}>SMARTBAND TETHER</Text>
                  <Text style={styles.telemetryValue}>
                    {bleConnected ? `Connected (${separationDistance}m)` : 'Connected (2.4m)'}
                  </Text>
                  <Text style={styles.telemetryStatusActive}>⚡ Battery {batteryLevel}%</Text>
                </View>
              </View>

              {/* Location Address Strip */}
              <View style={styles.addressStrip}>
                <Text style={styles.addressIcon}>📍</Text>
                <Text style={styles.addressText} numberOfLines={1}>
                  {currentLocation?.address || '123 Maple Street, Model Town, Ludhiana'}
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={[styles.cardButtonsRow, { flexDirection: isMobile ? 'column' : 'row' }]}>
                <TouchableOpacity
                  style={[styles.primaryActionBtn, { width: isMobile ? '100%' : 'auto', flex: isMobile ? undefined : 1 }]}
                  onPress={() => navigation.navigate('LiveLocation')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryActionText}>🗺️ View Live GPS Map</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.secondaryActionBtn, { width: isMobile ? '100%' : 'auto' }]}
                  onPress={() => navigation.navigate('CaregiverDashboard')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.secondaryActionText}>Safety Center ›</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick Actions Shortcuts Grid */}
            <View style={styles.quickToolsCard}>
              <Text style={styles.quickToolsHeader}>QUICK TOOLS & SHORTCUTS</Text>
              <View style={styles.quickToolsGrid}>
                <TouchableOpacity
                  style={styles.quickToolTile}
                  onPress={() => navigation.navigate('AAC')}
                  activeOpacity={0.85}
                >
                  <View style={[styles.toolIconBox, { backgroundColor: '#EFF6FF' }]}>
                    <Text style={styles.toolEmoji}>🖼️</Text>
                  </View>
                  <Text style={styles.toolLabel}>AAC Board</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickToolTile}
                  onPress={() => navigation.navigate('LearningTab')}
                  activeOpacity={0.85}
                >
                  <View style={[styles.toolIconBox, { backgroundColor: '#ECFDF5' }]}>
                    <Text style={styles.toolEmoji}>🎓</Text>
                  </View>
                  <Text style={styles.toolLabel}>Routines</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickToolTile}
                  onPress={() => navigation.navigate('LiveLocation')}
                  activeOpacity={0.85}
                >
                  <View style={[styles.toolIconBox, { backgroundColor: '#EFF6FF' }]}>
                    <Text style={styles.toolEmoji}>📍</Text>
                  </View>
                  <Text style={styles.toolLabel}>Live GPS</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickToolTile}
                  onPress={() => navigation.navigate('CommunityTab')}
                  activeOpacity={0.85}
                >
                  <View style={[styles.toolIconBox, { backgroundColor: '#FFFBEB' }]}>
                    <Text style={styles.toolEmoji}>💬</Text>
                  </View>
                  <Text style={styles.toolLabel}>Community</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickToolTile}
                  onPress={() => navigation.navigate('Tutor')}
                  activeOpacity={0.85}
                >
                  <View style={[styles.toolIconBox, { backgroundColor: '#FAF5FF' }]}>
                    <Text style={styles.toolEmoji}>🤖</Text>
                  </View>
                  <Text style={styles.toolLabel}>AI Tutor</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickToolTile}
                  onPress={() => navigation.navigate('SensoryHome')}
                  activeOpacity={0.85}
                >
                  <View style={[styles.toolIconBox, { backgroundColor: '#F0FDF4' }]}>
                    <Text style={styles.toolEmoji}>🎧</Text>
                  </View>
                  <Text style={styles.toolLabel}>Sensory</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickToolTile}
                  onPress={() => navigation.navigate('EmergencyContacts')}
                  activeOpacity={0.85}
                >
                  <View style={[styles.toolIconBox, { backgroundColor: '#FEF2F2' }]}>
                    <Text style={styles.toolEmoji}>📞</Text>
                  </View>
                  <Text style={styles.toolLabel}>Contacts</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          {/* ======================================================= */}
          {/* RIGHT COLUMN: COMMUNITY & ACTIVITIES                   */}
          {/* ======================================================= */}
          <Animated.View
            style={[
              styles.rightColumn,
              rightColumnAnim,
              { width: isDesktop || isLaptop ? '39%' : '100%' },
            ]}
          >
            {/* Pillar 2: Caregiver Community Portal */}
            <View style={styles.communityCard}>
              <View style={styles.cardHeader}>
                <View style={[styles.cardIconBox, { backgroundColor: '#FAF5FF' }]}>
                  <Text style={styles.cardIconEmoji}>👥</Text>
                </View>
                <View style={styles.cardHeaderContent}>
                  <Text style={styles.cardHeaderTitle}>Caregiver Community</Text>
                  <Text style={styles.cardHeaderSubtext}>{communityStats.community_online} Verified Peers Online</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('CommunityTab')}>
                  <Text style={styles.portalLink}>Portal ›</Text>
                </TouchableOpacity>
              </View>

              {/* Feed Highlights */}
              {loadingCommunity ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator size="small" color="#2563EB" />
                  <Text style={styles.loadingText}>Loading discussions...</Text>
                </View>
              ) : (
                <View style={styles.postsList}>
                  {communityPosts.slice(0, 2).map((post) => (
                    <TouchableOpacity
                      key={post.id}
                      style={styles.postCard}
                      onPress={() => navigation.navigate('CommunityTab')}
                      activeOpacity={0.85}
                    >
                      <View style={styles.postHeader}>
                        <Text style={styles.postAuthor}>👤 {post.author_name || 'Caregiver'}</Text>
                        {post.category && (
                          <View style={styles.categoryBadge}>
                            <Text style={styles.categoryBadgeText}>{post.category}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.postContent} numberOfLines={2}>
                        {post.content}
                      </Text>
                      <View style={styles.postMetricsRow}>
                        <Text style={styles.postMetricText}>💬 {post.comment_count || 0} comments</Text>
                        <Text style={styles.postMetricText}>❤️ {post.like_count || 0} helpful</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Community Actions */}
              <View style={[styles.cardButtonsRow, { flexDirection: isMobile ? 'column' : 'row' }]}>
                <TouchableOpacity
                  style={[styles.primaryPurpleBtn, { width: isMobile ? '100%' : 'auto', flex: isMobile ? undefined : 1 }]}
                  onPress={() => navigation.navigate('CommunityTab')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryActionText}>💬 Enter Community Feed</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.secondaryActionBtn, { width: isMobile ? '100%' : 'auto' }]}
                  onPress={() => navigation.navigate('SupportCenter')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.secondaryActionText}>Guides ›</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Recent Activity Log */}
            <View style={styles.activityCard}>
              <Text style={styles.activityHeader}>RECENT ACTIVITY LOG</Text>
              <View style={styles.activityList}>
                {safetyEvents.slice(0, 3).map((item, idx) => (
                  <View key={item.id || idx} style={styles.activityItem}>
                    <View
                      style={[
                        styles.activityDot,
                        { backgroundColor: item.isSafe ? '#10B981' : '#2563EB' },
                      ]}
                    />
                    <View style={styles.activityContent}>
                      <View style={styles.activityTitleRow}>
                        <Text style={styles.activityTitle}>{item.title}</Text>
                        <Text style={styles.activityTime}>{item.time}</Text>
                      </View>
                      <Text style={styles.activityDesc}>{item.desc}</Text>
                    </View>
                  </View>
                ))}
                <View style={styles.activityItem}>
                  <View style={[styles.activityDot, { backgroundColor: '#9333EA' }]} />
                  <View style={styles.activityContent}>
                    <View style={styles.activityTitleRow}>
                      <Text style={styles.activityTitle}>New Community Reply</Text>
                      <Text style={styles.activityTime}>09:40 AM</Text>
                    </View>
                    <Text style={styles.activityDesc}>Dr. Sarah Mitchell replied in Sensory Support.</Text>
                  </View>
                </View>
              </View>
            </View>
          </Animated.View>
        </View>
      </ScrollView>

      {/* ========================================================= */}
      {/* 3. MOBILE-ONLY BOTTOM NAVIGATION BAR                      */}
      {/* ========================================================= */}
      {isMobile && (
        <View style={styles.mobileBottomNav}>
          <TouchableOpacity
            style={styles.mobileBottomNavItem}
            onPress={() => navigateToTab('HOME')}
            activeOpacity={0.85}
          >
            <Text style={styles.bottomNavEmoji}>🏠</Text>
            <Text style={[styles.bottomNavLabel, activeTab === 'HOME' && styles.bottomNavLabelActive]}>
              Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mobileBottomNavItem}
            onPress={() => navigateToTab('COMMUNITY')}
            activeOpacity={0.85}
          >
            <Text style={styles.bottomNavEmoji}>👥</Text>
            <Text style={[styles.bottomNavLabel, activeTab === 'COMMUNITY' && styles.bottomNavLabelActive]}>
              Community
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mobileBottomNavItem}
            onPress={() => navigateToTab('LOCATION')}
            activeOpacity={0.85}
          >
            <Text style={styles.bottomNavEmoji}>📍</Text>
            <Text style={[styles.bottomNavLabel, activeTab === 'LOCATION' && styles.bottomNavLabelActive]}>
              Map
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mobileBottomNavItem}
            onPress={() => navigateToTab('SAFETY')}
            activeOpacity={0.85}
          >
            <Text style={styles.bottomNavEmoji}>🛡️</Text>
            <Text style={[styles.bottomNavLabel, activeTab === 'SAFETY' && styles.bottomNavLabelActive]}>
              Safety
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mobileBottomNavItem}
            onPress={() => navigateToTab('PROFILE')}
            activeOpacity={0.85}
          >
            <Text style={styles.bottomNavEmoji}>👤</Text>
            <Text style={[styles.bottomNavLabel, activeTab === 'PROFILE' && styles.bottomNavLabelActive]}>
              Profile
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* SOS Confirmation Modal */}
      <ConfirmModal
        visible={sosModalVisible}
        onClose={() => setSosModalVisible(false)}
        onConfirm={handleConfirmSOS}
        title="Broadcast Emergency SOS?"
        message={`Are you sure you want to trigger an emergency broadcast for ${childName}? This will immediately notify caregivers and transmit live GPS coordinates.`}
        confirmText="Yes, Send SOS"
        cancelText="Cancel"
        confirmVariant="danger"
        icon="🚨"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  navbarWrapper: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    zIndex: 50,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  navbarInner: {
    width: '100%',
    maxWidth: 1280,
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
  brandBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkleIcon: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 1.5,
  },
  brandTagline: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  navTabsGroup: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: '#F1F5F9',
    padding: 4,
    borderRadius: 12,
  },
  navTabItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  navTabItemActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  navTabLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  navTabLabelActive: {
    color: '#2563EB',
    fontWeight: '900',
  },
  navRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sosButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 9999,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sosButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  avatarButton: {
    borderRadius: 9999,
  },
  signOutBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  signOutText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  mobileHamburgerBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  mobileHamburgerIcon: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  mobileMenuDropdown: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingVertical: 12,
    gap: 6,
  },
  mobileDropdownItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  mobileDropdownText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  mobileSignOutItem: {
    paddingVertical: 10,
    marginTop: 4,
  },
  mobileSignOutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },

  // Main Scrollable Area
  mainScroll: {
    flex: 1,
  },
  mainScrollContent: {
    paddingTop: 16,
    width: '100%',
    maxWidth: 1280,
    alignSelf: 'center',
  },
  emergencyBanner: {
    backgroundColor: '#DC2626',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  emergencyIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  emergencyContent: {
    flex: 1,
  },
  emergencyTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  emergencySubtitle: {
    color: '#FEE2E2',
    fontSize: 12,
    marginTop: 2,
  },
  emergencyArrow: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },

  // Dashboard Grid
  dashboardGrid: {
    width: '100%',
    justifyContent: 'space-between',
  },
  leftColumn: {
    gap: 16,
  },
  rightColumn: {
    gap: 16,
  },

  // Greeting Banner
  greetingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    flexWrap: 'wrap',
    gap: 8,
  },
  greetingDetails: {
    flex: 1,
  },
  greetingTitle: {
    fontWeight: '900',
    color: '#0F172A',
  },
  greetingSubtitle: {
    fontSize: 13.5,
    color: '#64748B',
    marginTop: 3,
  },
  statusPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    alignSelf: 'flex-start',
  },

  // Pillar 1: Child Safety Card
  safetyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderTopWidth: 4,
    borderTopColor: '#2563EB',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardIconEmoji: {
    fontSize: 20,
  },
  cardHeaderContent: {
    flex: 1,
  },
  cardHeaderTitle: {
    fontSize: 16.5,
    fontWeight: '900',
    color: '#0F172A',
  },
  cardHeaderSubtext: {
    fontSize: 12.5,
    color: '#64748B',
  },
  safePillSmall: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  safePillSmallText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#065F46',
  },
  portalLink: {
    fontSize: 13,
    fontWeight: '800',
    color: '#7E22CE',
  },

  // Telemetry Matrix
  telemetryMatrix: {
    gap: 10,
    marginBottom: 14,
  },
  telemetryTile: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  telemetryLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#64748B',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  telemetryValue: {
    fontSize: 15.5,
    fontWeight: '900',
    color: '#0F172A',
  },
  telemetryStatusActive: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
    marginTop: 2,
  },
  addressStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  addressIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  addressText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  cardButtonsRow: {
    gap: 10,
  },
  primaryActionBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
  secondaryActionBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  secondaryActionText: {
    color: '#334155',
    fontSize: 13.5,
    fontWeight: '700',
  },
  primaryPurpleBtn: {
    backgroundColor: '#7E22CE',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },

  // Quick Tools Shortcuts Grid
  quickToolsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  quickToolsHeader: {
    fontSize: 12,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  quickToolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickToolTile: {
    flexGrow: 1,
    minWidth: 85,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  toolIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  toolEmoji: {
    fontSize: 20,
  },
  toolLabel: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#334155',
  },

  // Pillar 2: Community Card
  communityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderTopWidth: 4,
    borderTopColor: '#9333EA',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  loadingBox: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: '#64748B',
  },
  postsList: {
    gap: 10,
    marginBottom: 14,
  },
  postCard: {
    backgroundColor: '#FAF5FF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F3E8FF',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  postAuthor: {
    fontSize: 13,
    fontWeight: '800',
    color: '#581C87',
  },
  categoryBadge: {
    backgroundColor: '#E9D5FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B21A8',
  },
  postContent: {
    fontSize: 13,
    lineHeight: 19,
    color: '#334155',
    marginBottom: 8,
  },
  postMetricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  postMetricText: {
    fontSize: 12,
    color: '#64748B',
  },

  // Recent Activity Card
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  activityHeader: {
    fontSize: 12,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  activityList: {
    gap: 14,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  activityDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginTop: 5,
  },
  activityContent: {
    flex: 1,
  },
  activityTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  activityTime: {
    fontSize: 12,
    color: '#94A3B8',
  },
  activityDesc: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 2,
  },

  // Mobile Bottom Tab Bar
  mobileBottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: 'space-around',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  mobileBottomNavItem: {
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 6,
    minHeight: 44,
    justifyContent: 'center',
  },
  bottomNavEmoji: {
    fontSize: 18,
    marginBottom: 2,
  },
  bottomNavLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  bottomNavLabelActive: {
    color: '#2563EB',
    fontWeight: '900',
  },
});
