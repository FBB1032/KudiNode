import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { colors, spacing, radius, typography, shadows } from '../theme/theme';
import { TopHeader } from '../components/TopHeader';
import { Icon } from '../components/Icon';
import { useNavigation } from '@react-navigation/native';

const NOTIFICATIONS = [
  {
    id: 1, icon: 'checkmark-circle' as const, color: colors.successGreen,
    bg: '#E8FFF2', title: 'Sale Recorded',
    body: 'Rice ₦23,000 successfully logged to your ledger.',
    time: '5 min ago', read: false,
  },
  {
    id: 2, icon: 'bank' as const, color: '#1565C0',
    bg: '#EBF5FF', title: 'KudiNode Credit Approved',
    body: 'Your ₦150,000 Tier-1 credit line is active and ready.',
    time: '2 hrs ago', read: false,
  },
  {
    id: 3, icon: 'people' as const, color: colors.primaryMid,
    bg: colors.accentLight, title: 'Esusu Round Due',
    body: 'Your co-op contribution of ₦5,000 is due today.',
    time: 'Yesterday', read: true,
  },
  {
    id: 4, icon: 'shield-checkmark' as const, color: colors.successGreen,
    bg: '#E8FFF2', title: 'Identity Verified',
    body: 'BVN/NIN liveness match passed. Tier-1 status active.',
    time: 'Jul 27', read: true,
  },
  {
    id: 5, icon: 'stats-chart' as const, color: colors.warningOrange,
    bg: '#FFF3E8', title: 'Weekly Report Ready',
    body: 'Your sales summary for July 21–27 is available.',
    time: 'Jul 28', read: true,
  },
];

export function NotificationsScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.root}>
      <TopHeader showBack title="Notifications" subtitle="Alerts & account updates" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {NOTIFICATIONS.map((n, i) => (
          <TouchableOpacity
            key={n.id}
            style={[styles.card, shadows.card, !n.read && styles.cardUnread]}
            activeOpacity={0.8}
          >
            <View style={[styles.iconBox, { backgroundColor: n.bg }]}>
              <Icon name={n.icon} size={22} color={n.color} />
            </View>
            <View style={styles.textBlock}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>{n.title}</Text>
                {!n.read && <View style={styles.unreadDot} />}
              </View>
              <Text style={styles.body}>{n.body}</Text>
              <Text style={styles.time}>{n.time}</Text>
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height: spacing.xxxl * 2 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.grayBG },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.sm },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  cardUnread: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primaryMid,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textBlock: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  title: {
    fontSize: typography.sizes.body,
    fontWeight: '700',
    color: colors.textDark,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primaryMid,
  },
  body: {
    fontSize: typography.sizes.small,
    color: colors.textMuted,
    lineHeight: 18,
  },
  time: {
    fontSize: typography.sizes.tiny,
    color: colors.textMuted,
    marginTop: 4,
    fontWeight: '500',
  },
});
