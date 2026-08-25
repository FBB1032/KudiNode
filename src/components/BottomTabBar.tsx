import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors, spacing, radius, typography, shadows } from '../theme/theme';
import { Icon } from './Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TabName = 'Home' | 'CoopEsusu' | 'LogSales' | 'WemaCredit' | 'Profile';

const TAB_CONFIG: Record<TabName, { icon: any; label: string; center?: boolean }> = {
  Home:       { icon: 'home',        label: 'Home' },
  CoopEsusu:  { icon: 'people',      label: 'Co-op' },
  LogSales:   { icon: 'mic',         label: 'Log Sales', center: true },
  WemaCredit: { icon: 'stats-chart', label: 'Credit' },
  Profile:    { icon: 'person',      label: 'Profile' },
};

export function BottomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={styles.tabContainer}>
        {state.routes.map((route, index) => {
          const tabKey = route.name as TabName;
          const config = TAB_CONFIG[tabKey] ?? TAB_CONFIG.Home;
          const focused = state.index === index;
          const { options } = descriptors[route.key];

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          if (config.center) {
            const handleCenterPress = () => {
              (navigation as any).navigate('SalesIntake', { initialMode: 'VOICE' });
            };

            return (
              <View key={route.key} style={styles.centerSlot}>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityState={focused ? { selected: true } : {}}
                  onPress={handleCenterPress}
                  activeOpacity={0.88}
                  style={styles.centerBtn}
                >
                  <View style={[styles.centerBubble, focused && styles.centerBubbleFocused, shadows.glow]}>
                    <Icon name="mic" size={26} color={colors.white} />
                  </View>
                </TouchableOpacity>
                <Text style={[styles.centerLabel, focused && styles.labelActive]}>
                  {config.label}
                </Text>
              </View>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              activeOpacity={0.75}
              style={styles.tab}
            >
              {focused && <View style={styles.activeBar} />}

              <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
                <Icon
                  name={config.icon}
                  size={20}
                  color={focused ? colors.primaryDeep : colors.textMuted}
                />
              </View>
              <Text style={[styles.label, focused && styles.labelActive]}>
                {config.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 56,
    paddingHorizontal: spacing.xs,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: 2,
    position: 'relative',
  },
  activeBar: {
    position: 'absolute',
    top: 0,
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.primaryDeep,
  },
  iconWrap: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  iconWrapActive: {
    backgroundColor: 'rgba(59, 21, 102, 0.08)',
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 0.1,
  },
  labelActive: {
    color: colors.primaryDeep,
    fontWeight: '800',
  },
  centerSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: spacing.xs,
  },
  centerBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  centerBubble: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.successGreen,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    marginTop: -26,
  },
  centerBubbleFocused: {
    backgroundColor: colors.primaryDeep,
  },
  centerLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 0.1,
  },
});
