import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Modal, Alert,
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
    title: 'AI Advisory & Financial Intelligence',
    items: [
      { icon: 'robot'         as const, label: 'AI Financial Advisor (KudiBot)', sub: 'Instant credit, profit & reinvestment advice', route: 'AI_BOT_MODAL' as const },
      { icon: 'stats-chart'   as const, label: 'Credit Score',                  sub: 'KudiNode AI trust score breakdown',        route: 'TrustScore' as const },
    ],
  },
  {
    title: 'Finances & Ledger',
    items: [
      { icon: 'receipt'    as const, label: 'Transaction History',  sub: 'Full ledger export',         route: 'AllTransactions' as const },
      { icon: 'receipt'    as const, label: 'Sales Ledger',         sub: 'Voice & scan records',       route: 'Ledger'          as const },
    ],
  },
  {
    title: 'Community',
    items: [
      { icon: 'people'     as const, label: 'My Co-op Group',       sub: 'Mushin Market Node',         route: 'CoopEsusu'       as const },
      { icon: 'plus'       as const, label: 'Create Co-op Group',   sub: 'Start a new Esusu circle',   route: 'CoopCreate'      as const },
    ],
  },
  {
    title: 'Account & Settings',
    items: [
      { icon: 'globe'      as const, label: 'Voice & Language',     sub: 'Hausa, Yoruba, Igbo, Pidgin, EN', route: 'LANG_MODAL' as const },
      { icon: 'bell'       as const, label: 'Notifications',        sub: 'Manage alerts & SMS',        route: 'Notifications'   as const },
      { icon: 'shield'     as const, label: 'Security & PIN',       sub: 'Change PIN, biometrics',     route: 'SecuritySettings'as const },
      { icon: 'id-card'    as const, label: 'KYC Documents',        sub: 'Uploaded ID & liveness',     route: 'KYCDocuments'    as const },
      { icon: 'help'       as const, label: 'Help & Support',       sub: 'Chat, FAQ, call centre',     route: 'HelpSupport'     as const },
    ],
  },
  {
    title: '',
    items: [
      { icon: 'logout'     as const, label: 'Sign Out',             sub: 'Log out of merchant hub',    route: null, danger: true },
    ],
  },
];

export function ProfileScreen() {
  const nav = useNavigation<Nav>();
  const { language, setLanguage, t } = useLanguage();
  const [showLangModal, setShowLangModal] = useState(false);
  const [showAdvisorModal, setShowAdvisorModal] = useState(false);

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
    if (route) nav.navigate(route as any);
  };

  const handleSelectLang = (langId: Language) => {
    setLanguage(langId);
    setShowLangModal(false);
  };

  const handleCopyAcc = () => {
    Alert.alert('Copied to Clipboard', 'Wema Settlement Account 0129384756 (Amina Babangida Bello) copied.');
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

            <Text style={styles.navTitle}>Merchant Profile</Text>

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
              <Text style={styles.tierText}>{t('tier1')}</Text>
            </View>
          </View>

          {/* Bank card */}
          <View style={[styles.bankCard, shadows.card]}>
            <View style={styles.bankLeft}>
              <View style={styles.bankIcon}>
                <Icon name="bank" size={22} color={colors.primaryDeep} />
              </View>
              <View>
                <Text style={styles.bankLbl}>Wema Bank Settlement Account</Text>
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
            { label: 'Total Sales',  value: '₦1.2M',   icon: 'receipt'      as const },
            { label: 'Credit Used',  value: '₦50K',    icon: 'card'         as const },
            { label: 'Trust Score',  value: '91 / 100', icon: 'stats-chart' as const },
          ].map(s => (
            <View key={s.label} style={[styles.statCard, shadows.card]}>
              <Icon name={s.icon} size={17} color={colors.primaryMid} />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu sections */}
        {MENU_SECTIONS.map((section, si) => (
          <View key={si}>
            {section.title ? (
              <Text style={styles.sectionTitle}>{section.title}</Text>
            ) : null}
            <View style={[styles.menuCard, shadows.card]}>
              {section.items.map((item, ii) => (
                <TouchableOpacity
                  key={item.label}
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
                      {item.label}
                    </Text>
                    <Text style={styles.menuSub}>{item.sub}</Text>
                  </View>
                  {!(item as any).danger && (
                    <Icon name="chevron-forward" size={16} color={colors.textMuted} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <Text style={styles.version}>KudiNode AI v1.0.0 · Financial Sandbox</Text>
        <View style={{ height: spacing.xxxl * 2 }} />
      </ScrollView>

      {/* ── Language Selector Modal ── */}
      <Modal visible={showLangModal} transparent animationType="fade" onRequestClose={() => setShowLangModal(false)}>
        <TouchableOpacity style={styles.modalBg} activeOpacity={1} onPress={() => setShowLangModal(false)}>
          <View style={[styles.langCard, shadows.cardLg]}>
            <View style={styles.langHeader}>
              <Text style={styles.langTitle}>Select App & AI Voice Language</Text>
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
  langItemTextSelected: { color: colors.successGreen },
});
