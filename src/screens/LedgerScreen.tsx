/**
 * LedgerScreen — shows all saved voice-log & receipt-scan sales.
 * Export/share as CSV using expo-file-system + expo-sharing.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert,
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { colors, spacing, radius, typography, shadows } from '../theme/theme';
import { TopHeader } from '../components/TopHeader';
import { Icon } from '../components/Icon';
import { LinearGradient } from 'expo-linear-gradient';

const LEDGER_ENTRIES = [
  { id: 1,  date: 'Jul 28, 09:14', source: 'voice',  items: [{ item: 'Rice (10kg)', qty: 2, price: 11500 }, { item: 'Beans (4kg)', qty: 1, price: 3600 }], total: 26600 },
  { id: 2,  date: 'Jul 28, 08:00', source: 'scan',   items: [{ item: 'Palm Oil 1L', qty: 3, price: 3500 }, { item: 'Salt 1kg', qty: 2, price: 1000 }],    total: 12500 },
  { id: 3,  date: 'Jul 27, 14:32', source: 'voice',  items: [{ item: 'Garri 10kg', qty: 1, price: 8000 }, { item: 'Tomato paste', qty: 4, price: 800 }],  total: 11200 },
  { id: 4,  date: 'Jul 27, 10:10', source: 'scan',   items: [{ item: 'Semolina 5kg', qty: 2, price: 5000 }],                                               total: 10000 },
  { id: 5,  date: 'Jul 26, 09:00', source: 'voice',  items: [{ item: 'Maize 5kg', qty: 3, price: 2500 }, { item: 'Millet 2kg', qty: 2, price: 1500 }],    total: 10500 },
];

type Filter = 'All' | 'Voice' | 'Scan';

function buildCSV(entries: typeof LEDGER_ENTRIES) {
  const header = 'Date,Source,Item,Qty,Unit Price (₦),Line Total (₦)\n';
  const rows = entries
    .flatMap(e =>
      e.items.map(it =>
        `"${e.date}","${e.source === 'voice' ? 'Voice Log' : 'Receipt Scan'}","${it.item}",${it.qty},${it.price},${it.qty * it.price}`
      )
    )
    .join('\n');
  return header + rows;
}

export function LedgerScreen() {
  const [filter, setFilter] = useState<Filter>('All');
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = LEDGER_ENTRIES.filter(e => {
    if (filter === 'Voice') return e.source === 'voice';
    if (filter === 'Scan')  return e.source === 'scan';
    return true;
  });

  const totalRevenue = filtered.reduce((s, e) => s + e.total, 0);

  const handleExport = async () => {
    try {
      const csv = buildCSV(filtered);
      const fileName = 'KudiNode_Ledger.csv';
      const fileUri = (FileSystem.documentDirectory ?? '') + fileName;
      await FileSystem.writeAsStringAsync(fileUri, csv);
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export KudiNode Sales Ledger',
        });
      } else {
        Alert.alert('Exported', `Ledger saved successfully.`);
      }
    } catch (err) {
      Alert.alert('Export Error', 'Could not export ledger. Please try again.');
    }
  };

  return (
    <View style={styles.root}>
      <TopHeader
        showBack
        title="Sales Ledger"
        subtitle="Voice logs & receipt scans"
        rightSlot={
          <TouchableOpacity style={styles.exportBtn} onPress={handleExport} activeOpacity={0.8}>
            <Icon name="send" size={16} color={colors.white} />
          </TouchableOpacity>
        }
      />

      {/* Summary strip */}
      <LinearGradient
        colors={[colors.primaryMid, colors.primaryDeep]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={styles.summaryStrip}
      >
        <View style={styles.stripStat}>
          <Text style={styles.stripValue}>{filtered.length}</Text>
          <Text style={styles.stripLabel}>Entries</Text>
        </View>
        <View style={styles.stripDivider} />
        <View style={styles.stripStat}>
          <Text style={styles.stripValue}>
            ₦{totalRevenue.toLocaleString()}
          </Text>
          <Text style={styles.stripLabel}>Total Revenue</Text>
        </View>
        <View style={styles.stripDivider} />
        <TouchableOpacity style={styles.exportStrip} onPress={handleExport} activeOpacity={0.85}>
          <Icon name="send" size={15} color={colors.white} />
          <Text style={styles.exportStripText}>Export CSV</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Filter */}
      <View style={styles.filterRow}>
        {(['All', 'Voice', 'Scan'] as Filter[]).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.pill, filter === f && styles.pillActive]}
            onPress={() => setFilter(f)}
            activeOpacity={0.75}
          >
            {f !== 'All' && (
              <Icon
                name={f === 'Voice' ? 'mic' : 'camera'}
                size={13}
                color={filter === f ? colors.white : colors.textMuted}
              />
            )}
            <Text style={[styles.pillText, filter === f && styles.pillTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {filtered.map((entry) => (
          <TouchableOpacity
            key={entry.id}
            style={[styles.card, shadows.card]}
            onPress={() => setExpanded(expanded === entry.id ? null : entry.id)}
            activeOpacity={0.85}
          >
            {/* Card Header */}
            <View style={styles.cardHead}>
              <View style={[styles.sourceIcon, { backgroundColor: entry.source === 'voice' ? '#E8FFF2' : '#FFF8E7' }]}>
                <Icon
                  name={entry.source === 'voice' ? 'mic' : 'camera'}
                  size={18}
                  color={entry.source === 'voice' ? colors.successGreen : colors.warningOrange}
                />
              </View>
              <View style={styles.cardMeta}>
                <Text style={styles.cardDate}>{entry.date}</Text>
                <View style={styles.cardBadge}>
                  <Text style={[styles.cardBadgeText, { color: entry.source === 'voice' ? colors.successGreen : colors.warningOrange }]}>
                    {entry.source === 'voice' ? 'Voice Log' : 'Receipt Scan'}
                  </Text>
                </View>
              </View>
              <View style={styles.cardRight}>
                <Text style={styles.cardTotal}>₦{entry.total.toLocaleString()}</Text>
                <Icon
                  name={expanded === entry.id ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={colors.textMuted}
                />
              </View>
            </View>

            {/* Expanded items */}
            {expanded === entry.id && (
              <View style={styles.itemsWrap}>
                <View style={styles.itemsHeader}>
                  <Text style={[styles.itemCol, { flex: 2.2 }]}>Item</Text>
                  <Text style={[styles.itemCol, { flex: 0.8, textAlign: 'center' as const }]}>Qty</Text>
                  <Text style={[styles.itemCol, { flex: 1.3, textAlign: 'right' as const }]}>Price</Text>
                  <Text style={[styles.itemCol, { flex: 1.3, textAlign: 'right' as const }]}>Total</Text>
                </View>
                {entry.items.map((it, j) => (
                  <View key={j} style={styles.itemRow}>
                    <Text style={[styles.itemCell, { flex: 2.2 }]}>{it.item}</Text>
                    <Text style={[styles.itemCell, { flex: 0.8, textAlign: 'center' as const }]}>{it.qty}</Text>
                    <Text style={[styles.itemCell, { flex: 1.3, textAlign: 'right' as const }]}>₦{it.price.toLocaleString()}</Text>
                    <Text style={[styles.itemCell, styles.itemCellBold, { flex: 1.3, textAlign: 'right' as const }]}>
                      ₦{(it.qty * it.price).toLocaleString()}
                    </Text>
                  </View>
                ))}
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Entry Total</Text>
                  <Text style={styles.totalValue}>₦{entry.total.toLocaleString()}</Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {filtered.length === 0 && (
          <View style={styles.empty}>
            <Icon name="receipt" size={48} color={colors.border} />
            <Text style={styles.emptyTitle}>No entries found</Text>
            <Text style={styles.emptySub}>Log a voice sale or scan a receipt to see it here.</Text>
          </View>
        )}

        <View style={{ height: spacing.xxxl * 2 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: colors.grayBG },
  exportBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  summaryStrip: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingVertical: spacing.lg,
  },
  stripStat: { alignItems: 'center' },
  stripValue: { fontSize: typography.sizes.h3, fontWeight: '800', color: colors.white },
  stripLabel: { fontSize: typography.sizes.tiny, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  stripDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.2)' },
  exportStrip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: spacing.md, paddingVertical: 8,
    borderRadius: radius.pill,
  },
  exportStripText: { color: colors.white, fontWeight: '700', fontSize: typography.sizes.small },
  filterRow: {
    flexDirection: 'row', gap: spacing.sm,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: spacing.md, paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1, borderColor: colors.border,
  },
  pillActive:     { backgroundColor: colors.primaryDeep, borderColor: colors.primaryDeep },
  pillText:       { fontSize: typography.sizes.small, fontWeight: '600', color: colors.textMuted },
  pillTextActive: { color: colors.white },
  scroll:   { flex: 1 },
  content:  { padding: spacing.lg, gap: spacing.sm },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  cardHead: {
    flexDirection: 'row', alignItems: 'center',
    padding: spacing.lg, gap: spacing.md,
  },
  sourceIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cardMeta:   { flex: 1 },
  cardDate:   { fontSize: typography.sizes.body, fontWeight: '700', color: colors.textDark },
  cardBadge:  { marginTop: 3 },
  cardBadgeText: { fontSize: typography.sizes.tiny, fontWeight: '700' },
  cardRight:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardTotal:  { fontSize: typography.sizes.h4, fontWeight: '800', color: colors.textDark },
  // Items table
  itemsWrap: {
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border,
    padding: spacing.lg, paddingTop: spacing.md, gap: 2,
  },
  itemsHeader: { flexDirection: 'row', marginBottom: spacing.sm },
  itemCol: {
    fontSize: typography.sizes.tiny, fontWeight: '700',
    color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.4,
  },
  itemRow:     { flexDirection: 'row', paddingVertical: 4 },
  itemCell:    { fontSize: typography.sizes.small, color: colors.textDark },
  itemCellBold:{ fontWeight: '700' },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    borderTopWidth: 1.5, borderTopColor: colors.textDark,
    marginTop: spacing.sm, paddingTop: spacing.sm,
  },
  totalLabel: { fontSize: typography.sizes.small, fontWeight: '700', color: colors.textDark },
  totalValue: { fontSize: typography.sizes.body, fontWeight: '800', color: colors.primaryDeep },
  // Empty state
  empty: { alignItems: 'center', paddingTop: 80, gap: spacing.md },
  emptyTitle: { fontSize: typography.sizes.h3, fontWeight: '800', color: colors.textDark },
  emptySub:   { fontSize: typography.sizes.body, color: colors.textMuted, textAlign: 'center' },
});
