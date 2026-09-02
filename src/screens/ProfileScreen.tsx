import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Modal, Alert, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius, typography, shadows } from '../theme/theme';
import { Icon } from '../components/Icon';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../AppNavigator';
import { useLanguage, Language } from '../context/LanguageContext';
import { AiAdvisorModal } from '../components/AiAdvisorModal';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const LANGUAGES: { id: Language; label: string; flag: string }[] = [
  { id: 'EN',     label: 'English', flag: '🇬🇧' },
  { id: 'Pidgin', label: 'Pidgin',  flag: '🇳🇬' },
  { id: 'Hausa',  label: 'Hausa',   flag: '🇳🇬' },
  { id: 'Yoruba', label: 'Yoruba',  flag: '🇳🇬' },
  { id: 'Igbo',   label: 'Igbo',    flag: '🇳🇬' },
];

const MENU_SECTIONS = [
  {
    titleKey: 'profile.aiAdvisory',
    items: [
      { icon: 'robot'         as const, labelKey: 'profile.kudibot', subKey: 'profile.kudibotSub', route: 'AI_BOT_MODAL' as const },
      { icon: 'stats-chart'   as const, labelKey: 'profile.creditScore', subKey: 'profile.creditScoreSub', route: 'TrustScore' as const },
    ],
  },
  {
    titleKey: 'profile.finances',
    items: [
      { icon: 'receipt'    as const, labelKey: 'profile.transactionHistory', subKey: 'profile.transactionHistorySub', route: 'AllTransactions' as const },
      { icon: 'receipt'    as const, labelKey: 'profile.salesLedger', subKey: 'profile.salesLedgerSub', route: 'Ledger'          as const },
    ],
  },
  {
    titleKey: 'profile.community',
    items: [
      { icon: 'people'     as const, labelKey: 'profile.myCoop', subKey: 'profile.myCoopSub', route: 'CoopEsusu'       as const },
      { icon: 'plus'       as const, labelKey: 'profile.createCoop', subKey: 'profile.createCoopSub', route: 'CoopCreate'      as const },
    ],
  },
  {
    titleKey: 'profile.accountSettings',
    items: [
      { icon: 'globe'      as const, labelKey: 'profile.voiceLanguage', subKey: 'profile.voiceLanguageSub', route: 'LANG_MODAL' as const },
      { icon: 'lock'       as const, labelKey: 'profile.setTransferPin', subKey: 'profile.setTransferPinSub', route: 'PIN_SETUP_MODAL' as const },
      { icon: 'bell'       as const, labelKey: 'profile.notifications', subKey: 'profile.notificationsSub', route: 'Notifications'   as const },
      { icon: 'shield'     as const, labelKey: 'profile.security', subKey: 'profile.securitySub', route: 'SecuritySettings'as const },
      { icon: 'id-card'    as const, labelKey: 'profile.kyc', subKey: 'profile.kycSub', route: 'KYCDocuments'    as const },
      { icon: 'help'       as const, labelKey: 'profile.help', subKey: 'profile.helpSub', route: 'HelpSupport'     as const },
    ],
  },
  {
    titleKey: '',
    items: [
      { icon: 'logout'     as const, labelKey: 'profile.signOut', subKey: 'profile.signOutSub', route: null, danger: true },
    ],
  },
];

