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

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm1',
    sender: 'bot',
    text:
      "Sannu / E kaaro / Ututu Oma! I am KudiBot, your AI Financial Advisor. I analyze your daily market sales, Wema settlement account, and Trust Score velocity to give you instant business advice. Ask me anything — credit, profit, Esusu, stock, receipt scanning, or voice commands.",
    time: 'Just now',
  },
];

const QUICK_PROMPTS = [
  { key: 'components.prompt1', query: 'How do I increase my Wema credit line?' },
  { key: 'components.prompt2', query: 'Analyse my daily sales profit trend' },
  { key: 'components.prompt3', query: 'When is my next Co-op Esusu payout?' },
  { key: 'components.prompt4', query: 'How much should I reinvest in stock?' },
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
      return "📈 To upgrade your Wema Credit Line:\n1. 🧾 Record voice or receipt sales for 14 consecutive days\n2. 👥 Complete monthly Co-op Esusu contribution on time\n3. ✅ Keep zero defaults on micro-credit repayments\n4. ⬆️ Maintain or grow daily sales volume\n\nAsk me to remind you each morning!";
    }
    if (lower.includes('profit') || lower.includes('trend')) {
      return "💰 To analyze profit trend:\n1. Open 'Sales Intake' from the Home tab\n2. Choose SCAN RECEIPT (camera) or VOICE (speak items)\n3. Log all sales daily — KudiBot then compares day-over-day % change and suggests top-performing SKUs.";
    }
    if (lower.includes('esusu') || lower.includes('co-op') || lower.includes('payout')) {
      return "👥 For your Esusu / Co-op:\n- Payouts follow the rotation schedule your association set\n- Check the Co-op tab → 'Rotation' to see your position\n- Tip: keep recording daily sales — higher velocity = earlier eligibility for Wema credit top-up on payout month.";
    }
    if (lower.includes('stock') || lower.includes('reinvest')) {
      return "🛒 Reinvestment rule of thumb:\n- Reinvest 30-50% of weekly profit into fast-moving stock (grains, oil, tomatoes, beverages)\n- Use SCAN RECEIPT after each purchase to log stock — KudiBot will flag when items are due for restock.";
    }
    if (lower.includes('scan') || lower.includes('receipt') || lower.includes('handwritten')) {
      return "📄 Yes! Receipt scanner now handles:\n• Printed POS / supermarket receipts\n• ✏️ Handwritten receipts (exercise book, paper slips, tissue)\n• Mixed printed + handwritten (very common in Nigeria!)\n\nHow to use:\n1. Go to Home → Tap 'Record Sale'\n2. Select 'SCAN RECEIPT' tab\n3. Take a clear photo (good lighting, flat paper) → AI extracts all items, qty, price, total";
    }
    if (lower.includes('voice') || lower.includes('speak') || lower.includes('record')) {
      return "🗣️ Voice commands available:\n1. TRANSFER: Home → 'Send Money' → 'Voice' — say \"Send 5000 naira to Chidi at UBA 0123456789\"\n2. SALES LOG: Home → 'Record Sale' → 'VOICE' — say \"2 bags of rice 35000 each, 10 wraps akara 500 each\"\n\nBoth support English, Pidgin, Hausa, Yoruba and Igbo";
    }
    return "💡 How can I help today? Try:\n• 'How do I increase my credit line?'\n• 'How does the receipt scanner work?'\n• 'Tell me tips for Esusu payouts'\n• 'How to reinvest profit wisely'";
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
      handleSend("How do I increase my Wema credit limit?");
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
                    <Text style={[styles.bubbleText, isBot ? styles.bubbleTextBot : styles.bubbleTextUser]}>
                      {m.text}
                    </Text>
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
});
