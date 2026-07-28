import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius, typography, shadows } from '../theme/theme';
import { Icon } from '../components/Icon';
import { KudiNodeLogo } from '../components/KudiNodeLogo';
import { useLanguage } from '../context/LanguageContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const QUICK_ACTIONS = [
  { icon: 'send'      as const, label: 'Transfer',  color: '#4A1D7A', bg: '#F3EBFB', route: 'TransferPin'    as const },
  { icon: 'mic'       as const, label: 'Log Voice',  color: '#1FA84C', bg: '#E8FFF2', route: 'SalesIntake'   as const },
  { icon: 'camera'    as const, label: 'Scan',       color: '#E8A93A', bg: '#FFF8E7', route: 'SalesIntake'   as const },
  { icon: 'receipt'   as const, label: 'Ledger',     color: '#1565C0', bg: '#EBF5FF', route: 'Ledger'        as const },
];

const RECENT_TXN = [
  { id: 1, label: 'Amara Foods – Rice',   amount: '+₦23,000', type: 'sale',   date: 'Today 09:14' },
  { id: 2, label: 'Esusu Contribution',   amount: '-₦5,000',  type: 'debit',  date: 'Today 07:00' },
  { id: 3, label: 'Beans & Oil',          amount: '+₦10,700', type: 'sale',   date: 'Yesterday'   },
  { id: 4, label: 'KudiNode Credit Topup',amount: '+₦50,000', type: 'credit', date: 'Jul 27'      },
];