export function ProfileScreen() {
  const nav = useNavigation<Nav>();
  const { language, setLanguage, t } = useLanguage();
  const [showLangModal, setShowLangModal]       = useState(false);
  const [showAdvisorModal, setShowAdvisorModal] = useState(false);
  const [showPinSetupModal, setShowPinSetupModal] = useState(false);
  const [newPinVal, setNewPinVal]               = useState('');
  const [confirmPinVal, setConfirmPinVal]       = useState('');
  const [pinError, setPinError]                 = useState('');

  const handleSavePin = () => {
    if (newPinVal.length !== 4) {
      setPinError(t('profile.pinErrorLength'));
      return;
    }
    if (newPinVal !== confirmPinVal) {
      setPinError(t('profile.pinErrorMismatch'));
      return;
    }
    setPinError('');
    setShowPinSetupModal(false);
    setNewPinVal('');
    setConfirmPinVal('');
    Alert.alert(t('profile.pinUpdated'), t('profile.pinUpdatedMsg'));
  };

  const handlePress = (route: string | null, danger?: boolean) => {
    if (danger) {
      nav.reset({ index: 0, routes: [{ name: 'Login' }] });
      return;
    }
    if (route === 'LANG_MODAL') {
      setShowLangModal(true);
      return;
    }
    if (route === 'AI_BOT_MODAL') {
      setShowAdvisorModal(true);
      return;
    }
    if (route === 'PIN_SETUP_MODAL') {
      setShowPinSetupModal(true);
      return;
    }
    if (route) nav.navigate(route as any);
  };

  const handleSelectLang = (langId: Language) => {
    setLanguage(langId);
    setShowLangModal(false);
  };

  const handleCopyAcc = () => {
    Alert.alert(t('profile.copiedTitle'), t('profile.copiedMsg', { account: '0129384756', name: 'Amina Babangida Bello' }));
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDeep} translucent={false} />

      {/* ── Gradient header ── */}
      <LinearGradient
        colors={[colors.primaryDeep, colors.primaryMid]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView edges={['top', 'left', 'right']}>
          {/* Nav row */}
          <View style={styles.navRow}>
            <TouchableOpacity style={styles.navBtn} onPress={() => nav.goBack()} activeOpacity={0.8}>
              <Icon name="arrow-back" size={22} color={colors.white} />
            </TouchableOpacity>

            <Text style={styles.navTitle}>{t('profile.merchantProfile')}</Text>

            {/* Top Right Corner Language Selector Pill */}
            <TouchableOpacity
              style={styles.langPill}
              onPress={() => setShowLangModal(true)}
              activeOpacity={0.75}
            >
              <Text style={styles.langPillFlag}>
                {LANGUAGES.find(l => l.id === language)?.flag || '🇳🇬'}
              </Text>
              <Text style={styles.langPillText}>{language}</Text>
              <Icon name="chevron-down" size={12} color={colors.white} />
            </TouchableOpacity>
          </View>

          {/* Avatar section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarRing}>
              <View style={styles.avatarInner}>
                <Icon name="person" size={38} color={colors.white} />
              </View>
              <View style={styles.verifiedDot}>
                <Icon name="checkmark" size={9} color={colors.white} />
              </View>
            </View>
            <Text style={styles.profileName}>Amina Bello</Text>
            <Text style={styles.profileId}>KN-783462 · Mushin Central Market</Text>
            <View style={styles.tierBadge}>
              <Icon name="shield-checkmark" size={12} color={colors.successGreen} />
              <Text style={styles.tierText}>{t('profile.tier1')}</Text>
            </View>
          </View>

          {/* Bank card */}
          <View style={[styles.bankCard, shadows.card]}>
            <View style={styles.bankLeft}>
              <View style={styles.bankIcon}>
                <Icon name="bank" size={22} color={colors.primaryDeep} />
              </View>
              <View>
                <Text style={styles.bankLbl}>{t('profile.wemaSettlement')}</Text>
                <Text style={styles.bankNum}>0129 3847 56</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.copyBtn} onPress={handleCopyAcc} activeOpacity={0.75}>
              <Icon name="copy" size={16} color={colors.primaryMid} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* ── Scroll content ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { labelKey: 'profile.totalSales',  value: '₦1.2M',   icon: 'receipt'      as const },
            { labelKey: 'profile.creditUsed',  value: '₦50K',    icon: 'card'         as const },
            { labelKey: 'profile.trustScore',  value: '91 / 100', icon: 'stats-chart' as const },
          ].map(s => (
            <View key={s.labelKey} style={[styles.statCard, shadows.card]}>
              <Icon name={s.icon} size={17} color={colors.primaryMid} />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{t(s.labelKey)}</Text>
            </View>
          ))}
        </View>

        {/* Menu sections */}
        {MENU_SECTIONS.map((section, si) => (
          <View key={si}>
            {section.titleKey ? (
              <Text style={styles.sectionTitle}>{t(section.titleKey)}</Text>
            ) : null}
            <View style={[styles.menuCard, shadows.card]}>
              {section.items.map((item, ii) => (
                <TouchableOpacity
                  key={item.labelKey}
                  style={[styles.menuRow, ii < section.items.length - 1 && styles.menuBorder]}
                  onPress={() => handlePress(item.route, (item as any).danger)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.menuIcon, (item as any).danger && styles.menuIconDanger]}>
                    <Icon
                      name={item.icon}
                      size={20}
                      color={(item as any).danger ? '#FF3B30' : colors.primaryMid}
                    />
                  </View>
                  <View style={styles.menuText}>
                    <Text style={[styles.menuLabel, (item as any).danger && styles.menuLabelDanger]}>
                      {t(item.labelKey)}
                    </Text>
                    <Text style={styles.menuSub}>{t(item.subKey)}</Text>
                  </View>
                  {!(item as any).danger && (
                    <Icon name="chevron-forward" size={16} color={colors.textMuted} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <Text style={styles.version}>{t('profile.version')}</Text>
        <View style={{ height: spacing.xxxl * 2 }} />
      </ScrollView>

      {/* ── Language Selector Modal ── */}
      <Modal visible={showLangModal} transparent animationType="fade" onRequestClose={() => setShowLangModal(false)}>
        <TouchableOpacity style={styles.modalBg} activeOpacity={1} onPress={() => setShowLangModal(false)}>
          <View style={[styles.langCard, shadows.cardLg]}>
            <View style={styles.langHeader}>
              <Text style={styles.langTitle}>{t('profile.selectLanguage')}</Text>
              <TouchableOpacity onPress={() => setShowLangModal(false)}>
                <Icon name="close" size={20} color={colors.textDark} />
              </TouchableOpacity>
            </View>

            <View style={styles.langList}>
              {LANGUAGES.map(l => {
                const isSelected = language === l.id;
                return (
                  <TouchableOpacity
                    key={l.id}
                    style={[styles.langItem, isSelected && styles.langItemSelected]}
                    onPress={() => handleSelectLang(l.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.langFlag}>{l.flag}</Text>
                    <Text style={[styles.langItemLabel, isSelected && styles.langItemTextSelected]}>
                      {l.label}
                    </Text>
                    {isSelected && (
                      <Icon name="checkmark-circle" size={18} color={colors.successGreen} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 🔒 Set Transfer PIN Modal 🔒 */}
      <Modal visible={showPinSetupModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.pinSetupCard, shadows.cardLg]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('profile.setPinTitle')}</Text>
              <TouchableOpacity onPress={() => setShowPinSetupModal(false)} activeOpacity={0.8}>
                <Icon name="close" size={22} color={colors.textDark} />
              </TouchableOpacity>
            </View>

            <Text style={styles.pinSetupSub}>
              {t('profile.setPinSub')}
            </Text>

            <View style={styles.pinInputWrap}>
              <Text style={styles.pinInputLabel}>{t('profile.newPin')}</Text>
              <TextInput
                style={styles.pinInputField}
                value={newPinVal}
                onChangeText={v => { setNewPinVal(v); setPinError(''); }}
                keyboardType="numeric"
                secureTextEntry
                maxLength={4}
                placeholder="••••"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.pinInputWrap}>
              <Text style={styles.pinInputLabel}>{t('profile.confirmPin')}</Text>
              <TextInput
                style={styles.pinInputField}
                value={confirmPinVal}
                onChangeText={v => { setConfirmPinVal(v); setPinError(''); }}
                keyboardType="numeric"
                secureTextEntry
                maxLength={4}
                placeholder="••••"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            {pinError ? <Text style={styles.pinErrorText}>{pinError}</Text> : null}

            <TouchableOpacity style={styles.savePinBtn} onPress={handleSavePin} activeOpacity={0.88}>
              <Text style={styles.savePinBtnText}>{t('profile.savePin')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 🤖 AI Financial Advisor Modal 🤖 */}
      <AiAdvisorModal visible={showAdvisorModal} onClose={() => setShowAdvisorModal(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.grayBG },

  // Header
  navRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md, paddingBottom: spacing.md,
  },
  navBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  navTitle: { fontSize: typography.sizes.h4, fontWeight: '800', color: colors.white },

  langPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: radius.pill, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  langPillFlag: { fontSize: 13 },
  langPillText: { fontSize: typography.sizes.tiny, color: colors.white, fontWeight: '800' },

  // Avatar
  avatarSection: { alignItems: 'center', paddingBottom: spacing.md },
  avatarRing: { position: 'relative', marginBottom: spacing.md },
  avatarInner: {
    width: 82, height: 82, borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  verifiedDot: {
    position: 'absolute', bottom: -4, right: -4,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: colors.successGreen,
    borderWidth: 2, borderColor: colors.white,
    alignItems: 'center', justifyContent: 'center',
  },
  profileName: { fontSize: typography.sizes.h2, fontWeight: '800', color: colors.white },
  profileId:   { fontSize: typography.sizes.small, color: 'rgba(255,255,255,0.7)', marginTop: 3 },
  tierBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: spacing.md, paddingVertical: 5,
    borderRadius: radius.pill, marginTop: spacing.sm,
  },
  tierText: { fontSize: typography.sizes.tiny, color: colors.white, fontWeight: '700' },

  // Bank card
  bankCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.white, borderRadius: radius.xl,
    padding: spacing.lg,
    margin: spacing.lg, marginTop: spacing.md,
  },
  bankLeft:  { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  bankIcon:  { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.accentLight, alignItems: 'center', justifyContent: 'center' },
  bankLbl:   { fontSize: typography.sizes.tiny, color: colors.textMuted, fontWeight: '600' },
  bankNum:   { fontSize: typography.sizes.h4, fontWeight: '800', color: colors.textDark, letterSpacing: 1.2, marginTop: 1 },
  copyBtn:   { padding: spacing.sm },

  // Scroll
  scroll:   { flex: 1 },
  content:  { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.md },

  // Stats
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statCard: {
    flex: 1, backgroundColor: colors.white,
    borderRadius: radius.xl, padding: spacing.md,
    alignItems: 'center', gap: 4,
  },
  statValue: { fontSize: typography.sizes.small, fontWeight: '800', color: colors.textDark, textAlign: 'center' },
  statLabel: { fontSize: typography.sizes.tiny, color: colors.textMuted, textAlign: 'center' },

  // Menu
  sectionTitle: { fontSize: typography.sizes.small, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  menuCard:     { backgroundColor: colors.white, borderRadius: radius.xl, overflow: 'hidden' },
  menuRow:      { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, gap: spacing.md },
  menuBorder:   { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  menuIcon:     { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.accentLight, alignItems: 'center', justifyContent: 'center' },
  menuIconDanger:{ backgroundColor: '#FFF0F0' },
  menuText:     { flex: 1 },
  menuLabel:    { fontSize: typography.sizes.body, fontWeight: '700', color: colors.textDark },
  menuLabelDanger: { color: '#FF3B30' },
  menuSub:      { fontSize: typography.sizes.tiny, color: colors.textMuted, marginTop: 2 },

  version: { textAlign: 'center', fontSize: typography.sizes.tiny, color: colors.textMuted, marginTop: spacing.sm },

  // Modal
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  langCard: { width: '100%', maxWidth: 360, backgroundColor: colors.white, borderRadius: radius.xxl, padding: spacing.xl },
  langHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  langTitle: { fontSize: typography.sizes.h4, fontWeight: '800', color: colors.textDark },
  langList: { gap: spacing.sm },
  langItem: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.md, borderRadius: radius.lg,
    backgroundColor: colors.grayBG, borderWidth: 1, borderColor: colors.border,
  },
  langItemSelected: { backgroundColor: '#F0FDF4', borderColor: colors.successGreen },
  langFlag: { fontSize: 20 },
  langItemLabel: { flex: 1, fontSize: typography.sizes.body, fontWeight: '700', color: colors.textDark },
  langItemTextSelected: { color: colors.successGreen, fontWeight: '800' },

  // Set Transfer PIN Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: spacing.sm },
  modalTitle:   { fontSize: typography.sizes.h4, fontWeight: '800', color: colors.textDark },
  pinSetupCard: {
    backgroundColor: colors.white, borderTopLeftRadius: radius.xxl, borderTopRightRadius: radius.xxl,
    padding: spacing.xl, width: '100%', gap: spacing.md,
  },
  pinSetupSub: { fontSize: typography.sizes.small, color: colors.textMuted, lineHeight: 18 },
  pinInputWrap: { gap: 4 },
  pinInputLabel: { fontSize: typography.sizes.tiny, fontWeight: '700', color: colors.textMuted },
  pinInputField: {
    backgroundColor: colors.grayBG, borderRadius: radius.lg,
    paddingHorizontal: spacing.md, height: 48,
    borderWidth: 1, borderColor: colors.border,
    fontSize: 20, color: colors.textDark, fontWeight: '800', letterSpacing: 8,
  },
  pinErrorText: { fontSize: typography.sizes.tiny, color: '#EF4444', fontWeight: '700' },
  savePinBtn: {
    backgroundColor: colors.primaryDeep, borderRadius: radius.xl,
    paddingVertical: 14, alignItems: 'center', justifyContent: 'center', marginTop: 4,
  },
  savePinBtnText: { color: colors.white, fontWeight: '800', fontSize: typography.sizes.body },
});
