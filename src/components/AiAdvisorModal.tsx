import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView,
  TextInput, KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { colors, spacing, radius, typography, shadows } from '../theme/theme';
import { Icon } from './Icon';
import { useLanguage } from '../context/LanguageContext';
import { LinearGradient } from 'expo-linear-gradient';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  chipTag?: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm1',
    sender: 'bot',
    text: "Sannu / E kaaro / Ututu Oma! I am KudiBot, your AI Financial Advisor. I analyze your daily market sales, Wema settlement account, and Trust Score velocity to give you instant business advice.",
    time: 'Just now',
  },
  {
    id: 'm2',
    sender: 'bot',
    text: "💡 Quick Financial Snapshot for Amina Bello:\n• Monthly Sales: ₦1,250,000\n• Wema Credit Line: ₦150,000 (Pre-Approved)\n• AI Trust Score: 91 / 100 (Excellent)\n\nHow can I assist your market trade today?",
    time: 'Just now',
    chipTag: 'Snapshot',
  },
];

const QUICK_PROMPTS = [
  'How do I increase my Wema credit line?',
  'Analyse my daily sales profit trend',
  'When is my next Co-op Esusu payout?',
  'How much should I reinvest in stock?',
];

export function AiAdvisorModal({ visible, onClose }: Props) {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    if (isListening) {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 400, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: 400, useNativeDriver: true }),
        ])
      );
      loop.start();
    } else {
      pulseAnim.setValue(1);
    }
    return () => loop?.stop();
  }, [isListening, pulseAnim]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    // Generate intelligent AI response based on query
    setTimeout(() => {
      let botAnswer = "Based on your 91 Trust Score and ₦1.2M sales volume, keeping your Wema settlement account active guarantees automatic credit upgrades.";

      const lower = text.toLowerCase();
      if (lower.includes('credit') || lower.includes('increase')) {
        botAnswer = "📈 To upgrade your Wema Credit Line from ₦150,000 to ₦500,000:\n1. Record voice/receipt sales for 14 consecutive days.\n2. Complete July Co-op Esusu contribution on time.\n3. Maintain zero defaults on micro-credit repayments.";
      } else if (lower.includes('profit') || lower.includes('trend')) {
        botAnswer = "💰 Your profit margin is up +14.2% compared to last week! Top selling category: Rice & Cooking Oil. Reinvesting 30% into stock will maximize weekend profit.";
      } else if (lower.includes('esusu') || lower.includes('co-op') || lower.includes('payout')) {
        botAnswer = "👥 Your next Co-op Esusu payout of ₦160,000 is scheduled for August 15th! You are currently #2 in rotation sequence for Alaba Market Assoc.";
      } else if (lower.includes('stock') || lower.includes('reinvest')) {
        botAnswer = "🛒 Recommended Stock Reinvestment: ₦85,000 into Grains (Rice & Beans) before price increase next Monday.";
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botAnswer,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1000);
  };

  const handleVoiceListenToggle = () => {
    if (isListening) {
      setIsListening(false);
      handleSend("How do I increase my Wema credit limit?");
    } else {
      setIsListening(true);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        style={styles.overlay}
      >
        <View style={styles.cardContainer}>
          {/* Header */}
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
                <Text style={styles.botTitle}>KudiBot AI Advisor</Text>
                <Text style={styles.botSub}>Financial & Market Trade Intelligence ({language})</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
              <Icon name="close" size={20} color={colors.white} />
            </TouchableOpacity>
          </LinearGradient>

          {/* Quick Prompts Horizontal Bar */}
          <View style={styles.promptsBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promptsContent}>
              {QUICK_PROMPTS.map((p, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.promptChip}
                  onPress={() => handleSend(p)}
                  activeOpacity={0.75}
                >
                  <Icon name="sparkles" size={12} color={colors.primaryMid} />
                  <Text style={styles.promptText}>{p}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Chat Messages Log */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.msgScrollView}
            contentContainerStyle={styles.msgContainer}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map(m => {
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
                    KudiBot is analyzing market trends...
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer Input Controls */}
          <View style={styles.footerInputRow}>
            {/* Mic Voice Dictation Button */}
            <TouchableOpacity onPress={handleVoiceListenToggle} activeOpacity={0.8}>
              <Animated.View
                style={[
                  styles.micBtn,
                  isListening && styles.micBtnActive,
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
              placeholder={isListening ? "Listening... Speak financial query" : "Ask KudiBot financial advice..."}
              placeholderTextColor={colors.textMuted}
              onSubmitEditing={() => handleSend()}
            />

            <TouchableOpacity
              style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
              onPress={() => handleSend()}
              disabled={!inputText.trim()}
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
    height: '82%',
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
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },

  promptsBar: { backgroundColor: colors.white, paddingVertical: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.border },
  promptsContent: { paddingHorizontal: spacing.md, gap: 8 },
  promptChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#F3EBFB', paddingHorizontal: spacing.md, paddingVertical: 6,
    borderRadius: radius.pill, borderWidth: 1, borderColor: '#E9D5FF',
  },
  promptText: { fontSize: 11, fontWeight: '700', color: colors.primaryDeep },

  msgScrollView: { flex: 1 },
  msgContainer: { padding: spacing.lg, gap: spacing.md },
  bubbleWrap: { flexDirection: 'row', gap: 8, maxWidth: '85%' },
  bubbleWrapBot: { alignSelf: 'flex-start' },
  bubbleWrapUser: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  botIconSmall: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primaryMid, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  bubble: { padding: spacing.md, borderRadius: radius.xl },
  bubbleBot: { backgroundColor: colors.white, borderTopLeftRadius: 4, ...shadows.card },
  bubbleUser: { backgroundColor: colors.primaryDeep, borderTopRightRadius: 4 },
  bubbleText: { fontSize: typography.sizes.body, lineHeight: 20 },
  bubbleTextBot: { color: colors.textDark, fontWeight: '500' },
  bubbleTextUser: { color: colors.white, fontWeight: '600' },
  bubbleTime: { fontSize: 9, marginTop: 4, textAlign: 'right' },
  bubbleTimeBot: { color: colors.textMuted },
  bubbleTimeUser: { color: 'rgba(255,255,255,0.7)' },

  footerInputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.white, paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  micBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primaryDeep, alignItems: 'center', justifyContent: 'center' },
  micBtnActive: { backgroundColor: colors.warningOrange },
  textInput: {
    flex: 1, height: 42, backgroundColor: colors.grayBG,
    borderRadius: radius.pill, paddingHorizontal: spacing.md,
    fontSize: typography.sizes.body, color: colors.textDark,
    borderWidth: 1, borderColor: colors.border,
  },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primaryMid, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.5 },
});
