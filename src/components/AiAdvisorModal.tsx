import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView,
  TextInput, KeyboardAvoidingView, Platform, Animated, Alert,
} from 'react-native';
import { colors, spacing, radius, typography, shadows } from '../theme/theme';
import { Icon } from './Icon';
import { useLanguage } from '../context/LanguageContext';
import { LinearGradient } from 'expo-linear-gradient';
import {
  sendAiChatMessage,
  type ChatMessageInput,
} from '../services/aiApi';
import { useAuth } from '../context/AuthContext';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  chipTag?: string;
  providerLabel?: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
}

function parseTable(rows: string[]): { type: 'table'; rows: string[][]; hasHeader: boolean } | null {
  const isSeparator = (line: string) => /^\|[\s:\-|]+\|$/.test(line) && /-/.test(line);

  let headerIdx = -1;
  for (let r = 0; r < rows.length; r++) {
    if (isSeparator(rows[r])) {
      headerIdx = r;
      break;
    }
  }

  const body = rows.filter((_, r) => r !== headerIdx);
  if (body.length === 0) return null;

  const splitRow = (line: string) => {
    const cells = line.replace(/^\|/, '').replace(/\|$/, '').split('|');
    return cells.map((c) => c.trim());
  };

  const parsed: string[][] = body.map(splitRow);
  const hasHeader = headerIdx === 1;

  if (hasHeader && parsed.length > 0 && parsed[0].length > 0) {
    return { type: 'table', rows: parsed, hasHeader: true };
  }
  return parsed.length > 0 ? { type: 'table', rows: parsed, hasHeader: false } : null;
}

