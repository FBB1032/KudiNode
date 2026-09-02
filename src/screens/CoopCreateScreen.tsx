/**
 * CoopCreateScreen — create a new Co-op Esusu group.
 * Presented as a stack screen with back button.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, StatusBar, Alert, Modal, FlatList,
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
type FreqOption = 'Weekly' | 'Bi-weekly' | 'Monthly';

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

export function CoopCreateScreen() {
  const { t } = useLanguage();
  const nav = useNavigation<Nav>();
  const [groupName, setGroupName]         = useState('');
  const [desc, setDesc]                   = useState('');
  const [contrib, setContrib]             = useState('5000');
  const [maxMembers, setMaxMembers]       = useState('10');
  const [freq, setFreq]                   = useState<FreqOption>('Monthly');

  // Collection Account Details
  const [collectionAccNum, setCollectionAccNum] = useState('0129384756');
  const [collectionBank, setCollectionBank]     = useState('Wema Bank PLC');
  const [collectionName, setCollectionName]     = useState('Mushin Grains Esusu Pool');

  // Bank Modal State
  const [showBankModal, setShowBankModal]       = useState(false);
  const [bankSearchQuery, setBankSearchQuery]   = useState('');

  const [inviteMethod, setInviteMethod]   = useState<'phone' | 'qr'>('phone');
  const [phones, setPhones]               = useState('');

  const filteredBanks = NIGERIAN_BANKS.filter(b =>
    b.name.toLowerCase().includes(bankSearchQuery.toLowerCase())
  );

  const handleCreate = () => {
    if (!groupName) {
      Alert.alert(t('coopCreate.missingField'), t('coopCreate.missingFieldMsg'));
      return;
    }
    Alert.alert(
      t('coopCreate.created'),
      t('coopCreate.createdMsg', { name: groupName, acc: collectionAccNum, bank: collectionBank, accName: collectionName }),
      [{ text: 'OK', onPress: () => nav.goBack() }]
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDeep} translucent={false} />
      <TopHeader showBack title={t('coopCreate.title')} subtitle={t('coopCreate.subtitle')} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Explainer card */}
        <View style={styles.infoCard}>
          <Icon name="people" size={24} color={colors.primaryMid} />
          <Text style={styles.infoText}>
            {t('coopCreate.info')}
          </Text>
        </View>

        {/* Group Details */}
        <Text style={styles.sectionTitle}>{t('coopCreate.groupDetails')}</Text>
        <View style={[styles.card, shadows.card]}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>{t('coopCreate.groupName')}</Text>
            <View style={styles.inputRow}>
              <Icon name="people" size={18} color={colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder={t('coopCreate.groupNamePlaceholder')}
                placeholderTextColor={colors.textMuted}
                value={groupName}
                onChangeText={setGroupName}
              />
            </View>
          </View>

          <View style={[styles.field, styles.fieldBorder]}>
            <Text style={styles.fieldLabel}>{t('coopCreate.description')}</Text>
            <TextInput
              style={[styles.input, styles.inputMulti]}
              placeholder={t('coopCreate.descPlaceholder')}
              placeholderTextColor={colors.textMuted}
              value={desc}
              onChangeText={setDesc}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Contribution Settings */}
        <Text style={styles.sectionTitle}>{t('coopCreate.contributionSettings')}</Text>
        <View style={[styles.card, shadows.card]}>
          {/* Contribution amount */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>{t('coopCreate.contributionAmount')}</Text>
            <View style={styles.inputRow}>
              <Text style={styles.nairaSign}>₦</Text>
              <TextInput
                style={styles.input}
                placeholder="5,000"
                placeholderTextColor={colors.textMuted}
                value={contrib}
                onChangeText={setContrib}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Frequency */}
          <View style={[styles.field, styles.fieldBorder]}>
            <Text style={styles.fieldLabel}>{t('coopCreate.frequency')}</Text>
            <View style={styles.freqRow}>
              {(['Weekly', 'Bi-weekly', 'Monthly'] as FreqOption[]).map(f => (
                <TouchableOpacity
                  key={f}
                  style={[styles.freqBtn, freq === f && styles.freqBtnActive]}
                  onPress={() => setFreq(f)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.freqText, freq === f && styles.freqTextActive]}>{t('coopCreate.' + f.toLowerCase())}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Max members */}
          <View style={[styles.field, styles.fieldBorder]}>
            <Text style={styles.fieldLabel}>{t('coopCreate.maxMembers')}</Text>
            <View style={styles.inputRow}>
              <Icon name="person" size={18} color={colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="10"
                placeholderTextColor={colors.textMuted}
                value={maxMembers}
                onChangeText={setMaxMembers}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Group Collection Account Details */}
        <Text style={styles.sectionTitle}>{t('coopCreate.bankAccount')}</Text>
        <View style={[styles.card, shadows.card]}>
          {/* Collection Account Number */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>{t('coopCreate.collectionAccNum')}</Text>
            <View style={styles.inputRow}>
              <Icon name="card" size={18} color={colors.primaryDeep} />
              <TextInput
                style={styles.input}
                placeholder="0123456789"
                placeholderTextColor={colors.textMuted}
                value={collectionAccNum}
                onChangeText={setCollectionAccNum}
                keyboardType="number-pad"
                maxLength={10}
              />
            </View>
          </View>

          {/* Collection Bank Name Dropdown Picker Trigger */}
          <View style={[styles.field, styles.fieldBorder]}>
            <Text style={styles.fieldLabel}>{t('coopCreate.collectionBank')}</Text>
            <TouchableOpacity
              style={styles.bankPickerTrigger}
              onPress={() => setShowBankModal(true)}
              activeOpacity={0.8}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 }}>
                <Icon name="bank" size={18} color={colors.primaryDeep} />
                <Text style={styles.bankPickerText}>{collectionBank}</Text>
              </View>
              <Icon name="chevron-down" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Collection Account Name */}
          <View style={[styles.field, styles.fieldBorder]}>
            <Text style={styles.fieldLabel}>{t('coopCreate.collectionAccName')}</Text>
            <View style={styles.inputRow}>
              <Icon name="person" size={18} color={colors.primaryDeep} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Mushin Grains Esusu Pool"
                placeholderTextColor={colors.textMuted}
                value={collectionName}
                onChangeText={setCollectionName}
              />
            </View>
          </View>
        </View>

        {/* Invite Members */}
        <Text style={styles.sectionTitle}>{t('coopCreate.inviteMembers')}</Text>
        <View style={[styles.card, shadows.card]}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>{t('coopCreate.inviteVia')}</Text>
            <View style={styles.methodRow}>
              <TouchableOpacity
                style={[styles.methodBtn, inviteMethod === 'phone' && styles.methodBtnActive]}
                onPress={() => setInviteMethod('phone')}
                activeOpacity={0.8}
              >
                <Icon name="phone" size={16} color={inviteMethod === 'phone' ? colors.white : colors.textMuted} />
                <Text style={[styles.methodText, inviteMethod === 'phone' && styles.methodTextActive]}>{t('coopCreate.phoneNumber')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.methodBtn, inviteMethod === 'qr' && styles.methodBtnActive]}
                onPress={() => setInviteMethod('qr')}
                activeOpacity={0.8}
              >
                <Icon name="qr-code" size={16} color={inviteMethod === 'qr' ? colors.white : colors.textMuted} />
                <Text style={[styles.methodText, inviteMethod === 'qr' && styles.methodTextActive]}>{t('coopCreate.qrCode')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {inviteMethod === 'phone' ? (
            <View style={[styles.field, styles.fieldBorder]}>
              <Text style={styles.fieldLabel}>{t('coopCreate.phoneNumbers')}</Text>
              <View style={styles.inputRow}>
                <Icon name="phone" size={18} color={colors.textMuted} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="08012345678, 07098765432..."
                  placeholderTextColor={colors.textMuted}
                  value={phones}
                  onChangeText={setPhones}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          ) : (
            <View style={[styles.qrBox, styles.fieldBorder]}>
              <Icon name="qr-code" size={64} color={colors.primaryDeep} />
              <Text style={styles.qrText}>{t('coopCreate.scanQr')}</Text>
            </View>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, shadows.button]}
          onPress={handleCreate}
          activeOpacity={0.88}
        >
          <LinearGradient
            colors={[colors.primaryMid, colors.primaryDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitGrad}
          >
            <Icon name="checkmark" size={20} color={colors.white} />
            <Text style={styles.submitText}>{t('coopCreate.createButton')}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>

      {/* ── NIGERIAN COMMERCIAL BANKS PICKER MODAL ── */}
      <Modal visible={showBankModal} transparent animationType="slide">
        <View style={styles.bankModalOverlay}>
          <View style={styles.bankModalCard}>
            <View style={styles.bankModalHeader}>
              <Text style={styles.bankModalTitle}>{t('coopCreate.selectBank')}</Text>
              <TouchableOpacity onPress={() => setShowBankModal(false)} activeOpacity={0.8}>
                <Icon name="close" size={22} color={colors.textDark} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchBox}>
              <Icon name="search" size={16} color={colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder={t('coopCreate.searchBank')}
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
                    collectionBank === item.name && styles.bankItemRowSelected,
                  ]}
                  onPress={() => {
                    setCollectionBank(item.name);
                    setShowBankModal(false);
                  }}
                  activeOpacity={0.75}
                >
                  <View style={styles.bankIconCircle}>
                    <Icon name="bank" size={16} color={colors.primaryDeep} />
                  </View>
                  <Text style={[styles.bankItemName, collectionBank === item.name && styles.bankItemNameSelected]}>
                    {item.name}
                  </Text>
                  {collectionBank === item.name && (
                    <Icon name="checkmark" size={16} color={colors.successGreen} />
                  )}
                </TouchableOpacity>
              )}
              contentContainerStyle={{ paddingVertical: spacing.sm }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.grayBG },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md },

  infoCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.accentLight, borderRadius: radius.xl,
    padding: spacing.md, borderWidth: 1, borderColor: 'rgba(74, 29, 122, 0.12)',
  },
  infoText: { flex: 1, fontSize: typography.sizes.tiny, color: colors.primaryDeep, lineHeight: 18 },

  sectionTitle: {
    fontSize: typography.sizes.small, fontWeight: '700',
    color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5,
    marginTop: spacing.xs,
  },
  card: { backgroundColor: colors.white, borderRadius: radius.xl, overflow: 'hidden' },

  field: { padding: spacing.md },
  fieldBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  fieldLabel: { fontSize: typography.sizes.tiny, fontWeight: '600', color: colors.textMuted, marginBottom: 6 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.grayBG, borderRadius: radius.lg,
    paddingHorizontal: spacing.md, height: 46, borderWidth: 1, borderColor: colors.border,
  },
  nairaSign: { fontSize: typography.sizes.body, fontWeight: '700', color: colors.textDark },
  input: { flex: 1, fontSize: typography.sizes.body, color: colors.textDark },
  inputMulti: { height: 70, paddingTop: 8, paddingHorizontal: spacing.md, backgroundColor: colors.grayBG, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },

  bankPickerTrigger: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.grayBG, borderRadius: radius.lg,
    paddingHorizontal: spacing.md, height: 46, borderWidth: 1, borderColor: colors.border,
  },
  bankPickerText: { fontSize: typography.sizes.body, fontWeight: '700', color: colors.textDark },

  freqRow: { flexDirection: 'row', gap: spacing.sm },
  freqBtn: {
    flex: 1, paddingVertical: 10, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', backgroundColor: colors.grayBG,
  },
  freqBtnActive: { backgroundColor: colors.primaryDeep, borderColor: colors.primaryDeep },
  freqText: { fontSize: typography.sizes.tiny, color: colors.textDark, fontWeight: '600' },
  freqTextActive: { color: colors.white, fontWeight: '700' },

  methodRow: { flexDirection: 'row', gap: spacing.md },
  methodBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 12, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.grayBG,
  },
  methodBtnActive: { backgroundColor: colors.primaryDeep, borderColor: colors.primaryDeep },
  methodText: { fontSize: typography.sizes.tiny, color: colors.textDark, fontWeight: '600' },
  methodTextActive: { color: colors.white, fontWeight: '700' },

  qrBox: { padding: spacing.xl, alignItems: 'center', gap: spacing.sm },
  qrText: { fontSize: typography.sizes.tiny, color: colors.textMuted, fontWeight: '600' },

  submitBtn: { marginTop: spacing.sm, borderRadius: radius.xl, overflow: 'hidden' },
  submitGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, paddingVertical: 16,
  },
  submitText: { fontSize: typography.sizes.body, fontWeight: '800', color: colors.white },

  // Bank Modal
  bankModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  bankModalCard:    { backgroundColor: colors.white, borderTopLeftRadius: radius.xxl, borderTopRightRadius: radius.xxl, maxHeight: '80%', padding: spacing.lg },
  bankModalHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  bankModalTitle:   { fontSize: typography.sizes.h4, fontWeight: '800', color: colors.textDark },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.grayBG, borderRadius: radius.lg,
    paddingHorizontal: spacing.md, height: 44, borderWidth: 1, borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  searchInput: { flex: 1, fontSize: typography.sizes.body, color: colors.textDark },
  bankItemRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingVertical: spacing.md, paddingHorizontal: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  bankItemRowSelected: { backgroundColor: colors.accentLight, borderRadius: radius.lg },
  bankIconCircle: { width: 34, height: 34, borderRadius: 10, backgroundColor: colors.accentLight, alignItems: 'center', justifyContent: 'center' },
  bankItemName:   { flex: 1, fontSize: typography.sizes.body, fontWeight: '600', color: colors.textDark },
  bankItemNameSelected: { fontWeight: '800', color: colors.primaryDeep },
});
