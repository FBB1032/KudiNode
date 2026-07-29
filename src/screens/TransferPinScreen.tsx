import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, TextInput, Modal, StatusBar, Alert, FlatList, ActivityIndicator,
} from 'react-native';
import { colors, spacing, radius, typography, shadows } from '../theme/theme';
import { TopHeader } from '../components/TopHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { Avatar } from '../components/Avatar';
import { Icon } from '../components/Icon';
import { useLanguage } from '../context/LanguageContext';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../AppNavigator';
import { LinearGradient } from 'expo-linear-gradient';
import { UssdFallbackModule } from '../services/UssdFallbackModule';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type TransferRouteProp = RouteProp<RootStackParamList, 'TransferPin'>;

// NIGERIAN COMMERCIAL & MICROFINANCE BANKS
const NIGERIAN_BANKS = [
  { code: '035', name: 'Wema Bank PLC' },
  { code: '044', name: 'Access Bank PLC' },
  { code: '058', name: 'Guaranty Trust Bank (GTBank)' },
  { code: '057', name: 'Zenith Bank PLC' },
  { code: '011', name: 'First Bank of Nigeria' },
  { code: '033', name: 'United Bank for Africa (UBA)' },
  { code: '50211', name: 'Kuda Microfinance Bank' },
  { code: '999991', name: 'OPay / Paycom' },
  { code: '999992', name: 'Palmpay' },
  { code: '50343', name: 'Moniepoint MFB' },
  { code: '221', name: 'Stanbic IBTC Bank' },
  { code: '232', name: 'Sterling Bank PLC' },
  { code: '070', name: 'Fidelity Bank PLC' },
  { code: '214', name: 'First City Monument Bank (FCMB)' },
  { code: '032', name: 'Union Bank of Nigeria' },
  { code: '076', name: 'Polaris Bank PLC' },
];

