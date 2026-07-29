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
  { icon: 'send' as const, label: 'Transfer', color: '#4A1D7A', bg: '#F3EBFB', route: 'VoiceTransfer' as const },
  { icon: 'mic' as const, label: 'Log Voice', color: '#1FA84C', bg: '#E8FFF2', route: 'SalesIntake' as const },
  { icon: 'camera' as const, label: 'Scan', color: '#E8A93A', bg: '#FFF8E7', route: 'SalesIntake' as const },
  { icon: 'receipt' as const, label: 'Ledger', color: '#1565C0', bg: '#EBF5FF', route: 'Ledger' as const },
];

const RECENT_TXN = [
  { id: 1, label: 'Amara Foods – Rice', amount: '+₦23,000', type: 'sale', date: 'Today 09:14' },
  { id: 2, label: 'Esusu Contribution', amount: '-₦5,000', type: 'debit', date: 'Today 07:00' },
  { id: 3, label: 'Beans & Oil', amount: '+₦10,700', type: 'sale', date: 'Yesterday' },
  { id: 4, label: 'KudiNode Credit Topup', amount: '+₦50,000', type: 'credit', date: 'Jul 27' },
];

export function HomeScreen() {
  const { t } = useLanguage();
  const nav = useNavigation<Nav>();
  const [showBalance, setShowBalance] = useState(true);

  const handleCopyWemaAccount = () => {
    Alert.alert('Account Details Copied', 'Wema Account · 0129384756 (Amina Babangida Bello) copied to clipboard.');
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDeep} translucent={false} />

      {/* ── COMPACT GRADIENT HEADER ── */}
      <LinearGradient
        colors={[colors.primaryDeep, colors.primaryMid]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView edges={['top', 'left', 'right']}>
          {/* Header Row: Wema Account Pill (Left) + Notification Bell (Right) */}
          <View style={styles.greetRow}>
            <TouchableOpacity
              style={styles.headerWemaPill}
              onPress={handleCopyWemaAccount}
              activeOpacity={0.8}
            >
              <View style={styles.wemaPillLeft}>
                <Icon name="bank" size={13} color={colors.white} />
                <Text style={styles.headerWemaText}>
                  Wema Account · <Text style={styles.wemaBoldNum}>0129 3847 56</Text>
                </Text>
              </View>
              <Icon name="copy" size={11} color="rgba(255,255,255,0.75)" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => nav.navigate('Notifications')}
              activeOpacity={0.8}
            >
              <Icon name="bell" size={20} color={colors.white} />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>

          {/* Verified Merchant Badge */}
          <View style={styles.tierBadge}>
            <Icon name="shield-checkmark" size={11} color={colors.successGreen} />
            <Text style={styles.tierText}>Tier-1 Verified Merchant · Amina Bello</Text>
          </View>

          {/* ── PREMIER FINTECH BALANCE CARD ── */}
          <View style={[styles.balanceCard, shadows.cardLg]}>
            {/* Header: Cash in Hand / Account Label + Eye Toggle */}
            <View style={styles.cardHeaderRow}>
              <View style={styles.labelWithIcon}>
                <View style={styles.bankIconWrap}>
                  <Icon name="bank" size={15} color={colors.primaryDeep} />
                </View>
                <View>
                  <Text style={styles.balanceLbl}>Cash in Hand</Text>
                  <Text style={styles.balanceSub}>Merchant Settlement Account</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setShowBalance(!showBalance)}
                style={styles.eyeBtn}
                activeOpacity={0.7}
              >
                <Icon name={showBalance ? 'eye' : 'eye-off'} size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Main Balance Display */}
            <View style={styles.balanceDisplayRow}>
              <Text style={styles.balanceAmt}>
                {showBalance ? '₦57,300.00' : '••••••••'}
              </Text>
            </View>

            {/* 2 Clean Stat Boxes (Today's Profit & KudiNode Credit) */}
            <View style={styles.statsGrid}>
              {/* Today's Profit Box */}
              <View style={styles.statBox}>
                <Text style={styles.statBoxLabel}>Today's Net Profit</Text>
                <Text style={styles.statBoxValue}>{showBalance ? '₦24,680' : '••••••'}</Text>
                <View style={styles.growthPill}>
                  <Icon name="trending-up" size={10} color={colors.successGreen} />
                  <Text style={styles.growthPillText}>▲ 18% vs yesterday</Text>
                </View>
              </View>

              {/* KudiNode Credit Box */}
              <View style={styles.statBox}>
                <Text style={styles.statBoxLabel}>KudiNode Credit</Text>
                <Text style={styles.statBoxValue}>{showBalance ? '₦150,000' : '••••••'}</Text>
                <Text style={styles.statBoxSub}>Instant Loan Limit</Text>
              </View>
            </View>

            {/* Pristine Action Row */}
            <View style={styles.cardActionRow}>
              <TouchableOpacity
                style={styles.withdrawBtn}
                onPress={() => nav.navigate('VoiceTransfer')}
                activeOpacity={0.85}
              >
                <Icon name="send" size={14} color={colors.white} />
                <Text style={styles.withdrawTxt} numberOfLines={1}>Transfer</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.topupBtn}
                onPress={() => nav.navigate('ApplyLoan')}
                activeOpacity={0.85}
              >
                <Icon name="bank" size={14} color={colors.primaryDeep} />
                <Text style={styles.topupTxt} numberOfLines={1}>Get Credit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* ── SCROLLABLE BODY CONTENT ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── QUICK ACTIONS (4 Grid Tiles) ── */}
        <Text style={styles.sectionTitle}>{t('quickActions')}</Text>
        <View style={styles.quickGrid}>
          {QUICK_ACTIONS.map(action => (
            <TouchableOpacity
              key={action.label}
              style={[styles.quickTile, shadows.card]}
              onPress={() => nav.navigate(action.route as any)}
              activeOpacity={0.82}
            >
              <View style={[styles.quickTileIcon, { backgroundColor: action.bg }]}>
                <Icon name={action.icon} size={22} color={action.color} />
              </View>
              <Text style={styles.quickTileLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── AI CREDIT OFFER BANNER ── */}
        <TouchableOpacity
          style={[styles.creditBanner, shadows.card]}
          onPress={() => nav.navigate('ApplyLoan')}
          activeOpacity={0.85}
        >
          <View style={styles.creditBannerLeft}>
            <View style={styles.creditBannerIcon}>
              <Icon name="flash" size={22} color={colors.primaryDeep} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.creditBannerTitle}>Pre-Approved Loan: ₦150,000</Text>
              <Text style={styles.creditBannerSub}>0.5% daily interest · 1-click disbursement to account</Text>
            </View>
          </View>
          <Icon name="arrow-forward" size={16} color={colors.primaryMid} />
        </TouchableOpacity>

        {/* ── RECENT TRANSACTIONS ── */}
        <View style={styles.txnHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => nav.navigate('AllTransactions')} activeOpacity={0.7}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.txnCard, shadows.card]}>
          {RECENT_TXN.map((txn, i) => {
            const iconData =
              txn.type === 'sale' ? { name: 'receipt' as const, color: colors.successGreen, bg: '#E8FFF2' } :
                txn.type === 'credit' ? { name: 'card' as const, color: '#1565C0', bg: '#EBF5FF' } :
                  { name: 'transfer' as const, color: colors.warningOrange, bg: '#FFF3E8' };
            return (
              <View key={txn.id} style={[styles.txnRow, i < RECENT_TXN.length - 1 && styles.txnBorder]}>
                <View style={[styles.txnDot, { backgroundColor: iconData.bg }]}>
                  <Icon name={iconData.name} size={18} color={iconData.color} />
                </View>
                <View style={styles.txnInfo}>
                  <Text style={styles.txnLabel}>{txn.label}</Text>
                  <Text style={styles.txnDate}>{txn.date}</Text>
                </View>
                <Text style={[styles.txnAmount, { color: txn.amount.startsWith('+') ? colors.successGreen : colors.textDark }]}>
                  {txn.amount}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={{ height: spacing.xxxl * 2 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.grayBG },

  greetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
  headerWemaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  wemaPillLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerWemaText: {
    fontSize: 11,
    color: colors.white,
    fontWeight: '600',
  },
  wemaBoldNum: {
    fontWeight: '800',
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.13)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.warningOrange,
    borderWidth: 1.5,
    borderColor: colors.primaryDeep,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignSelf: 'flex-start',
    marginLeft: spacing.lg,
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  tierText: { fontSize: 10, color: colors.white, fontWeight: '600' },

  // Balance Card — COMPACT & SHIFTED UP
  balanceCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(74, 29, 122, 0.08)',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  bankIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceLbl: {
    fontSize: typography.sizes.small,
    color: colors.textDark,
    fontWeight: '800',
  },
  balanceSub: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1,
  },
  eyeBtn: {
    padding: 4,
  },
  balanceDisplayRow: {
    marginVertical: 4,
  },
  balanceAmt: {
    fontSize: 30,
    fontWeight: '900',
    color: colors.primaryDeep,
    letterSpacing: 0.5,
  },

  // Stats Grid (2 Boxes)
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F9F6FC',
    borderRadius: radius.lg,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(74, 29, 122, 0.06)',
  },
  statBoxLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
  },
  statBoxValue: {
    fontSize: typography.sizes.body,
    fontWeight: '800',
    color: colors.textDark,
    marginTop: 2,
  },
  growthPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#E8FFF2',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: radius.pill,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  growthPillText: {
    fontSize: 9,
    color: colors.successGreen,
    fontWeight: '700',
  },
  statBoxSub: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 4,
    fontWeight: '500',
  },

  // Action Buttons
  cardActionRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  withdrawBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: colors.primaryDeep,
    paddingVertical: 10,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.lg,
  },
  withdrawTxt: {
    fontSize: typography.sizes.tiny,
    fontWeight: '800',
    color: colors.white,
  },
  topupBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: colors.accentLight,
    paddingVertical: 10,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(74, 29, 122, 0.15)',
  },
  topupTxt: {
    fontSize: typography.sizes.tiny,
    fontWeight: '800',
    color: colors.primaryDeep,
  },

  // Scroll Content
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },

  sectionTitle: {
    fontSize: typography.sizes.body,
    fontWeight: '800',
    color: colors.textDark,
    marginBottom: spacing.xs,
  },

  // Quick Actions Grid (4 Tiles)
  quickGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  quickTile: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
  },
  quickTileIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickTileLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textDark,
    textAlign: 'center',
  },

  // Credit Offer Banner
  creditBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#F3EBFB',
  },
  creditBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  creditBannerIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.accentLight, alignItems: 'center', justifyContent: 'center' },
  creditBannerTitle: { fontSize: typography.sizes.small, fontWeight: '800', color: colors.textDark },
  creditBannerSub: { fontSize: 10, color: colors.textMuted, marginTop: 2 },

  // Transactions
  txnHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  seeAll: { fontSize: typography.sizes.tiny, fontWeight: '800', color: colors.primaryMid },
  txnCard: { backgroundColor: colors.white, borderRadius: radius.xl, overflow: 'hidden' },
  txnRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.md },
  txnBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  txnDot: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  txnInfo: { flex: 1 },
  txnLabel: { fontSize: typography.sizes.small, fontWeight: '700', color: colors.textDark },
  txnDate: { fontSize: 10, color: colors.textMuted, marginTop: 1 },
  txnAmount: { fontSize: typography.sizes.small, fontWeight: '800' },
});
