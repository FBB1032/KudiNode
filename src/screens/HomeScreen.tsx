import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius, typography, shadows } from '../theme/theme';
import { Icon } from '../components/Icon';
import { useLanguage } from '../context/LanguageContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const QUICK_ACTIONS = [
  {
    icon: 'send' as const,
    labelKey: 'home.transfer',
    color: '#7C3AED',
    bg: '#F3E8FF',
    route: 'VoiceTransfer' as const,
    params: undefined,
  },
  {
    icon: 'mic' as const,
    labelKey: 'home.voiceLog',
    color: '#059669',
    bg: '#D1FAE5',
    route: 'SalesIntake' as const,
    params: { initialMode: 'VOICE' as const },
  },
  {
    icon: 'camera' as const,
    labelKey: 'home.scan',
    color: '#D97706',
    bg: '#FEF3C7',
    route: 'SalesIntake' as const,
    params: { initialMode: 'PHOTO' as const },
  },
  {
    icon: 'receipt' as const,
    labelKey: 'home.ledger',
    color: '#1D4ED8',
    bg: '#DBEAFE',
    route: 'Ledger' as const,
    params: undefined,
  },
];

const RECENT_TXN = [
  { id: 1, label: 'Amara Foods – Rice', amount: '+₦23,000', type: 'sale', date: 'Today · 09:14' },
  { id: 2, label: 'Esusu Contribution', amount: '-₦5,000', type: 'debit', date: 'Today · 07:00' },
  { id: 3, label: 'Beans & Oil', amount: '+₦10,700', type: 'sale', date: 'Yesterday' },
  { id: 4, label: 'KudiNode Credit', amount: '+₦50,000', type: 'credit', date: 'Jul 27' },
];

function TxnIcon({ type }: { type: string }) {
  const cfg =
    type === 'sale'
      ? { name: 'checkmark-circle' as const, color: '#059669', bg: '#D1FAE5' }
      : type === 'credit'
      ? { name: 'card' as const, color: '#1D4ED8', bg: '#DBEAFE' }
      : { name: 'transfer' as const, color: '#D97706', bg: '#FEF3C7' };
  return (
    <View style={[s.txnIcon, { backgroundColor: cfg.bg }]}>
      <Icon name={cfg.name} size={18} color={cfg.color} />
    </View>
  );
}

