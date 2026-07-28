import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Dimensions,
  TouchableOpacity, StatusBar, Animated, Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, typography, shadows } from '../theme/theme';
import { KudiNodeLogo } from '../components/KudiNodeLogo';
import { Icon } from '../components/Icon';
import { Avatar } from '../components/Avatar';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ── 1. ANIMATED CHARACTER SLIDE 1: VOICE MERCHANT ──
function VoiceMerchantCharacter() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -8, duration: 1200, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={charStyles.container}>
      <Animated.View style={[charStyles.pulseRing, { transform: [{ scale: pulseAnim }] }]} />

      <Animated.View style={[charStyles.speechBubble, { transform: [{ translateY: floatAnim }] }]}>
        <Icon name="mic" size={14} color={colors.successGreen} />
        <Text style={charStyles.speechText}>"I sold 2 bags of rice for ₦23,000"</Text>
      </Animated.View>

      <View style={charStyles.avatarBox}>
        <Avatar size={72} initials="AB" />
        <View style={charStyles.micBadgeCircle}>
          <Icon name="mic" size={16} color={colors.white} />
        </View>
      </View>

      <View style={charStyles.wavesRow}>
        {[12, 24, 38, 24, 12].map((h, i) => (
          <View key={i} style={[charStyles.waveBar, { height: h }]} />
        ))}
      </View>
    </View>
  );
}

// ── 2. ANIMATED ROBOT CHARACTER SLIDE: KUDIBOT AI FINANCIAL ADVISOR ──
function RobotAdvisorCharacter() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.25, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 900, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -10, duration: 1300, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1300, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={charStyles.container}>
      {/* Outer Glowing Pulsing Ring */}
      <Animated.View style={[charStyles.robotPulseRing, { transform: [{ scale: pulseAnim }] }]} />

      {/* Floating AI Speech Bubble Note */}
      <Animated.View style={[charStyles.speechBubble, { top: -20, transform: [{ translateY: floatAnim }] }]}>
        <Icon name="sparkles" size={14} color={colors.warningOrange} />
        <Text style={charStyles.speechText}>"Sannu Amina! Ask me about your trade profit!"</Text>
      </Animated.View>

      {/* Robot Character Badge */}
      <View style={charStyles.robotAvatarBox}>
        <View style={charStyles.robotHeadInner}>
          <Icon name="robot" size={54} color={colors.white} />
        </View>
        <View style={charStyles.aiOnlineDot} />
      </View>

      {/* Language Pills */}
      <View style={charStyles.langPillRow}>
        <Text style={charStyles.langMiniPill}>Hausa</Text>
        <Text style={charStyles.langMiniPill}>Yoruba</Text>
        <Text style={charStyles.langMiniPill}>Igbo</Text>
        <Text style={charStyles.langMiniPill}>Pidgin</Text>
        <Text style={charStyles.langMiniPill}>EN</Text>
      </View>
    </View>
  );
}

// ── 3. ANIMATED CHARACTER SLIDE 3: CAMERA SCANNER ──
function ScannerMerchantCharacter() {
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue: 80, duration: 1400, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(scanAnim, { toValue: 0, duration: 1400, easing: Easing.linear, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={charStyles.container}>
      <View style={charStyles.receiptCard}>
        <View style={charStyles.receiptLine} />
        <View style={[charStyles.receiptLine, { width: '60%' }]} />
        <View style={[charStyles.receiptLine, { width: '80%' }]} />

        <Animated.View
          style={[
            charStyles.laserBeam,
            { transform: [{ translateY: scanAnim }] },
          ]}
        />
      </View>

      <View style={charStyles.cameraBadge}>
        <Icon name="camera" size={24} color={colors.white} />
      </View>
    </View>
  );
}

// ── 4. ANIMATED CHARACTER SLIDE 4: CO-OP ESUSU CIRCLE ──
function EsusuCircleCharacter() {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={charStyles.container}>
      <Animated.View style={[charStyles.orbitCircle, { transform: [{ rotate: spin }] }]}>
        <View style={[charStyles.orbitDot, { top: -12, left: 60 }]}>
          <Avatar size={28} initials="EE" />
        </View>
        <View style={[charStyles.orbitDot, { bottom: -12, left: 60 }]}>
          <Avatar size={28} initials="FU" />
        </View>
        <View style={[charStyles.orbitDot, { left: -12, top: 60 }]}>
          <Avatar size={28} initials="CO" />
        </View>
        <View style={[charStyles.orbitDot, { right: -12, top: 60 }]}>
          <Avatar size={28} initials="TA" />
        </View>
      </Animated.View>

      <View style={charStyles.vaultBadge}>
        <Icon name="people" size={26} color={colors.white} />
        <Text style={charStyles.vaultText}>₦160,000</Text>
      </View>
    </View>
  );
}

