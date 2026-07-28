import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, ScrollView, KeyboardAvoidingView,
  Platform, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, typography, shadows } from '../theme/theme';
import { Icon } from '../components/Icon';
import { useLanguage } from '../context/LanguageContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../AppNavigator';
import { KudiNodeLogo } from '../components/KudiNodeLogo';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function LoginScreen() {
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [useBio, setUseBio] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      nav.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    }, 800);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDeep} />
      <LinearGradient
        colors={[colors.primaryDeep, '#2D1060']}
        style={[styles.gradient, { paddingTop: insets.top }]}
      >
        {/* Brand header */}
        <View style={styles.brand}>
          <KudiNodeLogo size="large" variant="light" />
          <View style={styles.bankBadge}>
            <View style={styles.bankDot} />
            <Text style={styles.bankText}>Powered by Wema Bank Sandbox</Text>
          </View>
        </View>
      </LinearGradient>

      {/* White card sheet */}
      <ScrollView
        style={styles.sheet}
        contentContainerStyle={styles.sheetContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>Merchant Sign In</Text>
        <Text style={styles.sheetSub}>Enter your registered mobile number and security PIN</Text>

        {/* Phone */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Mobile Number</Text>
          <View style={styles.inputRow}>
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>+234</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="801 234 5678"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={11}
            />
            <Icon name="phone" size={18} color={colors.textMuted} />
          </View>
        </View>

        {/* PIN or Biometric */}
        {!useBio ? (
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>4-Digit Security PIN</Text>
              <TouchableOpacity onPress={handleLogin}>
                <Text style={styles.forgot}>Forgot PIN?</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="••••"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                secureTextEntry={!showPin}
                value={pin}
                onChangeText={setPin}
                maxLength={4}
              />
              <TouchableOpacity onPress={() => setShowPin(p => !p)} style={{ padding: 4 }}>
                <Icon name={showPin ? 'eye-off' : 'eye'} size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.bioBox} onPress={handleLogin} activeOpacity={0.8}>
            <Icon name="fingerprint" size={52} color={colors.primaryMid} />
            <Text style={styles.bioTitle}>Touch to Authenticate</Text>
            <Text style={styles.bioSub}>Place your registered finger on the sensor</Text>
          </TouchableOpacity>
        )}

        {/* Bio toggle */}
        <TouchableOpacity
          style={styles.bioToggle}
          onPress={() => setUseBio(v => !v)}
          activeOpacity={0.7}
        >
          <Icon name={useBio ? 'lock' : 'fingerprint'} size={16} color={colors.primaryMid} />
          <Text style={styles.bioToggleText}>
            {useBio ? 'Use security PIN instead' : 'Use Biometric / Face ID'}
          </Text>
        </TouchableOpacity>

        {/* Sign in button */}
        <TouchableOpacity
          style={[styles.signInBtn, shadows.button]}
          onPress={handleLogin}
          activeOpacity={0.88}
        >
          <LinearGradient
            colors={[colors.primaryMid, colors.primaryDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.signInGrad}
          >
            {loading ? (
              <Text style={styles.signInText}>Authenticating...</Text>
            ) : (
              <>
                <Text style={styles.signInText}>Sign In to Merchant Hub</Text>
                <Icon name="arrow-forward" size={18} color={colors.white} />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Demo */}
        <TouchableOpacity style={styles.demoBtn} onPress={handleLogin} activeOpacity={0.8}>
          <Text style={styles.demoText}>Quick Demo (skip sign-in)</Text>
        </TouchableOpacity>

        {/* Register */}
        <View style={styles.registerWrap}>
          <Text style={styles.registerText}>New merchant?</Text>
          <TouchableOpacity onPress={() => nav.navigate('RegisterKYC')} activeOpacity={0.8}>
            <Text style={styles.registerLink}>Create Tier-1 Account</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  gradient: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl + spacing.xl,
  },
  brand: { alignItems: 'center', paddingTop: spacing.xxl },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  brandName: { fontSize: 26, fontWeight: '800', color: colors.white, letterSpacing: 0.3 },
  brandTag:  { fontSize: typography.sizes.small, color: 'rgba(255,255,255,0.7)', marginTop: 3 },
  bankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  bankDot:  { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.successGreen },
  bankText: { fontSize: typography.sizes.tiny, color: colors.white, fontWeight: '600' },

  // Sheet
  sheet: { flex: 1, backgroundColor: colors.white, marginTop: -spacing.xxl, borderTopLeftRadius: radius.xxl, borderTopRightRadius: radius.xxl },
  sheetContent: { paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: spacing.xl },
  sheetTitle: { fontSize: typography.sizes.h2, fontWeight: '800', color: colors.textDark },
  sheetSub:   { fontSize: typography.sizes.small, color: colors.textMuted, marginTop: 4, marginBottom: spacing.xl },

  // Fields
  fieldGroup: { marginBottom: spacing.lg },
  fieldLabel: { fontSize: typography.sizes.small, fontWeight: '700', color: colors.textDark, marginBottom: 6 },
  labelRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  forgot:     { fontSize: typography.sizes.tiny, color: colors.primaryMid, fontWeight: '700' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.grayBG,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    height: 54,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  codeBox:  { paddingRight: spacing.sm, borderRightWidth: 1, borderRightColor: colors.border },
  codeText: { fontSize: typography.sizes.body, fontWeight: '700', color: colors.textDark },
  input:    { flex: 1, fontSize: typography.sizes.body, color: colors.textDark, fontWeight: '600' },

  // Biometric
  bioBox: {
    alignItems: 'center',
    backgroundColor: colors.grayBG,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  bioTitle: { fontSize: typography.sizes.body, fontWeight: '700', color: colors.primaryDeep },
  bioSub:   { fontSize: typography.sizes.tiny, color: colors.textMuted, textAlign: 'center' },
  bioToggle:     { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', paddingVertical: spacing.sm, marginBottom: spacing.lg },
  bioToggleText: { fontSize: typography.sizes.small, fontWeight: '700', color: colors.primaryMid },

  // Buttons
  signInBtn:  { borderRadius: radius.xl, overflow: 'hidden', marginBottom: spacing.md },
  signInGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: 16 },
  signInText: { fontSize: typography.sizes.body, fontWeight: '800', color: colors.white },
  demoBtn:    { alignItems: 'center', paddingVertical: spacing.md, marginBottom: spacing.lg },
  demoText:   { fontSize: typography.sizes.small, color: colors.textMuted, fontWeight: '600' },
  registerWrap: { flexDirection: 'row', justifyContent: 'center', gap: 6, alignItems: 'center' },
  registerText: { fontSize: typography.sizes.small, color: colors.textMuted },
  registerLink: { fontSize: typography.sizes.small, fontWeight: '800', color: colors.primaryMid },
});
