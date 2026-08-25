import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';
import { colors, spacing, radius, typography } from '../theme/theme';

interface SecondaryButtonProps extends TouchableOpacityProps {
  title: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function SecondaryButton({
  title,
  icon,
  disabled = false,
  fullWidth = true,
  style,
  ...rest
}: SecondaryButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      disabled={disabled}
      activeOpacity={0.82}
      {...rest}
    >
      <View style={styles.content}>
        {icon && <View style={styles.iconLeft}>{icon}</View>}
        <Text style={styles.text}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fullWidth: {
    width: '100%',
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
    color: colors.primaryDeep,
    fontSize: typography.sizes.body,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
