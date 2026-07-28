import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, radius } from '../theme/theme';
import { useLanguage } from '../context/LanguageContext';
import { Ionicons } from './Icon';

interface LanguageToggleProps {
  compact?: boolean;
}

export function LanguageToggle({ compact = true }: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage();

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <TouchableOpacity
        style={[
          styles.segment,
          compact && styles.segmentCompact,
          language === 'EN' && styles.activeSegment,
        ]}
        onPress={() => setLanguage('EN')}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.text,
            compact && styles.textCompact,
            language === 'EN' ? styles.activeText : styles.inactiveText,
          ]}
        >
          EN
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.segment,
          compact && styles.segmentCompact,
          language === 'Pidgin' && styles.activeSegment,
        ]}
        onPress={() => setLanguage('Pidgin')}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.text,
            compact && styles.textCompact,
            language === 'Pidgin' ? styles.activeText : styles.inactiveText,
          ]}
        >
          {compact ? 'PDG' : 'Pidgin'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    padding: 3,
    opacity: 0.95,
  },
  containerCompact: {
    padding: 2,
  },
  segment: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 42,
  },
  segmentCompact: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    minWidth: 36,
  },
  activeSegment: {
    backgroundColor: colors.primaryDeep,
  },
  text: {
    fontSize: typography.sizes.small,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  textCompact: {
    fontSize: typography.sizes.tiny,
  },
  activeText: {
    color: colors.white,
  },
  inactiveText: {
    color: colors.primaryDeep,
  },
});
