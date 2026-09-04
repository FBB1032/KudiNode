import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, typography, shadows } from '../theme/theme';
import { Ionicons } from './Icon';
import { useReduceMotion } from '../hooks/useReduceMotion';
import { useLanguage } from '../context/LanguageContext';

interface PrimaryButtonProps extends TouchableOpacityProps {
  title: string;
  icon?: React.ReactNode;
  showArrow?: boolean;
  loading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  variant?: 'purple' | 'green';
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function PrimaryButton({
  title,
  icon,
  showArrow = false,
  loading = false,
  loadingText,
  disabled = false,
  variant = 'purple',
  fullWidth = true,
  style,
  ...rest
}: PrimaryButtonProps) {
  const reduceMotion = useReduceMotion();
  const { t } = useLanguage();
  const isGreen = variant === 'green';
  const gradColors: [string, string] = isGreen
    ? ['#10B981', '#059669']
    : [colors.primaryLight, colors.primaryDeep];

  return (
    <TouchableOpacity
      style={[
        styles.buttonWrapper,
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        shadows.button,
        style,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.88}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      {...rest}
    >
      <LinearGradient
        colors={gradColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {loading ? (
          <View style={styles.content}>
            {reduceMotion ? null : (
              <ActivityIndicator color={colors.white} size="small" />
            )}
            <Text
              style={[styles.text, styles.loadingText]}
              accessibilityLiveRegion="polite"
            >
              {loadingText || t('common.loading')}
            </Text>
          </View>
        ) : (
          <View style={styles.content}>
            {icon && <View style={styles.iconLeft}>{icon}</View>}
            <Text style={styles.text}>{title}</Text>
            {showArrow && (
              <Ionicons
                name="arrow-forward"
                size={18}
                color={colors.white}
                style={styles.arrow}
              />
            )}
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonWrapper: {
    height: 52,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  fullWidth: {
    width: '100%',
  },
  gradient: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  text: {
    color: colors.white,
    fontSize: typography.sizes.body,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  arrow: {
    marginLeft: spacing.sm,
  },
  loadingText: {
    marginLeft: spacing.sm,
  },
});
