/**
 * KudiNode AI — Pure Geometric Vector Icon System
 * 100% Expo Go SDK 54 compatible. Zero native modules. Zero emojis.
 * Each icon is drawn with React Native View primitives.
 */
import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';

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
  | 'receipt' | 'document-text'
  | 'stats-chart' | 'trending-up'
  | 'notifications' | 'bell'
  | 'fingerprint' | 'finger-print'
  | 'phone' | 'call'
  | 'flash' | 'flash-outline'
  | 'search'
  | 'refresh'
  | 'eye' | 'eye-off'
  | 'settings' | 'gear'
  | 'logout' | 'log-out'
  | 'help' | 'info'
  | 'plus' | 'add'
  | 'menu' | 'dots'
  | 'star'
  | 'location' | 'pin'
  | 'calendar'
  | 'qr-code'
  | 'copy'
  | 'server'
  | 'paper-plane'
  | 'transfer'
  | 'bank'
  | 'id-card'
  | 'user-check'
  | string;

export function Icon({ name, size = 20, color = '#FFFFFF', style }: IconProps) {
  const s = size;
  const c = color;
  const w = (v: number) => v * s;

  const container = (children: React.ReactNode) => (
    <View style={[{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }, style as ViewStyle]}>
      {children}
    </View>
  );

  switch (name) {
    // ── HOME ──────────────────────────────────────────────────────────
    case 'home':
    case 'home-outline':
      return container(
        <>
          {/* Roof */}
          <View style={{ position: 'absolute', top: w(0.05), width: 0, height: 0, borderLeftWidth: w(0.42), borderRightWidth: w(0.42), borderBottomWidth: w(0.38), borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: c }} />
          {/* Wall */}
          <View style={{ position: 'absolute', bottom: w(0.08), width: w(0.6), height: w(0.44), backgroundColor: c, borderRadius: 2 }}>
            {/* Door */}
            <View style={{ position: 'absolute', bottom: 0, alignSelf: 'center', width: w(0.2), height: w(0.24), backgroundColor: name === 'home-outline' ? c : '#FFFFFF', borderTopLeftRadius: 2, borderTopRightRadius: 2 }} />
          </View>
        </>
      );

    // ── SEND / PAPER PLANE ────────────────────────────────────────────
    case 'send':
    case 'send-outline':
    case 'paper-plane':
    case 'paper-plane-outline':
      return container(
        <View style={{ transform: [{ rotate: '45deg' }] }}>
          {/* Arrow shaft */}
          <View style={{ width: w(0.7), height: 2.5, backgroundColor: c, borderRadius: 2 }} />
          {/* Arrow tip */}
          <View style={{ position: 'absolute', right: -2, top: -w(0.18), width: 0, height: 0, borderLeftWidth: w(0.3), borderTopWidth: w(0.18), borderBottomWidth: w(0.18), borderLeftColor: c, borderTopColor: 'transparent', borderBottomColor: 'transparent' }} />
          {/* Tail */}
          <View style={{ position: 'absolute', left: 0, bottom: -w(0.16), width: 0, height: 0, borderRightWidth: w(0.25), borderTopWidth: w(0.16), borderRightColor: c, borderTopColor: 'transparent' }} />
        </View>
      );

    // ── MICROPHONE ────────────────────────────────────────────────────
    case 'mic':
    case 'mic-outline':
      return container(
        <>
          {/* Mic capsule */}
          <View style={{ position: 'absolute', top: w(0.04), width: w(0.36), height: w(0.5), borderRadius: w(0.18), backgroundColor: c }} />
          {/* Stand arc */}
          <View style={{ position: 'absolute', top: w(0.3), width: w(0.6), height: w(0.3), borderBottomLeftRadius: w(0.3), borderBottomRightRadius: w(0.3), borderLeftWidth: 2.2, borderRightWidth: 2.2, borderBottomWidth: 2.2, borderColor: c, borderTopWidth: 0 }} />
          {/* Pole */}
          <View style={{ position: 'absolute', bottom: w(0.08), width: 2.2, height: w(0.18), backgroundColor: c }} />
          {/* Base */}
          <View style={{ position: 'absolute', bottom: w(0.05), width: w(0.36), height: 2.2, backgroundColor: c, borderRadius: 2 }} />
        </>
      );

    // ── CAMERA ────────────────────────────────────────────────────────
    case 'camera':
    case 'camera-outline':
      return container(
        <>
          {/* Flash bump */}
          <View style={{ position: 'absolute', top: w(0.12), left: w(0.22), width: w(0.22), height: w(0.12), backgroundColor: c, borderTopLeftRadius: 3, borderTopRightRadius: 3 }} />
          {/* Body */}
          <View style={{ position: 'absolute', top: w(0.22), left: w(0.06), right: w(0.06), bottom: w(0.1), borderRadius: 6, backgroundColor: c }}>
            {/* Lens ring outer */}
            <View style={{ position: 'absolute', alignSelf: 'center', top: w(0.06), width: w(0.42), height: w(0.42), borderRadius: w(0.21), backgroundColor: name === 'camera-outline' ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.18)', borderWidth: 2, borderColor: name === 'camera-outline' ? c : 'rgba(255,255,255,0.4)' }}>
              {/* Lens inner */}
              <View style={{ position: 'absolute', alignSelf: 'center', top: '20%', width: '60%', height: '60%', borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.3)' }} />
            </View>
          </View>
        </>
      );

    // ── CARD ──────────────────────────────────────────────────────────
    case 'card':
    case 'card-outline':
      return container(
        <View style={{ width: w(0.86), height: w(0.6), borderRadius: 5, borderWidth: name === 'card-outline' ? 2 : 0, borderColor: c, backgroundColor: name === 'card-outline' ? 'transparent' : c }}>
          {/* Magnetic stripe */}
          <View style={{ width: '100%', height: w(0.14), backgroundColor: name === 'card-outline' ? c : 'rgba(255,255,255,0.35)', marginTop: w(0.1) }} />
          {/* Chip */}
          <View style={{ width: w(0.18), height: w(0.13), backgroundColor: name === 'card-outline' ? c : 'rgba(255,255,255,0.55)', borderRadius: 3, marginTop: w(0.06), marginLeft: w(0.1) }} />
        </View>
      );

    // ── WALLET ────────────────────────────────────────────────────────
    case 'wallet':
    case 'wallet-outline':
      return container(
        <>
          <View style={{ width: w(0.82), height: w(0.62), borderRadius: 5, borderWidth: 2, borderColor: c }}>
            <View style={{ position: 'absolute', right: w(0.04), top: '25%', width: w(0.22), height: w(0.5), backgroundColor: c, borderRadius: 4, opacity: 0.7 }}>
              <View style={{ alignSelf: 'center', marginTop: '25%', width: w(0.1), height: w(0.1), borderRadius: w(0.05), backgroundColor: 'rgba(255,255,255,0.8)' }} />
            </View>
          </View>
        </>
      );

    // ── PERSON ────────────────────────────────────────────────────────
    case 'person':
    case 'person-outline':
      return container(
        <>
          {/* Head */}
          <View style={{ position: 'absolute', top: w(0.06), width: w(0.36), height: w(0.36), borderRadius: w(0.18), backgroundColor: c }} />
          {/* Shoulders */}
          <View style={{ position: 'absolute', bottom: w(0.06), width: w(0.72), height: w(0.36), borderTopLeftRadius: w(0.36), borderTopRightRadius: w(0.36), backgroundColor: c }} />
        </>
      );

    // ── PEOPLE ────────────────────────────────────────────────────────
    case 'people':
    case 'people-outline':
      return container(
        <>
          {/* Right person (back) */}
          <View style={{ position: 'absolute', right: w(0.04), top: w(0.08), width: w(0.28), height: w(0.28), borderRadius: w(0.14), backgroundColor: c, opacity: 0.65 }} />
          <View style={{ position: 'absolute', right: w(0.0), bottom: w(0.06), width: w(0.55), height: w(0.3), borderTopLeftRadius: w(0.28), borderTopRightRadius: w(0.28), backgroundColor: c, opacity: 0.55 }} />
          {/* Left person (front) */}
          <View style={{ position: 'absolute', left: w(0.1), top: w(0.1), width: w(0.32), height: w(0.32), borderRadius: w(0.16), backgroundColor: c }} />
          <View style={{ position: 'absolute', left: w(0.04), bottom: w(0.06), width: w(0.6), height: w(0.32), borderTopLeftRadius: w(0.3), borderTopRightRadius: w(0.3), backgroundColor: c }} />
        </>
      );

    // ── LOCK ──────────────────────────────────────────────────────────
    case 'lock':
    case 'lock-closed':
    case 'lock-outline':
      return container(
        <>
          {/* Shackle */}
          <View style={{ position: 'absolute', top: w(0.06), width: w(0.4), height: w(0.36), borderTopLeftRadius: w(0.2), borderTopRightRadius: w(0.2), borderWidth: 2.5, borderColor: c, borderBottomWidth: 0 }} />
          {/* Body */}
          <View style={{ position: 'absolute', bottom: w(0.06), width: w(0.68), height: w(0.46), borderRadius: 5, backgroundColor: c, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: w(0.14), height: w(0.2), borderRadius: w(0.07), borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' }} />
          </View>
        </>
      );

    // ── SHIELD / SHIELD-CHECKMARK ─────────────────────────────────────
    case 'shield':
    case 'shield-checkmark':
    case 'shield-outline':
      return container(
        <>
          {/* Shield body */}
          <View style={{ width: w(0.78), height: w(0.88), borderTopLeftRadius: w(0.36), borderTopRightRadius: w(0.36), borderBottomLeftRadius: w(0.44), borderBottomRightRadius: w(0.44), backgroundColor: c, alignItems: 'center', justifyContent: 'center' }}>
            {name === 'shield-checkmark' && (
              /* Checkmark */
              <View style={{ width: w(0.34), height: w(0.2), borderLeftWidth: 2.5, borderBottomWidth: 2.5, borderColor: 'rgba(255,255,255,0.9)', transform: [{ rotate: '-45deg' }], marginTop: -w(0.06) }} />
            )}
          </View>
        </>
      );

    // ── CHECKMARK ─────────────────────────────────────────────────────
    case 'checkmark':
    case 'check':
      return container(
        <View style={{ width: w(0.6), height: w(0.36), borderLeftWidth: 2.5, borderBottomWidth: 2.5, borderColor: c, transform: [{ rotate: '-45deg' }], marginTop: -w(0.1) }} />
      );

    case 'checkmark-circle':
      return container(
        <>
          <View style={{ position: 'absolute', width: w(0.9), height: w(0.9), borderRadius: w(0.45), backgroundColor: c }} />
          <View style={{ width: w(0.4), height: w(0.24), borderLeftWidth: 2.5, borderBottomWidth: 2.5, borderColor: '#FFFFFF', transform: [{ rotate: '-45deg' }], marginTop: -w(0.06) }} />
        </>
      );

    // ── CLOSE / X ─────────────────────────────────────────────────────
    case 'close':
    case 'x':
      return container(
        <>
          <View style={{ position: 'absolute', width: w(0.7), height: 2.5, backgroundColor: c, borderRadius: 2, transform: [{ rotate: '45deg' }] }} />
          <View style={{ position: 'absolute', width: w(0.7), height: 2.5, backgroundColor: c, borderRadius: 2, transform: [{ rotate: '-45deg' }] }} />
        </>
      );

    // ── ARROWS / CHEVRONS ─────────────────────────────────────────────
    case 'arrow-back':
    case 'chevron-back':
      return container(
        <>
          <View style={{ position: 'absolute', left: w(0.2), width: w(0.3), height: w(0.3), borderLeftWidth: 2.5, borderTopWidth: 2.5, borderColor: c, transform: [{ rotate: '-45deg' }] }} />
          {name === 'arrow-back' && <View style={{ width: w(0.65), height: 2.5, backgroundColor: c, borderRadius: 2 }} />}
        </>
      );

    case 'arrow-forward':
    case 'chevron-forward':
      return container(
        <>
          <View style={{ position: 'absolute', right: w(0.2), width: w(0.3), height: w(0.3), borderRightWidth: 2.5, borderTopWidth: 2.5, borderColor: c, transform: [{ rotate: '45deg' }] }} />
          {name === 'arrow-forward' && <View style={{ width: w(0.65), height: 2.5, backgroundColor: c, borderRadius: 2 }} />}
        </>
      );

    case 'chevron-down':
      return container(
        <View style={{ width: w(0.42), height: w(0.42), borderRightWidth: 2.5, borderBottomWidth: 2.5, borderColor: c, transform: [{ rotate: '45deg' }], marginTop: -w(0.18) }} />
      );

    case 'chevron-up':
      return container(
        <View style={{ width: w(0.42), height: w(0.42), borderRightWidth: 2.5, borderBottomWidth: 2.5, borderColor: c, transform: [{ rotate: '-135deg' }], marginBottom: -w(0.18) }} />
      );

    // ── RECEIPT / DOCUMENT ────────────────────────────────────────────
    case 'receipt':
    case 'document-text':
      return container(
        <View style={{ width: w(0.68), height: w(0.86), borderRadius: 4, borderWidth: 2, borderColor: c, paddingHorizontal: w(0.1), paddingTop: w(0.14), gap: w(0.1) }}>
          <View style={{ width: '90%', height: 2, backgroundColor: c, borderRadius: 1 }} />
          <View style={{ width: '75%', height: 2, backgroundColor: c, borderRadius: 1, opacity: 0.6 }} />
          <View style={{ width: '90%', height: 2, backgroundColor: c, borderRadius: 1 }} />
          <View style={{ width: '55%', height: 2, backgroundColor: c, borderRadius: 1, opacity: 0.6 }} />
          <View style={{ width: '80%', height: 2, backgroundColor: c, borderRadius: 1 }} />
        </View>
      );

    // ── STATS CHART / TRENDING ────────────────────────────────────────
    case 'stats-chart':
    case 'trending-up':
      return container(
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: w(0.72), gap: w(0.08) }}>
          <View style={{ width: w(0.16), height: w(0.35), backgroundColor: c, borderRadius: 2, opacity: 0.5 }} />
          <View style={{ width: w(0.16), height: w(0.55), backgroundColor: c, borderRadius: 2, opacity: 0.7 }} />
          <View style={{ width: w(0.16), height: w(0.44), backgroundColor: c, borderRadius: 2, opacity: 0.8 }} />
          <View style={{ width: w(0.16), height: w(0.72), backgroundColor: c, borderRadius: 2 }} />
          <View style={{ width: w(0.16), height: w(0.6), backgroundColor: c, borderRadius: 2, opacity: 0.85 }} />
        </View>
      );

    // ── NOTIFICATIONS / BELL ──────────────────────────────────────────
    case 'notifications':
    case 'bell':
      return container(
        <>
          <View style={{ position: 'absolute', top: w(0.06), width: w(0.6), height: w(0.6), borderTopLeftRadius: w(0.3), borderTopRightRadius: w(0.3), borderLeftWidth: 2, borderRightWidth: 2, borderTopWidth: 2, borderColor: c }} />
          <View style={{ position: 'absolute', bottom: w(0.12), width: w(0.74), height: 2.5, backgroundColor: c, borderRadius: 2 }} />
          <View style={{ position: 'absolute', bottom: w(0.06), width: w(0.24), height: w(0.12), borderBottomLeftRadius: w(0.12), borderBottomRightRadius: w(0.12), backgroundColor: c }} />
          <View style={{ position: 'absolute', top: 0, width: w(0.18), height: w(0.18), borderRadius: w(0.09), borderWidth: 2, borderColor: c, backgroundColor: 'transparent' }} />
        </>
      );

    // ── FINGERPRINT ───────────────────────────────────────────────────
    case 'fingerprint':
    case 'finger-print':
      return container(
        <>
          <View style={{ position: 'absolute', width: w(0.8), height: w(0.8), borderRadius: w(0.4), borderWidth: 1.8, borderColor: c, opacity: 0.3 }} />
          <View style={{ position: 'absolute', width: w(0.6), height: w(0.6), borderRadius: w(0.3), borderWidth: 1.8, borderColor: c, opacity: 0.5 }} />
          <View style={{ position: 'absolute', width: w(0.4), height: w(0.4), borderRadius: w(0.2), borderWidth: 1.8, borderColor: c, opacity: 0.75 }} />
          <View style={{ position: 'absolute', width: w(0.2), height: w(0.2), borderRadius: w(0.1), backgroundColor: c }} />
        </>
      );

    // ── PHONE / CALL ──────────────────────────────────────────────────
    case 'phone':
    case 'call':
      return container(
        <View style={{ width: w(0.5), height: w(0.8), borderRadius: w(0.1), borderWidth: 2, borderColor: c, transform: [{ rotate: '-30deg' }], alignItems: 'center', justifyContent: 'flex-start', paddingTop: w(0.08) }}>
          <View style={{ width: w(0.2), height: w(0.08), backgroundColor: c, borderRadius: 2 }} />
        </View>
      );

    // ── FLASH ─────────────────────────────────────────────────────────
    case 'flash':
    case 'flash-outline':
      return container(
        <View style={{ width: 0, height: 0, borderStyle: 'solid', borderLeftWidth: w(0.35), borderRightWidth: w(0.12), borderTopWidth: w(0.5), borderBottomWidth: w(0.5), borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: c, borderBottomColor: 'transparent' }} />
      );

    // ── SEARCH ────────────────────────────────────────────────────────
    case 'search':
      return container(
        <>
          <View style={{ position: 'absolute', top: w(0.06), left: w(0.1), width: w(0.55), height: w(0.55), borderRadius: w(0.275), borderWidth: 2.5, borderColor: c }} />
          <View style={{ position: 'absolute', bottom: w(0.1), right: w(0.1), width: w(0.28), height: 2.5, backgroundColor: c, borderRadius: 2, transform: [{ rotate: '45deg' }] }} />
        </>
      );

    // ── REFRESH ───────────────────────────────────────────────────────
    case 'refresh':
      return container(
        <>
          <View style={{ width: w(0.72), height: w(0.72), borderRadius: w(0.36), borderWidth: 2.2, borderColor: c, borderTopColor: 'transparent' }} />
          <View style={{ position: 'absolute', top: w(0.04), right: w(0.1), width: 0, height: 0, borderLeftWidth: w(0.14), borderRightWidth: w(0.14), borderBottomWidth: w(0.2), borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: c, transform: [{ rotate: '30deg' }] }} />
        </>
      );

    // ── EYE ──────────────────────────────────────────────────────────
    case 'eye':
      return container(
        <>
          <View style={{ width: w(0.82), height: w(0.5), borderRadius: w(0.25), borderWidth: 2, borderColor: c, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: w(0.24), height: w(0.24), borderRadius: w(0.12), backgroundColor: c }} />
          </View>
        </>
      );

    case 'eye-off':
      return container(
        <>
          <View style={{ width: w(0.82), height: w(0.5), borderRadius: w(0.25), borderWidth: 2, borderColor: c, opacity: 0.35 }} />
          <View style={{ position: 'absolute', width: w(0.8), height: 2.5, backgroundColor: c, borderRadius: 2, transform: [{ rotate: '-20deg' }] }} />
        </>
      );

    // ── SETTINGS / GEAR ───────────────────────────────────────────────
    case 'settings':
    case 'gear':
      return container(
        <>
          <View style={{ width: w(0.52), height: w(0.52), borderRadius: w(0.26), borderWidth: 2.5, borderColor: c }} />
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <View key={i} style={{ position: 'absolute', width: w(0.16), height: w(0.16), borderRadius: w(0.08), backgroundColor: c, transform: [{ rotate: `${angle}deg` }, { translateY: -w(0.38) }] }} />
          ))}
        </>
      );

    // ── LOGOUT ────────────────────────────────────────────────────────
    case 'logout':
    case 'log-out':
      return container(
        <>
          {/* Door frame */}
          <View style={{ position: 'absolute', left: w(0.08), width: w(0.52), height: w(0.78), borderTopWidth: 2, borderLeftWidth: 2, borderBottomWidth: 2, borderColor: c, borderRadius: 3 }} />
          {/* Arrow */}
          <View style={{ position: 'absolute', right: w(0.08), width: w(0.45), height: 2.5, backgroundColor: c, borderRadius: 2 }} />
          <View style={{ position: 'absolute', right: w(0.08), width: w(0.2), height: w(0.2), borderRightWidth: 2.5, borderTopWidth: 2.5, borderColor: c, transform: [{ rotate: '45deg' }] }} />
        </>
      );

    // ── HELP / INFO ───────────────────────────────────────────────────
    case 'help':
    case 'info':
      return container(
        <>
          <View style={{ width: w(0.88), height: w(0.88), borderRadius: w(0.44), borderWidth: 2, borderColor: c, alignItems: 'center', justifyContent: 'center' }}>
            {name === 'help' ? (
              <>
                <View style={{ width: 2.5, height: w(0.22), backgroundColor: c, borderRadius: 2, marginBottom: w(0.04) }} />
                <View style={{ width: w(0.12), height: w(0.12), borderRadius: w(0.06), backgroundColor: c }} />
              </>
            ) : (
              <>
                <View style={{ width: w(0.12), height: w(0.12), borderRadius: w(0.06), backgroundColor: c, marginBottom: w(0.04) }} />
                <View style={{ width: 2.5, height: w(0.28), backgroundColor: c, borderRadius: 2 }} />
              </>
            )}
          </View>
        </>
      );

    // ── PLUS / ADD ────────────────────────────────────────────────────
    case 'plus':
    case 'add':
      return container(
        <>
          <View style={{ width: w(0.72), height: 2.5, backgroundColor: c, borderRadius: 2 }} />
          <View style={{ position: 'absolute', width: 2.5, height: w(0.72), backgroundColor: c, borderRadius: 2 }} />
        </>
      );

    // ── MENU ──────────────────────────────────────────────────────────
    case 'menu':
    case 'dots':
      return container(
        <>
          <View style={{ width: w(0.72), height: 2.5, backgroundColor: c, borderRadius: 2, marginBottom: w(0.16) }} />
          <View style={{ width: w(0.72), height: 2.5, backgroundColor: c, borderRadius: 2, marginBottom: w(0.16) }} />
          <View style={{ width: w(0.72), height: 2.5, backgroundColor: c, borderRadius: 2 }} />
        </>
      );

    // ── STAR ──────────────────────────────────────────────────────────
    case 'star':
      return container(
        <View style={{ width: w(0.7), height: w(0.7), backgroundColor: c, transform: [{ rotate: '15deg' }] }}>
          <View style={{ position: 'absolute', width: w(0.7), height: w(0.7), backgroundColor: c, transform: [{ rotate: '30deg' }] }} />
        </View>
      );

    // ── LOCATION / PIN ────────────────────────────────────────────────
    case 'location':
    case 'pin':
      return container(
        <>
          <View style={{ width: w(0.58), height: w(0.58), borderRadius: w(0.29), backgroundColor: c, position: 'absolute', top: w(0.04) }} />
          <View style={{ position: 'absolute', bottom: w(0.06), width: 0, height: 0, borderLeftWidth: w(0.22), borderRightWidth: w(0.22), borderTopWidth: w(0.38), borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: c }} />
        </>
      );

    // ── CALENDAR ──────────────────────────────────────────────────────
    case 'calendar':
      return container(
        <View style={{ width: w(0.82), height: w(0.8), borderRadius: 4, borderWidth: 2, borderColor: c }}>
          <View style={{ width: '100%', height: w(0.22), backgroundColor: c, borderRadius: 2 }} />
          <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', padding: w(0.06), gap: w(0.06) }}>
            {Array.from({ length: 9 }).map((_, i) => (
              <View key={i} style={{ width: w(0.16), height: w(0.16), backgroundColor: c, borderRadius: 1, opacity: 0.5 }} />
            ))}
          </View>
        </View>
      );

    // ── QR CODE ───────────────────────────────────────────────────────
    case 'qr-code':
      return container(
        <View style={{ width: w(0.82), height: w(0.82), borderWidth: 2, borderColor: c, padding: w(0.08), gap: w(0.08) }}>
          <View style={{ flexDirection: 'row', gap: w(0.08), flex: 1 }}>
            <View style={{ flex: 1, borderWidth: 2, borderColor: c }} />
            <View style={{ width: w(0.14), height: '100%', backgroundColor: c }} />
            <View style={{ flex: 1, borderWidth: 2, borderColor: c }} />
          </View>
          <View style={{ height: w(0.14), backgroundColor: c, width: '50%' }} />
          <View style={{ flexDirection: 'row', gap: w(0.08), flex: 1 }}>
            <View style={{ flex: 1, borderWidth: 2, borderColor: c }} />
            <View style={{ width: w(0.14), height: '100%' }} />
            <View style={{ flex: 1, borderWidth: 2, borderColor: c }} />
          </View>
        </View>
      );

    // ── COPY ──────────────────────────────────────────────────────────
    case 'copy':
      return container(
        <>
          <View style={{ position: 'absolute', bottom: w(0.06), left: w(0.06), width: w(0.6), height: w(0.65), borderRadius: 4, borderWidth: 2, borderColor: c }} />
          <View style={{ position: 'absolute', top: w(0.06), right: w(0.06), width: w(0.6), height: w(0.65), borderRadius: 4, borderWidth: 2, borderColor: c, backgroundColor: 'rgba(255,255,255,0.9)' }} />
        </>
      );

    // ── ROBOT ICON ───────────────────────────────────────────────────
    case 'robot':
    case 'bot':
    case 'hardware-chip':
      return container(
        <>
          {/* Antenna stem & bulb */}
          <View style={{ position: 'absolute', top: w(0.02), width: 2, height: w(0.18), backgroundColor: c }} />
          <View style={{ position: 'absolute', top: 0, width: w(0.14), height: w(0.14), borderRadius: w(0.07), backgroundColor: '#10B981', borderWidth: 1.5, borderColor: c }} />

          {/* Head container */}
          <View style={{ position: 'absolute', top: w(0.18), width: w(0.76), height: w(0.62), borderRadius: w(0.16), borderWidth: 2, borderColor: c, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' }}>
            {/* Robot Eyes Row */}
            <View style={{ flexDirection: 'row', gap: w(0.18), marginTop: -w(0.04) }}>
              <View style={{ width: w(0.16), height: w(0.16), borderRadius: w(0.08), backgroundColor: '#10B981', borderWidth: 1.5, borderColor: c }} />
              <View style={{ width: w(0.16), height: w(0.16), borderRadius: w(0.08), backgroundColor: '#10B981', borderWidth: 1.5, borderColor: c }} />
            </View>

            {/* Robot Mouth Grid / Line */}
            <View style={{ marginTop: w(0.08), width: w(0.36), height: 3, backgroundColor: c, borderRadius: 2 }} />
          </View>

          {/* Left & Right Ears */}
          <View style={{ position: 'absolute', top: w(0.34), left: 0, width: w(0.08), height: w(0.24), borderRadius: 2, backgroundColor: c }} />
          <View style={{ position: 'absolute', top: w(0.34), right: 0, width: w(0.08), height: w(0.24), borderRadius: 2, backgroundColor: c }} />
        </>
      );

    // ── SERVER ────────────────────────────────────────────────────────
    case 'server':
      return container(
        <>
          {[0.06, 0.34, 0.62].map((top, i) => (
            <View key={i} style={{ position: 'absolute', top: w(top), width: w(0.82), height: w(0.24), borderRadius: 3, borderWidth: 2, borderColor: c }}>
              <View style={{ position: 'absolute', right: w(0.1), top: '25%', width: w(0.12), height: w(0.12), borderRadius: w(0.06), backgroundColor: c }} />
              <View style={{ position: 'absolute', right: w(0.26), top: '25%', width: w(0.12), height: w(0.12), borderRadius: w(0.06), backgroundColor: c, opacity: 0.5 }} />
            </View>
          ))}
        </>
      );

    // ── BANK ──────────────────────────────────────────────────────────
    case 'bank':
      return container(
        <>
          {/* Roof/peak */}
          <View style={{ position: 'absolute', top: w(0.04), width: 0, height: 0, borderLeftWidth: w(0.44), borderRightWidth: w(0.44), borderBottomWidth: w(0.28), borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: c }} />
          {/* Columns */}
          <View style={{ position: 'absolute', bottom: w(0.14), flexDirection: 'row', gap: w(0.1), alignItems: 'flex-end' }}>
            {[1, 1, 1, 1].map((_, i) => (
              <View key={i} style={{ width: w(0.1), height: w(0.44), backgroundColor: c, borderRadius: 2 }} />
            ))}
          </View>
          {/* Base */}
          <View style={{ position: 'absolute', bottom: w(0.08), width: w(0.82), height: w(0.12), backgroundColor: c, borderRadius: 2 }} />
        </>
      );

    // ── ID CARD ───────────────────────────────────────────────────────
    case 'id-card':
      return container(
        <View style={{ width: w(0.9), height: w(0.68), borderRadius: 5, borderWidth: 2, borderColor: c, padding: w(0.08) }}>
          <View style={{ flexDirection: 'row', gap: w(0.1), alignItems: 'flex-start' }}>
            <View style={{ width: w(0.22), height: w(0.22), borderRadius: w(0.11), backgroundColor: c }} />
            <View style={{ flex: 1, gap: w(0.06) }}>
              <View style={{ width: '80%', height: 2.5, backgroundColor: c, borderRadius: 1 }} />
              <View style={{ width: '60%', height: 2.5, backgroundColor: c, borderRadius: 1, opacity: 0.5 }} />
            </View>
          </View>
          <View style={{ marginTop: w(0.08), width: '100%', height: 2, backgroundColor: c, opacity: 0.3 }} />
          <View style={{ marginTop: w(0.08), width: '70%', height: 2, backgroundColor: c, opacity: 0.5 }} />
        </View>
      );

    // ── TRANSFER ──────────────────────────────────────────────────────
    case 'transfer':
      return container(
        <>
          <View style={{ position: 'absolute', top: w(0.2), width: w(0.72), height: 2.5, backgroundColor: c, borderRadius: 2 }} />
          <View style={{ position: 'absolute', top: w(0.12), right: w(0.1), width: w(0.22), height: w(0.22), borderRightWidth: 2.5, borderTopWidth: 2.5, borderColor: c, transform: [{ rotate: '45deg' }] }} />
          <View style={{ position: 'absolute', bottom: w(0.2), width: w(0.72), height: 2.5, backgroundColor: c, borderRadius: 2 }} />
          <View style={{ position: 'absolute', bottom: w(0.12), left: w(0.1), width: w(0.22), height: w(0.22), borderLeftWidth: 2.5, borderBottomWidth: 2.5, borderColor: c, transform: [{ rotate: '-45deg' }] }} />
        </>
      );

    // ── USER-CHECK ────────────────────────────────────────────────────
    case 'user-check':
      return container(
        <>
          <View style={{ position: 'absolute', top: w(0.06), left: w(0.06), width: w(0.32), height: w(0.32), borderRadius: w(0.16), backgroundColor: c }} />
          <View style={{ position: 'absolute', bottom: w(0.06), left: w(0.0), width: w(0.62), height: w(0.32), borderTopLeftRadius: w(0.3), borderTopRightRadius: w(0.3), backgroundColor: c }} />
          {/* Check */}
          <View style={{ position: 'absolute', bottom: w(0.28), right: w(0.06), width: w(0.28), height: w(0.18), borderLeftWidth: 2.5, borderBottomWidth: 2.5, borderColor: c, transform: [{ rotate: '-45deg' }] }} />
        </>
      );

    // ── FALLBACK ──────────────────────────────────────────────────────
    default:
      return container(
        <View style={{ width: w(0.4), height: w(0.4), borderRadius: w(0.2), borderWidth: 2, borderColor: c }} />
      );
  }
}

export const Ionicons = Icon;
export default Icon;
