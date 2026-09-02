import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Switch, Alert, StatusBar,
} from 'react-native';
import { colors, spacing, radius, typography, shadows } from '../theme/theme';
import { TopHeader } from '../components/TopHeader';
import { Icon } from '../components/Icon';
import { useLanguage } from '../context/LanguageContext';

export function SecuritySettingsScreen() {
  const { t } = useLanguage();
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled]   = useState(true);
  const [smsAlerts, setSmsAlerts]                 = useState(true);
  const [oldPin, setOldPin]                       = useState('');
  const [newPin, setNewPin]                       = useState('');
  const [showPinModal, setShowPinModal]           = useState(false);

  const handleUpdatePin = () => {
    if (newPin.length !== 4) {
      Alert.alert(t('security.invalidPin'), t('security.invalidPinMsg'));
      return;
    }
    Alert.alert(t('common.success'), t('security.pinUpdated'));
    setOldPin(''); setNewPin(''); setShowPinModal(false);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDeep} translucent={false} />
      <TopHeader showBack title={t('security.title')} subtitle={t('security.subtitle')} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Authentication Options */}
        <Text style={styles.sectionTitle}>{t('security.authentication')}</Text>
        <View style={[styles.card, shadows.card]}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={styles.iconBox}>
                <Icon name="fingerprint" size={20} color={colors.primaryMid} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.rowTitle}>{t('security.biometric')}</Text>
                <Text style={styles.rowSub}>{t('security.biometricSub')}</Text>
              </View>
            </View>
            <Switch
              value={biometricsEnabled}
              onValueChange={setBiometricsEnabled}
              trackColor={{ false: colors.border, true: colors.primaryMid }}
              thumbColor={colors.white}
            />
          </View>

          <View style={[styles.row, styles.borderTop]}>
            <View style={styles.rowLeft}>
              <View style={styles.iconBox}>
                <Icon name="lock" size={20} color={colors.primaryMid} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.rowTitle}>{t('security.twoFactor')}</Text>
                <Text style={styles.rowSub}>{t('security.twoFactorSub')}</Text>
              </View>
            </View>
            <Switch
              value={twoFactorEnabled}
              onValueChange={setTwoFactorEnabled}
              trackColor={{ false: colors.border, true: colors.primaryMid }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        {/* Change PIN Section */}
        <Text style={styles.sectionTitle}>{t('security.securityPin')}</Text>
        <View style={[styles.card, shadows.card]}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => setShowPinModal(!showPinModal)}
            activeOpacity={0.75}
          >
            <View style={styles.rowLeft}>
              <View style={styles.iconBox}>
                <Icon name="lock-closed" size={20} color={colors.primaryMid} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.rowTitle}>{t('security.changePin')}</Text>
                <Text style={styles.rowSub}>{t('security.changePinSub', { days: '30' })}</Text>
              </View>
            </View>
            <Icon name={showPinModal ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
          </TouchableOpacity>

          {showPinModal && (
            <View style={styles.pinForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('security.currentPin')}</Text>
                <TextInput
                  style={styles.pinInput}
                  value={oldPin}
                  onChangeText={setOldPin}
                  keyboardType="numeric"
                  secureTextEntry
                  maxLength={4}
                  placeholder="••••"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('security.newPin')}</Text>
                <TextInput
                  style={styles.pinInput}
                  value={newPin}
                  onChangeText={setNewPin}
                  keyboardType="numeric"
                  secureTextEntry
                  maxLength={4}
                  placeholder="••••"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleUpdatePin} activeOpacity={0.85}>
                <Text style={styles.saveBtnText}>{t('security.updatePin')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Limits & Notifications */}
        <Text style={styles.sectionTitle}>{t('security.transactionSafety')}</Text>
        <View style={[styles.card, shadows.card]}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={styles.iconBox}>
                <Icon name="bell" size={20} color={colors.primaryMid} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.rowTitle}>{t('security.smsAlerts')}</Text>
                <Text style={styles.rowSub}>{t('security.smsAlertsSub')}</Text>
              </View>
            </View>
            <Switch
              value={smsAlerts}
              onValueChange={setSmsAlerts}
              trackColor={{ false: colors.border, true: colors.primaryMid }}
              thumbColor={colors.white}
            />
          </View>

          <View style={[styles.row, styles.borderTop]}>
            <View style={styles.rowLeft}>
              <View style={styles.iconBox}>
                <Icon name="card" size={20} color={colors.primaryMid} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.rowTitle}>{t('security.dailyLimit')}</Text>
                <Text style={styles.rowSub}>{t('security.dailyLimitSub', { limit: '500,000' })}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.linkPill}>
              <Text style={styles.linkText}>{t('security.edit')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: spacing.xxxl * 2 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: colors.grayBG },
  scroll:  { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md },
  sectionTitle: {
    fontSize: typography.sizes.small, fontWeight: '700',
    color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5,
    marginTop: spacing.sm,
  },
  card: { backgroundColor: colors.white, borderRadius: radius.xl, overflow: 'hidden' },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: spacing.lg, gap: spacing.md,
  },
  borderTop: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1, minWidth: 0 },
  iconBox: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: colors.accentLight, alignItems: 'center', justifyContent: 'center',
  },
  rowTitle: { fontSize: typography.sizes.body, fontWeight: '700', color: colors.textDark, flexShrink: 1 },
  rowSub:   { fontSize: typography.sizes.tiny, color: colors.textMuted, marginTop: 2, flexShrink: 1 },
  pinForm:  { padding: spacing.lg, paddingTop: 0, gap: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  inputGroup: { gap: 4 },
  inputLabel: { fontSize: typography.sizes.tiny, fontWeight: '700', color: colors.textMuted },
  pinInput: {
    backgroundColor: colors.grayBG, borderRadius: radius.lg,
    paddingHorizontal: spacing.md, height: 48,
    borderWidth: 1, borderColor: colors.border,
    fontSize: typography.sizes.body, color: colors.textDark, fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: colors.primaryDeep, borderRadius: radius.lg,
    paddingVertical: 12, alignItems: 'center', justifyContent: 'center',
    marginTop: 4,
  },
  saveBtnText: { color: colors.white, fontWeight: '700', fontSize: typography.sizes.small },
  linkPill: {
    backgroundColor: colors.accentLight, paddingHorizontal: spacing.md,
    paddingVertical: 6, borderRadius: radius.pill,
  },
  linkText: { color: colors.primaryDeep, fontWeight: '700', fontSize: typography.sizes.tiny },
});
