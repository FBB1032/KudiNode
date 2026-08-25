import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Dimensions,
  TouchableOpacity, StatusBar, Animated, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, typography, shadows } from '../theme/theme';
import { KudiNodeLogo } from '../components/KudiNodeLogo';
import { Icon } from '../components/Icon';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const SLIDES = [
  {
    id: 1,
    image: require('../../assets/images/slide_voice_intake.jpg'),
    badge: 'VOICE-FIRST INTAKE',
    badgeColor: colors.successGreen,
    title: 'Speak Daily Sales Instantly',
    subtitle: 'Voice intake in Hausa, Yoruba, Igbo, Pidgin & English. AI parses items & prices automatically.',
  },
  {
    id: 2,
    image: require('../../assets/images/slide_kudibot_ai.jpg'),
    badge: 'KUDIBOT AI ADVISOR',
    badgeColor: colors.warningOrange,
    title: '24/7 AI Trade Advisor',
    subtitle: 'Ask KudiBot about profit margin analysis, stock reinvestments & credit velocity in your language.',
  },
  {
    id: 3,
    image: require('../../assets/images/slide_camera_scanner.jpg'),
    badge: 'SMART RECEIPT SCANNER',
    badgeColor: '#8B5CF6',
    title: 'Snap & Digitize Receipts',
    subtitle: 'Photograph paper ledgers & physical receipts to instantly turn paper notes into digital income.',
  },
  {
    id: 4,
    image: require('../../assets/images/slide_esusu_circle.jpg'),
    badge: 'ESUSU CO-OP CIRCLES',
    badgeColor: '#3B82F6',
    title: 'Automated Group Savings',
    subtitle: 'Participate in rotating esusu savings payouts backed by Wema Bank settlement accounts.',
  },
  {
    id: 5,
    image: require('../../assets/images/slide_micro_credit.jpg'),
    badge: 'INSTANT MICRO-CREDIT',
    badgeColor: colors.successGreen,
    title: 'Pre-Approved Trade Loans',
    subtitle: 'Access micro-loans up to ₦500,000 based on your AI Trust Score & verified sales velocity.',
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
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Floating Header Bar on top of images */}
      <View style={[styles.headerRow, { paddingTop: Math.max(insets.top, 24) + spacing.sm }]}>
        <KudiNodeLogo size="small" variant="light" />
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} activeOpacity={0.75}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Full-Screen ScrollView */}
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
          <View key={slide.id} style={styles.fullSlideCard}>
            {/* Full-Screen Background Image */}
            <Image
              source={slide.image}
              style={styles.fullBgImage}
              resizeMode="cover"
            />

            {/* Immersive Gradient Overlay (Dims top, dark purple bottom for crisp text readability) */}
            <LinearGradient
              colors={['rgba(15, 7, 30, 0.45)', 'rgba(15, 7, 30, 0.25)', 'rgba(15, 7, 30, 0.85)', '#17062E']}
              locations={[0, 0.35, 0.70, 1]}
              style={styles.gradientOverlay}
            />

            {/* Content Container Floating Directly On Image */}
            <View style={styles.contentWrap}>
              {/* Category Badge Pill */}
              <View style={[styles.categoryBadge, { backgroundColor: slide.badgeColor }]}>
                <Text style={styles.categoryBadgeText}>{slide.badge}</Text>
              </View>

              <Text style={styles.slideTitle}>{slide.title}</Text>
              <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 20) + spacing.md }]}>
        {/* Pagination Dots */}
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

        {/* Next / Get Started Button */}
        <TouchableOpacity
          style={[styles.nextBtn, shadows.button]}
          onPress={handleNext}
          activeOpacity={0.88}
        >
          <LinearGradient
            colors={[colors.primaryLight, colors.primaryMid]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextGrad}
          >
            <Text style={styles.nextText}>
              {activeIndex === SLIDES.length - 1 ? 'Get Started' : 'Continue'}
            </Text>
            <Icon name="arrow-forward" size={18} color={colors.white} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#17062E',
  },
  headerRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    zIndex: 30,
  },
  skipBtn: {
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  skipText: {
    fontSize: typography.sizes.tiny,
    color: colors.white,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  slider: {
    flex: 1,
  },
  fullSlideCard: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  fullBgImage: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  contentWrap: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 160,
    alignItems: 'flex-start',
    zIndex: 20,
  },
  categoryBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
    marginBottom: spacing.md,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  categoryBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 0.9,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.white,
    textAlign: 'left',
    marginBottom: spacing.xs,
    letterSpacing: 0.3,
    lineHeight: 34,
  },
  slideSubtitle: {
    fontSize: typography.sizes.body,
    color: 'rgba(255, 255, 255, 0.90)',
    textAlign: 'left',
    lineHeight: 23,
    maxWidth: 320,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
    zIndex: 30,
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
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  dotActive: {
    width: 28,
    backgroundColor: colors.successGreen,
    borderRadius: 4,
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
    paddingVertical: 16,
  },
  nextText: {
    fontSize: typography.sizes.body,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.4,
  },
});
