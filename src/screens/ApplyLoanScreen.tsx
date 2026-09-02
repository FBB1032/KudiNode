import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, StatusBar, Alert,
} from 'react-native';
import { colors, spacing, radius, typography, shadows } from '../theme/theme';
import { TopHeader } from '../components/TopHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { Icon } from '../components/Icon';
import { useLanguage } from '../context/LanguageContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const LOAN_AMOUNTS = [
  { label: '₦25,000',  val: 25000 },
  { label: '₦50,000',  val: 50000 },
  { label: '₦100,000', val: 100000 },
  { label: '₦150,000', val: 150000 },
];

const TENURES = [
  { labelKey: 'loan.tenure30', rate: 0.025, months: 1 },
  { labelKey: 'loan.tenure60', rate: 0.045, months: 2 },
  { labelKey: 'loan.tenure90', rate: 0.065, months: 3 },
];

const PURPOSES = [
  { labelKey: 'loan.purpose1' },
  { labelKey: 'loan.purpose2' },
  { labelKey: 'loan.purpose3' },
  { labelKey: 'loan.purpose4' },
];

export function ApplyLoanScreen() {
  const { t } = useLanguage();
  const nav = useNavigation<Nav>();
  const [selectedAmount, setSelectedAmount]   = useState(150000);
  const [selectedTenure, setSelectedTenure]   = useState(TENURES[0]);
  const [selectedPurpose, setSelectedPurpose] = useState(PURPOSES[0].labelKey);
  const [disbursementBank, setDisbursementBank] = useState('Wema Merchant (0129384756)');
  const [isSubmitting, setIsSubmitting]       = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Interest calculation
  const interestAmount = Math.round(selectedAmount * selectedTenure.rate);
  const totalRepayment = selectedAmount + interestAmount;
  const monthlyRepayment = Math.round(totalRepayment / selectedTenure.months);

  const handleSubmitLoan = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccessModal(true);
    }, 800);
  };

  const handleModalDone = () => {
    setShowSuccessModal(false);
    nav.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDeep} translucent={false} />
      <TopHeader showBack title={t('loan.title')} subtitle={t('loan.subtitle')} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Pre-Approved Hero Banner */}
        <LinearGradient
          colors={[colors.primaryDeep, colors.primaryMid]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={styles.heroCard}
        >
          <View style={styles.heroBadge}>
            <Icon name="shield-checkmark" size={13} color={colors.successGreen} />
            <Text style={styles.heroBadgeText}>{t('loan.instantDisbursement')}</Text>
          </View>
          <Text style={styles.heroTitle}>{t('loan.maxCredit')}</Text>
          <Text style={styles.heroAmount}>₦150,000.00</Text>
          <Text style={styles.heroSub}>
            {t('loan.creditBasis')}
          </Text>
        </LinearGradient>

        {/* 1. Select Loan Amount */}
        <Text style={styles.sectionTitle}>{t('loan.selectAmount')}</Text>
        <View style={[styles.card, shadows.card]}>
          <View style={styles.amountGrid}>
            {LOAN_AMOUNTS.map(a => {
              const isSel = selectedAmount === a.val;
              return (
                <TouchableOpacity
                  key={a.val}
                  style={[styles.amountTile, isSel && styles.amountTileSel]}
                  onPress={() => setSelectedAmount(a.val)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.amountTileText, isSel && styles.amountTileTextSel]}>
                    {a.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 2. Select Repayment Tenure */}
        <Text style={styles.sectionTitle}>{t('loan.repaymentPeriod')}</Text>
        <View style={[styles.card, shadows.card]}>
          {TENURES.map((tenure, idx) => {
            const isSel = selectedTenure.labelKey === tenure.labelKey;
            return (
              <TouchableOpacity
                key={tenure.labelKey}
                style={[styles.tenureRow, idx < TENURES.length - 1 && styles.borderBottom]}
                onPress={() => setSelectedTenure(tenure)}
                activeOpacity={0.8}
              >
                <View style={styles.radioCircle}>
                  {isSel && <View style={styles.radioInner} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tenureTitle}>{t(tenure.labelKey)}</Text>
                  <Text style={styles.tenureSub}>{t('loan.interestRate', { rate: (tenure.rate * 100).toFixed(1) })}</Text>
                </View>
                <Text style={styles.tenureAmount}>
                  {t('loan.monthlyPayment', { amount: Math.round((selectedAmount * (1 + tenure.rate)) / tenure.months).toLocaleString() })}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 3. Purpose of Loan */}
        <Text style={styles.sectionTitle}>{t('loan.loanPurpose')}</Text>
        <View style={[styles.card, shadows.card]}>
          {PURPOSES.map((p, idx) => {
            const isSel = selectedPurpose === p.labelKey;
            return (
              <TouchableOpacity
                key={p.labelKey}
                style={[styles.purposeRow, idx < PURPOSES.length - 1 && styles.borderBottom]}
                onPress={() => setSelectedPurpose(p.labelKey)}
                activeOpacity={0.8}
              >
                <Icon
                  name={isSel ? 'radio-button-on' : 'radio-button-off'}
                  size={18}
                  color={isSel ? colors.primaryMid : colors.textMuted}
                />
                <Text style={[styles.purposeText, isSel && styles.purposeTextSel]}>{t(p.labelKey)}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Loan Calculation Breakdown */}
        <Text style={styles.sectionTitle}>{t('loan.loanSummary')}</Text>
        <View style={[styles.summaryCard, shadows.card]}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('loan.principal')}</Text>
            <Text style={styles.summaryValue}>₦{selectedAmount.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('loan.interest')}</Text>
            <Text style={styles.summaryValue}>₦{interestAmount.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('loan.disbursementAccount')}</Text>
            <Text style={styles.summaryValue}>{disbursementBank}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>{t('loan.totalRepayment')}</Text>
            <Text style={styles.summaryTotalValue}>₦{totalRepayment.toLocaleString()}</Text>
          </View>
        </View>

        {/* Submit Button */}
        <PrimaryButton
          title={isSubmitting ? t('loan.processing') : t('loan.submit')}
          icon={<Icon name="bank" size={18} color={colors.white} />}
          loading={isSubmitting}
          onPress={handleSubmitLoan}
          style={{ marginTop: spacing.md }}
        />

        <View style={{ height: spacing.xxxl * 2 }} />
      </ScrollView>

      {/* ── SUBMIT SUCCESSFUL MODAL ── */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, shadows.cardLg]}>
            <View style={styles.successIconCircle}>
              <Icon name="checkmark-circle" size={52} color={colors.successGreen} />
            </View>

            <Text style={styles.modalTitle}>{t('loan.approved')}</Text>
            <Text style={styles.modalSub}>
              {t('loan.approvedMsg', { amount: selectedAmount.toLocaleString() })}
            </Text>

            <View style={styles.modalDetailsBox}>
              <View style={styles.mRow}>
                <Text style={styles.mLbl}>{t('loan.reference')}</Text>
                <Text style={styles.mVal}>LN-WEMA-782910</Text>
              </View>
              <View style={styles.mRow}>
                <Text style={styles.mLbl}>{t('loan.amountCredited')}</Text>
                <Text style={styles.mAmt}>₦{selectedAmount.toLocaleString()}</Text>
              </View>
              <View style={styles.mRow}>
                <Text style={styles.mLbl}>{t('loan.repaymentDue')}</Text>
                <Text style={styles.mVal}>₦{totalRepayment.toLocaleString()} ({t(selectedTenure.labelKey)})</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.modalDoneBtn} onPress={handleModalDone} activeOpacity={0.88}>
              <LinearGradient
                colors={[colors.primaryMid, colors.primaryDeep]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.modalDoneGrad}
              >
                <Text style={styles.modalDoneText}>{t('loan.returnDashboard')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: colors.grayBG },
  scroll:  { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md },

  heroCard: {
    borderRadius: radius.xxl, padding: spacing.xl, gap: spacing.xs,
  },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'flex-start',
    paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radius.pill,
  },
  heroBadgeText: { color: colors.white, fontWeight: '700', fontSize: typography.sizes.tiny },
  heroTitle:  { fontSize: typography.sizes.small, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  heroAmount: { fontSize: 32, fontWeight: '800', color: colors.white, letterSpacing: 0.5 },
  heroSub:    { fontSize: typography.sizes.tiny, color: 'rgba(255,255,255,0.75)', lineHeight: 18 },

  sectionTitle: {
    fontSize: typography.sizes.small, fontWeight: '700',
    color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5,
    marginTop: spacing.xs,
  },
  card: { backgroundColor: colors.white, borderRadius: radius.xl, overflow: 'hidden' },

  // Amount Grid
  amountGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: spacing.md, gap: spacing.sm },
  amountTile: {
    width: '47.5%', paddingVertical: spacing.md, borderRadius: radius.lg,
    alignItems: 'center', borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.grayBG,
  },
  amountTileSel: { backgroundColor: colors.primaryDeep, borderColor: colors.primaryDeep },
  amountTileText: { fontSize: typography.sizes.body, fontWeight: '800', color: colors.textDark },
  amountTileTextSel: { color: colors.white },

  // Tenure
  tenureRow: {
    flexDirection: 'row', alignItems: 'center', padding: spacing.lg, gap: spacing.md,
  },
  borderBottom: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  radioCircle: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2,
    borderColor: colors.primaryMid, alignItems: 'center', justifyContent: 'center',
  },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primaryDeep },
  tenureTitle: { fontSize: typography.sizes.body, fontWeight: '700', color: colors.textDark },
  tenureSub:   { fontSize: typography.sizes.tiny, color: colors.textMuted, marginTop: 1 },
  tenureAmount:{ fontSize: typography.sizes.small, fontWeight: '800', color: colors.primaryDeep },

  // Purpose
  purposeRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, gap: spacing.md },
  purposeText: { fontSize: typography.sizes.body, color: colors.textDark },
  purposeTextSel: { fontWeight: '700', color: colors.primaryDeep },

  // Summary
  summaryCard: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.sm },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: typography.sizes.small, color: colors.textMuted },
  summaryValue: { fontSize: typography.sizes.small, fontWeight: '700', color: colors.textDark },
  summaryDivider: { height: 1, backgroundColor: colors.border, marginVertical: 4 },
  summaryTotalLabel: { fontSize: typography.sizes.body, fontWeight: '800', color: colors.textDark },
  summaryTotalValue: { fontSize: typography.sizes.h3, fontWeight: '800', color: colors.primaryDeep },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  modalCard:    { width: '100%', backgroundColor: colors.white, borderRadius: radius.xxl, padding: spacing.xl, alignItems: 'center' },
  successIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E8FFF2', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  modalTitle: { fontSize: typography.sizes.h2, fontWeight: '800', color: colors.textDark, textAlign: 'center' },
  modalSub:   { fontSize: typography.sizes.small, color: colors.textMuted, textAlign: 'center', marginTop: 6, lineHeight: 20, marginBottom: spacing.lg },
  modalDetailsBox: { width: '100%', backgroundColor: colors.grayBG, borderRadius: radius.xl, padding: spacing.md, gap: spacing.xs, marginBottom: spacing.lg },
  mRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mLbl: { fontSize: typography.sizes.tiny, color: colors.textMuted },
  mVal: { fontSize: typography.sizes.small, fontWeight: '700', color: colors.textDark },
  mAmt: { fontSize: typography.sizes.h4, fontWeight: '800', color: colors.successGreen },
  modalDoneBtn: { width: '100%', borderRadius: radius.xl, overflow: 'hidden' },
  modalDoneGrad:{ paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  modalDoneText:{ color: colors.white, fontWeight: '800', fontSize: typography.sizes.body },
});
