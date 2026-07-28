/**
 * VerificationScreen — editable AI-parsed transaction details.
 * Acts as fallback for both voice and photo intakes.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar,
} from 'react-native';
import { colors, spacing, radius, typography, shadows } from '../theme/theme';
import { TopHeader } from '../components/TopHeader';
import { Icon } from '../components/Icon';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../AppNavigator';
import { useLanguage } from '../context/LanguageContext';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface Row {
  id: number;
  item: string;
  qty: number;
  price: string;
  amount: string;
}

const INITIAL_ROWS: Row[] = [
  { id: 1, item: 'Rice (10kg)',  qty: 2, price: '₦11,500', amount: '₦23,000' },
  { id: 2, item: 'Beans (4kg)', qty: 2, price: '₦3,600',  amount: '₦7,200'  },
  { id: 3, item: 'Oil (1L)',    qty: 1, price: '₦3,500',  amount: '₦3,500'  },
  { id: 4, item: 'Salt (1kg)',  qty: 1, price: '₦1,000',  amount: '₦1,000'  },
];

function parseN(s: string) {
  return parseInt(s.replace(/[^0-9]/g, ''), 10) || 0;
}

export function VerificationScreen() {
  const { t } = useLanguage();
  const nav = useNavigation<Nav>();
  const [rows, setRows] = useState<Row[]>(INITIAL_ROWS);
  const [editId, setEditId] = useState<number | null>(null);
  const [editVals, setEditVals] = useState<Partial<Row>>({});

  const total = rows.reduce((s, r) => s + parseN(r.amount), 0);

  const startEdit = (r: Row) => { setEditId(r.id); setEditVals({ ...r }); };

  const saveEdit = () => {
    if (editId != null) {
      const qty = editVals.qty ?? 1;
      const price = parseN(editVals.price ?? '0');
      const computed = qty * price;
      setRows(prev => prev.map(r =>
        r.id === editId
          ? { ...r, item: editVals.item || r.item, qty, price: `₦${price.toLocaleString()}`, amount: `₦${computed.toLocaleString()}` }
          : r
      ));
    }
    setEditId(null); setEditVals({});
  };

  const deleteRow = (id: number) => setRows(prev => prev.filter(r => r.id !== id));

  const addRow = () => {
    const newId = Date.now();
    setRows(prev => [...prev, { id: newId, item: 'New item', qty: 1, price: '₦0', amount: '₦0' }]);
    setTimeout(() => setEditId(newId), 50);
  };

  const handleConfirm = () => {
    nav.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDeep} translucent={false} />
      <TopHeader
        showBack
        title="Verify Transaction"
        subtitle="Review, edit & confirm sale details"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* AI parsed label */}
        <View style={styles.aiBadge}>
          <Icon name="shield-checkmark" size={14} color={colors.primaryMid} />
          <Text style={styles.aiText}>AI-parsed from voice/scan · Review and correct if needed</Text>
        </View>

        {/* Items card */}
        <View style={[styles.card, shadows.card]}>
          <View style={styles.cardHead}>
            <Text style={styles.cardTitle}>Sale Items</Text>
            <TouchableOpacity style={styles.addBtn} onPress={addRow} activeOpacity={0.8}>
              <Icon name="plus" size={16} color={colors.primaryMid} />
              <Text style={styles.addBtnText}>Add item</Text>
            </TouchableOpacity>
          </View>

          {/* Table header */}
          <View style={styles.tableHead}>
            <Text style={[styles.th, { flex: 2 }]}>Item</Text>
            <Text style={[styles.th, { flex: 0.7, textAlign: 'center' as const }]}>Qty</Text>
            <Text style={[styles.th, { flex: 1.2, textAlign: 'right' as const }]}>Price</Text>
            <Text style={[styles.th, { flex: 1.2, textAlign: 'right' as const }]}>Total</Text>
            <View style={{ width: 52 }} />
          </View>

          {rows.map((row, i) => {
            const isEditing = editId === row.id;
            return (
              <View key={row.id} style={[styles.tableRow, i < rows.length - 1 && styles.rowBorder,
                isEditing && styles.rowEditing]}>
                {isEditing ? (
                  /* EDIT STATE */
                  <>
                    <TextInput
                      style={[styles.editInput, { flex: 2 }]}
                      value={editVals.item}
                      onChangeText={v => setEditVals(p => ({ ...p, item: v }))}
                      placeholder="Item name"
                      autoFocus
                    />
                    <TextInput
                      style={[styles.editInput, { flex: 0.7, textAlign: 'center' as const }]}
                      value={String(editVals.qty ?? '')}
                      onChangeText={v => setEditVals(p => ({ ...p, qty: parseInt(v) || 0 }))}
                      keyboardType="numeric"
                    />
                    <TextInput
                      style={[styles.editInput, { flex: 1.2, textAlign: 'right' as const }]}
                      value={editVals.price}
                      onChangeText={v => setEditVals(p => ({ ...p, price: v }))}
                      keyboardType="numeric"
                    />
                    {/* Live calc */}
                    <Text style={[styles.td, { flex: 1.2, textAlign: 'right' as const, fontWeight: '700' }]}>
                      ₦{((editVals.qty ?? 0) * parseN(editVals.price ?? '0')).toLocaleString()}
                    </Text>
                    <View style={styles.editActions}>
                      <TouchableOpacity style={styles.saveBtn} onPress={saveEdit} activeOpacity={0.8}>
                        <Icon name="checkmark" size={13} color={colors.white} />
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  /* DISPLAY STATE */
                  <>
                    <Text style={[styles.td, { flex: 2 }]}>{row.item}</Text>
                    <Text style={[styles.td, { flex: 0.7, textAlign: 'center' as const }]}>{row.qty}</Text>
                    <Text style={[styles.td, { flex: 1.2, textAlign: 'right' as const }]}>{row.price}</Text>
                    <Text style={[styles.td, styles.tdBold, { flex: 1.2, textAlign: 'right' as const }]}>{row.amount}</Text>
                    <View style={styles.editActions}>
                      <TouchableOpacity style={styles.editBtn} onPress={() => startEdit(row)} activeOpacity={0.7}>
                        <Icon name="settings" size={13} color={colors.primaryMid} />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.delBtn} onPress={() => deleteRow(row.id)} activeOpacity={0.7}>
                        <Icon name="close" size={11} color={colors.warningOrange} />
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            );
          })}

          {/* Total row */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalValue}>₦{total.toLocaleString()}</Text>
          </View>
        </View>

        {/* Merchant note */}
        <View style={[styles.card, shadows.card]}>
          <Text style={styles.cardTitle}>Merchant Note (Optional)</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="e.g. Wholesale buyer, credit sale, market day..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Confirm CTA */}
        <TouchableOpacity style={[styles.confirmBtn, shadows.button]} onPress={handleConfirm} activeOpacity={0.88}>
          <LinearGradient
            colors={[colors.successGreen, '#166534']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.confirmGrad}
          >
            <Icon name="checkmark-circle" size={22} color={colors.white} />
            <Text style={styles.confirmText}>Confirm & Save to Ledger</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.editAgainBtn} onPress={() => nav.goBack()} activeOpacity={0.75}>
          <Icon name="refresh" size={16} color={colors.textMuted} />
          <Text style={styles.editAgainText}>Scan or speak again</Text>
        </TouchableOpacity>

        <View style={{ height: spacing.xxxl * 2 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:  { flex: 1, backgroundColor: colors.grayBG },
  scroll:{ flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.lg },
  aiBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.accentLight,
    paddingHorizontal: spacing.md, paddingVertical: 8,
    borderRadius: radius.lg,
  },
  aiText: { fontSize: typography.sizes.small, color: colors.primaryMid, fontWeight: '600', flex: 1 },
  card: { backgroundColor: colors.white, borderRadius: radius.xl, overflow: 'hidden' },
  cardHead: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: spacing.lg, paddingBottom: spacing.md,
  },
  cardTitle: { fontSize: typography.sizes.h4, fontWeight: '800', color: colors.textDark },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.accentLight, paddingHorizontal: spacing.md,
    paddingVertical: 6, borderRadius: radius.pill,
  },
  addBtnText: { fontSize: typography.sizes.tiny, fontWeight: '700', color: colors.primaryMid },
  tableHead: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingBottom: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  th: {
    fontSize: typography.sizes.tiny, fontWeight: '700',
    color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.4,
  },
  tableRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: 4,
    minHeight: 48,
  },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  rowEditing:{ backgroundColor: '#F9F5FF' },
  td:       { fontSize: typography.sizes.small, color: colors.textDark },
  tdBold:   { fontWeight: '700' },
  editInput: {
    fontSize: typography.sizes.small, color: colors.textDark,
    backgroundColor: colors.grayBG, borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 4,
    borderWidth: 1, borderColor: colors.primaryMid,
  },
  editActions: { width: 52, flexDirection: 'row', justifyContent: 'flex-end', gap: 4 },
  editBtn: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: colors.accentLight, alignItems: 'center', justifyContent: 'center',
  },
  delBtn: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: '#FFF3E8', alignItems: 'center', justifyContent: 'center',
  },
  saveBtn: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: colors.successGreen, alignItems: 'center', justifyContent: 'center',
  },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    margin: spacing.lg, marginTop: 0,
    borderTopWidth: 2, borderTopColor: colors.textDark,
    paddingTop: spacing.md,
  },
  totalLabel:{ fontSize: typography.sizes.small, fontWeight: '800', color: colors.textDark, letterSpacing: 0.5 },
  totalValue:{ fontSize: typography.sizes.h3, fontWeight: '800', color: colors.primaryDeep },
  // Note
  noteInput: {
    fontSize: typography.sizes.body, color: colors.textDark,
    paddingHorizontal: spacing.lg, paddingTop: spacing.md,
    paddingBottom: spacing.md, minHeight: 80,
    textAlignVertical: 'top',
  },
  // Buttons
  confirmBtn:  { borderRadius: radius.xl, overflow: 'hidden' },
  confirmGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: 16 },
  confirmText: { fontSize: typography.sizes.body, fontWeight: '800', color: colors.white },
  editAgainBtn:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: spacing.md },
  editAgainText:{ fontSize: typography.sizes.small, color: colors.textMuted, fontWeight: '600' },
});
