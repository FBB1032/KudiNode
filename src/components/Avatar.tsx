import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { colors, spacing, radius, typography } from '../theme/theme';
import { Ionicons } from './Icon';

interface AvatarProps {
  size?: number;
  uri?: string;
  initials?: string;
  verified?: boolean;
  verifiedSize?: number;
  onPress?: () => void;
}

export function Avatar({
  size = 44,
  uri,
  initials = 'AB',
  verified = false,
  verifiedSize = 16,
  onPress,
}: AvatarProps) {
  const content = (
    <>
      {uri ? (
        <Image
          source={{ uri }}
          style={[
            styles.image,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        />
      ) : (
        <View
          style={[
            styles.fallback,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        >
          <Text style={[styles.initials, { fontSize: size * 0.36 }]}>
            {initials}
          </Text>
        </View>
      )}
      {verified && (
        <View
          style={[
            styles.verifiedBadge,
            {
              width: verifiedSize,
              height: verifiedSize,
              borderRadius: verifiedSize / 2,
              right: -1,
              bottom: -1,
            },
          ]}
        >
          <Ionicons
            name="checkmark"
            size={verifiedSize * 0.65}
            color={colors.white}
          />
        </View>
      )}
    </>
  );

  const wrapperStyle = { width: size, height: size, position: 'relative' as const };

  if (onPress) {
    return (
      <TouchableOpacity
        style={wrapperStyle}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={wrapperStyle}>{content}</View>;
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.accentLight,
  },
  fallback: {
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: '700',
    color: colors.primaryDeep,
  },
  verifiedBadge: {
    position: 'absolute',
    backgroundColor: colors.successGreen,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
});
