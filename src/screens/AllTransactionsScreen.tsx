import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { colors, spacing, radius, typography, shadows } from '../theme/theme';
import { TopHeader } from '../components/TopHeader';
import { Icon } from '../components/Icon';

const ALL_TXN = [
  { id: 1,  label: 'Rice (10kg)',         amount: '+₦23,000',  type: 'sale',   date: 'Today 09:14',    note: 'Scan receipt'    },
  { id: 2,  label: 'Esusu Contribution',  amount: '-₦5,000',   type: 'debit',  date: 'Today 07:00',    note: 'Co-op Esusu'     },
  { id: 3,  label: 'Beans & Oil',         amount: '+₦10,700',  type: 'sale',   date: 'Yesterday 14:32',note: 'Voice log'        },
  { id: 4,  label: 'KudiNode Credit Topup',   amount: '+₦50,000',  type: 'credit', date: 'Jul 27 10:00',   note: 'Auto-disbursed'  },
  { id: 5,  label: 'Esusu Contribution',   amount: '-₦5,000',   type: 'debit',  date: 'Jul 26 07:00',   note: 'Mushin Node'     },
  { id: 6,  label: 'Soft Drinks & Juice',  amount: '+₦14,200',  type: 'sale',   date: 'Jul 24 16:20',   note: 'Voice entry'     },
  { id: 7,  label: 'Airtime & Data',       amount: '-₦2,000',   type: 'debit',  date: 'Jul 22 11:30',   note: 'MTN Topup'       },
  { id: 8,  label: 'Yam & Palm Oil',       amount: '+₦31,000',  type: 'sale',   date: 'Jul 20 13:45',   note: 'Scan entry'      },
  { id: 9,  label: 'Amara Foods',          amount: '+₦18,500',  type: 'sale',   date: 'Jul 18 10:15',   note: 'Voice entry'     },
  { id: 10, label: 'KudiNode Credit Topup',   amount: '+₦50,000',  type: 'credit', date: 'Jul 15 09:00',   note: 'Auto-disbursed'  },
];

type Filter = 'All' | 'Sales' | 'Debits' | 'Credits';

export function AllTransactionsScreen() {
  const [filter, setFilter] = useState<Filter>('All');

  const filtered = ALL_TXN.filter(t => {
    if (filter === 'All')     return true;
    if (filter === 'Sales')   return t.type === 'sale';
    if (filter === 'Debits')  return t.type === 'debit';
    if (filter === 'Credits') return t.type === 'credit';
    return true;
  });

  const getIcon = (type: string) => {
    if (type === 'sale')   return { name: 'receipt'  as const, color: colors.successGreen, bg: '#E8FFF2' };
    if (type === 'credit') return { name: 'card'     as const, color: '#1565C0',           bg: '#EBF5FF' };
    return                        { name: 'transfer' as const, color: colors.warningOrange,bg: '#FFF3E8' };
  };

  return (
    <View style={styles.root}>
      <TopHeader showBack title="All Transactions" subtitle="Complete ledger history" />

      {/* Filter pills */}
      <View style={styles.filterRow}>
        {(['All', 'Sales', 'Debits', 'Credits'] as Filter[]).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.pill, filter === f && styles.pillActive]}
            onPress={() => setFilter(f)}
            activeOpacity={0.75}
          >
            <Text style={[styles.pillText, filter === f && styles.pillTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, shadows.card]}>
          {filtered.map((txn, i) => {
            const ic = getIcon(txn.type);
            return (
              <View key={txn.id} style={[styles.row, i < filtered.length - 1 && styles.rowBorder]}>
                <View style={[styles.iconBox, { backgroundColor: ic.bg }]}>
                  <Icon name={ic.name} size={18} color={ic.color} />
                </View>
                <View style={styles.info}>
                  <Text style={styles.label}>{txn.label}</Text>
                  <Text style={styles.meta}>{txn.date} · {txn.note}</Text>
                </View>
                <Text style={[styles.amount, {
                  color: txn.type === 'debit' ? colors.warningOrange : colors.successGreen,
                }]}>
                  {txn.amount}
                </Text>
              </View>
            );
          })}
        </View>
        <View style={{ height: spacing.xxxl * 2 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: colors.grayBG },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillActive:     { backgroundColor: colors.primaryDeep, borderColor: colors.primaryDeep },
  pillText:       { fontSize: typography.sizes.small, fontWeight: '600', color: colors.textMuted },
  pillTextActive: { color: colors.white },
  scroll:         { flex: 1 },
  content:        { padding: spacing.lg },
  card:           { backgroundColor: colors.white, borderRadius: radius.xl, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  rowBorder:  { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  iconBox:    { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  info:       { flex: 1 },
  label:      { fontSize: typography.sizes.body, fontWeight: '600', color: colors.textDark },
  meta:       { fontSize: typography.sizes.tiny, color: colors.textMuted, marginTop: 2 },
  amount:     { fontSize: typography.sizes.body, fontWeight: '800' },
});
