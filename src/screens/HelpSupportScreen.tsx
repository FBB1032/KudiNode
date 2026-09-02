import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, StatusBar,
} from 'react-native';
import { colors, spacing, radius, typography, shadows } from '../theme/theme';
import { TopHeader } from '../components/TopHeader';
import { Icon } from '../components/Icon';
import { useLanguage } from '../context/LanguageContext';

const FAQS = [
  {
    qKey: 'help.faq1q',
    aKey: 'help.faq1a',
  },
  {
    qKey: 'help.faq2q',
    aKey: 'help.faq2a',
  },
  {
    qKey: 'help.faq3q',
    aKey: 'help.faq3a',
  },
  {
    qKey: 'help.faq4q',
    aKey: 'help.faq4a',
  },
];

export function HelpSupportScreen() {
  const { t } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [issueText, setIssueText] = useState('');

  const handleSendReport = () => {
    if (!issueText.trim()) {
      Alert.alert(t('help.emptyMessage'), t('help.emptyMessageText'));
      return;
    }
    Alert.alert(t('help.ticketCreated'), t('help.ticketCreatedMsg'));
    setIssueText('');
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDeep} translucent={false} />
      <TopHeader showBack title={t('help.title')} subtitle={t('help.subtitle')} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Support Channels */}
        <View style={styles.channelsRow}>
          <TouchableOpacity
            style={[styles.channelCard, shadows.card]}
            onPress={() => Alert.alert(t('help.callCenter'), t('help.callMsg'))}
            activeOpacity={0.8}
          >
            <View style={[styles.channelIcon, { backgroundColor: '#E8FFF2' }]}>
              <Icon name="phone" size={22} color={colors.successGreen} />
            </View>
            <Text style={styles.channelTitle}>{t('help.callCenter')}</Text>
            <Text style={styles.channelSub}>{t('help.callCenterSub')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.channelCard, shadows.card]}
            onPress={() => Alert.alert(t('help.liveChat'), t('help.liveChatMsg'))}
            activeOpacity={0.8}
          >
            <View style={[styles.channelIcon, { backgroundColor: colors.accentLight }]}>
              <Icon name="help" size={22} color={colors.primaryDeep} />
            </View>
            <Text style={styles.channelTitle}>{t('help.liveChat')}</Text>
            <Text style={styles.channelSub}>{t('help.liveChatSub')}</Text>
          </TouchableOpacity>
        </View>

        {/* FAQs */}
        <Text style={styles.sectionTitle}>{t('help.faq')}</Text>
        <View style={[styles.card, shadows.card]}>
          {FAQS.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <View key={i} style={[styles.faqItem, i < FAQS.length - 1 && styles.faqBorder]}>
                <TouchableOpacity
                  style={styles.faqHead}
                  onPress={() => setOpenFaq(isOpen ? null : i)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.faqQuestion}>{t(faq.qKey)}</Text>
                  <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
                </TouchableOpacity>
                {isOpen && <Text style={styles.faqAnswer}>{t(faq.aKey)}</Text>}
              </View>
            );
          })}
        </View>

        {/* Report an Issue Form */}
        <Text style={styles.sectionTitle}>{t('help.reportIssue')}</Text>
        <View style={[styles.card, shadows.card, { padding: spacing.lg }]}>
          <Text style={styles.formTitle}>{t('help.formTitle')}</Text>
          <TextInput
            style={styles.issueInput}
            value={issueText}
            onChangeText={setIssueText}
            placeholder={t('help.issuePlaceholder')}
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <TouchableOpacity style={styles.submitBtn} onPress={handleSendReport} activeOpacity={0.85}>
            <Icon name="send" size={16} color={colors.white} />
            <Text style={styles.submitBtnText}>{t('help.submitTicket')}</Text>
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
  channelsRow: { flexDirection: 'row', gap: spacing.md },
  channelCard: {
    flex: 1, backgroundColor: colors.white, borderRadius: radius.xl,
    padding: spacing.lg, alignItems: 'center', gap: 6,
  },
  channelIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  channelTitle: { fontSize: typography.sizes.body, fontWeight: '800', color: colors.textDark },
  channelSub:   { fontSize: typography.sizes.tiny, color: colors.textMuted },
  sectionTitle: {
    fontSize: typography.sizes.small, fontWeight: '700',
    color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5,
    marginTop: spacing.sm,
  },
  card: { backgroundColor: colors.white, borderRadius: radius.xl, overflow: 'hidden' },
  faqItem: { padding: spacing.lg },
  faqBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  faqHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md },
  faqQuestion: { fontSize: typography.sizes.body, fontWeight: '700', color: colors.textDark, flex: 1 },
  faqAnswer: { fontSize: typography.sizes.small, color: colors.textMuted, marginTop: spacing.md, lineHeight: 20 },
  formTitle: { fontSize: typography.sizes.small, fontWeight: '600', color: colors.textDark, marginBottom: spacing.sm },
  issueInput: {
    backgroundColor: colors.grayBG, borderRadius: radius.lg,
    padding: spacing.md, height: 100, borderWidth: 1, borderColor: colors.border,
    fontSize: typography.sizes.body, color: colors.textDark,
  },
  submitBtn: {
    backgroundColor: colors.primaryDeep, borderRadius: radius.lg,
    paddingVertical: 14, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: spacing.sm, marginTop: spacing.md,
  },
  submitBtnText: { color: colors.white, fontWeight: '800', fontSize: typography.sizes.body },
});
