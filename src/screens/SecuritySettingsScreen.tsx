import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Switch, Alert, StatusBar,
} from 'react-native';
import { colors, spacing, radius, typography, shadows } from '../theme/theme';
import { TopHeader } from '../components/TopHeader';
import { Icon } from '../components/Icon';

export function SecuritySettingsScreen() {
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled]   = useState(true);
  const [smsAlerts, setSmsAlerts]                 = useState(true);
  const [oldPin, setOldPin]                       = useState('');
  const [newPin, setNewPin]                       = useState('');
  const [showPinModal, setShowPinModal]           = useState(false);

  const handleUpdatePin = () => {
    if (newPin.length !== 4) {
      Alert.alert('Invalid PIN', 'Please enter a valid 4-digit PIN.');
      return;
    }
    Alert.alert('Success', 'Security PIN updated successfully.');
    setOldPin(''); setNewPin(''); setShowPinModal(false);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDeep} translucent={false} />
      <TopHeader showBack title="Security & PIN" subtitle="Protect your merchant account" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Authentication Options */}
        <Text style={styles.sectionTitle}>Authentication</Text>
        <View style={[styles.card, shadows.card]}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={styles.iconBox}>
                <Icon name="fingerprint" size={20} color={colors.primaryMid} />
              </View>
              <View>
                <Text style={styles.rowTitle}>Biometric Authentication</Text>
                <Text style={styles.rowSub}>Use fingerprint or Face ID for fast login</Text>
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
              <View>
                <Text style={styles.rowTitle}>Two-Factor Authentication (2FA)</Text>
                <Text style={styles.rowSub}>Require SMS code for transfers over ₦50,000</Text>
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
        <Text style={styles.sectionTitle}>Security PIN</Text>
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
              <View>
                <Text style={styles.rowTitle}>Change 4-Digit Security PIN</Text>
                <Text style={styles.rowSub}>Last updated 30 days ago</Text>
              </View>
            </View>
            <Icon name={showPinModal ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
          </TouchableOpacity>

          {showPinModal && (
            <View style={styles.pinForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Current Security PIN</Text>
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
                <Text style={styles.inputLabel}>New 4-Digit PIN</Text>
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
                <Text style={styles.saveBtnText}>Update PIN</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Limits & Notifications */}
        <Text style={styles.sectionTitle}>Transaction Safety</Text>
        <View style={[styles.card, shadows.card]}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={styles.iconBox}>
                <Icon name="bell" size={20} color={colors.primaryMid} />
              </View>
              <View>
                <Text style={styles.rowTitle}>Instant SMS Alerts</Text>
                <Text style={styles.rowSub}>Receive real-time SMS for all transfers</Text>
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
              <View>
                <Text style={styles.rowTitle}>Daily Transfer Limit</Text>
                <Text style={styles.rowSub}>Current limit: ₦500,000 / day</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.linkPill}>
              <Text style={styles.linkText}>Edit</Text>
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
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  iconBox: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: colors.accentLight, alignItems: 'center', justifyContent: 'center',
  },
  rowTitle: { fontSize: typography.sizes.body, fontWeight: '700', color: colors.textDark },
  rowSub:   { fontSize: typography.sizes.tiny, color: colors.textMuted, marginTop: 2 },
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
