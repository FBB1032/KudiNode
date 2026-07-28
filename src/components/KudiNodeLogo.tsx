import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, radius } from '../theme/theme';

interface KudiNodeLogoProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'light' | 'dark';
  showSub?: boolean;
}

export function KudiNodeLogo({ size = 'medium', variant = 'dark', showSub = true }: KudiNodeLogoProps) {
  const isSmall = size === 'small';
  const isLarge = size === 'large';

  const badgeSize = isSmall ? 36 : isLarge ? 56 : 44;
  const fontSize = isSmall ? 17 : isLarge ? 28 : 22;
  const kSize = isSmall ? 18 : isLarge ? 30 : 23;
  const dotSize = isSmall ? 6 : isLarge ? 10 : 8;

  const isLight = variant === 'light';

  return (
    <View style={styles.container}>
      {/* Isometric Hexagonal Node Badge */}
      <View style={[styles.badgeWrap, { width: badgeSize, height: badgeSize }]}>
        <LinearGradient
          colors={['#7E22CE', '#581C87']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.badgeGrad, { borderRadius: badgeSize * 0.3 }]}
        >
          <Text style={[styles.kText, { fontSize: kSize }]}>K</Text>
        </LinearGradient>

        {/* 3 Green Node Dots */}
        <View style={[styles.nodeDot, { top: -2, right: -2, width: dotSize, height: dotSize, borderRadius: dotSize / 2 }]} />
        <View style={[styles.nodeDot, { bottom: 4, right: -4, width: dotSize, height: dotSize, borderRadius: dotSize / 2 }]} />
        <View style={[styles.nodeDot, { bottom: -2, left: -2, width: dotSize, height: dotSize, borderRadius: dotSize / 2 }]} />
      </View>

      {/* Brand Name Typography */}
      <View style={styles.textWrap}>
        <Text style={[styles.brandText, { fontSize }]}>
          <Text style={{ color: isLight ? '#E9D5FF' : '#7E22CE' }}>Kudi</Text>
          <Text style={{ color: '#10B981' }}>Node </Text>
          <Text style={{ color: '#10B981' }}>AI</Text>
        </Text>
        {showSub && (
          <Text style={[styles.subText, { color: isLight ? 'rgba(255,255,255,0.7)' : colors.textMuted }]}>
            SMART MERCHANT NETWORK
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badgeWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeGrad: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    elevation: 3,
    shadowColor: '#7E22CE',
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  kText: {
    fontWeight: '900',
    color: colors.white,
    letterSpacing: -0.5,
  },
  nodeDot: {
    position: 'absolute',
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: colors.white,
    zIndex: 10,
  },
  textWrap: {
    justifyContent: 'center',
  },
  brandText: {
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginTop: -2,
  },
});
