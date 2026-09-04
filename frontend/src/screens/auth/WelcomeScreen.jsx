import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
} from 'react-native';
import useResponsive from '../../theme/responsive';
import { useFadeSlideIn, useFloatingAnimation, usePulseAnimation } from '../../utils/animations';

export default function WelcomeScreen({ navigation }) {
  const { width, isMobile, isTablet, isLaptop, isDesktop, gutter, clampFont } = useResponsive();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const heroLeftAnim = useFadeSlideIn(80, 20, 500);
  const heroRightAnim = useFadeSlideIn(200, 20, 500);
  const floatAnim = useFloatingAnimation(7, 3200);
  const radarDotAnim = usePulseAnimation(0.85, 1.25, 1600);

  // Dynamic feature column width calculation
  const getFeatureColWidth = () => {
    if (isMobile) return '100%';
    if (isTablet) return '48%';
    return '23.5%';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* ========================================================= */}
        {/* 1. RESPONSIVE WEBSITE NAVBAR                              */}
        {/* ========================================================= */}
        <View style={styles.navbarWrapper}>
          <View style={[styles.navbarInner, { paddingHorizontal: gutter }]}>
            {/* Brand Logo & Name */}
            <TouchableOpacity
              style={styles.brandLogoRow}
              onPress={() => {}}
              activeOpacity={0.85}
            >
              <View style={styles.brandBadge}>
                <Text style={styles.sparkleIcon}>✦</Text>
              </View>
              <View>
                <Text style={styles.brandTitle}>NIVARA</Text>
                {!isMobile && (
                  <Text style={styles.brandTagline}>AUTISM & CAREGIVER PLATFORM</Text>
                )}
              </View>
            </TouchableOpacity>

            {/* Desktop / Laptop Navigation Links */}
            {(isDesktop || isLaptop) && (
              <View style={styles.navLinksRow}>
                <TouchableOpacity style={styles.navLinkItem}>
                  <Text style={styles.navLinkText}>Safety & GPS</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navLinkItem}>
                  <Text style={styles.navLinkText}>AAC Board</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navLinkItem}>
                  <Text style={styles.navLinkText}>Caregiver Community</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navLinkItem}>
                  <Text style={styles.navLinkText}>Visual Routines</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Right Action Buttons & Mobile Hamburger */}
            <View style={styles.navActionsRow}>
              {!isMobile ? (
                <>
                  <TouchableOpacity
                    style={styles.signInBtn}
                    onPress={() => navigation.navigate('Login')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.signInBtnText}>Sign In</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.getStartedBtn}
                    onPress={() => navigation.navigate('Register')}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.getStartedBtnText}>Get Started</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.mobileSignInPill}
                    onPress={() => navigation.navigate('Login')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.mobileSignInText}>Sign In</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.hamburgerBtn}
                    onPress={() => setMobileMenuOpen(!mobileMenuOpen)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.hamburgerIcon}>{mobileMenuOpen ? '✕' : '☰'}</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          {/* Mobile Collapsible Dropdown Menu */}
          {isMobile && mobileMenuOpen && (
            <View style={[styles.mobileDropdownMenu, { paddingHorizontal: gutter }]}>
              <TouchableOpacity
                style={styles.mobileMenuItem}
                onPress={() => {
                  setMobileMenuOpen(false);
                  navigation.navigate('Login');
                }}
              >
                <Text style={styles.mobileMenuText}>📍 Safety & GPS Tracking</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.mobileMenuItem}
                onPress={() => {
                  setMobileMenuOpen(false);
                  navigation.navigate('Login');
                }}
              >
                <Text style={styles.mobileMenuText}>🖼️ AAC Communication Board</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.mobileMenuItem}
                onPress={() => {
                  setMobileMenuOpen(false);
                  navigation.navigate('Login');
                }}
              >
                <Text style={styles.mobileMenuText}>👥 Caregiver Peer Community</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.mobileMenuItem}
                onPress={() => {
                  setMobileMenuOpen(false);
                  navigation.navigate('Login');
                }}
              >
                <Text style={styles.mobileMenuText}>🎓 Visual Routines & Schedules</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.mobileMenuRegisterBtn}
                onPress={() => {
                  setMobileMenuOpen(false);
                  navigation.navigate('Register');
                }}
              >
                <Text style={styles.mobileMenuRegisterText}>Create Free Account</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ========================================================= */}
        {/* 2. HERO SECTION                                           */}
        {/* ========================================================= */}
        <View
          style={[
            styles.heroSection,
            {
              paddingHorizontal: gutter,
              flexDirection: isDesktop || isLaptop ? 'row' : 'column',
              paddingVertical: isMobile ? 24 : isTablet ? 36 : 56,
            },
          ]}
        >
          {/* Hero Left Column */}
          <Animated.View
            style={[
              styles.heroLeftCol,
              heroLeftAnim,
              { width: isDesktop || isLaptop ? '56%' : '100%', marginBottom: isDesktop || isLaptop ? 0 : 32 },
            ]}
          >
            <View style={styles.pillBadge}>
              <Text style={styles.pillIcon}>✨</Text>
              <Text style={styles.pillText}>Intelligent Care & Real-Time Safety</Text>
            </View>

            <Text
              style={[
                styles.heroHeading,
                {
                  fontSize: clampFont(24, isMobile ? 28 : isTablet ? 36 : 48, 52),
                  lineHeight: clampFont(32, isMobile ? 36 : isTablet ? 44 : 56, 60),
                },
              ]}
            >
              Empowering Neurodivergent Care, Safety & Connection.
            </Text>

            <Text style={styles.heroSubtext}>
              NIVARA combines live geofenced GPS telemetry, picture-based AAC communication,
              sensory regulation, and a verified caregiver community into a unified, secure sanctuary.
            </Text>

            {/* Hero CTAs */}
            <View style={[styles.heroCtaRow, { flexDirection: isMobile ? 'column' : 'row' }]}>
              <TouchableOpacity
                style={[styles.primaryCtaBtn, { width: isMobile ? '100%' : 'auto' }]}
                onPress={() => navigation.navigate('Register')}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryCtaText}>Start Free Trial</Text>
                <Text style={styles.primaryCtaArrow}>→</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryCtaBtn, { width: isMobile ? '100%' : 'auto' }]}
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryCtaText}>Caregiver Portal ›</Text>
              </TouchableOpacity>
            </View>

            {/* Trust Badges Strip */}
            <View style={styles.trustStrip}>
              <View style={styles.trustItem}>
                <Text style={styles.trustNumber}>99.8%</Text>
                <Text style={styles.trustLabel}>GPS Accuracy</Text>
              </View>
              <View style={styles.trustDivider} />
              <View style={styles.trustItem}>
                <Text style={styles.trustNumber}>&lt; 3s</Text>
                <Text style={styles.trustLabel}>Instant SOS</Text>
              </View>
              <View style={styles.trustDivider} />
              <View style={styles.trustItem}>
                <Text style={styles.trustNumber}>100%</Text>
                <Text style={styles.trustLabel}>Encrypted</Text>
              </View>
            </View>
          </Animated.View>

          {/* Hero Right Column: Floating Telemetry Showcase Card */}
          <Animated.View
            style={[
              styles.heroRightCol,
              heroRightAnim,
              floatAnim,
              { width: isDesktop || isLaptop ? '40%' : '100%', maxWidth: isDesktop || isLaptop ? 460 : '100%' },
            ]}
          >
            <View style={styles.showcaseCard}>
              <View style={styles.showcaseHeader}>
                <View style={styles.radarStatusRow}>
                  <Animated.View style={[styles.radarDot, radarDotAnim]} />
                  <Text style={styles.radarStatusText}>LIVE TELEMETRY</Text>
                </View>
                <View style={styles.safeZoneBadge}>
                  <Text style={styles.safeZoneBadgeText}>🟢 Safe in Zone</Text>
                </View>
              </View>

              <View style={styles.showcaseBody}>
                <View style={styles.childInfoRow}>
                  <View style={styles.childAvatarBox}>
                    <Text style={styles.childAvatarEmoji}>👦</Text>
                  </View>
                  <View style={styles.childDetails}>
                    <Text style={styles.childNameText}>Aarav Patel</Text>
                    <Text style={styles.childSubtext}>Age 7 • Smartband Tethered (2.4m)</Text>
                  </View>
                </View>

                {/* Metrics Box */}
                <View style={styles.telemetryBoxesRow}>
                  <View style={styles.telemetryBox}>
                    <Text style={styles.boxLabel}>CURRENT ZONE</Text>
                    <Text style={styles.boxValue}>Home Sanctuary</Text>
                    <Text style={styles.boxStatusGood}>Geofence Active</Text>
                  </View>
                  <View style={styles.telemetryBox}>
                    <Text style={styles.boxLabel}>BAND BATTERY</Text>
                    <Text style={styles.boxValue}>⚡ 94%</Text>
                    <Text style={styles.boxStatusGood}>Good for 36h</Text>
                  </View>
                </View>

                {/* Simulated AAC Quick Strip */}
                <View style={styles.aacPreviewCard}>
                  <Text style={styles.boxLabel}>RECENT AAC PHRASE</Text>
                  <View style={styles.aacChipsRow}>
                    <View style={styles.aacChip}>
                      <Text style={styles.aacChipIcon}>🥤</Text>
                      <Text style={styles.aacChipText}>Thirsty</Text>
                    </View>
                    <View style={styles.aacChip}>
                      <Text style={styles.aacChipIcon}>🎧</Text>
                      <Text style={styles.aacChipText}>Quiet</Text>
                    </View>
                    <View style={styles.aacChip}>
                      <Text style={styles.aacChipIcon}>😊</Text>
                      <Text style={styles.aacChipText}>Happy</Text>
                    </View>
                  </View>
                </View>

                {/* Community Peer Badge */}
                <View style={styles.communityBanner}>
                  <Text style={styles.communityIcon}>👥</Text>
                  <View style={styles.communityContent}>
                    <Text style={styles.communityTitle}>Verified Caregivers</Text>
                    <Text style={styles.communitySubtext}>128 peers online in your city</Text>
                  </View>
                </View>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* ========================================================= */}
        {/* 3. FOUR CORE PILLARS (RESPONSIVE GRID)                    */}
        {/* ========================================================= */}
        <View style={[styles.pillarsSection, { paddingHorizontal: gutter }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionSubtitle}>ALL-IN-ONE SOLUTION</Text>
            <Text
              style={[
                styles.sectionTitle,
                { fontSize: clampFont(22, isMobile ? 24 : 32, 36) },
              ]}
            >
              Everything Your Child & Family Needs
            </Text>
            <Text style={styles.sectionDescription}>
              Engineered with child development specialists, occupational therapists, and caregivers.
            </Text>
          </View>

          <View style={styles.pillarsGrid}>
            {/* Feature 1 */}
            <View style={[styles.pillarCard, { width: getFeatureColWidth() }]}>
              <View style={[styles.pillarIconBox, { backgroundColor: '#EFF6FF' }]}>
                <Text style={styles.pillarEmoji}>📍</Text>
              </View>
              <Text style={styles.pillarTitle}>Live GPS & Safe Zones</Text>
              <Text style={styles.pillarDescription}>
                High-precision tracking with geofence entry/exit alerts, smartband tethering, and instant SOS.
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.pillarLink}>Explore Safe Zones ›</Text>
              </TouchableOpacity>
            </View>

            {/* Feature 2 */}
            <View style={[styles.pillarCard, { width: getFeatureColWidth() }]}>
              <View style={[styles.pillarIconBox, { backgroundColor: '#FAF5FF' }]}>
                <Text style={styles.pillarEmoji}>🖼️</Text>
              </View>
              <Text style={styles.pillarTitle}>AAC Voice Board</Text>
              <Text style={styles.pillarDescription}>
                Empower non-verbal children with intuitive picture cards, emotion checks, and voice generation.
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.pillarLink}>Try AAC Tools ›</Text>
              </TouchableOpacity>
            </View>

            {/* Feature 3 */}
            <View style={[styles.pillarCard, { width: getFeatureColWidth() }]}>
              <View style={[styles.pillarIconBox, { backgroundColor: '#ECFDF5' }]}>
                <Text style={styles.pillarEmoji}>👥</Text>
              </View>
              <Text style={styles.pillarTitle}>Peer Community</Text>
              <Text style={styles.pillarDescription}>
                Connect with verified parents, therapists, and certified specialists in a safe and private space.
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.pillarLink}>Join Discussions ›</Text>
              </TouchableOpacity>
            </View>

            {/* Feature 4 */}
            <View style={[styles.pillarCard, { width: getFeatureColWidth() }]}>
              <View style={[styles.pillarIconBox, { backgroundColor: '#FFFBEB' }]}>
                <Text style={styles.pillarEmoji}>🎓</Text>
              </View>
              <Text style={styles.pillarTitle}>Visual Routines</Text>
              <Text style={styles.pillarDescription}>
                Build predictable day structures with step-by-step checklists, AI tutor, and sensory games.
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.pillarLink}>View Schedules ›</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ========================================================= */}
        {/* 4. TESTIMONIAL                                            */}
        {/* ========================================================= */}
        <View style={[styles.testimonialSection, { paddingHorizontal: gutter }]}>
          <View style={styles.testimonialCard}>
            <Text style={styles.quoteMark}>“</Text>
            <Text style={styles.testimonialQuote}>
              NIVARA has completely eliminated our morning anxiety. Having geofence safety combined with the AAC board in one single app gives our family peace of mind we never had before.
            </Text>
            <View style={styles.authorRow}>
              <View style={styles.authorAvatar}>
                <Text style={styles.authorEmoji}>👩‍⚕️</Text>
              </View>
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>Dr. Sarah Mitchell</Text>
                <Text style={styles.authorRole}>Child Developmental Psychologist & Verified Caregiver</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ========================================================= */}
        {/* 5. CTA CONVERSION BANNER                                  */}
        {/* ========================================================= */}
        <View style={[styles.ctaSection, { paddingHorizontal: gutter }]}>
          <View style={[styles.ctaBanner, { padding: isMobile ? 20 : isTablet ? 32 : 44 }]}>
            <Text
              style={[
                styles.ctaBannerTitle,
                { fontSize: clampFont(20, isMobile ? 22 : 28, 32) },
              ]}
            >
              Ready to Experience Peace of Mind?
            </Text>
            <Text style={styles.ctaBannerSubtitle}>
              Join thousands of families and caregivers using NIVARA today. Setup takes under 2 minutes.
            </Text>
            <View style={[styles.ctaButtonsRow, { flexDirection: isMobile ? 'column' : 'row' }]}>
              <TouchableOpacity
                style={[styles.ctaWhiteBtn, { width: isMobile ? '100%' : 'auto' }]}
                onPress={() => navigation.navigate('Register')}
                activeOpacity={0.85}
              >
                <Text style={styles.ctaWhiteBtnText}>Create Free Account</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.ctaOutlineBtn, { width: isMobile ? '100%' : 'auto' }]}
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.85}
              >
                <Text style={styles.ctaOutlineBtnText}>Sign In to Dashboard</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ========================================================= */}
        {/* 6. WEBSITE FOOTER                                         */}
        {/* ========================================================= */}
        <View style={[styles.footerWrapper, { paddingHorizontal: gutter }]}>
          <View style={[styles.footerInner, { flexDirection: isDesktop || isLaptop ? 'row' : 'column' }]}>
            <View style={styles.footerBrandCol}>
              <View style={styles.footerBrandRow}>
                <Text style={styles.footerSparkle}>✦</Text>
                <Text style={styles.footerBrandTitle}>NIVARA</Text>
              </View>
              <Text style={styles.footerBrandDescription}>
                Dedicated to safety, communicative freedom, and community support for neurodivergent children and their families.
              </Text>
            </View>

            <View style={styles.footerLinksGrid}>
              <View style={styles.footerLinksCol}>
                <Text style={styles.footerLinksHeader}>PORTAL</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.footerLinkText}>Caregiver Sign In</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.footerLinkText}>Register New Family</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                  <Text style={styles.footerLinkText}>Forgot Password</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.footerLinksCol}>
                <Text style={styles.footerLinksHeader}>PILLARS</Text>
                <Text style={styles.footerLinkText}>GPS Geofence Live</Text>
                <Text style={styles.footerLinkText}>AAC Voice Board</Text>
                <Text style={styles.footerLinkText}>Caregiver Community</Text>
                <Text style={styles.footerLinkText}>Visual Daily Routines</Text>
              </View>

              <View style={styles.footerLinksCol}>
                <Text style={styles.footerLinksHeader}>SAFETY</Text>
                <Text style={styles.footerLinkText}>256-bit Encryption</Text>
                <Text style={styles.footerLinkText}>Emergency SOS Protocols</Text>
                <Text style={styles.footerLinkText}>Verified Identity Badging</Text>
              </View>
            </View>
          </View>

          <View style={styles.footerBottomBar}>
            <Text style={styles.footerCopyright}>
              © {new Date().getFullYear()} NIVARA Technologies Inc. All rights reserved.
            </Text>
            <Text style={styles.footerEmergencyNotice}>
              🚨 For immediate medical or critical emergencies, always contact local emergency services immediately.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#F8FAFC',
    maxWidth: '100%',
  },
  navbarWrapper: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    zIndex: 50,
  },
  navbarInner: {
    width: '100%',
    maxWidth: 1280,
    alignSelf: 'center',
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  sparkleIcon: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 18,
  },
  brandTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 1.5,
  },
  brandTagline: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  navLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  navLinkItem: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  navLinkText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#334155',
  },
  navActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  signInBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 9999,
  },
  signInBtnText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  getStartedBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 9999,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  getStartedBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
  },
  mobileSignInPill: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  mobileSignInText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  hamburgerBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  hamburgerIcon: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  mobileDropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingVertical: 12,
    gap: 8,
  },
  mobileMenuItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  mobileMenuText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  mobileMenuRegisterBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  mobileMenuRegisterText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  // Hero Section
  heroSection: {
    width: '100%',
    maxWidth: 1280,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroLeftCol: {
    alignItems: 'flex-start',
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 9999,
    marginBottom: 16,
  },
  pillIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  pillText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1D4ED8',
    letterSpacing: 0.2,
  },
  heroHeading: {
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  heroSubtext: {
    fontSize: 16,
    lineHeight: 24,
    color: '#475569',
    marginBottom: 24,
    maxWidth: 580,
  },
  heroCtaRow: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 28,
    width: '100%',
  },
  primaryCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    paddingHorizontal: 26,
    borderRadius: 9999,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 48,
  },
  primaryCtaText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '800',
    marginRight: 8,
  },
  primaryCtaArrow: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  secondaryCtaBtn: {
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 9999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  secondaryCtaText: {
    color: '#334155',
    fontSize: 15.5,
    fontWeight: '700',
  },
  trustStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 16,
    flexWrap: 'wrap',
  },
  trustItem: {
    alignItems: 'flex-start',
  },
  trustNumber: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },
  trustLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  trustDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },

  // Hero Right Column Showcase Card
  heroRightCol: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  showcaseCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 6,
  },
  showcaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 16,
  },
  radarStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radarDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  radarStatusText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
  },
  safeZoneBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  safeZoneBadgeText: {
    color: '#065F46',
    fontSize: 12,
    fontWeight: '700',
  },
  showcaseBody: {
    gap: 12,
  },
  childInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  childAvatarBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  childAvatarEmoji: {
    fontSize: 24,
  },
  childDetails: {
    flex: 1,
  },
  childNameText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  childSubtext: {
    fontSize: 12.5,
    color: '#64748B',
  },
  telemetryBoxesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  telemetryBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  boxLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  boxValue: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  boxStatusGood: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
    marginTop: 2,
  },
  aacPreviewCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  aacChipsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 4,
  },
  aacChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  aacChipIcon: {
    fontSize: 13,
    marginRight: 4,
  },
  aacChipText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  communityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5FF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    gap: 10,
    marginTop: 4,
  },
  communityIcon: {
    fontSize: 22,
  },
  communityContent: {
    flex: 1,
  },
  communityTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#6B21A8',
  },
  communitySubtext: {
    fontSize: 12,
    color: '#7E22CE',
  },

  // 3. Four Core Pillars
  pillarsSection: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingVertical: 48,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  sectionHeader: {
    alignItems: 'center',
    maxWidth: 700,
    alignSelf: 'center',
    marginBottom: 36,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },
  pillarsGrid: {
    width: '100%',
    maxWidth: 1280,
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  pillarCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  pillarIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  pillarEmoji: {
    fontSize: 22,
  },
  pillarTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  pillarDescription: {
    fontSize: 13.5,
    lineHeight: 20,
    color: '#475569',
    marginBottom: 14,
  },
  pillarLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },

  // 4. Testimonial
  testimonialSection: {
    width: '100%',
    paddingVertical: 36,
  },
  testimonialCard: {
    width: '100%',
    maxWidth: 860,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 26,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  quoteMark: {
    fontSize: 38,
    fontWeight: '900',
    color: '#2563EB',
    lineHeight: 38,
    marginBottom: 4,
  },
  testimonialQuote: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1E293B',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  authorAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorEmoji: {
    fontSize: 22,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  authorRole: {
    fontSize: 12.5,
    color: '#64748B',
  },

  // 5. CTA Conversion Banner
  ctaSection: {
    width: '100%',
    marginBottom: 36,
  },
  ctaBanner: {
    width: '100%',
    maxWidth: 1280,
    alignSelf: 'center',
    backgroundColor: '#1E40AF',
    borderRadius: 24,
    alignItems: 'center',
    textAlign: 'center',
  },
  ctaBannerTitle: {
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  ctaBannerSubtitle: {
    fontSize: 14.5,
    color: '#BFDBFE',
    textAlign: 'center',
    maxWidth: 600,
    marginBottom: 20,
    lineHeight: 22,
  },
  ctaButtonsRow: {
    alignItems: 'center',
    gap: 12,
  },
  ctaWhiteBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
  },
  ctaWhiteBtnText: {
    color: '#1E40AF',
    fontSize: 15,
    fontWeight: '800',
  },
  ctaOutlineBtn: {
    borderWidth: 1.5,
    borderColor: '#93C5FD',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
  },
  ctaOutlineBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  // 6. Website Footer
  footerWrapper: {
    width: '100%',
    backgroundColor: '#0F172A',
    paddingVertical: 40,
  },
  footerInner: {
    width: '100%',
    maxWidth: 1280,
    alignSelf: 'center',
    justifyContent: 'space-between',
    gap: 32,
    marginBottom: 32,
  },
  footerBrandCol: {
    maxWidth: 380,
  },
  footerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  footerSparkle: {
    color: '#3B82F6',
    fontSize: 20,
    fontWeight: '900',
  },
  footerBrandTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  footerBrandDescription: {
    fontSize: 13.5,
    lineHeight: 20,
    color: '#94A3B8',
  },
  footerLinksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 36,
  },
  footerLinksCol: {
    gap: 8,
  },
  footerLinksHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 4,
  },
  footerLinkText: {
    fontSize: 13.5,
    color: '#94A3B8',
  },
  footerBottomBar: {
    width: '100%',
    maxWidth: 1280,
    alignSelf: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingTop: 20,
    gap: 8,
  },
  footerCopyright: {
    fontSize: 12.5,
    color: '#64748B',
  },
  footerEmergencyNotice: {
    fontSize: 12.5,
    color: '#94A3B8',
    lineHeight: 18,
  },
});