export function HomeScreen() {
  const { t } = useLanguage();
  const nav = useNavigation<Nav>();
  const [showBalance, setShowBalance] = useState(true);

  const handleCopyWemaAccount = () => {
    Alert.alert('Account Details Copied', 'Wema Bank PLC · 0129384756 (Amina Babangida Bello) copied to clipboard.');
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDeep} translucent={false} />

      {/* ── GRADIENT HEADER WITH LOGO ── */}
      <LinearGradient
        colors={[colors.primaryDeep, colors.primaryMid]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView edges={['top', 'left', 'right']}>
          {/* Greeting & Logo row */}
          <View style={styles.greetRow}>
            <TouchableOpacity
              onPress={() => nav.navigate('Profile')}
              activeOpacity={0.85}
            >
              <KudiNodeLogo size="small" variant="light" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => nav.navigate('Notifications')}
              activeOpacity={0.8}
            >
              <Icon name="bell" size={22} color={colors.white} />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>

          {/* Verified Merchant Badge */}
          <View style={styles.tierBadge}>
            <Icon name="shield-checkmark" size={12} color={colors.successGreen} />
            <Text style={styles.tierText}>Tier-1 Verified Merchant · Amina Bello</Text>
          </View>

          {/* ── PREMIER FINTECH BALANCE CARD ── */}
          <View style={[styles.balanceCard, shadows.cardLg]}>
            {/* Header: Account Label + Eye Toggle */}
            <View style={styles.cardHeaderRow}>
              <View style={styles.labelWithIcon}>
                <View style={styles.bankIconWrap}>
                  <Icon name="bank" size={16} color={colors.primaryDeep} />
                </View>
                <View>
                  <Text style={styles.balanceLbl}>Cash in Hand</Text>
                  <Text style={styles.balanceSub}>Wema Settlement Account</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setShowBalance(!showBalance)}
                style={styles.eyeBtn}
                activeOpacity={0.7}
              >
                <Icon name={showBalance ? 'eye' : 'eye-off'} size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Main Balance Display */}
            <View style={styles.balanceDisplayRow}>
              <Text style={styles.balanceAmt}>
                {showBalance ? '₦57,300.00' : '••••••••'}
              </Text>
            </View>

            {/* Wema Bank Account Badge */}
            <TouchableOpacity
              style={styles.wemaPill}
              onPress={handleCopyWemaAccount}
              activeOpacity={0.8}
            >
              <View style={styles.wemaPillLeft}>
                <Icon name="bank" size={12} color={colors.primaryDeep} />
                <Text style={styles.wemaPillText}>
                  Wema Bank · <Text style={styles.wemaBoldNum}>0129 3847 56</Text> (Amina Bello)
                </Text>
              </View>
              <Icon name="copy" size={12} color={colors.primaryMid} />
            </TouchableOpacity>

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
                onPress={() => nav.navigate('TransferPin')}
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

      {/* ── SCROLL AREA ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.qaRow}>
          {QUICK_ACTIONS.map((a) => (
            <TouchableOpacity
              key={a.label}
              style={styles.qaItem}
              onPress={() => nav.navigate(a.route)}
              activeOpacity={0.75}
            >
              <View style={[styles.qaIcon, { backgroundColor: a.bg }]}>
                <Icon name={a.icon} size={24} color={a.color} />
              </View>
              <Text style={styles.qaLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Credit Banner */}
        <TouchableOpacity
          style={[styles.creditBanner, shadows.card]}
          onPress={() => nav.navigate('ApplyLoan')}
          activeOpacity={0.85}
        >
          <View style={styles.creditBannerLeft}>
            <View style={styles.creditBannerIcon}>
              <Icon name="bank" size={22} color={colors.primaryDeep} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.creditBannerTitle}>KudiNode Credit Line</Text>
              <Text style={styles.creditBannerSub} numberOfLines={1}>₦150,000 available loan</Text>
            </View>
          </View>
          <Icon name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Recent Transactions */}
        <View style={styles.txnHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => nav.navigate('AllTransactions')} activeOpacity={0.7}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.txnCard, shadows.card]}>
          {RECENT_TXN.map((txn, i) => {
            const iconData =
              txn.type === 'sale'   ? { name: 'receipt'  as const, color: colors.successGreen, bg: '#E8FFF2' } :
              txn.type === 'credit' ? { name: 'card'     as const, color: '#1565C0',           bg: '#EBF5FF' } :
                                      { name: 'transfer' as const, color: colors.warningOrange, bg: '#FFF3E8' };
            return (
              <View key={txn.id} style={[styles.txnRow, i < RECENT_TXN.length - 1 && styles.txnBorder]}>
                <View style={[styles.txnDot, { backgroundColor: iconData.bg }]}>
                  <Icon name={iconData.name} size={16} color={iconData.color} />
                </View>
                <View style={styles.txnInfo}>
                  <Text style={styles.txnLabel}>{txn.label}</Text>
                  <Text style={styles.txnDate}>{txn.date}</Text>
                </View>
                <Text style={[styles.txnAmount, { color: txn.type === 'debit' ? colors.warningOrange : colors.successGreen }]}>
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
    paddingTop: spacing.md,
  },
  headerIconBtn: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.13)',
    alignItems: 'center', justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute', top: 9, right: 9,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.warningOrange,
    borderWidth: 1.5, borderColor: colors.primaryDeep,
  },
  tierBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignSelf: 'flex-start',
    marginLeft: spacing.lg,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md, paddingVertical: 5,
    borderRadius: radius.pill,
  },
  tierText: { fontSize: typography.sizes.tiny, color: colors.white, fontWeight: '600' },

  // Balance Card
  balanceCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
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
    gap: spacing.sm,
    flex: 1,
  },
  bankIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceLbl: {
    fontSize: typography.sizes.body,
    color: colors.textDark,
    fontWeight: '800',
  },
  balanceSub: {
    fontSize: typography.sizes.tiny,
    color: colors.textMuted,
    marginTop: 1,
  },
  eyeBtn: {
    padding: 6,
  },
  balanceDisplayRow: {
    marginTop: spacing.xs,
  },
  balanceAmt: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.primaryDeep,
    letterSpacing: 0.5,
  },

  // Wema Account Pill
  wemaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3EBFB',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  wemaPillLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  wemaPillText: {
    fontSize: 11,
    color: colors.primaryDeep,
    fontWeight: '600',
  },
  wemaBoldNum: {
    fontWeight: '800',
  },

  // Stats Grid (2 Boxes)
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F9F6FC',
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(74, 29, 122, 0.06)',
  },
  statBoxLabel: {
    fontSize: typography.sizes.tiny,
    color: colors.textMuted,
    fontWeight: '600',
  },
  statBoxValue: {
    fontSize: typography.sizes.h4,
    fontWeight: '800',
    color: colors.textDark,
    marginTop: 3,
  },
  growthPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#E8FFF2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  growthPillText: {
    fontSize: 10,
    color: colors.successGreen,
    fontWeight: '700',
  },
  statBoxSub: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 6,
    fontWeight: '500',
  },

  // Action Buttons
  cardActionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  withdrawBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primaryDeep,
    paddingVertical: 12,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.xl,
  },
  withdrawTxt: {
    fontSize: typography.sizes.small,
    fontWeight: '700',
    color: colors.white,
  },
  topupBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.accentLight,
    paddingVertical: 12,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(74, 29, 122, 0.15)',
  },
  topupTxt: {
    fontSize: typography.sizes.small,
    fontWeight: '700',
    color: colors.primaryDeep,
  },

  // Scroll Content
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.xs },

  sectionTitle: {
    fontSize: typography.sizes.h4,
    fontWeight: '800',
    color: colors.textDark,
    marginBottom: spacing.md,
  },

  // Quick Actions
  qaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  qaItem: { alignItems: 'center', width: '22%' },
  qaIcon: {
    width: 54, height: 54, borderRadius: radius.xl,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 6,
  },
  qaLabel: {
    fontSize: typography.sizes.tiny,
    fontWeight: '600', color: colors.textDark,
    textAlign: 'center',
  },

  // Credit Banner
  creditBanner: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: radius.xl, padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  creditBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  creditBannerIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.accentLight, alignItems: 'center', justifyContent: 'center' },
  creditBannerTitle: { fontSize: typography.sizes.body, fontWeight: '700', color: colors.textDark },
  creditBannerSub:   { fontSize: typography.sizes.tiny, color: colors.textMuted, marginTop: 2 },

  // Transactions
  txnHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  seeAll:    { fontSize: typography.sizes.small, fontWeight: '700', color: colors.primaryMid },
  txnCard:   { backgroundColor: colors.white, borderRadius: radius.xl, overflow: 'hidden' },
  txnRow:    { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, gap: spacing.md },
  txnBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  txnDot:    { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  txnInfo:   { flex: 1 },
  txnLabel:  { fontSize: typography.sizes.body, fontWeight: '600', color: colors.textDark },
  txnDate:   { fontSize: typography.sizes.tiny, color: colors.textMuted, marginTop: 2 },
  txnAmount: { fontSize: typography.sizes.body, fontWeight: '800' },
});