export function HomeScreen() {
  const { t } = useLanguage();
  const nav = useNavigation<Nav>();
  const [showBalance, setShowBalance] = useState(true);

  const handleCopyWema = () =>
    Alert.alert(t('common.copied'), t('home.accountCopied', { account: '0129384756', name: 'Amina Babangida Bello' }));

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#1A0840" translucent={false} />

      {/* ─── Header gradient ─── */}
      <LinearGradient
        colors={['#1A0840', colors.primaryDeep, '#4C1D95']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView edges={['top', 'left', 'right']}>
          {/* Top bar */}
          <View style={s.topBar}>
            {/* Account pill */}
            <TouchableOpacity style={s.accountPill} onPress={handleCopyWema} activeOpacity={0.8}>
              <Icon name="bank" size={13} color="rgba(255,255,255,0.85)" />
              <Text style={s.accountPillText}>
                Wema · <Text style={{ fontWeight: '800' }}>0129 3847 56</Text>
              </Text>
              <Icon name="copy" size={11} color="rgba(255,255,255,0.55)" />
            </TouchableOpacity>

            {/* Notification */}
            <TouchableOpacity
              style={s.iconBtn}
              onPress={() => nav.navigate('Notifications')}
              activeOpacity={0.8}
            >
              <Icon name="notifications-outline" size={19} color={colors.white} />
              <View style={s.notifBadge} />
            </TouchableOpacity>
          </View>

          {/* Merchant status row */}
          <View style={s.statusRow}>
            <Icon name="shield-checkmark" size={12} color="#34D399" />
            <Text style={s.statusText}>{t('home.verifiedStatus')} · Amina Bello</Text>
          </View>

          {/* ─── Balance card ─── */}
          <View style={[s.balCard, shadows.cardLg]}>
            {/* Card header */}
            <View style={s.balCardHeader}>
              <View style={s.balCardLeft}>
                <View style={s.balIconWrap}>
                  <Icon name="wallet-outline" size={16} color={colors.primaryDeep} />
                </View>
                <View>
                  <Text style={s.balLabel}>{t('home.cashInHand')}</Text>
                  <Text style={s.balSublabel}>{t('home.settlementAccount')}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setShowBalance(!showBalance)} activeOpacity={0.7}>
                <Icon
                  name={showBalance ? 'eye-outline' : 'eye-off-outline'}
                  size={19}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            {/* Amount */}
            <Text style={s.balAmount}>{showBalance ? '₦57,300.00' : '  ••••••  '}</Text>

            {/* Stats row */}
            <View style={s.statsRow}>
              <View style={s.statItem}>
                <View style={s.statLabelRow}>
                  <Icon name="trending-up" size={11} color="#059669" />
                  <Text style={s.statLabel}>{t('home.todayProfit')}</Text>
                </View>
                <Text style={s.statValue}>{showBalance ? '₦24,680' : '••••'}</Text>
              </View>

              <View style={s.statDivider} />

              <View style={s.statItem}>
                <View style={s.statLabelRow}>
                  <Icon name="flash" size={11} color={colors.primaryLight} />
                  <Text style={s.statLabel}>{t('home.creditLimit')}</Text>
                </View>
                <Text style={s.statValue}>{showBalance ? '₦150,000' : '••••'}</Text>
              </View>
            </View>

            {/* Action buttons */}
            <View style={s.cardActions}>
              <TouchableOpacity
                style={s.actionBtnPrimary}
                onPress={() => nav.navigate('VoiceTransfer')}
                activeOpacity={0.85}
              >
                <Icon name="send" size={14} color={colors.white} />
                <Text style={s.actionBtnPrimaryText}>{t('home.transfer')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.actionBtnSecondary}
                onPress={() => nav.navigate('ApplyLoan')}
                activeOpacity={0.85}
              >
                <Icon name="flash-outline" size={14} color={colors.primaryDeep} />
                <Text style={s.actionBtnSecondaryText}>{t('home.getCredit')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* ─── Scrollable body ─── */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Quick Actions ── */}
        <Text style={s.sectionTitle}>{t('home.quickActions')}</Text>
        <View style={s.quickGrid}>
          {QUICK_ACTIONS.map((a) => (
            <TouchableOpacity
              key={a.labelKey}
              style={[s.quickTile, shadows.card]}
              onPress={() => nav.navigate(a.route as any, a.params as any)}
              activeOpacity={0.82}
            >
              <View style={[s.quickTileIcon, { backgroundColor: a.bg }]}>
                <Icon name={a.icon} size={21} color={a.color} />
              </View>
              <Text style={s.quickTileLabel}>{t(a.labelKey)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Credit offer ── */}
        <TouchableOpacity
          style={[s.creditBanner, shadows.card]}
          onPress={() => nav.navigate('ApplyLoan')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#4C1D95', '#3B1566']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.creditBannerGrad}
          >
            <View style={s.creditBannerIconWrap}>
              <Icon name="flash" size={20} color="#FCD34D" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.creditBannerTitle}>{t('home.creditBannerTitle')}</Text>
              <Text style={s.creditBannerSub}>{t('home.creditBannerSub')}</Text>
            </View>
            <Icon name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
          </LinearGradient>
        </TouchableOpacity>

        {/* ── Recent activity ── */}
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>{t('home.recentActivity')}</Text>
          <TouchableOpacity onPress={() => nav.navigate('AllTransactions')} activeOpacity={0.7}>
            <Text style={s.seeAll}>{t('home.seeAll')}</Text>
          </TouchableOpacity>
        </View>

        <View style={[s.txnCard, shadows.card]}>
          {RECENT_TXN.map((txn, i) => (
            <View key={txn.id} style={[s.txnRow, i < RECENT_TXN.length - 1 && s.txnSep]}>
              <TxnIcon type={txn.type} />
              <View style={s.txnInfo}>
                <Text style={s.txnLabel} numberOfLines={1}>{txn.label}</Text>
                <Text style={s.txnDate}>{txn.date}</Text>
              </View>
              <Text
                style={[
                  s.txnAmount,
                  { color: txn.amount.startsWith('+') ? '#059669' : colors.textDark },
                ]}
              >
                {txn.amount}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ height: spacing.xxxl * 2 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F1F5F9' },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
  accountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  accountPillText: {
    fontSize: 11,
    color: colors.white,
    fontWeight: '600',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
    borderWidth: 1.5,
    borderColor: colors.primaryDeep,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(52,211,153,0.15)',
    alignSelf: 'flex-start',
    marginLeft: spacing.lg,
    marginTop: 2,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.3)',
  },
  statusText: { fontSize: 10, color: '#34D399', fontWeight: '700' },

  balCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  balCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  balCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  balIconWrap: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balLabel: {
    fontSize: typography.sizes.small,
    fontWeight: '800',
    color: colors.textDark,
  },
  balSublabel: { fontSize: 10, color: colors.textMuted },
  balAmount: {
    fontSize: 30,
    fontWeight: '900',
    color: colors.primaryDeep,
    letterSpacing: -0.5,
    marginVertical: spacing.xs,
  },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.md,
    alignItems: 'center',
  },
  statItem: { flex: 1 },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 2,
  },
  statLabel: { fontSize: 10, color: colors.textMuted, fontWeight: '700' },
  statValue: {
    fontSize: typography.sizes.body,
    fontWeight: '800',
    color: colors.textDark,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
  },

  cardActions: { flexDirection: 'row', gap: spacing.sm },
  actionBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primaryDeep,
    paddingVertical: 12,
    borderRadius: radius.xl,
  },
  actionBtnPrimaryText: {
    fontSize: typography.sizes.small,
    fontWeight: '800',
    color: colors.white,
  },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.accentLight,
    paddingVertical: 12,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(91,33,182,0.2)',
  },
  actionBtnSecondaryText: {
    fontSize: typography.sizes.small,
    fontWeight: '800',
    color: colors.primaryDeep,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },

  sectionTitle: {
    fontSize: typography.sizes.body,
    fontWeight: '800',
    color: colors.textDark,
    marginBottom: spacing.sm,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  seeAll: {
    fontSize: typography.sizes.small,
    fontWeight: '700',
    color: colors.primaryLight,
  },

  quickGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  quickTile: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickTileIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickTileLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textDark,
    textAlign: 'center',
  },

  creditBanner: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  creditBannerGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  creditBannerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: 'rgba(252,211,77,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(252,211,77,0.3)',
  },
  creditBannerTitle: {
    fontSize: typography.sizes.small,
    fontWeight: '800',
    color: colors.white,
  },
  creditBannerSub: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 },

  txnCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  txnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  txnSep: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  txnIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  txnInfo: { flex: 1 },
  txnLabel: {
    fontSize: typography.sizes.small,
    fontWeight: '700',
    color: colors.textDark,
  },
  txnDate: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
  txnAmount: {
    fontSize: typography.sizes.small,
    fontWeight: '800',
  },
});
