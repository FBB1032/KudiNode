import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing } from '../theme/theme';
import { KudiNodeLogo } from '../components/KudiNodeLogo';
import { useLanguage } from '../context/LanguageContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function SplashScreen() {
  const { t } = useLanguage();
  const nav = useNavigation<Nav>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 1300, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 1300, useNativeDriver: true }),
      ])
    ).start();

    const timer = setTimeout(() => {
      nav.replace('Onboarding');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDeep} translucent={false} />
      <LinearGradient
        colors={['#1E0A38', colors.primaryDeep, colors.primaryMid, '#120524']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Animated.View style={[styles.glowOrb, { transform: [{ scale: pulseAnim }] }]} />

        {/* Unboxed Logo + App Name + Motto */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <KudiNodeLogo size="large" variant="light" showSub={true} />

          <Text style={styles.mottoText}>
            {t('splash.motto')}
          </Text>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  glowOrb: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(16, 185, 129, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.20)',
  },
  logoContainer: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  mottoText: {
    fontSize: typography.sizes.body,
    color: 'rgba(255, 255, 255, 0.90)',
    textAlign: 'center',
    fontWeight: '600',
    maxWidth: 290,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
});
