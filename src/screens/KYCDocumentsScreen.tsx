import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar,
} from 'react-native';
import { colors, spacing, radius, typography, shadows } from '../theme/theme';
import { TopHeader } from '../components/TopHeader';
import { Icon } from '../components/Icon';
import { LinearGradient } from 'expo-linear-gradient';

const DOCUMENTS = [
  { id: 'nin',      name: 'National Identity Number (NIN)', status: 'Verified', date: 'Jul 20, 2026', icon: 'id-card' as const },
  { id: 'bvn',      name: 'Bank Verification Number (BVN)', status: 'Verified', date: 'Jul 20, 2026', icon: 'shield-checkmark' as const },
  { id: 'selfie',   name: 'Live Selfie & Liveness Check',   status: 'Verified', date: 'Jul 20, 2026', icon: 'person' as const },
  { id: 'business', name: 'Proof of Business / Trade Ledger',status: 'Optional for Tier-2', date: 'Not Uploaded', icon: 'receipt' as const },
];

export function KYCDocumentsScreen() {
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDeep} translucent={false} />
      <TopHeader showBack title="KYC & Verification" subtitle="KudiNode regulatory compliance" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Tier status card */}
        <LinearGradient
          colors={[colors.primaryMid, colors.primaryDeep]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={styles.statusCard}
        >
          <View style={styles.statusBadge}>
            <Icon name="shield-checkmark" size={14} color={colors.successGreen} />
            <Text style={styles.statusBadgeText}>Tier-1 Active</Text>
          </View>
          <Text style={styles.statusTitle}>Verified Merchant Account</Text>
          <Text style={styles.statusSub}>
            Your identity has been authenticated against Central Bank of Nigeria (CBN) databases via KudiNode sandbox.
          </Text>
          <View style={styles.limitRow}>
            <View style={styles.limitCol}>
              <Text style={styles.limitLbl}>Single Transfer Limit</Text>
              <Text style={styles.limitVal}>₦50,000</Text>
            </View>
            <View style={styles.limitSep} />
            <View style={styles.limitCol}>
              <Text style={styles.limitLbl}>Maximum Balance</Text>
              <Text style={styles.limitVal}>₦300,000</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Uploaded Documents */}
        <Text style={styles.sectionTitle}>Verification Documents</Text>
        <View style={[styles.card, shadows.card]}>
          {DOCUMENTS.map((doc, i) => {
            const isVerified = doc.status === 'Verified';
            return (
              <View key={doc.id} style={[styles.docRow, i < DOCUMENTS.length - 1 && styles.docBorder]}>
                <View style={[styles.docIcon, { backgroundColor: isVerified ? '#E8FFF2' : colors.accentLight }]}>
                  <Icon name={doc.icon} size={20} color={isVerified ? colors.successGreen : colors.primaryMid} />
                </View>
                <View style={styles.docInfo}>
                  <Text style={styles.docName}>{doc.name}</Text>
                  <Text style={styles.docDate}>{doc.date}</Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: isVerified ? '#E8FFF2' : '#FFF3E8' }]}>
                  <Text style={[styles.statusPillText, { color: isVerified ? colors.successGreen : colors.warningOrange }]}>
                    {doc.status}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Upgrade to Tier 2 CTA */}
        <View style={[styles.upgradeCard, shadows.card]}>
          <Icon name="trending-up" size={24} color={colors.primaryDeep} />
          <View style={styles.upgradeText}>
            <Text style={styles.upgradeTitle}>Upgrade to Tier-2 Merchant</Text>
            <Text style={styles.upgradeSub}>Upload a photo of your paper sales ledger to unlock up to ₦500,000 daily limits & credit expansion.</Text>
          </View>
          <TouchableOpacity style={styles.uploadBtn} activeOpacity={0.85}>
            <Text style={styles.uploadBtnText}>Upload Proof</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: spacing.xxxl * 2 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: colors.grayBG },
  scroll:  { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md },
  statusCard: {
    borderRadius: radius.xxl, padding: spacing.xl, gap: spacing.xs,
  },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'flex-start',
    paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radius.pill,
  },
  statusBadgeText: { color: colors.white, fontWeight: '700', fontSize: typography.sizes.tiny },
  statusTitle: { fontSize: typography.sizes.h3, fontWeight: '800', color: colors.white, marginTop: 4 },
  statusSub:   { fontSize: typography.sizes.small, color: 'rgba(255,255,255,0.85)', lineHeight: 20 },
  limitRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: radius.lg,
    padding: spacing.md, marginTop: spacing.sm,
  },
  limitCol: { flex: 1 },
  limitLbl: { fontSize: typography.sizes.tiny, color: 'rgba(255,255,255,0.7)' },
  limitVal: { fontSize: typography.sizes.body, fontWeight: '800', color: colors.white, marginTop: 2 },
  limitSep: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.2)' },
  sectionTitle: {
    fontSize: typography.sizes.small, fontWeight: '700',
    color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5,
    marginTop: spacing.sm,
  },
  card: { backgroundColor: colors.white, borderRadius: radius.xl, overflow: 'hidden' },
  docRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, gap: spacing.md },
  docBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  docIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  docInfo: { flex: 1 },
  docName: { fontSize: typography.sizes.body, fontWeight: '700', color: colors.textDark },
  docDate: { fontSize: typography.sizes.tiny, color: colors.textMuted, marginTop: 2 },
  statusPill: { paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radius.pill },
  statusPillText: { fontSize: typography.sizes.tiny, fontWeight: '700' },
  upgradeCard: {
    backgroundColor: colors.white, borderRadius: radius.xl,
    padding: spacing.lg, gap: spacing.md, alignItems: 'flex-start',
  },
  upgradeText: { gap: 4 },
  upgradeTitle: { fontSize: typography.sizes.body, fontWeight: '800', color: colors.textDark },
  upgradeSub:   { fontSize: typography.sizes.small, color: colors.textMuted, lineHeight: 18 },
  uploadBtn: {
    backgroundColor: colors.primaryDeep, borderRadius: radius.lg,
    paddingHorizontal: spacing.xl, paddingVertical: 10, alignSelf: 'stretch',
    alignItems: 'center', justifyContent: 'center',
  },
  uploadBtnText: { color: colors.white, fontWeight: '700', fontSize: typography.sizes.small },
});
