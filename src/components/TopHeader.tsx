import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius, typography } from '../theme/theme';
import { useLanguage } from '../context/LanguageContext';
import { Icon } from './Icon';
import { Avatar } from './Avatar';
import { useNavigation } from '@react-navigation/native';

interface TopHeaderProps {
  showGreeting?: boolean;
  greetingName?: string;
  verified?: boolean;
  avatarUri?: string;
  onNotificationPress?: () => void;
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  rightSlot?: React.ReactNode;
}

export function TopHeader({
  showGreeting,
  greetingName,
  verified,
  avatarUri,
  onNotificationPress,
  title,
  subtitle,
  showBack,
  rightSlot,
}: TopHeaderProps) {
  const navigation = useNavigation<any>();
  const { t } = useLanguage();

  if (showGreeting) {
    return (
      <LinearGradient
        colors={[colors.primaryDeep, colors.primaryMid, '#2A0B4D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <StatusBar barStyle="light-content" backgroundColor={colors.primaryDeep} translucent={false} />
        <SafeAreaView edges={['top', 'left', 'right']}>
          <View style={styles.greetRow}>
            <TouchableOpacity
              style={styles.avatarBtn}
              onPress={() => navigation.navigate('Profile')}
              activeOpacity={0.85}
            >
              <Avatar size={46} uri={avatarUri} initials="AB" verified={verified} verifiedSize={16} />
            </TouchableOpacity>
            <View style={styles.greetText}>
              <Text style={styles.greetHello}>{t('components.goodMorning')}</Text>
              <Text style={styles.greetName}>{greetingName ?? t('components.merchant')}</Text>
            </View>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={onNotificationPress ?? (() => navigation.navigate('Notifications'))}
              activeOpacity={0.8}
            >
              <Icon name="bell" size={20} color={colors.white} />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>
          {verified && (
            <View style={styles.verifiedRow}>
              <Icon name="shield-checkmark" size={12} color={colors.successGreen} />
              <Text style={styles.verifiedText}>{t('components.tier1Verified')}</Text>
            </View>
          )}
          <View style={{ height: spacing.xxxl + spacing.xl }} />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[colors.primaryDeep, colors.primaryMid]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDeep} translucent={false} />
      <SafeAreaView edges={['top', 'left', 'right']}>
        <View style={styles.innerRow}>
          {showBack ? (
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
              <Icon name="arrow-back" size={20} color={colors.white} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 42 }} />
          )}
          <View style={styles.titleBlock}>
            {title && <Text style={styles.innerTitle} numberOfLines={1}>{title}</Text>}
            {subtitle && <Text style={styles.innerSubtitle} numberOfLines={1}>{subtitle}</Text>}
          </View>
          {rightSlot ? rightSlot : <View style={{ width: 42 }} />}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  greetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.md,
  },
  avatarBtn: {},
  greetText: { flex: 1 },
  greetHello: { fontSize: typography.sizes.tiny, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
  greetName: { fontSize: typography.sizes.h3, color: colors.white, fontWeight: '800' },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.warningOrange,
    borderWidth: 1.5,
    borderColor: colors.primaryDeep,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignSelf: 'flex-start',
    marginLeft: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  verifiedText: {
    fontSize: typography.sizes.tiny,
    color: colors.white,
    fontWeight: '700',
  },
  innerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 56,
  },
  titleBlock: { flex: 1, alignItems: 'center' },
  innerTitle: { fontSize: typography.sizes.h4, fontWeight: '800', color: colors.white },
  innerSubtitle: { fontSize: typography.sizes.tiny, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
});
