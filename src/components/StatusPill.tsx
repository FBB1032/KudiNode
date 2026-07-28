import React from 'react';
import { View, Text, StyleSheet, ViewProps } from 'react-native';
import { colors, spacing, radius, typography } from '../theme/theme';
import { Ionicons } from './Icon';

export type StatusPillType = 'paid' | 'pending' | 'verified' | 'active' | 'ai-parsed';

interface StatusPillProps extends ViewProps {
  type: StatusPillType;
  label?: string;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export function StatusPill({
  type,
  label,
  size = 'sm',
  showIcon = true,
  style,
}: StatusPillProps) {
  const config: Record<
    StatusPillType,
    { bg: string; text: string; border: string; icon: string; defaultLabel: string }
  > = {
    paid: {
      bg: 'rgba(31, 168, 76, 0.1)',
      text: colors.successGreen,
      border: 'rgba(31, 168, 76, 0.25)',
      icon: 'checkmark-circle',
      defaultLabel: 'Paid',
    },
    pending: {
      bg: 'rgba(232, 169, 58, 0.12)',
      text: colors.warningOrange,
      border: 'rgba(232, 169, 58, 0.3)',
      icon: 'time-outline',
      defaultLabel: 'Pending',
    },
    verified: {
      bg: 'rgba(31, 168, 76, 0.12)',
      text: colors.successGreen,
      border: 'rgba(31, 168, 76, 0.3)',
      icon: 'shield-checkmark',
      defaultLabel: 'Verified',
    },
    active: {
      bg: 'rgba(31, 168, 76, 0.1)',
      text: colors.successGreen,
      border: 'rgba(31, 168, 76, 0.25)',
      icon: 'checkmark-circle',
      defaultLabel: 'Active',
    },
    'ai-parsed': {
      bg: 'rgba(31, 168, 76, 0.1)',
      text: colors.successGreen,
      border: 'rgba(31, 168, 76, 0.25)',
      icon: 'sparkles',
      defaultLabel: 'AI Parsed',
    },
  };

  const c = config[type];
  const displayLabel = label || c.defaultLabel;

  return (
    <View
      style={[
        styles.pill,
        size === 'sm' && styles.pillSm,
        size === 'md' && styles.pillMd,
        { backgroundColor: c.bg, borderColor: c.border },
        style,
      ]}
    >
      {showIcon && (
        <Ionicons
          name={c.icon as any}
          size={size === 'sm' ? 12 : 14}
          color={c.text}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.text,
          size === 'sm' && styles.textSm,
          size === 'md' && styles.textMd,
          { color: c.text },
        ]}
      >
        {displayLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  pillSm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    gap: 3,
  },
  pillMd: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: 4,
  },
  icon: {
    marginTop: 1,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  textSm: {
    fontSize: typography.sizes.tiny,
  },
  textMd: {
    fontSize: typography.sizes.small,
  },
});