function renderBotMessage(text: string): React.ReactNode[] {
  if (!text) return [<Text key="empty"> </Text>];

  const lines = text.split('\n');
  const blocks: ({ type: 'paragraph' | 'list-item'; text: string; number?: number } | { type: 'table'; rows: string[][]; hasHeader: boolean })[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      if (blocks.length > 0 && blocks[blocks.length - 1].type !== 'paragraph') {
        blocks.push({ type: 'paragraph', text: '' });
      }
      continue;
    }

    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numberedMatch) {
      blocks.push({ type: 'list-item', text: numberedMatch[2], number: parseInt(numberedMatch[1], 10) });
      continue;
    }

    const numberedParenMatch = trimmed.match(/^(\d+)\)\s+(.*)/);
    if (numberedParenMatch) {
      blocks.push({ type: 'list-item', text: numberedParenMatch[2], number: parseInt(numberedParenMatch[1], 10) });
      continue;
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
      blocks.push({ type: 'list-item', text: trimmed.slice(2).trim(), number: undefined });
      continue;
    }

    if (/^\|.*\|$/.test(trimmed) && trimmed.length > 2) {
      const tableRows: string[] = [trimmed];
      let j = i + 1;
      while (j < lines.length && /^\|.*\|$/.test(lines[j].trim()) && lines[j].trim().length > 2) {
        tableRows.push(lines[j].trim());
        j++;
      }
      i = j - 1;
      const parsed = parseTable(tableRows);
      if (parsed) blocks.push(parsed);
      continue;
    }

    const lastBlock = blocks.length > 0 ? blocks[blocks.length - 1] : undefined;
    if (lastBlock && lastBlock.type === 'paragraph') {
      lastBlock.text += (lastBlock.text ? '\n' : '') + line;
    } else {
      blocks.push({ type: 'paragraph', text: line });
    }
  }

  const renderInline = (blockText: string, keyPrefix: string) => {
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*(.+?)\*\*|_(.+?)_|\*(.+?)\*|`(.+?)`)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let partIdx = 0;

    while ((match = regex.exec(blockText)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <Text key={`${keyPrefix}-t${partIdx++}`}>{blockText.slice(lastIndex, match.index)}</Text>,
        );
      }
      if (match[2] !== undefined) {
        parts.push(
          <Text key={`${keyPrefix}-b${partIdx++}`} style={styles.botBold}>{match[2]}</Text>,
        );
      } else if (match[3] !== undefined) {
        parts.push(
          <Text key={`${keyPrefix}-i${partIdx++}`} style={styles.botItalic}>{match[3]}</Text>,
        );
      } else if (match[4] !== undefined) {
        if (match.index > 0) {
          parts.push(
            <Text key={`${keyPrefix}-i${partIdx++}`} style={styles.botItalic}>{match[4]}</Text>,
          );
        } else {
          parts.push(
            <Text key={`${keyPrefix}-i${partIdx++}`}>{`*${match[4]}*`}</Text>,
          );
        }
      } else if (match[5] !== undefined) {
        parts.push(
          <Text key={`${keyPrefix}-c${partIdx++}`} style={styles.botCode}>{match[5]}</Text>,
        );
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < blockText.length) {
      parts.push(
        <Text key={`${keyPrefix}-t${partIdx++}`}>{blockText.slice(lastIndex)}</Text>,
      );
    }

    return parts.length > 0 ? parts : blockText;
  };

  const elements: React.ReactNode[] = [];
  let blockIdx = 0;

  for (const block of blocks) {
    if (block.type === 'paragraph') {
      if (block.text === '') {
        elements.push(<View key={`b${blockIdx++}`} style={styles.botBlock} />);
      } else {
        elements.push(
          <Text key={`b${blockIdx++}`} style={styles.botBlock}>
            {renderInline(block.text, `p${blockIdx}`)}
          </Text>,
        );
      }
    } else if (block.type === 'table') {
      const numCols = block.rows.reduce((max, r) => Math.max(max, r.length), 0);
      elements.push(
        <View key={`b${blockIdx++}`} style={styles.botTable}>
          {block.rows.map((row, rIdx) => {
            const isHeader = rIdx === 0 && block.hasHeader;
            return (
              <View
                key={`tr${rIdx}`}
                style={[styles.botTableRow, isHeader && styles.botTableRowHeader]}
              >
                {row.map((cell, cIdx) => (
                  <Text
                    key={`td${cIdx}`}
                    style={[
                      styles.botTableCell,
                      isHeader && styles.botTableCellHeader,
                      { flex: numCols > 0 ? 1 : undefined },
                    ]}
                  >
                    {renderInline(cell, `t${blockIdx}-${rIdx}-${cIdx}`)}
                  </Text>
                ))}
              </View>
            );
          })}
        </View>,
      );
    } else {
      elements.push(
        <View key={`b${blockIdx++}`} style={styles.botListBlock}>
          <View style={styles.botListItem}>
            {block.number !== undefined ? (
              <Text style={styles.botListNumber}>{block.number}.</Text>
            ) : (
              <Text style={styles.botListNumber}>•</Text>
            )}
            <Text style={styles.botListItemText}>
              {renderInline(block.text, `l${blockIdx}`)}
            </Text>
          </View>
        </View>,
      );
    }
  }

  return elements;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm1',
    sender: 'bot',
    text:
      "Sannu / E kaaro / Ututu Oma! I'm KudiBot, your AI business assistant. I watch your daily sales, Wema account, and Trust Score to help you grow your business. Ask me about credit, profit, savings, stock, receipts, or voice commands — I'm here to help!",
    time: 'Just now',
  },
];

const QUICK_PROMPTS = [
  { key: 'components.prompt1', query: 'How do I increase my credit line?' },
  { key: 'components.prompt2', query: 'Analyse my daily profit trend' },
  { key: 'components.prompt3', query: 'When is my next Esusu payout?' },
  { key: 'components.prompt4', query: 'How much should I reinvest in products?' },
];

