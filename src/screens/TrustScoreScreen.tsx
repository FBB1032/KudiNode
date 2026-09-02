import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, typography, shadows } from '../theme/theme';
import { TopHeader } from '../components/TopHeader';
import { Icon } from '../components/Icon';
import { useLanguage } from '../context/LanguageContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const AXES = [
  { label: 'Inventory Turnover',  value: 0.92, color: colors.warningOrange, tag: 'High'      },
  { label: 'Peer Validation',     value: 0.85, color: colors.successGreen,  tag: 'Strong'     },
  { label: 'Co-op Reliability',   value: 0.96, color: colors.primaryMid,    tag: 'Excellent'  },
  { label: 'Revenue Consistency', value: 0.78, color: '#1565C0',            tag: 'Good'       },
];

const CREDIT_TIERS = [
  { tier: 'Tier 1', limit: '₦50,000',  status: 'active',  desc: 'Instant micro-credit'    },
  { tier: 'Tier 2', limit: '₦150,000', status: 'active',  desc: 'Verified trade evidence'  },
  { tier: 'Tier 3', limit: '₦500,000', status: 'locked',  desc: 'Requires 6-month history' },
];

export function TrustScoreScreen() {
  const { t } = useLanguage();
  const nav = useNavigation<Nav>();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDeep} />
      <TopHeader showBack title={t('trust.title')} subtitle={t('trust.subtitle')} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Score ring card */}
        <View style={[styles.scoreCard, shadows.cardLg]}>
          <View style={styles.scoreRingOuter}>
            <View style={styles.scoreRingInner}>
              <Text style={styles.scoreNumber}>91</Text>
              <Text style={styles.scoreMax}>/ 100</Text>
              <Text style={styles.scoreWord}>{t('trust.scoreWord')}</Text>
            </View>
          </View>

          <View style={styles.scoreTagRow}>
            <Icon name="trending-up" size={16} color={colors.successGreen} />
            <Text style={styles.scoreTagText}>{t('trust.tradeVelocity')}</Text>
            <Icon name="checkmark-circle" size={16} color={colors.successGreen} />
          </View>
          <Text style={styles.scoreDesc}>
            {t('trust.creditEligible', { amount: '150,000', rate: '1.5%' })}
          </Text>
        </View>

        {/* Score axes */}
        <Text style={styles.sectionTitle}>{t('trust.scoreBreakdown')}</Text>
        <View style={[styles.card, shadows.card]}>
          {AXES.map((axis, i) => (
            <View key={i} style={[styles.axisRow, i < AXES.length - 1 && styles.axisBorder]}>
              <View style={styles.axisLeft}>
                <Text style={styles.axisLabel}>{axis.label}</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${axis.value * 100}%` as any, backgroundColor: axis.color }]} />
                </View>
              </View>
              <View style={[styles.axisBadge, { backgroundColor: axis.color + '18' }]}>
                <Text style={[styles.axisBadgeText, { color: axis.color }]}>
                  {axis.tag}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Credit tiers */}
        <Text style={styles.sectionTitle}>{t('trust.creditTiers')}</Text>
        {CREDIT_TIERS.map((tier, i) => (
          <View
            key={i}
            style={[styles.tierCard, shadows.card, tier.status === 'locked' && styles.tierLocked]}
          >
            <View style={[styles.tierIcon, tier.status === 'locked' && styles.tierIconLocked]}>
              <Icon
                name={tier.status === 'active' ? 'card' : 'lock'}
                size={22}
                color={tier.status === 'active' ? colors.primaryMid : colors.textMuted}
              />
            </View>
            <View style={styles.tierInfo}>
              <View style={styles.tierRow}>
                <Text style={[styles.tierName, tier.status === 'locked' && styles.tierTextMuted]}>
                  {tier.tier}
                </Text>
                <View style={[styles.tierPill, { backgroundColor: tier.status === 'active' ? '#E8FFF2' : colors.grayBG }]}>
                  <Text style={[styles.tierPillText, { color: tier.status === 'active' ? colors.successGreen : colors.textMuted }]}>
                    {tier.status === 'active' ? t('common.unlocked') : t('common.locked')}
                  </Text>
                </View>
              </View>
              <Text style={[styles.tierLimit, tier.status === 'locked' && styles.tierTextMuted]}>
                {tier.limit}
              </Text>
              <Text style={styles.tierDesc}>{tier.desc}</Text>
            </View>
          </View>
        ))}

        {/* Apply CTA */}
        <TouchableOpacity
          style={[styles.applyBtn, shadows.button]}
          onPress={() => nav.navigate('ApplyLoan')}
          activeOpacity={0.88}
        >
          <LinearGradient
            colors={[colors.primaryMid, colors.primaryDeep]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.applyGrad}
          >
            <Icon name="bank" size={20} color={colors.white} />
            <Text style={styles.applyText}>{t('trust.applyButton')}</Text>
            <Icon name="arrow-forward" size={18} color={colors.white} />
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: spacing.xxxl * 2 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:  { flex: 1, backgroundColor: colors.grayBG },
  scroll:{ flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.md },
  // Score card
  scoreCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  scoreRingOuter: {
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: colors.grayBG,
    borderWidth: 10, borderColor: colors.primaryMid,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  scoreRingInner: { alignItems: 'center' },
  scoreNumber:    { fontSize: 40, fontWeight: '800', color: colors.primaryDeep, lineHeight: 44 },
  scoreMax:       { fontSize: typography.sizes.small, color: colors.textMuted, fontWeight: '600' },
  scoreWord:      { fontSize: typography.sizes.tiny, color: colors.textMuted, marginTop: 2 },
  scoreTagRow:    { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.sm },
  scoreTagText:   { fontSize: typography.sizes.small, fontWeight: '700', color: colors.successGreen },
  scoreDesc:      { fontSize: typography.sizes.small, color: colors.textMuted, textAlign: 'center', lineHeight: 18 },
  // Sections
  sectionTitle: { fontSize: typography.sizes.h4, fontWeight: '800', color: colors.textDark, marginTop: spacing.sm },
  card:         { backgroundColor: colors.white, borderRadius: radius.xl, overflow: 'hidden' },
  axisRow:      { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  axisBorder:   { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  axisLeft:     { flex: 1 },
  axisLabel:    { fontSize: typography.sizes.small, fontWeight: '600', color: colors.textDark, marginBottom: 6 },
  barTrack:     { height: 6, backgroundColor: colors.grayBG, borderRadius: 3 },
  barFill:      { height: '100%', borderRadius: 3 },
  axisBadge:    { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.pill },
  axisBadgeText:{ fontSize: typography.sizes.tiny, fontWeight: '700' },
  // Tiers
  tierCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md,
    backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.lg,
  },
  tierLocked:    { opacity: 0.6 },
  tierIcon:      { width: 46, height: 46, borderRadius: 14, backgroundColor: colors.accentLight, alignItems: 'center', justifyContent: 'center' },
  tierIconLocked:{ backgroundColor: colors.grayBG },
  tierInfo:      { flex: 1 },
  tierRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tierName:      { fontSize: typography.sizes.body, fontWeight: '800', color: colors.textDark },
  tierTextMuted: { color: colors.textMuted },
  tierLimit:     { fontSize: typography.sizes.h3, fontWeight: '800', color: colors.primaryDeep, marginTop: 2 },
  tierPill:      { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.pill },
  tierPillText:  { fontSize: typography.sizes.tiny, fontWeight: '700' },
  tierDesc:      { fontSize: typography.sizes.tiny, color: colors.textMuted, marginTop: 4 },
  // Apply
  applyBtn:  { borderRadius: radius.xl, overflow: 'hidden', marginTop: spacing.sm },
  applyGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: 16 },
  applyText: { fontSize: typography.sizes.body, fontWeight: '800', color: colors.white },
});
