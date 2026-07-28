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
import { Ionicons } from './Icon';

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
      activeOpacity={0.85}
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
    height: 50,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAE7F0',
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.textDark,
    fontSize: typography.sizes.body,
    fontWeight: '600',
  },
});
