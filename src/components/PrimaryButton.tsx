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
import { colors, spacing, radius, typography, shadows } from '../theme/theme';
import { Ionicons } from './Icon';

interface PrimaryButtonProps extends TouchableOpacityProps {
  title: string;
  icon?: React.ReactNode;
  showArrow?: boolean;
  loading?: boolean;
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
  disabled = false,
  variant = 'purple',
  fullWidth = true,
  style,
  ...rest
}: PrimaryButtonProps) {
  const isGreen = variant === 'green';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        fullWidth && styles.fullWidth,
        isGreen ? styles.greenBg : styles.purpleBg,
        (disabled || loading) && styles.disabled,
        shadows.button,
        style,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.85}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} size="small" />
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
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 54,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  purpleBg: {
    backgroundColor: colors.primaryDeep,
  },
  greenBg: {
    backgroundColor: colors.successGreen,
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
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  arrow: {
    marginLeft: spacing.sm,
  },
});
