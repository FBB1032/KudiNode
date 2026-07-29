/**
 * VerificationScreen — editable AI-parsed transaction details.
 * Pixel-perfect aligned paddings and headers for iOS & Android.
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

        {/* Sale Items Card */}
        <View style={[styles.card, shadows.card]}>
          {/* Card Header */}
          <View style={styles.cardHead}>
            <Text style={styles.cardTitle}>Sale Items</Text>
            <TouchableOpacity style={styles.addBtn} onPress={addRow} activeOpacity={0.8}>
              <Icon name="plus" size={13} color={colors.primaryMid} />
              <Text style={styles.addBtnText}>Add item</Text>
            </TouchableOpacity>
          </View>

          {/* Table Header (Exact 1:1 match with rows) */}
          <View style={styles.tableHead}>
            <Text style={[styles.th, { flex: 2.2 }]}>ITEM</Text>
            <Text style={[styles.th, { width: 36, textAlign: 'center' as const }]}>QTY</Text>
            <Text style={[styles.th, { flex: 1.25, textAlign: 'right' as const }]}>PRICE</Text>
            <Text style={[styles.th, { flex: 1.25, textAlign: 'right' as const }]}>TOTAL</Text>
            <View style={{ width: 52 }} />
          </View>

          {/* Table Rows */}
          {rows.map((row, i) => {
            const isEditing = editId === row.id;
            return (
              <View
                key={row.id}
                style={[
                  styles.tableRow,
                  i < rows.length - 1 && styles.rowBorder,
                  isEditing && styles.rowEditing,
                ]}
              >
                {isEditing ? (
                  /* EDIT STATE */
                  <>
                    <TextInput
                      style={[styles.editInput, { flex: 2.2 }]}
                      value={editVals.item}
                      onChangeText={v => setEditVals(p => ({ ...p, item: v }))}
                      placeholder="Item name"
                      autoFocus
                    />
                    <TextInput
                      style={[styles.editInput, { width: 36, textAlign: 'center' as const }]}
                      value={String(editVals.qty ?? '')}
                      onChangeText={v => setEditVals(p => ({ ...p, qty: parseInt(v) || 0 }))}
                      keyboardType="numeric"
                    />
                    <TextInput
                      style={[styles.editInput, { flex: 1.25, textAlign: 'right' as const }]}
                      value={editVals.price}
                      onChangeText={v => setEditVals(p => ({ ...p, price: v }))}
                      keyboardType="numeric"
                    />
                    <Text style={[styles.td, styles.tdBold, { flex: 1.25, textAlign: 'right' as const }]} numberOfLines={1}>
                      ₦{((editVals.qty ?? 0) * parseN(editVals.price ?? '0')).toLocaleString()}
                    </Text>
                    <View style={styles.editActions}>
                      <TouchableOpacity style={styles.saveBtn} onPress={saveEdit} activeOpacity={0.8}>
                        <Icon name="checkmark" size={12} color={colors.white} />
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  /* DISPLAY STATE */
                  <>
                    <Text style={[styles.td, { flex: 2.2 }]} numberOfLines={1}>{row.item}</Text>
                    <Text style={[styles.td, { width: 36, textAlign: 'center' as const }]} numberOfLines={1}>{row.qty}</Text>
                    <Text style={[styles.td, { flex: 1.25, textAlign: 'right' as const }]} numberOfLines={1}>{row.price}</Text>
                    <Text style={[styles.td, styles.tdBold, { flex: 1.25, textAlign: 'right' as const }]} numberOfLines={1}>{row.amount}</Text>
                    <View style={styles.editActions}>
                      <TouchableOpacity style={styles.editBtn} onPress={() => startEdit(row)} activeOpacity={0.7}>
                        <Icon name="settings" size={12} color={colors.primaryMid} />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.delBtn} onPress={() => deleteRow(row.id)} activeOpacity={0.7}>
                        <Icon name="close" size={10} color={colors.warningOrange} />
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            );
          })}

          {/* Total Row */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalValue}>₦{total.toLocaleString()}</Text>
          </View>
        </View>

        {/* Merchant Note Card */}
        <View style={[styles.card, shadows.card]}>
          <Text style={styles.noteTitle}>Merchant Note (Optional)</Text>
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
            <Icon name="checkmark-circle" size={20} color={colors.white} />
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
  root:   { flex: 1, backgroundColor: colors.grayBG },
  scroll: { flex: 1 },
  content:{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.lg },

  aiBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.accentLight,
    paddingHorizontal: spacing.md, paddingVertical: 8,
    borderRadius: radius.lg,
  },
  aiText: { fontSize: typography.sizes.small, color: colors.primaryMid, fontWeight: '600', flex: 1 },

  card:     { backgroundColor: colors.white, borderRadius: radius.xl, overflow: 'hidden' },
  cardHead: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm,
  },
  cardTitle: { fontSize: typography.sizes.h4, fontWeight: '800', color: colors.textDark },

  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.accentLight, paddingHorizontal: 10,
    paddingVertical: 5, borderRadius: radius.pill,
  },
  addBtnText: { fontSize: typography.sizes.tiny, fontWeight: '700', color: colors.primaryMid },

  // Table header & rows — IDENTICAL PADDING, GAPS, AND COLUMN WIDTHS
  tableHead: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: spacing.lg, paddingVertical: 8,
    backgroundColor: '#FAFAFC',
    borderTopWidth: 1, borderTopColor: colors.border,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  th: {
    fontSize: 11, fontWeight: '800',
    color: colors.textMuted, letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: spacing.lg, paddingVertical: 12,
    minHeight: 48,
  },
  rowBorder:  { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  rowEditing: { backgroundColor: '#F9F5FF' },
  td:         { fontSize: 13, color: colors.textDark, fontWeight: '600' },
  tdBold:     { fontWeight: '800', color: colors.textDark },

  editInput: {
    fontSize: 12, color: colors.textDark,
    backgroundColor: colors.grayBG, borderRadius: 6,
    paddingHorizontal: 4, paddingVertical: 3,
    borderWidth: 1, borderColor: colors.primaryMid,
  },
  editActions: { width: 52, flexDirection: 'row', justifyContent: 'flex-end', gap: 4 },
  editBtn: {
    width: 24, height: 24, borderRadius: 6,
    backgroundColor: colors.accentLight, alignItems: 'center', justifyContent: 'center',
  },
  delBtn: {
    width: 24, height: 24, borderRadius: 6,
    backgroundColor: '#FFF3E8', alignItems: 'center', justifyContent: 'center',
  },
  saveBtn: {
    width: 24, height: 24, borderRadius: 6,
    backgroundColor: colors.successGreen, alignItems: 'center', justifyContent: 'center',
  },

  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderTopWidth: 2, borderTopColor: colors.textDark,
    marginTop: spacing.xs,
  },
  totalLabel: { fontSize: typography.sizes.small, fontWeight: '800', color: colors.textDark, letterSpacing: 0.5 },
  totalValue: { fontSize: typography.sizes.h3, fontWeight: '900', color: colors.primaryDeep },

  // Merchant Note Card
  noteTitle: { fontSize: typography.sizes.h4, fontWeight: '800', color: colors.textDark, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  noteInput: {
    fontSize: typography.sizes.body, color: colors.textDark,
    paddingHorizontal: spacing.lg, paddingTop: spacing.xs,
    paddingBottom: spacing.lg, minHeight: 70,
    textAlignVertical: 'top',
  },

  // Buttons
  confirmBtn:  { borderRadius: radius.xl, overflow: 'hidden' },
  confirmGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: 16 },
  confirmText: { fontSize: typography.sizes.body, fontWeight: '800', color: colors.white },
  editAgainBtn:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: spacing.sm },
  editAgainText:{ fontSize: typography.sizes.small, color: colors.textMuted, fontWeight: '600' },
});
