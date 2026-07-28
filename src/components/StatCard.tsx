import React from 'react';
import { View, Text, StyleSheet, ViewProps } from 'react-native';
import { colors, spacing, radius, typography, shadows } from '../theme/theme';

export type StatCardVariant = 'default' | 'profit' | 'cash';

interface StatCardProps extends ViewProps {
  label: string;
  value: string;
  subtext?: string;
  subtextColor?: 'green' | 'gray' | 'orange';
  variant?: StatCardVariant;
  icon?: React.ReactNode;
}

export function StatCard({
  label,
  value,
  subtext,
  subtextColor = 'gray',
  variant = 'default',
  icon,
  style,
}: StatCardProps) {
  return (
    <View style={[styles.card, shadows.card, style]}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{label}</Text>
        {icon}
      </View>
      <Text style={styles.value}>{value}</Text>
      {subtext && (
        <View style={styles.subtextRow}>
          <Text
            style={[
              styles.subtext,
              subtextColor === 'green' && styles.subtextGreen,
              subtextColor === 'orange' && styles.subtextOrange,
              subtextColor === 'gray' && styles.subtextGray,
            ]}
          >
            {subtext}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    color: colors.textMuted,
    fontSize: typography.sizes.tiny,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  value: {
    color: colors.textDark,
    fontSize: typography.sizes.amount,
    fontWeight: '800',
    marginTop: spacing.xs,
    includeFontPadding: false,
  },
  subtextRow: {
    marginTop: 4,
  },
  subtext: {
    fontSize: typography.sizes.tiny,
    fontWeight: '600',
  },
  subtextGreen: { color: colors.successGreen },
  subtextOrange: { color: colors.warningOrange },
  subtextGray: { color: colors.textMuted, fontWeight: '500' },
});