export function AiAdvisorModal({ visible, onClose }: Props) {
  const { t, language } = useLanguage();
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [requestInFlight, setRequestInFlight] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    if (isListening) {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 400, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: 400, useNativeDriver: true }),
        ]),
      );
      loop.start();
    } else {
      pulseAnim.setValue(1);
    }
    return () => loop?.stop();
  }, [isListening, pulseAnim]);

  useEffect(() => {
    if (visible) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [visible, messages, isTyping]);

  const appendBotMessage = useCallback((text: string, providerLabel?: string) => {
    const botMsg: Message = {
      id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      sender: 'bot',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      providerLabel,
    };
    setMessages((prev) => [...prev, botMsg]);
  }, []);

  const fallbackResponse = (query: string) => {
    const lower = query.toLowerCase();
    if (lower.includes('credit') || lower.includes('increase')) {
      return "To raise your Wema credit line:\n1. Log your sales every day (voice or receipt) for 2 weeks\n2. Pay your monthly Co-op/Esusu contributions on time\n3. Repay any small loan before the date it's due\n4. Keep your daily sales from dropping\n\nWant a daily reminder?";
    }
    if (lower.includes('profit') || lower.includes('trend')) {
      return "To check your profit trend:\n1. Go to the Home tab and tap 'Record Sale'\n2. Pick SCAN RECEIPT (use your camera) or VOICE (speak your items)\n3. Log your sales every day — I'll compare your profits and show you which products are selling best.";
    }
    if (lower.includes('esusu') || lower.includes('co-op') || lower.includes('payout')) {
      return "For your Esusu / Co-op:\n- Payouts follow the order your group agreed on\n- Co-op tab → 'Rotation' shows when it's your turn\n- Tip: log your sales every day — the more you sell, the more you may qualify for a credit top-up when you get your payout.";
    }
    if (lower.includes('stock') || lower.includes('reinvest')) {
      return "A simple rule for reinvesting:\n- Put 30 to 50 percent of your weekly profit back into products that sell fast (like grains, oil, tomatoes, drinks)\n- Scan your purchase receipts to log your stock — I'll tell you when it's time to buy more.";
    }
    if (lower.includes('scan') || lower.includes('receipt') || lower.includes('handwritten')) {
      return "You can scan all kinds of receipts:\n• Printed receipts from POS machines and shops\n• Handwritten receipts (exercise book, paper slips, any paper)\n• Mixed printed and handwritten (common in Nigeria!)\n\nHow to use:\n1. Go to Home → Tap 'Record Sale'\n2. Choose the 'SCAN RECEIPT' tab\n3. Take a clear photo (good lighting, flat paper) — the AI will read all items, prices, and totals for you.";
    }
    if (lower.includes('voice') || lower.includes('speak') || lower.includes('record')) {
      return "Use your voice to:\n1. Send money: Go to Home → 'Send Money' → 'Voice' — say \"Send 5000 naira to Chidi at UBA 0123456789\"\n2. Log sales: Go to Home → 'Record Sale' → 'VOICE' — say \"2 bags of rice 35000 each, 10 wraps akara 500 each\"\n\nWorks in English, Pidgin, Hausa, Yoruba, and Igbo.";
    }
    return "How can I help? Try asking:\n• 'How do I increase my credit line?'\n• 'How does the receipt scanner work?'\n• 'Tips for Esusu payouts'\n• 'How to reinvest profit wisely'";
  };

  const handleSend = useCallback(
    async (textToSend?: string) => {
      const text = textToSend || inputText;
      const trimmed = text.trim();
      if (!trimmed || requestInFlight) return;

      const userMsg: Message = {
        id: `u-${Date.now()}`,
        sender: 'user',
        text: trimmed,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const conversationSoFar = [...messages, userMsg];
      setMessages(conversationSoFar);
      if (!textToSend) setInputText('');
      setIsTyping(true);
      setRequestInFlight(true);

      const apiMessages: ChatMessageInput[] = conversationSoFar
        .filter((m) => m.id !== 'm1' || true)
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text,
        }));

      try {
        const userName = profile?.full_name || undefined;
        const resp = await sendAiChatMessage(apiMessages, userName);
        const providerLabel =
          resp.provider === 'groq' ? 'Powered by Groq' : 'Powered by Gemini';
        appendBotMessage(resp.content, providerLabel);
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          'AI chat unavailable';
        const fallback = fallbackResponse(trimmed);
        appendBotMessage(
          `${fallback}\n\n_(Live AI note: ${msg}. Try again when server is reachable.)_`,
          'Offline fallback',
        );
      } finally {
        setIsTyping(false);
        setRequestInFlight(false);
      }
    },
    [appendBotMessage, inputText, messages, profile, requestInFlight],
  );

  const handleVoiceListenToggle = () => {
    if (isListening) {
      setIsListening(false);
      handleSend("How do I increase my credit line?");
    } else {
      Alert.alert(
        t("components.voiceComingSoon"),
        t("components.voiceComingSoonMsg"),
        [{ text: t("components.gotIt") }],
      );
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        style={styles.overlay}
      >
        <View style={styles.cardContainer}>
          <LinearGradient
            colors={[colors.primaryDeep, colors.primaryMid]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.header}
          >
            <View style={styles.headerLeft}>
              <View style={styles.botAvatarBadge}>
                <Icon name="robot" size={24} color={colors.white} />
                <View style={styles.onlineDot} />
              </View>
              <View>
                <Text style={styles.botTitle}>{t('components.botTitle')}</Text>
                <Text style={styles.botSub}>
                  {t('components.botSub', { language })}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
              <Icon name="close" size={20} color={colors.white} />
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.promptsBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promptsContent}>
              {QUICK_PROMPTS.map((p, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.promptChip}
                  onPress={() => handleSend(p.query)}
                  activeOpacity={0.75}
                  disabled={requestInFlight}
                >
                  <Icon name="sparkles" size={12} color={colors.primaryMid} />
                  <Text style={styles.promptText}>{t(p.key)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <ScrollView
            ref={scrollViewRef}
            style={styles.msgScrollView}
            contentContainerStyle={styles.msgContainer}
          >
            {messages.map((m) => {
              const isBot = m.sender === 'bot';
              return (
                <View
                  key={m.id}
                  style={[
                    styles.bubbleWrap,
                    isBot ? styles.bubbleWrapBot : styles.bubbleWrapUser,
                  ]}
                >
                  {isBot && (
                    <View style={styles.botIconSmall}>
                      <Icon name="robot" size={16} color={colors.white} />
                    </View>
                  )}
                  <View
                    style={[
                      styles.bubble,
                      isBot ? styles.bubbleBot : styles.bubbleUser,
                    ]}
                  >
                  {isBot ? (
                    <View style={styles.botMessageContent}>
                      {renderBotMessage(m.text)}
                    </View>
                  ) : (
                    <Text style={[styles.bubbleText, styles.bubbleTextUser]}>
                      {m.text}
                    </Text>
                  )}
                    {m.providerLabel ? (
                      <Text style={[styles.providerBadge, isBot ? styles.providerBadgeBot : styles.providerBadgeUser]}>
                        {m.providerLabel}
                      </Text>
                    ) : null}
                    <Text style={[styles.bubbleTime, isBot ? styles.bubbleTimeBot : styles.bubbleTimeUser]}>
                      {m.time}
                    </Text>
                  </View>
                </View>
              );
            })}

            {isTyping && (
              <View style={[styles.bubbleWrap, styles.bubbleWrapBot]}>
                <View style={styles.botIconSmall}>
                  <Icon name="robot" size={16} color={colors.white} />
                </View>
                <View style={[styles.bubble, styles.bubbleBot, { paddingVertical: 10 }]}>
                  <Text style={{ fontSize: 12, color: colors.textMuted, fontStyle: 'italic' }}>
                    {t('components.kudibotAnalyzing')}
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.footerInputRow}>
            <TouchableOpacity
              onPress={handleVoiceListenToggle}
              activeOpacity={0.8}
              disabled={requestInFlight}
            >
              <Animated.View
                style={[
                  styles.micBtn,
                  isListening && styles.micBtnActive,
                  requestInFlight && { opacity: 0.5 },
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <Icon name={isListening ? 'checkmark' : 'mic'} size={20} color={colors.white} />
              </Animated.View>
            </TouchableOpacity>

            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder={
                requestInFlight
                  ? t("components.kudibotTyping")
                  : isListening
                  ? t("components.listening")
                  : t("components.askKudibot")
              }
              placeholderTextColor={colors.textMuted}
              onSubmitEditing={() => handleSend()}
              editable={!requestInFlight}
            />

            <TouchableOpacity
              style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
              onPress={() => handleSend()}
              disabled={!inputText.trim() || requestInFlight}
              activeOpacity={0.8}
            >
              <Icon name="send" size={18} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  cardContainer: {
    height: '86%',
    backgroundColor: colors.grayBG,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  botAvatarBadge: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)',
  },
  onlineDot: {
    position: 'absolute', top: 2, right: 2,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: colors.successGreen, borderWidth: 2, borderColor: colors.white,
  },
  botTitle: { fontSize: typography.sizes.body, fontWeight: '800', color: colors.white },
  botSub: { fontSize: 10, color: 'rgba(255,255,255,0.8)' },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },

  promptsBar: {
    backgroundColor: colors.white, paddingVertical: spacing.xs,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  promptsContent: { paddingHorizontal: spacing.md, gap: 8 },
  promptChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#F3EBFB', paddingHorizontal: spacing.md, paddingVertical: 6,
    borderRadius: radius.pill, borderWidth: 1, borderColor: '#E9D5FF',
  },
  promptText: { fontSize: 11, fontWeight: '700', color: colors.primaryDeep },

  msgScrollView: { flex: 1 },
  msgContainer: { padding: spacing.lg, gap: spacing.md },
  bubbleWrap: { flexDirection: 'row', gap: 8, maxWidth: '87%' },
  bubbleWrapBot: { alignSelf: 'flex-start' },
  bubbleWrapUser: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  botIconSmall: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.primaryMid, alignItems: 'center',
    justifyContent: 'center', marginTop: 4,
  },
  bubble: { padding: spacing.md, borderRadius: radius.xl },
  bubbleBot: { backgroundColor: colors.white, borderTopLeftRadius: 4, ...shadows.card },
  bubbleUser: { backgroundColor: colors.primaryDeep, borderTopRightRadius: 4 },
  bubbleText: { fontSize: typography.sizes.body, lineHeight: 21 },
  bubbleTextBot: { color: colors.textDark, fontWeight: '500' },
  bubbleTextUser: { color: colors.white, fontWeight: '600' },
  providerBadge: {
    fontSize: 9, marginTop: 6,
    alignSelf: 'flex-end', paddingHorizontal: 6, paddingVertical: 1,
    borderRadius: 10, overflow: 'hidden', fontWeight: '700',
  },
  providerBadgeBot: { backgroundColor: '#F3EBFB', color: colors.primaryDeep },
  providerBadgeUser: { backgroundColor: 'rgba(255,255,255,0.2)', color: '#E9D5FF' },
  bubbleTime: { fontSize: 9, marginTop: 4, textAlign: 'right' },
  bubbleTimeBot: { color: colors.textMuted },
  bubbleTimeUser: { color: 'rgba(255,255,255,0.7)' },

  footerInputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.white, paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  micBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: colors.primaryDeep, alignItems: 'center', justifyContent: 'center',
  },
  micBtnActive: { backgroundColor: colors.warningOrange },
  textInput: {
    flex: 1, height: 42, backgroundColor: colors.grayBG,
    borderRadius: radius.pill, paddingHorizontal: spacing.md,
    fontSize: typography.sizes.body, color: colors.textDark,
    borderWidth: 1, borderColor: colors.border,
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: colors.primaryMid, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.5 },
  botBlock: {
    marginBottom: 8,
    fontSize: typography.sizes.body,
    lineHeight: 21,
    color: colors.textDark,
    fontWeight: '500',
  },
  botListBlock: { paddingLeft: 16, marginBottom: 4 },
  botListItem: { flexDirection: 'row', marginBottom: 2 },
  botListNumber: { width: 20, fontWeight: '700', color: colors.primaryMid },
  botListItemText: {
    flex: 1,
    fontSize: typography.sizes.body,
    lineHeight: 21,
    color: colors.textDark,
    fontWeight: '500',
  },
  botMessageContent: { flexShrink: 1 },
  botBold: { fontWeight: '700' },
  botItalic: { fontStyle: 'italic' },
  botCode: { fontFamily: 'monospace', backgroundColor: '#F1F5F9', paddingHorizontal: 4, borderRadius: 4 },
  botTable: {
    borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8,
    overflow: 'hidden', marginBottom: 8, backgroundColor: colors.white,
  },
  botTableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  botTableRowHeader: { backgroundColor: '#F3EBFB' },
  botTableCell: {
    flex: 1, paddingHorizontal: 8, paddingVertical: 6,
    fontSize: 12, lineHeight: 16, color: colors.textDark, fontWeight: '400',
  },
  botTableCellHeader: { fontWeight: '700', color: colors.primaryDeep },
});
