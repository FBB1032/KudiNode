import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, radius } from '../theme/theme';
import { useLanguage, Language } from '../context/LanguageContext';

interface LanguageToggleProps {
  compact?: boolean;
}

const LANGUAGE_ORDER: Language[] = ['EN', 'Pidgin', 'Hausa', 'Yoruba', 'Igbo'];

const LABEL_KEYS: Record<Language, string> = {
  EN: 'components.english',
  Pidgin: 'components.pidgin',
  Hausa: 'components.hausa',
  Yoruba: 'components.yoruba',
  Igbo: 'components.igbo',
};

const COMPACT_LABELS: Record<Language, string> = {
  EN: 'EN',
  Pidgin: 'PDG',
  Hausa: 'HA',
  Yoruba: 'YO',
  Igbo: 'IG',
};

export function LanguageToggle({ compact = true }: LanguageToggleProps) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {LANGUAGE_ORDER.map((lang) => (
        <TouchableOpacity
          key={lang}
          style={[
            styles.segment,
            compact && styles.segmentCompact,
            language === lang && styles.activeSegment,
          ]}
          onPress={() => setLanguage(lang)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.text,
              compact && styles.textCompact,
              language === lang ? styles.activeText : styles.inactiveText,
            ]}
          >
            {compact ? COMPACT_LABELS[lang] : t(LABEL_KEYS[lang])}
          </Text>
        </TouchableOpacity>
      ))}
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
    flexWrap: 'wrap',
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