/**
 * ManualTransferScreen — KudiNode AI
 * - When arriving from Voice: shows AI-parsed fields pre-filled with a "Voice Parsed" banner.
 * - When arriving from "Use Manual Instead": empty form ready to fill.
 * All fields must be completed before proceeding.
 * Tapping "Proceed" opens the Security PIN Authorization Modal directly on this screen.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, FlatList, Modal, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, typography, shadows } from '../theme/theme';
import { TopHeader } from '../components/TopHeader';
import { Icon } from '../components/Icon';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../AppNavigator';
import { UssdFallbackModule } from '../services/UssdFallbackModule';

type Nav   = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'ManualTransfer'>;

const NIGERIAN_BANKS = [
  'Wema Bank PLC',
  'Access Bank PLC',
  'Guaranty Trust Bank (GTBank)',
  'Zenith Bank PLC',
  'First Bank of Nigeria',
  'United Bank for Africa (UBA)',
  'Kuda Microfinance Bank',
  'OPay / Paycom',
  'Palmpay',
  'Moniepoint MFB',
  'Stanbic IBTC Bank',
  'Sterling Bank PLC',
  'Fidelity Bank PLC',
  'First City Monument Bank (FCMB)',
  'Union Bank',
  'Polaris Bank PLC',
];

export function ManualTransferScreen() {
  const nav   = useNavigation<Nav>();
  const route = useRoute<Route>();
  const prefilled = route.params?.prefilled;
  const fromVoice = !!prefilled;

  const [recipientName, setRecipientName] = useState(prefilled?.prefilledRecipient ?? '');
  const [accountNum, setAccountNum]       = useState(prefilled?.prefilledAccount   ?? '');
  const [selectedBank, setSelectedBank]   = useState(prefilled?.prefilledBank      ?? '');
  const [amount, setAmount]               = useState(prefilled?.prefilledAmount    ?? '');
  const [note, setNote]                   = useState('');

  // Modals & PIN
  const [showBankPicker, setShowBankPicker]         = useState(false);
  const [showPinModal, setShowPinModal]             = useState(false);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal]     = useState(false);
  const [isVerifyingPin, setIsVerifyingPin]         = useState(false);
  const [processStep, setProcessStep]               = useState(1);
  const [pin, setPin]                               = useState('');

  const [bankSearch, setBankSearch] = useState('');
  const [errors, setErrors]         = useState<Record<string, string>>({});

  const filteredBanks = NIGERIAN_BANKS.filter(b =>
    b.toLowerCase().includes(bankSearch.toLowerCase())
  );

  const allFilled = recipientName.trim() && accountNum.length === 10 && selectedBank && amount.trim();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!recipientName.trim())                              e.recipientName = 'Recipient name is required';
    if (!accountNum.trim() || accountNum.length < 10)      e.accountNum    = '10-digit account number required';
    if (!selectedBank)                                      e.selectedBank  = 'Please select a bank';
    if (!amount.trim() || isNaN(Number(amount.replace(/,/g, '')))) e.amount = 'Enter a valid amount';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleProceed = () => {
    if (!validate()) return;
    setPin('');
    setShowPinModal(true);
  };

  const startTransferProcessing = () => {
    setShowPinModal(false);
    setShowProcessingModal(true);
    setProcessStep(1);
    setTimeout(() => setProcessStep(2), 600);
    setTimeout(() => setProcessStep(3), 1200);
    setTimeout(() => {
      setShowProcessingModal(false);
      setShowSuccessModal(true);
    }, 1800);
  };

  const handleKeypadPress = (val: string) => {
    if (isVerifyingPin) return;
    if (val === 'DEL') {
      setPin(prev => prev.slice(0, -1));
    } else if (val === 'BIO') {
      // Simulate Biometric Success -> trigger loading steps
      startTransferProcessing();
    } else if (pin.length < 4) {
      const nextPin = pin + val;
      setPin(nextPin);
      if (nextPin.length === 4) {
        setIsVerifyingPin(true);
        setTimeout(() => {
          setIsVerifyingPin(false);
          startTransferProcessing();
        }, 400);
      }
    }
  };

  const handleUssdFallback = async () => {
    const numAmount = parseInt(amount.replace(/[^0-9]/g, ''), 10) || 0;
    const success = await UssdFallbackModule.triggerUssdFallback({
      accountNumber: accountNum,
      amount: numAmount,
      recipientName,
    });
    if (success) {
      setShowPinModal(false);
    }
  };

  const handleDoneSuccess = () => {
    setShowSuccessModal(false);
    nav.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDeep} translucent={false} />
      <TopHeader
        showBack
        title={fromVoice ? 'Review Transfer Details' : 'Manual Transfer'}
        subtitle={fromVoice ? 'Verify AI-parsed details below' : 'Fill in all transfer details'}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Transfer Form Card ── */}
        <View style={[styles.card, shadows.card]}>
          <Text style={styles.cardTitle}>Transfer Details</Text>

          {/* Fixed Non-Editable Sender / From Account */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>From Account (Fixed)</Text>
            <View style={styles.fixedFromWrap}>
              <Icon name="bank" size={18} color={colors.primaryDeep} />
              <View style={{ flex: 1 }}>
                <Text style={styles.fixedFromTitle}>Wema Bank PLC</Text>
                <Text style={styles.fixedFromSub}>Settlement Account · 0129384756 (Amina Bello)</Text>
              </View>
              <Icon name="lock-closed" size={14} color={colors.textMuted} />
            </View>
          </View>

          {/* Recipient */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Recipient / Beneficiary Name</Text>
            <View style={[styles.inputWrap, errors.recipientName ? styles.inputError : null]}>
              <Icon name="person" size={18} color={colors.textMuted} />
              <TextInput
                style={styles.input}
                value={recipientName}
                onChangeText={v => { setRecipientName(v); setErrors(p => ({ ...p, recipientName: '' })); }}
                placeholder="e.g. Supplier Musa Ibrahim"
                placeholderTextColor={colors.textMuted}
              />
              {fromVoice && recipientName ? (
                <Icon name="mic" size={13} color={colors.primaryMid} />
              ) : null}
            </View>
            {errors.recipientName ? <Text style={styles.fieldError}>{errors.recipientName}</Text> : null}
          </View>

          {/* Bank Selector */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Destination Bank</Text>
            <TouchableOpacity
              style={[styles.inputWrap, styles.bankTrigger, errors.selectedBank ? styles.inputError : null]}
              onPress={() => setShowBankPicker(true)}
              activeOpacity={0.8}
            >
              <Icon name="bank" size={18} color={selectedBank ? colors.primaryDeep : colors.textMuted} />
              <Text style={[styles.bankTriggerText, { color: selectedBank ? colors.textDark : colors.textMuted }]}>
                {selectedBank || 'Select bank…'}
              </Text>
              {fromVoice && selectedBank ? (
                <Icon name="mic" size={13} color={colors.primaryMid} />
              ) : null}
              <Icon name="chevron-down" size={16} color={colors.textMuted} />
            </TouchableOpacity>
            {errors.selectedBank ? <Text style={styles.fieldError}>{errors.selectedBank}</Text> : null}
          </View>

          {/* Account Number */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Account Number (10 digits)</Text>
            <View style={[styles.inputWrap, errors.accountNum ? styles.inputError : null]}>
              <Icon name="card" size={18} color={colors.textMuted} />
              <TextInput
                style={styles.input}
                value={accountNum}
                onChangeText={v => { setAccountNum(v); setErrors(p => ({ ...p, accountNum: '' })); }}
                placeholder="0123456789"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                maxLength={10}
              />
              {fromVoice && accountNum ? (
                <Icon name="mic" size={13} color={colors.primaryMid} />
              ) : null}
              {accountNum.length === 10 && (
                <Icon name="checkmark-circle" size={16} color={colors.successGreen} />
              )}
            </View>
            {errors.accountNum ? <Text style={styles.fieldError}>{errors.accountNum}</Text> : null}
          </View>

          {/* Amount */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Transfer Amount (₦)</Text>
            <View style={[styles.inputWrap, errors.amount ? styles.inputError : null]}>
              <Text style={styles.nairaSign}>₦</Text>
              <TextInput
                style={[styles.input, styles.amountInput]}
                value={amount}
                onChangeText={v => { setAmount(v); setErrors(p => ({ ...p, amount: '' })); }}
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
              />
              {fromVoice && amount ? (
                <Icon name="mic" size={13} color={colors.primaryMid} />
              ) : null}
            </View>
            {errors.amount ? <Text style={styles.fieldError}>{errors.amount}</Text> : null}
          </View>

          {/* Optional note */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Transfer Note <Text style={{ fontWeight: '400', color: colors.textMuted }}>(Optional)</Text></Text>
            <View style={styles.inputWrap}>
              <Icon name="document-text" size={18} color={colors.textMuted} />
              <TextInput
                style={styles.input}
                value={note}
                onChangeText={setNote}
                placeholder="e.g. Payment for goods"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>
        </View>

        {/* ── Summary Preview (when all filled) ── */}
        {allFilled ? (
          <View style={[styles.summaryCard, shadows.card]}>
            <View style={styles.summaryHeader}>
              <Icon name="checkmark-circle" size={18} color={colors.successGreen} />
              <Text style={styles.summaryTitle}>Transfer Summary</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>To</Text>
              <Text style={styles.summaryValue}>{recipientName}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Account</Text>
              <Text style={styles.summaryValue}>{accountNum}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Bank</Text>
              <Text style={styles.summaryValue}>{selectedBank}</Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryAmountRow]}>
              <Text style={styles.summaryLabel}>Amount</Text>
              <Text style={styles.summaryAmount}>₦{Number(amount.replace(/,/g, '')).toLocaleString()}</Text>
            </View>
          </View>
        ) : null}

        {/* ── Proceed CTA ── */}
        <TouchableOpacity
          style={[styles.proceedBtn, shadows.button]}
          onPress={handleProceed}
          activeOpacity={0.88}
        >
          <LinearGradient
            colors={[colors.primaryMid, colors.primaryDeep]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.proceedGrad}
          >
            <Icon name="lock" size={20} color={colors.white} />
            <Text style={styles.proceedText}>Proceed to Authorize</Text>
            <Icon name="arrow-forward" size={18} color={colors.white} />
          </LinearGradient>
        </TouchableOpacity>

        {/* ── Back to Voice link ── */}
        <TouchableOpacity
          style={styles.voiceBackBtn}
          onPress={() => nav.replace('VoiceTransfer')}
          activeOpacity={0.75}
        >
          <Icon name="mic" size={16} color={colors.primaryMid} />
          <Text style={styles.voiceBackText}>
            {fromVoice ? 'Re-record Voice Command' : 'Use Voice Transfer Instead'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: spacing.xxxl * 2 }} />
      </ScrollView>

      {/* ── Bank Picker Bottom-Sheet Modal ── */}
      <Modal visible={showBankPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Destination Bank</Text>
              <TouchableOpacity onPress={() => setShowBankPicker(false)} activeOpacity={0.8}>
                <Icon name="close" size={22} color={colors.textDark} />
              </TouchableOpacity>
            </View>
            <View style={styles.searchBox}>
              <Icon name="search" size={16} color={colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search bank…"
                placeholderTextColor={colors.textMuted}
                value={bankSearch}
                onChangeText={setBankSearch}
              />
            </View>
            <FlatList
              data={filteredBanks}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.bankItem, selectedBank === item && styles.bankItemSelected]}
                  onPress={() => {
                    setSelectedBank(item);
                    setShowBankPicker(false);
                    setBankSearch('');
                    setErrors(p => ({ ...p, selectedBank: '' }));
                  }}
                  activeOpacity={0.75}
                >
                  <View style={styles.bankIconCircle}>
                    <Icon name="bank" size={16} color={colors.primaryDeep} />
                  </View>
                  <Text style={[styles.bankItemText, selectedBank === item && styles.bankItemTextSelected]}>
                    {item}
                  </Text>
                  {selectedBank === item && <Icon name="checkmark" size={16} color={colors.successGreen} />}
                </TouchableOpacity>
              )}
              contentContainerStyle={{ paddingVertical: spacing.sm }}
            />
          </View>
        </View>
      </Modal>

      {/* ── 🔒 SECURITY PIN AUTHORIZATION MODAL ── */}
      <Modal visible={showPinModal} transparent animationType="slide">
        <View style={styles.pinModalOverlay}>
          <View style={[styles.pinModalCard, shadows.cardLg]}>
            {/* Header */}
            <View style={styles.pinModalHeader}>
              <Text style={styles.pinModalTitle}>Authorize Transfer</Text>
              <TouchableOpacity onPress={() => setShowPinModal(false)} activeOpacity={0.8}>
                <Icon name="close" size={22} color={colors.textDark} />
              </TouchableOpacity>
            </View>

            {/* Summary line */}
            <View style={styles.pinSummaryBox}>
              <Text style={styles.pinSummarySub}>Sending</Text>
              <Text style={styles.pinSummaryAmt}>₦{Number(amount.replace(/,/g, '') || 0).toLocaleString()}</Text>
              <Text style={styles.pinSummaryTo}>To {recipientName} · {selectedBank}</Text>
            </View>

            <Text style={styles.pinPrompt}>Enter 4-Digit Security PIN</Text>

            {/* PIN Dots */}
            <View style={styles.pinDotsRow}>
              {[0, 1, 2, 3].map(idx => (
                <View
                  key={idx}
                  style={[
                    styles.pinDot,
                    pin.length > idx && styles.pinDotFilled,
                  ]}
                />
              ))}
            </View>

            {isVerifyingPin ? (
              <View style={styles.verifyingBox}>
                <ActivityIndicator size="small" color={colors.primaryMid} />
                <Text style={styles.verifyingText}>Verifying PIN…</Text>
              </View>
            ) : null}

            {/* Keypad */}
            <View style={styles.keypadGrid}>
              {['1','2','3','4','5','6','7','8','9','BIO','0','DEL'].map(key => (
                <TouchableOpacity
                  key={key}
                  style={[styles.keypadBtn, key === 'BIO' && styles.keypadSpecialBtn]}
                  onPress={() => handleKeypadPress(key)}
                  activeOpacity={0.7}
                >
                  {key === 'DEL' ? (
                    <Icon name="close" size={20} color={colors.textDark} />
                  ) : key === 'BIO' ? (
                    <Icon name="fingerprint" size={24} color={colors.primaryDeep} />
                  ) : (
                    <Text style={styles.keypadNum}>{key}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* USSD Fallback Action */}
            <TouchableOpacity style={styles.pinUssdBtn} onPress={handleUssdFallback} activeOpacity={0.75}>
              <Icon name="phone" size={14} color={colors.primaryMid} />
              <Text style={styles.pinUssdText}>Network slow? Pay via USSD code</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── ⏳ TRANSFER PROCESSING LOADING MODAL ── */}
      <Modal visible={showProcessingModal} transparent animationType="fade">
        <View style={styles.processingOverlay}>
          <View style={[styles.processingCard, shadows.cardLg]}>
            <View style={styles.processingSpinnerCircle}>
              <ActivityIndicator size="large" color={colors.primaryDeep} />
            </View>

            <Text style={styles.processingTitle}>Processing Transfer…</Text>
            <Text style={styles.processingSub}>
              Sending ₦{Number(amount.replace(/,/g, '') || 0).toLocaleString()} to {recipientName}
            </Text>

            <View style={styles.processingStepsBox}>
              <View style={styles.stepRow}>
                <Icon name={processStep >= 1 ? "checkmark-circle" : "radio-button-off"} size={16} color={processStep >= 1 ? colors.successGreen : colors.textMuted} />
                <Text style={[styles.stepText, processStep >= 1 && styles.stepTextDone]}>1. Security PIN Verified</Text>
              </View>
              <View style={styles.stepRow}>
                <Icon name={processStep >= 2 ? "checkmark-circle" : "radio-button-off"} size={16} color={processStep >= 2 ? colors.successGreen : colors.textMuted} />
                <Text style={[styles.stepText, processStep >= 2 && styles.stepTextDone]}>2. Connecting to NIP Handoff Gateway</Text>
              </View>
              <View style={styles.stepRow}>
                <Icon name={processStep >= 3 ? "checkmark-circle" : "radio-button-off"} size={16} color={processStep >= 3 ? colors.successGreen : colors.textMuted} />
                <Text style={[styles.stepText, processStep >= 3 && styles.stepTextDone]}>3. Debiting Merchant Settlement Account</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── 🎉 TRANSFER SUCCESS MODAL ── */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.successOverlay}>
          <View style={[styles.successCard, shadows.cardLg]}>
            <View style={styles.successIconCircle}>
              <Icon name="checkmark" size={36} color={colors.white} />
            </View>

            <Text style={styles.successTitle}>Transfer Successful!</Text>
            <Text style={styles.successAmt}>₦{Number(amount.replace(/,/g, '') || 0).toLocaleString()}</Text>

            <View style={styles.successDetailBox}>
              <View style={styles.successDetailRow}>
                <Text style={styles.successDetailLabel}>Recipient</Text>
                <Text style={styles.successDetailVal}>{recipientName}</Text>
              </View>
              <View style={styles.successDetailRow}>
                <Text style={styles.successDetailLabel}>Bank</Text>
                <Text style={styles.successDetailVal}>{selectedBank}</Text>
              </View>
              <View style={styles.successDetailRow}>
                <Text style={styles.successDetailLabel}>Account</Text>
                <Text style={styles.successDetailVal}>{accountNum}</Text>
              </View>
              <View style={styles.successDetailRow}>
                <Text style={styles.successDetailLabel}>From</Text>
                <Text style={styles.successDetailVal}>Wema Settlement (0129384756)</Text>
              </View>
              <View style={styles.successDetailRow}>
                <Text style={styles.successDetailLabel}>Txn Ref</Text>
                <Text style={styles.successDetailVal}>KN-{Math.floor(10000000 + Math.random() * 90000000)}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.successDoneBtn} onPress={handleDoneSuccess} activeOpacity={0.85}>
              <Text style={styles.successDoneText}>Done</Text>
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
  content: { padding: spacing.lg, gap: spacing.lg },

  voiceBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md,
    backgroundColor: colors.primaryDeep,
    borderRadius: radius.xl, padding: spacing.md,
  },
  voiceBannerIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.primaryMid,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  voiceBannerTitle: { fontSize: typography.sizes.body, fontWeight: '800', color: colors.white },
  voiceBannerSub:   { fontSize: typography.sizes.tiny, color: 'rgba(255,255,255,0.75)', marginTop: 3, lineHeight: 16 },

  infoBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: colors.accentLight,
    borderRadius: radius.lg, padding: spacing.md,
  },
  infoText: { fontSize: typography.sizes.small, color: colors.primaryMid, fontWeight: '600', flex: 1, lineHeight: 18 },

  card:      { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.md },
  cardTitle: { fontSize: typography.sizes.h4, fontWeight: '800', color: colors.textDark, marginBottom: spacing.xs },

  fieldGroup: { gap: 4 },
  fieldLabel: { fontSize: typography.sizes.small, fontWeight: '700', color: colors.textMuted },
  fieldError: { fontSize: typography.sizes.tiny, color: '#EF4444', fontWeight: '600' },

  fixedFromWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#F3EBFB', borderWidth: 1, borderColor: 'rgba(74, 29, 122, 0.2)',
    borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: 10,
  },
  fixedFromTitle: { fontSize: typography.sizes.body, fontWeight: '800', color: colors.primaryDeep },
  fixedFromSub:   { fontSize: 11, color: colors.textMuted, marginTop: 1 },

  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.grayBG,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.lg, paddingHorizontal: spacing.md, height: 50,
  },
  inputError:      { borderColor: '#EF4444', backgroundColor: '#FFF5F5' },
  input:           { flex: 1, fontSize: typography.sizes.body, color: colors.textDark, fontWeight: '600' },
  amountInput:     { fontWeight: '800', color: colors.primaryDeep, fontSize: typography.sizes.h4 },
  nairaSign:       { fontSize: typography.sizes.h4, fontWeight: '800', color: colors.primaryDeep },
  bankTrigger:     { justifyContent: 'space-between' },
  bankTriggerText: { flex: 1, fontSize: typography.sizes.body, fontWeight: '600' },

  summaryCard: {
    backgroundColor: colors.white, borderRadius: radius.xl,
    padding: spacing.lg, gap: spacing.sm,
    borderWidth: 1.5, borderColor: '#BBF7D0',
  },
  summaryHeader:    { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  summaryTitle:     { fontSize: typography.sizes.body, fontWeight: '800', color: colors.successGreen },
  summaryRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryAmountRow: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm, marginTop: 2 },
  summaryLabel:     { fontSize: typography.sizes.small, color: colors.textMuted },
  summaryValue:     { fontSize: typography.sizes.small, fontWeight: '700', color: colors.textDark, flexShrink: 1, textAlign: 'right', marginLeft: 8 },
  summaryAmount:    { fontSize: typography.sizes.h3, fontWeight: '900', color: colors.primaryDeep },

  proceedBtn:  { borderRadius: radius.xl, overflow: 'hidden' },
  proceedGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  proceedText: { fontSize: typography.sizes.body, fontWeight: '800', color: colors.white },

  voiceBackBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: spacing.sm },
  voiceBackText: { fontSize: typography.sizes.small, fontWeight: '700', color: colors.primaryMid },

  // Bank modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalCard:    { backgroundColor: colors.white, borderTopLeftRadius: radius.xxl, borderTopRightRadius: radius.xxl, padding: spacing.xl, maxHeight: '80%' },
  modalHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  modalTitle:   { fontSize: typography.sizes.h4, fontWeight: '800', color: colors.textDark },
  searchBox:    { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.grayBG, borderRadius: radius.lg, paddingHorizontal: spacing.md, height: 40, marginBottom: spacing.md },
  searchInput:  { flex: 1, fontSize: typography.sizes.body, color: colors.textDark },
  bankItem:     { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  bankItemSelected:     { backgroundColor: '#F0FDF4' },
  bankIconCircle:       { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.accentLight, alignItems: 'center', justifyContent: 'center' },
  bankItemText:         { flex: 1, fontSize: typography.sizes.body, fontWeight: '600', color: colors.textDark },
  bankItemTextSelected: { color: colors.successGreen, fontWeight: '800' },

  // ── PIN Modal ──
  pinModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  pinModalCard:    { backgroundColor: colors.white, borderTopLeftRadius: radius.xxl, borderTopRightRadius: radius.xxl, padding: spacing.xl, alignItems: 'center' },
  pinModalHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: spacing.md },
  pinModalTitle:   { fontSize: typography.sizes.h4, fontWeight: '800', color: colors.textDark },
  pinSummaryBox:   { backgroundColor: colors.accentLight, borderRadius: radius.xl, padding: spacing.md, alignItems: 'center', width: '100%', marginBottom: spacing.md },
  pinSummarySub:   { fontSize: typography.sizes.tiny, color: colors.primaryMid, fontWeight: '600' },
  pinSummaryAmt:   { fontSize: 26, fontWeight: '900', color: colors.primaryDeep, marginVertical: 2 },
  pinSummaryTo:    { fontSize: typography.sizes.tiny, color: colors.textDark, fontWeight: '700' },
  pinPrompt:       { fontSize: typography.sizes.small, fontWeight: '700', color: colors.textMuted, marginBottom: spacing.md },
  pinDotsRow:      { flexDirection: 'row', gap: 16, marginBottom: spacing.lg },
  pinDot:          { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.white },
  pinDotFilled:    { backgroundColor: colors.primaryDeep, borderColor: colors.primaryDeep },
  verifyingBox:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.sm },
  verifyingText:   { fontSize: typography.sizes.tiny, color: colors.primaryMid, fontWeight: '700' },

  keypadGrid: { flexDirection: 'row', flexWrap: 'wrap', width: 260, justifyContent: 'space-between', gap: 12, marginBottom: spacing.lg },
  keypadBtn:  { width: 72, height: 54, borderRadius: radius.lg, backgroundColor: colors.grayBG, alignItems: 'center', justifyContent: 'center' },
  keypadSpecialBtn: { backgroundColor: colors.accentLight },
  keypadNum:  { fontSize: 22, fontWeight: '800', color: colors.textDark },

  pinUssdBtn:  { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: spacing.xs },
  pinUssdText: { fontSize: typography.sizes.tiny, fontWeight: '700', color: colors.primaryMid },

  // ── Success Modal ──
  successOverlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  successCard:       { backgroundColor: colors.white, borderRadius: radius.xxl, padding: spacing.xl, alignItems: 'center', width: '100%' },
  successIconCircle: { width: 68, height: 68, borderRadius: 34, backgroundColor: colors.successGreen, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  successTitle:      { fontSize: typography.sizes.h3, fontWeight: '800', color: colors.textDark },
  successAmt:        { fontSize: 32, fontWeight: '900', color: colors.successGreen, marginVertical: spacing.xs },
  successDetailBox:  { backgroundColor: colors.grayBG, borderRadius: radius.xl, padding: spacing.md, width: '100%', gap: 8, marginVertical: spacing.lg },
  successDetailRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  successDetailLabel:{ fontSize: typography.sizes.tiny, color: colors.textMuted },
  successDetailVal:  { fontSize: typography.sizes.tiny, fontWeight: '700', color: colors.textDark, flexShrink: 1, textAlign: 'right' },
  successDoneBtn:    { backgroundColor: colors.primaryDeep, borderRadius: radius.xl, paddingVertical: 14, width: '100%', alignItems: 'center' },
  successDoneText:   { color: colors.white, fontWeight: '800', fontSize: typography.sizes.body },

  // ── Processing Loading Modal ──
  processingOverlay:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  processingCard:          { backgroundColor: colors.white, borderRadius: radius.xxl, padding: spacing.xl, alignItems: 'center', width: '100%', gap: spacing.xs },
  processingSpinnerCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#F3EBFB', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  processingTitle:         { fontSize: typography.sizes.h4, fontWeight: '800', color: colors.textDark },
  processingSub:           { fontSize: typography.sizes.small, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.md },
  processingStepsBox:      { backgroundColor: colors.grayBG, borderRadius: radius.xl, padding: spacing.md, width: '100%', gap: 10 },
  stepRow:                 { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepText:                { fontSize: typography.sizes.tiny, color: colors.textMuted, fontWeight: '600' },
  stepTextDone:            { color: colors.textDark, fontWeight: '800' },
});
