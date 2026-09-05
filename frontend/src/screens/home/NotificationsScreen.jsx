import React, { useCallback, useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNotificationStore } from '../../store/notificationStore';
import colors from '../../constants/colors';
import { radius, spacing } from '../../constants/spacing';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';

const TYPE_PRESENTATION = {
  security: { icon: '◈', background: '#FEE2E2', color: colors.danger[600] },
  emergency: { icon: '!', background: '#FEE2E2', color: colors.danger[600] },
  sos: { icon: '!', background: '#FEE2E2', color: colors.danger[600] },
  learning: { icon: '◆', background: '#D1FAE5', color: '#0F766E' },
  routine: { icon: '✓', background: '#DBEAFE', color: colors.primary[700] },
  community: { icon: '▰', background: '#DBEAFE', color: '#475569' },
  message: { icon: 'SJ', background: '#FDE68A', color: '#92400E' },
  system: { icon: '◷', background: '#DBEAFE', color: '#475569' },
  default: { icon: '•', background: colors.neutral[100], color: colors.neutral[600] },
};

function relativeTime(value) {
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return '';
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 172800) return 'Yesterday';
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function groupLabel(value) {
  const date = new Date(value);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const difference = startOfToday.getTime() - new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  if (difference <= 0) return 'TODAY';
  if (difference <= 86400000) return 'YESTERDAY';
  return 'EARLIER';
}

function destinationFor(notification) {
  const type = (notification.type || notification.category || '').toLowerCase();
  if (['sos', 'emergency', 'geofence', 'band_disconnected', 'separation'].includes(type)) return 'SafetyTab';
  if (['message', 'dm', 'group_message', 'comment', 'reaction', 'community'].includes(type)) return 'CommunityTab';
  if (['routine', 'learning'].includes(type)) return 'Home';
  return null;
}

export default function NotificationsScreen({ navigation }) {
  const { notifications, loading, error, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const visibleNotifications = notifications;
  const sections = useMemo(() => {
    const groups = { TODAY: [], YESTERDAY: [], EARLIER: [] };
    visibleNotifications.forEach((item) => groups[groupLabel(item.created_at || item.timestamp)].push(item));
    return Object.entries(groups).flatMap(([label, items]) => items.length ? [{ id: `heading-${label}`, heading: label }, ...items] : []);
  }, [visibleNotifications]);

  const onPressNotification = useCallback(async (item) => {
    if (!item.read && !item.is_read) await markAsRead(item.id);
    const destination = destinationFor(item);
    if (destination) navigation.navigate(destination, item.target_id ? { id: item.target_id } : undefined);
  }, [markAsRead, navigation]);

  const renderItem = ({ item }) => {
    if (item.heading) return <Text style={styles.sectionLabel}>{item.heading}</Text>;
    const type = (item.type || item.category || 'default').toLowerCase();
    const presentation = TYPE_PRESENTATION[type] || TYPE_PRESENTATION.default;
    const unread = !(item.read || item.is_read);
    const initials = item.initials || presentation.icon;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${unread ? 'Unread: ' : ''}${item.title}. ${item.body}`}
        onPress={() => onPressNotification(item)}
        style={({ pressed }) => [styles.notificationCard, unread && styles.unreadCard, pressed && styles.pressed]}
      >
        <View style={[styles.iconCircle, { backgroundColor: presentation.background }]}>
          <Text style={[styles.iconText, { color: presentation.color }, item.initials && styles.avatarText]}>{initials}</Text>
        </View>
        <View style={styles.notificationCopy}>
          <Text style={styles.notificationTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.notificationBody} numberOfLines={2}>{item.body || item.message}</Text>
        </View>
        <View style={styles.metaColumn}>
          <Text style={styles.time}>{relativeTime(item.created_at || item.timestamp)}</Text>
          {unread && <View style={styles.unreadDot} accessibilityLabel="Unread notification" />}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Go back" hitSlop={12} onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>
        <Text style={styles.heading}>Notifications</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Mark all notifications as read" onPress={markAllAsRead} style={styles.markAllButton}>
          <Text style={styles.markAllText}>⌁ Mark all read</Text>
        </Pressable>
      </View>

      {loading && !notifications.length ? (
        <View style={styles.centerState}><ActivityIndicator color={colors.primary[600]} /><Text style={styles.stateText}>Loading notifications…</Text></View>
      ) : error && !notifications.length ? (
        <ErrorState title="Notifications couldn’t load" message={error} onRetry={fetchNotifications} style={styles.errorState} />
      ) : !visibleNotifications.length ? (
        <EmptyState icon="✓" title="You’re all caught up" description="New safety, learning and community updates will appear here." />
      ) : (
        <FlatList
          data={sections}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchNotifications} tintColor={colors.primary[600]} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
      {Platform.OS === 'web' && <View style={styles.webFooterSpacer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F6F8FF' },
  header: { minHeight: 66, backgroundColor: colors.surface.white, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E9EDF7' },
  backButton: { width: 32, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  backIcon: { fontSize: 32, lineHeight: 34, color: colors.neutral[700], fontWeight: '300' },
  heading: { flex: 1, fontSize: 19, fontWeight: '800', color: colors.neutral[800] },
  markAllButton: { minHeight: 40, justifyContent: 'center' },
  markAllText: { fontSize: 11, fontWeight: '700', color: colors.primary[600] },
  listContent: { padding: spacing.lg, paddingBottom: 36 },
  sectionLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.45, color: colors.neutral[600], marginTop: 4, marginBottom: 9 },
  notificationCard: { minHeight: 76, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface.white, borderWidth: 1, borderColor: '#E3E9F6', borderRadius: radius.md, paddingHorizontal: 11, paddingVertical: 10, marginBottom: 7, shadowColor: '#14213D', shadowOpacity: 0.025, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  unreadCard: { borderColor: '#C9D9FF', backgroundColor: '#FFFFFF' },
  pressed: { opacity: 0.72 },
  iconCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 11 },
  iconText: { fontSize: 17, fontWeight: '800' },
  avatarText: { fontSize: 12 },
  notificationCopy: { flex: 1, minWidth: 0, paddingRight: 5 },
  notificationTitle: { fontSize: 14, lineHeight: 18, fontWeight: '800', color: '#17284A' },
  notificationBody: { marginTop: 3, fontSize: 11, lineHeight: 15, color: '#3B4F76' },
  metaColumn: { width: 46, alignSelf: 'stretch', alignItems: 'flex-end', justifyContent: 'space-between' },
  time: { fontSize: 8, color: '#3155B3', textAlign: 'right' },
  unreadDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#2449CD', marginRight: 1, marginBottom: 3 },
  centerState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  stateText: { marginTop: 12, color: colors.neutral[500], fontSize: 13 },
  errorState: { margin: spacing.lg },
  webFooterSpacer: { height: 0 },
});
