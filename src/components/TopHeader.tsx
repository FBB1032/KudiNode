/**
 * TopHeader — KudiNode AI
 *
 * Key fix: The greeting header INCLUDES the balance-card slot in its gradient,
 * so nothing "hangs under" the nav. Inner screens use SafeAreaView edges={['top']}
 * so the gradient starts at the very top of the screen (covers status bar).
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius, typography } from '../theme/theme';
import { Icon } from './Icon';
import { Avatar } from './Avatar';
import { useNavigation } from '@react-navigation/native';

interface TopHeaderProps {
  // Greeting mode
  showGreeting?: boolean;
  greetingName?: string;
  verified?: boolean;
  avatarUri?: string;
  onNotificationPress?: () => void;
  // Inner screen mode
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

  if (showGreeting) {
    return (
      <LinearGradient
        colors={[colors.primaryDeep, colors.primaryMid]}
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
              <Avatar size={44} uri={avatarUri} initials="AB" verified={verified} verifiedSize={15} />
            </TouchableOpacity>
            <View style={styles.greetText}>
              <Text style={styles.greetHello}>Good morning,</Text>
              <Text style={styles.greetName}>{greetingName ?? 'Merchant'}</Text>
            </View>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={onNotificationPress ?? (() => navigation.navigate('Notifications'))}
              activeOpacity={0.8}
            >
              <Icon name="bell" size={22} color={colors.white} />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>
          {verified && (
            <View style={styles.verifiedRow}>
              <Icon name="shield-checkmark" size={12} color={colors.successGreen} />
              <Text style={styles.verifiedText}>Tier-1 Verified · KN-783462</Text>
            </View>
          )}
          {/* spacer so balance card has room to overlap */}
          <View style={{ height: spacing.xxxl + spacing.xl }} />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Inner screen header
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
              <Icon name="arrow-back" size={22} color={colors.white} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 44 }} />
          )}
          <View style={styles.titleBlock}>
            {title && <Text style={styles.innerTitle} numberOfLines={1}>{title}</Text>}
            {subtitle && <Text style={styles.innerSubtitle} numberOfLines={1}>{subtitle}</Text>}
          </View>
          {rightSlot ? rightSlot : <View style={{ width: 44 }} />}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  // Greeting
  greetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  avatarBtn: {},
  greetText: { flex: 1 },
  greetHello: { fontSize: typography.sizes.tiny, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  greetName:  { fontSize: typography.sizes.h3, color: colors.white, fontWeight: '800' },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.13)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 10,
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
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignSelf: 'flex-start',
    marginLeft: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
    marginBottom: spacing.sm,
  },
  verifiedText: {
    fontSize: typography.sizes.tiny,
    color: colors.white,
    fontWeight: '600',
  },
  // Inner
  innerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 54,
  },
  titleBlock: { flex: 1, alignItems: 'center' },
  innerTitle: { fontSize: typography.sizes.h4, fontWeight: '800', color: colors.white },
  innerSubtitle: { fontSize: typography.sizes.tiny, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
});
