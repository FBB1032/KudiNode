import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import {
  Ionicons as ExpoIonicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from '@expo/vector-icons';

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export type IconName =
  | 'home' | 'home-outline'
  | 'send' | 'send-outline'
  | 'mic' | 'mic-outline'
  | 'camera' | 'camera-outline'
  | 'card' | 'card-outline'
  | 'wallet' | 'wallet-outline'
  | 'person' | 'person-outline'
  | 'people' | 'people-outline'
  | 'lock' | 'lock-closed' | 'lock-outline'
  | 'shield' | 'shield-checkmark' | 'shield-outline'
  | 'checkmark' | 'checkmark-circle' | 'check'
  | 'close' | 'x'
  | 'arrow-back' | 'chevron-back'
  | 'arrow-forward' | 'chevron-forward'
  | 'chevron-down' | 'chevron-up'
  | 'receipt' | 'document-text' | 'document-text-outline'
  | 'stats-chart' | 'trending-up'
  | 'notifications' | 'notifications-outline' | 'bell'
  | 'fingerprint' | 'finger-print'
  | 'phone' | 'call'
  | 'flash' | 'flash-outline'
  | 'search'
  | 'refresh' | 'sync'
  | 'eye' | 'eye-off' | 'eye-outline' | 'eye-off-outline'
  | 'settings' | 'gear'
  | 'logout' | 'log-out'
  | 'help' | 'info'
  | 'plus' | 'add'
  | 'menu' | 'dots'
  | 'star'
  | 'location' | 'pin'
  | 'calendar'
  | 'qr-code'
  | 'copy' | 'copy-outline'
  | 'server'
  | 'paper-plane'
  | 'transfer'
  | 'bank' | 'bank-outline'
  | 'id-card'
  | 'user-check'
  | 'robot' | 'bot' | 'robot-outline' | 'robot-happy'
  | 'sparkles'
  | 'alert-circle' | 'alert-circle-outline'
  | 'storefront' | 'storefront-outline'
  | 'person-add' | 'person-add-outline'
  | 'checkmark-circle-outline'
  | string;

const NAME_MAP: Record<string, keyof typeof ExpoIonicons.glyphMap> = {
  'home': 'home',
  'home-outline': 'home-outline',
  'send': 'paper-plane',
  'send-outline': 'paper-plane-outline',
  'paper-plane': 'paper-plane',
  'mic': 'mic',
  'mic-outline': 'mic-outline',
  'camera': 'camera',
  'camera-outline': 'camera-outline',
  'card': 'card',
  'card-outline': 'card-outline',
  'wallet': 'wallet',
  'wallet-outline': 'wallet-outline',
  'person': 'person',
  'person-outline': 'person-outline',
  'people': 'people',
  'people-outline': 'people-outline',
  'lock': 'lock-closed',
  'lock-closed': 'lock-closed',
  'lock-outline': 'lock-open-outline',
  'shield': 'shield',
  'shield-checkmark': 'shield-checkmark',
  'shield-outline': 'shield-outline',
  'checkmark': 'checkmark',
  'check': 'checkmark',
  'checkmark-circle': 'checkmark-circle',
  'checkmark-circle-outline': 'checkmark-circle-outline',
  'close': 'close',
  'x': 'close',
  'arrow-back': 'arrow-back',
  'chevron-back': 'chevron-back',
  'arrow-forward': 'arrow-forward',
  'chevron-forward': 'chevron-forward',
  'chevron-down': 'chevron-down',
  'chevron-up': 'chevron-up',
  'receipt': 'receipt',
  'document-text': 'document-text',
  'document-text-outline': 'document-text-outline',
  'stats-chart': 'stats-chart',
  'trending-up': 'trending-up',
  'notifications': 'notifications',
  'notifications-outline': 'notifications-outline',
  'bell': 'notifications',
  'fingerprint': 'finger-print',
  'finger-print': 'finger-print',
  'phone': 'call',
  'call': 'call',
  'flash': 'flash',
  'flash-outline': 'flash-outline',
  'search': 'search',
  'refresh': 'refresh',
  'sync': 'sync',
  'eye': 'eye',
  'eye-off': 'eye-off',
  'eye-outline': 'eye-outline',
  'eye-off-outline': 'eye-off-outline',
  'settings': 'settings-outline',
  'gear': 'settings-outline',
  'logout': 'log-out-outline',
  'log-out': 'log-out-outline',
  'help': 'help-circle-outline',
  'info': 'information-circle-outline',
  'plus': 'add',
  'add': 'add',
  'menu': 'menu',
  'dots': 'ellipsis-horizontal',
  'star': 'star',
  'location': 'location',
  'pin': 'location',
  'calendar': 'calendar',
  'qr-code': 'qr-code',
  'copy': 'copy-outline',
  'copy-outline': 'copy-outline',
  'server': 'server-outline',
  'transfer': 'swap-horizontal',
  'bank': 'business',
  'bank-outline': 'business-outline',
  'id-card': 'card-outline',
  'user-check': 'person-add',
  'sparkles': 'sparkles',
  'alert-circle': 'alert-circle',
  'alert-circle-outline': 'alert-circle-outline',
  'storefront': 'storefront',
  'storefront-outline': 'storefront-outline',
  'person-add': 'person-add',
  'person-add-outline': 'person-add-outline',
};

export function Icon({ name, size = 20, color = '#FFFFFF', style }: IconProps) {
  // Robot icons -> use MaterialCommunityIcons for authentic, professional robot glyphs
  if (name === 'robot' || name === 'bot') {
    return <MaterialCommunityIcons name="robot" size={size} color={color} style={style} />;
  }
  if (name === 'robot-outline') {
    return <MaterialCommunityIcons name="robot-outline" size={size} color={color} style={style} />;
  }
  if (name === 'robot-happy') {
    return <MaterialCommunityIcons name="robot-happy" size={size} color={color} style={style} />;
  }

  const mappedName = NAME_MAP[name] || (name as keyof typeof ExpoIonicons.glyphMap) || 'ellipse-outline';

  return (
    <ExpoIonicons
      name={mappedName}
      size={size}
      color={color}
      style={style}
    />
  );
}

export const Ionicons = Icon;
export default Icon;
