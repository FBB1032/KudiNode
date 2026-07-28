import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, StatusBar,
} from 'react-native';
import { colors, spacing, radius, typography, shadows } from '../theme/theme';
import { TopHeader } from '../components/TopHeader';
import { Icon } from '../components/Icon';

const FAQS = [
  {
    q: 'How does voice sales logging work?',
    a: 'Simply tap the Log Sales mic icon and speak your sale items in English, Pidgin, Hausa, Yoruba, or Igbo (e.g. "I sold 2 bags of rice for 23 thousand"). KudiNode AI automatically parses the items and amounts into your ledger.',
  },
  {
    q: 'What is KudiNode Credit Score?',
    a: 'Your credit score is calculated using your sales ledger history and Co-op Esusu contribution consistency. Higher scores unlock instant micro-credit lines up to ₦500,000 via KudiNode.',
  },
  {
    q: 'Can I use KudiNode offline?',
    a: 'Yes! All voice records and receipt scans are cached locally on your device when network is unavailable and automatically synced once you reconnect.',
  },
  {
    q: 'How do I withdraw funds to my main bank account?',
    a: 'Tap Send Money on your Wema balance card, enter the destination bank account and your 4-digit security PIN to authorize an instant transfer.',
  },
];

export function HelpSupportScreen() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [issueText, setIssueText] = useState('');

  const handleSendReport = () => {
    if (!issueText.trim()) {
      Alert.alert('Empty Message', 'Please enter details about your issue.');
      return;
    }
    Alert.alert('Support Ticket Created', 'Thank you! A KudiNode Merchant Support Agent will review your ticket and reach out via SMS/App Notification.');
    setIssueText('');
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDeep} translucent={false} />
      <TopHeader showBack title="Help & Support" subtitle="24/7 Merchant assistance" />

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
            onPress={() => Alert.alert('KudiNode Merchant Support', 'Calling 0800-KUDI-NODE (Toll Free)...')}
            activeOpacity={0.8}
          >
            <View style={[styles.channelIcon, { backgroundColor: '#E8FFF2' }]}>
              <Icon name="phone" size={22} color={colors.successGreen} />
            </View>
            <Text style={styles.channelTitle}>Call Center</Text>
            <Text style={styles.channelSub}>Toll Free 24/7</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.channelCard, shadows.card]}
            onPress={() => Alert.alert('Live Agent Chat', 'Connecting to KudiNode AI Support Agent...')}
            activeOpacity={0.8}
          >
            <View style={[styles.channelIcon, { backgroundColor: colors.accentLight }]}>
              <Icon name="help" size={22} color={colors.primaryDeep} />
            </View>
            <Text style={styles.channelTitle}>Live Chat</Text>
            <Text style={styles.channelSub}>Instant AI Help</Text>
          </TouchableOpacity>
        </View>

        {/* FAQs */}
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
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
                  <Text style={styles.faqQuestion}>{faq.q}</Text>
                  <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
                </TouchableOpacity>
                {isOpen && <Text style={styles.faqAnswer}>{faq.a}</Text>}
              </View>
            );
          })}
        </View>

        {/* Report an Issue Form */}
        <Text style={styles.sectionTitle}>Report an Issue</Text>
        <View style={[styles.card, shadows.card, { padding: spacing.lg }]}>
          <Text style={styles.formTitle}>Describe the problem you are experiencing</Text>
          <TextInput
            style={styles.issueInput}
            value={issueText}
            onChangeText={setIssueText}
            placeholder="Type your issue here..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <TouchableOpacity style={styles.submitBtn} onPress={handleSendReport} activeOpacity={0.85}>
            <Icon name="send" size={16} color={colors.white} />
            <Text style={styles.submitBtnText}>Submit Support Ticket</Text>
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