export function TransferPinScreen() {
  const { t } = useLanguage();
  const nav = useNavigation<Nav>();
  const route = useRoute<TransferRouteProp>();
  const params = route.params;

  // 2-Stage Voice Recording State
  const [hasCapturedVoice, setHasCapturedVoice] = useState(false);
  const [isVoiceRecording, setIsVoiceRecording]   = useState(false);
  const [recSeconds, setRecSeconds]             = useState(0);

  // Bank Selector Modal State
  const [showBankPickerModal, setShowBankPickerModal] = useState(false);
  const [bankSearchQuery, setBankSearchQuery]       = useState('');

  // Pulse animation for recording mic
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    let timer: any;
    if (isVoiceRecording) {
      setRecSeconds(0);
      timer = setInterval(() => setRecSeconds(s => s + 1), 1000);
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.25, duration: 400, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: 400, useNativeDriver: true }),
        ])
      );
      pulseLoop.current.start();
    } else {
      clearInterval(timer);
      pulseLoop.current?.stop();
      Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    }
    return () => clearInterval(timer);
  }, [isVoiceRecording, pulseAnim]);

  const handleMicClick = () => {
    if (isVoiceRecording) {
      setIsVoiceRecording(false);
      setHasCapturedVoice(true);
    } else {
      setIsVoiceRecording(true);
    }
  };

  // Transfer fields
  const [fromAccount, setFromAccount]       = useState('Wema Merchant (0129384756)');
  const [recipientName, setRecipientName]   = useState(params?.prefilledRecipient || 'Supplier Musa');
  const [bankName, setBankName]             = useState(params?.prefilledBank || 'Wema Bank PLC');
  const [accountNum, setAccountNum]         = useState(params?.prefilledAccount || '0123456789');
  const [amount, setAmount]                 = useState(params?.prefilledAmount || '15,000');
  const [isEditingDetails, setIsEditingDetails] = useState(false);

  // PIN state
  const [pin, setPin] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const pinMax = 4;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Outcome Modals
  const [showResultModal, setShowResultModal] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState(true);
  const [isUssdMode, setIsUssdMode]           = useState(false);

  const filteredBanks = NIGERIAN_BANKS.filter(b =>
    b.name.toLowerCase().includes(bankSearchQuery.toLowerCase())
  );

  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [processStep, setProcessStep]               = useState(1);

  const startTransferProcessing = () => {
    setShowProcessingModal(true);
    setProcessStep(1);
    setTimeout(() => setProcessStep(2), 600);
    setTimeout(() => setProcessStep(3), 1200);
    setTimeout(() => {
      setShowProcessingModal(false);
      setTransferSuccess(true);
      setShowResultModal(true);
    }, 1800);
  };

  const handlePinPress = (digit: string) => {
    if (pin.length < pinMax) {
      const next = pin + digit;
      setPin(next);
      if (next.length === pinMax) {
        setAuthorized(true);
        setTimeout(() => startTransferProcessing(), 200);
      }
    }
  };

  const handleDelete = () => setPin(p => p.slice(0, -1));

  const handleFingerprint = () => {
    setPin('1234');
    setAuthorized(true);
    setTimeout(() => startTransferProcessing(), 200);
  };

  const handleAuthorize = () => {
    if (pin.length < pinMax) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 8, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 6, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -6, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
      ]).start();
    } else {
      setAuthorized(true);
      startTransferProcessing();
    }
  };

  // ⚡ USSD Fallback Launcher (*945*Amount*Acc%23)
  const handleLaunchUSSD = async () => {
    const cleanAmount = amount.replace(/,/g, '');
    const cleanAcc = accountNum || '0123456789';

    setShowResultModal(false);
    setIsUssdMode(true);

    const payload = UssdFallbackModule.buildWemaPayload(cleanAmount, cleanAcc);
    Alert.alert(
      'Wema Bank USSD Fallback (*945#)',
      `Opening native dialer with payload:\n${payload}\n\nPress the call button and enter your Wema PIN on the telecom prompt.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Dialer (*945#)',
          onPress: async () => {
            await UssdFallbackModule.triggerUssdFallback({
              amount: cleanAmount,
              accountNumber: cleanAcc,
            });
          },
        },
      ]
    );
  };

  const handleSimulateFailure = () => {
    setTransferSuccess(false);
    setShowResultModal(true);
  };

  const handleDone = () => {
    setShowResultModal(false);
    nav.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  };

  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDeep} translucent={false} />
      <TopHeader showBack title="Authorize Transfer" subtitle="Wema Bank NIP / USSD Transfer" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Low Connectivity / USSD Fallback Alert Banner */}
        <TouchableOpacity style={styles.ussdAlertBanner} onPress={handleLaunchUSSD} activeOpacity={0.88}>
          <View style={styles.ussdAlertIconCircle}>
            <Icon name="call" size={16} color={colors.white} />
          </View>
          <View style={styles.ussdAlertTextWrap}>
            <Text style={styles.ussdAlertTitle}>Low Network Detected (USSD Fallback)</Text>
            <Text style={styles.ussdAlertSub}>
              Tap to transfer ₦{amount} to {recipientName} via Wema Bank *945# dialer.
            </Text>
          </View>
          <Icon name="chevron-forward" size={16} color={colors.warningOrange} />
        </TouchableOpacity>

        {/* DETAILS CARD */}
        {!isEditingDetails ? (
          <View style={[styles.detailsCard, shadows.card]}>
            {/* Card header with Edit button */}
            <View style={styles.detailsCardHeader}>
              <Text style={styles.detailsCardTitle}>Transfer Details</Text>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => setIsEditingDetails(true)}
                activeOpacity={0.75}
              >
                <Icon name="pencil" size={14} color={colors.primaryDeep} />
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>From Account</Text>
              <View style={styles.wemaAccountBadge}>
                <View style={styles.wemaDot} />
                <Text style={styles.wemaAccountText}>{fromAccount}</Text>
              </View>
            </View>

            <View style={[styles.detailRow, styles.detailRowBordered]}>
              <Text style={styles.detailLabel}>Recipient</Text>
              <View style={styles.recipientValue}>
                <Avatar size={28} initials={recipientName.substring(0, 2).toUpperCase()} />
                <Text style={styles.recipientText}>{recipientName}</Text>
              </View>
            </View>

            <View style={[styles.detailRow, styles.detailRowBordered]}>
              <Text style={styles.detailLabel}>Destination Bank</Text>
              <Text style={styles.detailValueText}>{bankName}</Text>
            </View>

            <View style={[styles.detailRow, styles.detailRowBordered]}>
              <Text style={styles.detailLabel}>Account No.</Text>
              <Text style={styles.detailValueText}>{accountNum}</Text>
            </View>

            <View style={[styles.detailRow, styles.detailRowBordered]}>
              <Text style={styles.detailLabel}>Transfer Amount</Text>
              <Text style={styles.detailAmount}>₦{amount}</Text>
            </View>
          </View>
        ) : (
          <View style={[styles.editFormCard, shadows.cardLg]}>
            <View style={styles.editFormHeader}>
              <Icon name="settings" size={18} color={colors.primaryDeep} />
              <Text style={styles.editFormHeaderTitle}>Voice Fallback Details Editor</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>From Account</Text>
              <View style={styles.formInputWrap}>
                <Icon name="bank" size={16} color={colors.primaryMid} />
                <TextInput
                  style={styles.formInput}
                  value={fromAccount}
                  onChangeText={setFromAccount}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Recipient Name</Text>
              <View style={styles.formInputWrap}>
                <Icon name="person" size={16} color={colors.textMuted} />
                <TextInput
                  style={styles.formInput}
                  value={recipientName}
                  onChangeText={setRecipientName}
                  placeholder="Enter recipient name"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Destination Bank</Text>
              <TouchableOpacity
                style={styles.bankPickerTrigger}
                onPress={() => setShowBankPickerModal(true)}
                activeOpacity={0.8}
              >
                <View style={styles.bankPickerTriggerLeft}>
                  <Icon name="bank" size={16} color={colors.primaryDeep} />
                  <Text style={styles.bankPickerTriggerText}>{bankName}</Text>
                </View>
                <Icon name="chevron-down" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Account Number (10 digits)</Text>
              <View style={styles.formInputWrap}>
                <Icon name="card" size={16} color={colors.textMuted} />
                <TextInput
                  style={styles.formInput}
                  value={accountNum}
                  onChangeText={setAccountNum}
                  keyboardType="numeric"
                  maxLength={10}
                  placeholder="0123456789"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Transfer Amount (₦)</Text>
              <View style={styles.formInputWrap}>
                <Text style={styles.nairaPrefix}>₦</Text>
                <TextInput
                  style={[styles.formInput, { fontWeight: '800', color: colors.primaryDeep }]}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  placeholder="15,000"
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.saveDetailsBtn}
              onPress={() => setIsEditingDetails(false)}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={[colors.primaryMid, colors.primaryDeep]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.saveDetailsGrad}
              >
                <Icon name="checkmark" size={16} color={colors.white} />
                <Text style={styles.saveDetailsText}>Save & Apply Details</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* PIN Section */}
        <Animated.View style={[styles.pinSection, { transform: [{ translateX: shakeAnim }] }]}>
          <Text style={styles.pinLabel}>Enter 4-Digit Security PIN</Text>
          <View style={styles.pinDots}>
            {Array.from({ length: pinMax }, (_, i) => {
              const filled = i < pin.length;
              return (
                <View
                  key={i}
                  style={[
                    styles.pinDot,
                    filled && styles.pinDotFilled,
                    authorized && filled && styles.pinDotSuccess,
                  ]}
                >
                  {filled && !authorized && <View style={styles.pinDotInner} />}
                  {filled && authorized && <Icon name="checkmark" size={14} color={colors.white} />}
                </View>
              );
            })}
          </View>

          <TouchableOpacity style={styles.fingerprintBtn} onPress={handleFingerprint} activeOpacity={0.7}>
            <Icon name="fingerprint" size={36} color={colors.primaryMid} />
            <Text style={styles.fingerprintText}>Or use Biometric / Fingerprint</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Keypad */}
        <View style={styles.keypad}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((k, i) => {
            if (k === '') return <View key={i} style={styles.keyBtn} />;
            const isDel = k === 'del';
            return (
              <TouchableOpacity
                key={i}
                style={[styles.keyBtn, isDel && styles.keyBtnDel]}
                onPress={isDel ? handleDelete : () => handlePinPress(k)}
                activeOpacity={0.7}
              >
                {isDel ? (
                  <Icon name="arrow-back" size={22} color={colors.textDark} />
                ) : (
                  <Text style={styles.keyText}>{k}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Action Buttons */}
        <View style={styles.authorizeBtnWrap}>
          <PrimaryButton
            title="Authorize Transfer"
            icon={<Icon name="lock" size={20} color={colors.white} />}
            onPress={handleAuthorize}
          />

          <TouchableOpacity style={styles.failTestBtn} onPress={handleLaunchUSSD} activeOpacity={0.7}>
            <Text style={styles.failTestText}>⚡ Launch Wema Bank USSD Fallback (*945#)</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>

      {/* ── BANK SELECTOR DROPDOWN MODAL ── */}
      <Modal visible={showBankPickerModal} transparent animationType="slide">
        <View style={styles.bankPickerOverlay}>
          <View style={styles.bankPickerCard}>
            <View style={styles.bankPickerHeader}>
              <Text style={styles.bankPickerTitle}>Select Destination Bank</Text>
              <TouchableOpacity onPress={() => setShowBankPickerModal(false)} activeOpacity={0.8}>
                <Icon name="close" size={22} color={colors.textDark} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchBox}>
              <Icon name="search" size={16} color={colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search bank name..."
                placeholderTextColor={colors.textMuted}
                value={bankSearchQuery}
                onChangeText={setBankSearchQuery}
              />
            </View>

            <FlatList
              data={filteredBanks}
              keyExtractor={item => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.bankItemRow,
                    bankName === item.name && styles.bankItemRowSelected,
                  ]}
                  onPress={() => {
                    setBankName(item.name);
                    setShowBankPickerModal(false);
                  }}
                  activeOpacity={0.75}
                >
                  <View style={styles.bankIconCircle}>
                    <Icon name="bank" size={16} color={colors.primaryDeep} />
                  </View>
                  <Text style={[styles.bankItemText, bankName === item.name && styles.bankItemTextSelected]}>
                    {item.name}
                  </Text>
                  {bankName === item.name && (
                    <Icon name="checkmark" size={16} color={colors.successGreen} />
                  )}
                </TouchableOpacity>
              )}
              contentContainerStyle={{ paddingVertical: spacing.sm }}
            />
          </View>
        </View>
      </Modal>

      {/* ── TRANSFER RESULT MODALS ── */}
      <Modal visible={showResultModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, shadows.cardLg]}>
            {transferSuccess ? (
              <>
                <View style={styles.successIconCircle}>
                  <Icon name="checkmark-circle" size={48} color={colors.successGreen} />
                </View>
                <Text style={styles.modalTitle}>Transfer Successful!</Text>
                <Text style={styles.modalSub}>Disbursed instantly from your Wema Merchant Account via NIP.</Text>

                <View style={styles.receiptBox}>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLbl}>From</Text>
                    <Text style={styles.receiptVal}>Wema Merchant (0129384756)</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLbl}>Amount Sent</Text>
                    <Text style={styles.receiptAmt}>₦{amount}</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLbl}>Recipient</Text>
                    <Text style={styles.receiptVal}>{recipientName}</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLbl}>Account No.</Text>
                    <Text style={styles.receiptVal}>{accountNum} ({bankName})</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.modalPrimaryBtn}
                  onPress={handleDone}
                  activeOpacity={0.88}
                >
                  <LinearGradient
                    colors={[colors.primaryMid, colors.primaryDeep]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={styles.modalGrad}
                  >
                    <Text style={styles.modalPrimaryText}>Back to Dashboard</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.failIconCircle}>
                  <Icon name="close" size={32} color={colors.warningOrange} />
                </View>
                <Text style={styles.modalTitle}>Transfer Intercepted</Text>
                <Text style={styles.modalSub}>
                  Network connection slow or API timeout (&gt;3000ms). Tap to execute via Wema Bank USSD fallback.
                </Text>

                <TouchableOpacity
                  style={styles.modalPrimaryBtn}
                  onPress={handleLaunchUSSD}
                  activeOpacity={0.88}
                >
                  <LinearGradient
                    colors={[colors.warningOrange, '#D97706']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={styles.modalGrad}
                  >
                    <Text style={styles.modalPrimaryText}>⚡ Transfer via USSD (*945#)</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
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
              Sending ₦{amount} to {recipientName} ({bankName})
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.grayBG },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },

  ussdAlertBanner: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: '#FFF8E7', borderWidth: 1, borderColor: '#FDE68A',
    padding: spacing.md, borderRadius: radius.xl, marginBottom: spacing.md,
  },
  ussdAlertIconCircle: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: colors.warningOrange,
    alignItems: 'center', justifyContent: 'center',
  },
  ussdAlertTextWrap: { flex: 1 },
  ussdAlertTitle: { fontSize: typography.sizes.small, fontWeight: '800', color: colors.warningOrange },
  ussdAlertSub: { fontSize: typography.sizes.tiny, color: colors.textMuted, marginTop: 1 },

  voiceCard: {
    backgroundColor: colors.white, borderRadius: radius.xxl,
    padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border,
  },
  voiceCardCaptured: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
  voiceCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  voiceTitleLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  micBadgeCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primaryDeep, alignItems: 'center', justifyContent: 'center' },
  voiceCardTitle: { fontSize: typography.sizes.body, fontWeight: '800', color: colors.textDark },
  voiceCardMeta: { fontSize: typography.sizes.tiny, color: colors.textMuted },
  initialTag: { backgroundColor: '#FFF8E7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill },
  initialTagText: { fontSize: typography.sizes.tiny, fontWeight: '800', color: colors.warningOrange },
  aiTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#E8FFF2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill },
  aiTagText: { fontSize: typography.sizes.tiny, fontWeight: '800', color: colors.successGreen },

  recorderControlsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
  recordMicBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primaryDeep, alignItems: 'center', justifyContent: 'center' },
  recordMicBtnActive: { backgroundColor: colors.warningOrange },
  waveformWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 2, height: 32 },
  recStatusText: { fontSize: typography.sizes.tiny, fontWeight: '800', color: colors.textMuted },
  voiceInstructionText: { fontSize: typography.sizes.tiny, color: colors.textMuted, lineHeight: 16 },

  detailsCard: { backgroundColor: colors.white, borderRadius: radius.xxl, padding: spacing.lg, marginBottom: spacing.lg },
  detailsCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  detailsCardTitle: { fontSize: typography.sizes.body, fontWeight: '800', color: colors.textDark },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.accentLight, paddingHorizontal: spacing.sm, paddingVertical: 5, borderRadius: radius.pill },
  editBtnText: { fontSize: typography.sizes.tiny, fontWeight: '800', color: colors.primaryDeep },
  detailRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  detailRowBordered: { borderTopWidth: 1, borderTopColor: colors.border },
  detailLabel: { fontSize: typography.sizes.small, color: colors.textMuted, fontWeight: '600' },
  wemaAccountBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.grayBG, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill },
  wemaDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.successGreen },
  wemaAccountText: { fontSize: typography.sizes.tiny, fontWeight: '800', color: colors.textDark },
  recipientValue: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  recipientText: { fontSize: typography.sizes.body, fontWeight: '800', color: colors.textDark },
  detailValueText: { fontSize: typography.sizes.body, fontWeight: '700', color: colors.textDark },
  detailAmount: { fontSize: typography.sizes.h3, fontWeight: '900', color: colors.primaryDeep },

  editFormCard: { backgroundColor: colors.white, borderRadius: radius.xxl, padding: spacing.lg, marginBottom: spacing.lg, gap: spacing.md },
  editFormHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  editFormHeaderTitle: { fontSize: typography.sizes.body, fontWeight: '800', color: colors.textDark },
  formGroup: { gap: 4 },
  formLabel: { fontSize: typography.sizes.tiny, fontWeight: '700', color: colors.textMuted },
  formInputWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.grayBG, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, paddingHorizontal: spacing.md, height: 44 },
  formInput: { flex: 1, fontSize: typography.sizes.body, color: colors.textDark, fontWeight: '600' },
  bankPickerTrigger: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.grayBG, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, paddingHorizontal: spacing.md, height: 44 },
  bankPickerTriggerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bankPickerTriggerText: { fontSize: typography.sizes.body, fontWeight: '700', color: colors.textDark },
  nairaPrefix: { fontSize: typography.sizes.body, fontWeight: '800', color: colors.primaryDeep },
  saveDetailsBtn: { borderRadius: radius.xl, overflow: 'hidden', marginTop: 4 },
  saveDetailsGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 44 },
  saveDetailsText: { fontSize: typography.sizes.body, fontWeight: '800', color: colors.white },

  pinSection: { backgroundColor: colors.white, borderRadius: radius.xxl, padding: spacing.lg, alignItems: 'center', marginBottom: spacing.lg },
  pinLabel: { fontSize: typography.sizes.small, fontWeight: '700', color: colors.textMuted, marginBottom: spacing.md },
  pinDots: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  pinDot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  pinDotFilled: { borderColor: colors.primaryDeep },
  pinDotSuccess: { backgroundColor: colors.successGreen, borderColor: colors.successGreen },
  pinDotInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primaryDeep },
  fingerprintBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  fingerprintText: { fontSize: typography.sizes.tiny, color: colors.primaryMid, fontWeight: '700' },

  keypad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.sm, marginBottom: spacing.lg },
  keyBtn: { width: '30%', height: 48, borderRadius: radius.xl, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  keyBtnDel: { backgroundColor: 'transparent' },
  keyText: { fontSize: typography.sizes.h3, fontWeight: '800', color: colors.textDark },

  authorizeBtnWrap: { gap: spacing.md },
  failTestBtn: { alignItems: 'center', paddingVertical: spacing.xs },
  failTestText: { fontSize: typography.sizes.tiny, color: colors.warningOrange, fontWeight: '800' },

  bankPickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  bankPickerCard: { backgroundColor: colors.white, borderTopLeftRadius: radius.xxl, borderTopRightRadius: radius.xxl, padding: spacing.xl, maxHeight: '80%' },
  bankPickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  bankPickerTitle: { fontSize: typography.sizes.h4, fontWeight: '800', color: colors.textDark },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.grayBG, borderRadius: radius.lg, paddingHorizontal: spacing.md, height: 40, marginBottom: spacing.md },
  searchInput: { flex: 1, fontSize: typography.sizes.body, color: colors.textDark },
  bankItemRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  bankItemRowSelected: { backgroundColor: '#F0FDF4' },
  bankIconCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.accentLight, alignItems: 'center', justifyContent: 'center' },
  bankItemText: { flex: 1, fontSize: typography.sizes.body, fontWeight: '600', color: colors.textDark },
  bankItemTextSelected: { color: colors.successGreen, fontWeight: '800' },

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

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  modalCard: { width: '100%', maxWidth: 360, backgroundColor: colors.white, borderRadius: radius.xxl, padding: spacing.xl, alignItems: 'center' },
  successIconCircle: { marginBottom: spacing.md },
  failIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFF8E7', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  modalTitle: { fontSize: typography.sizes.h3, fontWeight: '800', color: colors.textDark, textAlign: 'center', marginBottom: 4 },
  modalSub: { fontSize: typography.sizes.small, color: colors.textMuted, textAlign: 'center', lineHeight: 18, marginBottom: spacing.lg },
  receiptBox: { width: '100%', backgroundColor: colors.grayBG, borderRadius: radius.xl, padding: spacing.md, gap: 8, marginBottom: spacing.lg },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  receiptLbl: { fontSize: typography.sizes.tiny, color: colors.textMuted },
  receiptVal: { fontSize: typography.sizes.tiny, fontWeight: '700', color: colors.textDark },
  receiptAmt: { fontSize: typography.sizes.body, fontWeight: '900', color: colors.successGreen },
  modalPrimaryBtn: { width: '100%', borderRadius: radius.xl, overflow: 'hidden', marginBottom: spacing.sm },
  modalGrad: { height: 48, alignItems: 'center', justifyContent: 'center' },
  modalPrimaryText: { fontSize: typography.sizes.body, fontWeight: '800', color: colors.white },
  modalSecondaryBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8 },
  modalSecondaryText: { fontSize: typography.sizes.small, fontWeight: '700', color: colors.primaryDeep },
});