// ── 5. REALISTIC ANIMATED CREDIT CARD ──
function CreditLoanCharacter() {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -8, duration: 1200, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={charStyles.container}>
      <Animated.View
        style={[
          charStyles.realCardWrap,
          { transform: [{ translateY: floatAnim }] },
          shadows.cardLg,
        ]}
      >
        <LinearGradient
          colors={['#4A1D7A', '#2D1060', '#1A083B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={charStyles.realCardGrad}
        >
          <View style={charStyles.cardTopRow}>
            <View style={charStyles.cardBankBadge}>
              <Icon name="bank" size={14} color={colors.white} />
              <Text style={charStyles.cardBankText}>Wema Merchant Credit</Text>
            </View>
            <View style={charStyles.wifiIcon}>
              <Icon name="wifi" size={16} color="rgba(255,255,255,0.7)" />
            </View>
          </View>

          <View style={charStyles.emvChip}>
            <View style={charStyles.emvLine} />
            <View style={charStyles.emvLine} />
          </View>

          <Text style={charStyles.cardNumber}>5399  8472  0129  7834</Text>

          <View style={charStyles.cardBottomRow}>
            <View>
              <Text style={charStyles.cardLabel}>CARDHOLDER</Text>
              <Text style={charStyles.cardHolderName}>AMINA BELLO</Text>
            </View>

            <View>
              <Text style={charStyles.cardLabel}>VALID THRU</Text>
              <Text style={charStyles.cardExp}>08/29</Text>
            </View>

            <View style={charStyles.cardNetworkBadge}>
              <View style={charStyles.netCircleRed} />
              <View style={charStyles.netCircleOrange} />
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <View style={charStyles.creditLimitPill}>
        <Icon name="shield-checkmark" size={12} color={colors.successGreen} />
        <Text style={charStyles.creditLimitPillText}>₦150,000 Loan Approved</Text>
      </View>
    </View>
  );
}

const SLIDES = [
  {
    id: 1,
    characterComponent: <VoiceMerchantCharacter />,
    title: 'Voice-First Sales Intake',
    subtitle: 'Speak daily sales in Hausa, Yoruba, Igbo, Pidgin, or English. KudiNode AI parses items & prices automatically.',
  },
  {
    id: 2,
    characterComponent: <RobotAdvisorCharacter />,
    title: 'KudiBot — AI Financial Advisor',
    subtitle: 'Ask KudiBot anything in your language! Get instant credit line advice, sales profit analysis, and stock reinvestment notes.',
  },
  {
    id: 3,
    characterComponent: <ScannerMerchantCharacter />,
    title: 'Camera Receipt Scanner',
    subtitle: 'Snap photo receipts or handwritten paper exercise books with Expo Camera to digitize your inventory instantly.',
  },
  {
    id: 4,
    characterComponent: <EsusuCircleCharacter />,
    title: 'Co-op Esusu Circles',
    subtitle: 'Automate group contributions & rotating payouts with pre-filled bank settlement account transfers.',
  },
  {
    id: 5,
    characterComponent: <CreditLoanCharacter />,
    title: 'Micro-Credit & Loans',
    subtitle: 'Unlock pre-approved trade loans up to ₦500,000 via Wema Bank rails based on your AI Trust Score velocity.',
  },
];

export function OnboardingScreen() {
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
        if (index !== activeIndex && index >= 0 && index < SLIDES.length) {
          setActiveIndex(index);
        }
      },
    }
  );

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: (activeIndex + 1) * SCREEN_WIDTH,
        animated: true,
      });
    } else {
      nav.replace('Login');
    }
  };

  const handleSkip = () => {
    nav.replace('Login');
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDeep} translucent={false} />

      <View style={[styles.headerRow, { paddingTop: Math.max(insets.top, 24) + spacing.md }]}>
        <KudiNodeLogo size="small" variant="light" />
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} activeOpacity={0.7}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.slider}
      >
        {SLIDES.map((slide) => (
          <View key={slide.id} style={styles.slideCard}>
            <View style={styles.illustrationWrap}>
              {slide.characterComponent}
            </View>
            <Text style={styles.slideTitle}>{slide.title}</Text>
            <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 20) + spacing.lg }]}>
        <View style={styles.paginationRow}>
          {SLIDES.map((_, i) => {
            const isCurrent = i === activeIndex;
            return (
              <View
                key={i}
                style={[
                  styles.dot,
                  isCurrent && styles.dotActive,
                ]}
              />
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.nextBtn, shadows.button]}
          onPress={handleNext}
          activeOpacity={0.88}
        >
          <LinearGradient
            colors={[colors.primaryMid, colors.primaryDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextGrad}
          >
            <Text style={styles.nextText}>
              {activeIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <Icon name="arrow-forward" size={18} color={colors.white} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const charStyles = StyleSheet.create({
  container: {
    width: 220,
    height: 170,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(31, 168, 76, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(31, 168, 76, 0.4)',
  },
  robotPulseRing: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(168, 85, 247, 0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(168, 85, 247, 0.5)',
  },
  speechBubble: {
    position: 'absolute',
    top: -15,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    zIndex: 10,
  },
  speechText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primaryDeep,
  },
  avatarBox: {
    position: 'relative',
  },
  robotAvatarBox: {
    position: 'relative',
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.primaryMid,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    elevation: 6,
  },
  robotHeadInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiOnlineDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.successGreen,
    borderWidth: 2,
    borderColor: colors.white,
  },
  langPillRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 10,
  },
  langMiniPill: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.white,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  micBadgeCircle: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.successGreen,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primaryDeep,
  },
  wavesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 12,
  },
  waveBar: {
    width: 4,
    backgroundColor: colors.successGreen,
    borderRadius: 2,
  },

  // Scanner Slide
  receiptCard: {
    width: 120,
    height: 130,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  receiptLine: {
    height: 6,
    backgroundColor: colors.grayBG,
    borderRadius: 3,
  },
  laserBeam: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.warningOrange,
    shadowColor: colors.warningOrange,
    shadowRadius: 4,
    shadowOpacity: 1,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.warningOrange,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Esusu Slide
  orbitCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitDot: {
    position: 'absolute',
  },
  vaultBadge: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryMid,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderWidth: 2,
    borderColor: colors.white,
  },
  vaultText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.white,
  },

  // Real Credit Card Slide Styles
  realCardWrap: {
    width: 210,
    height: 126,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  realCardGrad: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardBankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardBankText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.5,
  },
  wifiIcon: {},
  emvChip: {
    width: 26,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#E8A93A',
    justifyContent: 'space-around',
    paddingVertical: 2,
    paddingHorizontal: 3,
  },
  emvLine: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  cardNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 1.5,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 6,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.5,
  },
  cardHolderName: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.white,
    marginTop: 1,
  },
  cardExp: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.white,
    marginTop: 1,
  },
  cardNetworkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  netCircleRed: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#EB001B',
  },
  netCircleOrange: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FF5F00',
    marginLeft: -6,
    opacity: 0.9,
  },
  creditLimitPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8FFF2',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginTop: spacing.sm,
  },
  creditLimitPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.successGreen,
  },
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.primaryDeep,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  skipBtn: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  skipText: {
    fontSize: typography.sizes.tiny,
    color: colors.white,
    fontWeight: '700',
  },
  slider: {
    flex: 1,
  },
  slideCard: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl * 1.5,
    paddingBottom: spacing.xl,
  },
  illustrationWrap: {
    height: 190,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  slideTitle: {
    fontSize: typography.sizes.h2,
    fontWeight: '800',
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  slideSubtitle: {
    fontSize: typography.sizes.body,
    color: 'rgba(255,255,255,0.82)',
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomBar: {
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.successGreen,
  },
  nextBtn: {
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  nextGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
  },
  nextText: {
    fontSize: typography.sizes.body,
    fontWeight: '800',
    color: colors.white,
  },
});
