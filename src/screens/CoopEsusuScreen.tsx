import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Modal, FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, typography, shadows } from '../theme/theme';
import { TopHeader } from '../components/TopHeader';
import { Icon } from '../components/Icon';
import { Avatar } from '../components/Avatar';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// User's Enrolled Co-op Groups / Contributions
const MY_CONTRIBUTIONS = [
  {
    id: 'grp-1',
    title: 'Mushin Grains Traders Esusu',
    amount: '5,000',
    cycle: 'Monthly',
    accountNumber: '0129384756',
    bankName: 'Wema Bank PLC',
    recipientName: 'Mushin Grains Esusu Pool',
    status: 'Due Jul 31',
    membersCount: 32,
  },
  {
    id: 'grp-2',
    title: 'Ketu Foodstuffs Circle',
    amount: '10,000',
    cycle: 'Monthly',
    accountNumber: '0234567890',
    bankName: 'GTBank PLC',
    recipientName: 'Ketu Traders Esusu Pool',
    status: 'Paid Jul 01',
    membersCount: 15,
  },
  {
    id: 'grp-3',
    title: 'Yaba Provisions Syndicate',
    amount: '15,000',
    cycle: 'Monthly',
    accountNumber: '0567890123',
    bankName: 'Zenith Bank PLC',
    recipientName: 'Yaba Syndicate Collection',
    status: 'Due Aug 15',
    membersCount: 20,
  },
];

const MEMBERS = [
  { id: 1, name: 'Amina Bello',      role: 'Coordinator', paid: true,  amount: '₦5,000' },
  { id: 2, name: 'Emeka Eze',        role: 'Member',      paid: true,  amount: '₦5,000' },
  { id: 3, name: 'Fatima Usman',     role: 'Member',      paid: false, amount: 'Pending' },
  { id: 4, name: 'Chidi Okafor',     role: 'Member',      paid: true,  amount: '₦5,000' },
  { id: 5, name: 'Ngozi Adeyemi',    role: 'Member',      paid: false, amount: 'Pending' },
  { id: 6, name: 'Tunde Adesanya',   role: 'Treasurer',   paid: true,  amount: '₦5,000' },
  { id: 7, name: 'Bisi Akande',      role: 'Member',      paid: true,  amount: '₦5,000' },
  { id: 8, name: 'Kabeer Sani',      role: 'Member',      paid: false, amount: 'Pending' },
];

const ROUNDS = [
  { round: 'Jul 2026', recipient: 'Emeka Eze',    total: '₦160,000', status: 'active'  },
  { round: 'Jun 2026', recipient: 'Amina Bello',  total: '₦160,000', status: 'paid'    },
  { round: 'May 2026', recipient: 'Fatima Usman', total: '₦160,000', status: 'paid'    },
];

export function CoopEsusuScreen() {
  const nav = useNavigation<Nav>();
  const [tab, setTab] = useState<'overview' | 'groups' | 'members' | 'rounds'>('overview');
  const [showPayModal, setShowPayModal] = useState(false);

  const handleSelectContributionToPay = (group: typeof MY_CONTRIBUTIONS[0]) => {
    setShowPayModal(false);
    nav.navigate('TransferPin', {
      prefilledAccount: group.accountNumber,
      prefilledBank: group.bankName,
      prefilledRecipient: group.recipientName,
      prefilledAmount: group.amount,
    });
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDeep} translucent={false} />
      <TopHeader
        showBack
        title="Co-op Esusu"
        subtitle="Mushin Market Node · 32 Members"
        rightSlot={
          <TouchableOpacity style={styles.headerBtn} onPress={() => nav.navigate('CoopCreate')}>
            <Icon name="plus" size={20} color={colors.white} />
          </TouchableOpacity>
        }
      />

      {/* Stats strip */}
      <LinearGradient
        colors={[colors.primaryMid, colors.primaryDeep]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.statsStrip}
      >
        <View style={styles.stripStat}>
          <Text style={styles.stripValue}>₦160,000</Text>
          <Text style={styles.stripLabel}>Pool This Round</Text>
        </View>
        <View style={styles.stripSep} />
        <View style={styles.stripStat}>
          <Text style={styles.stripValue}>32</Text>
          <Text style={styles.stripLabel}>Active Members</Text>
        </View>
        <View style={styles.stripSep} />
        <View style={styles.stripStat}>
          <Text style={styles.stripValue}>₦5,000</Text>
          <Text style={styles.stripLabel}>Monthly Contrib.</Text>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['overview', 'groups', 'members', 'rounds'] as const).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
            onPress={() => setTab(t)}
            activeOpacity={0.75}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'groups' ? 'My Groups' : t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Overview ── */}
        {tab === 'overview' && (
          <>
            {/* My contribution summary card */}
            <View style={[styles.card, shadows.card]}>
              <Text style={styles.cardTitle}>My Contribution Status</Text>
              <View style={styles.contribRow}>
                <View style={styles.contribStat}>
                  <Text style={styles.contribAmount}>₦20,000</Text>
                  <Text style={styles.contribLabel}>Total Paid (4 cycles)</Text>
                </View>
                <View style={styles.contribBadge}>
                  <Icon name="checkmark-circle" size={16} color={colors.successGreen} />
                  <Text style={styles.contribBadgeText}>Up to date</Text>
                </View>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '60%' }]} />
              </View>
              <Text style={styles.progressNote}>Next payout in 3 rounds · Estimated Oct 2026</Text>
            </View>

            {/* Pay now CTA (Triggers Modal to select group contribution) */}
            <TouchableOpacity
              style={[styles.payBtn, shadows.button]}
              onPress={() => setShowPayModal(true)}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={[colors.primaryMid, colors.primaryDeep]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.payGrad}
              >
                <Icon name="send" size={18} color={colors.white} />
                <Text style={styles.payText}>Pay Contribution Now</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Enrolled Co-op Groups List */}
            <Text style={styles.sectionHeaderTitle}>My Active Contributions</Text>
            <View style={styles.groupsList}>
              {MY_CONTRIBUTIONS.map(grp => (
                <TouchableOpacity
                  key={grp.id}
                  style={[styles.groupCard, shadows.card]}
                  onPress={() => handleSelectContributionToPay(grp)}
                  activeOpacity={0.85}
                >
                  <View style={styles.groupCardIcon}>
                    <Icon name="people" size={22} color={colors.primaryDeep} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.groupCardTitle}>{grp.title}</Text>
                    <Text style={styles.groupCardSub}>
                      {grp.accountNumber} ({grp.bankName})
                    </Text>
                    <Text style={styles.groupCardMeta}>
                      {grp.membersCount} members · {grp.cycle}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.groupCardAmount}>₦{grp.amount}</Text>
                    <View style={styles.groupStatusTag}>
                      <Text style={styles.groupStatusText}>{grp.status}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* ── Groups Tab ── */}
        {tab === 'groups' && (
          <View style={{ gap: spacing.md }}>
            <Text style={styles.sectionHeaderTitle}>All Enrolled Co-op Groups</Text>
            {MY_CONTRIBUTIONS.map(grp => (
              <View key={grp.id} style={[styles.groupDetailCard, shadows.card]}>
                <View style={styles.groupDetailHeader}>
                  <View style={styles.groupCardIcon}>
                    <Icon name="people" size={22} color={colors.primaryDeep} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.groupCardTitle}>{grp.title}</Text>
                    <Text style={styles.groupCardSub}>{grp.recipientName}</Text>
                  </View>
                  <Text style={styles.groupCardAmount}>₦{grp.amount}/mo</Text>
                </View>

                <View style={styles.bankAccountBox}>
                  <Icon name="bank" size={16} color={colors.primaryDeep} />
                  <Text style={styles.bankAccountText}>
                    Collection: <Text style={{ fontWeight: '800' }}>{grp.accountNumber}</Text> ({grp.bankName})
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.payGroupBtn}
                  onPress={() => handleSelectContributionToPay(grp)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.payGroupBtnText}>Pay ₦{grp.amount} Contribution</Text>
                  <Icon name="arrow-forward" size={14} color={colors.white} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* ── Members Tab ── */}
        {tab === 'members' && (
          <View style={[styles.card, shadows.card]}>
            <View style={styles.membersHeader}>
              <Text style={styles.cardTitle}>Mushin Node Roster</Text>
              <Text style={styles.membersCountBadge}>32 Active Members</Text>
            </View>
            {MEMBERS.map((m, i) => (
              <View
                key={m.id}
                style={[styles.memberRow, i < MEMBERS.length - 1 && styles.borderBottom]}
              >
                <Avatar size={38} initials={m.name.substring(0, 2).toUpperCase()} />
                <View style={styles.memberInfo}>
                  <View style={styles.memberNameRow}>
                    <Text style={styles.memberName}>{m.name}</Text>
                    {m.role !== 'Member' && (
                      <View style={styles.roleBadge}>
                        <Text style={styles.roleText}>{m.role}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.memberSub}>
                    {m.paid ? 'July Contribution Paid' : 'Pending July Payment'}
                  </Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.memberAmount, { color: m.paid ? colors.successGreen : colors.warningOrange }]}>
                    {m.amount}
                  </Text>
                  <View style={[styles.statusPill, { backgroundColor: m.paid ? '#E8FFF2' : '#FFF3E8' }]}>
                    <Text style={[styles.statusPillText, { color: m.paid ? colors.successGreen : colors.warningOrange }]}>
                      {m.paid ? 'PAID' : 'PENDING'}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── Rounds Tab ── */}
        {tab === 'rounds' && (
          <View style={[styles.card, shadows.card]}>
            <Text style={styles.cardTitle}>Rotation & Payout History</Text>
            {ROUNDS.map((r, i) => (
              <View key={r.round} style={[styles.roundRow, i < ROUNDS.length - 1 && styles.borderBottom]}>
                <View style={styles.roundLeft}>
                  <Icon
                    name={r.status === 'active' ? 'time' : 'checkmark-circle'}
                    size={22}
                    color={r.status === 'active' ? colors.warningOrange : colors.successGreen}
                  />
                  <View>
                    <Text style={styles.roundMonth}>{r.round}</Text>
                    <Text style={styles.roundRecipient}>Recipient: {r.recipient}</Text>
                  </View>
                </View>
                <Text style={styles.roundTotal}>{r.total}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: spacing.xxxl * 2 }} />
      </ScrollView>

      {/* ── CONTRIBUTION SELECTION MODAL ── */}
      <Modal visible={showPayModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, shadows.cardLg]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Contribution to Pay</Text>
              <TouchableOpacity onPress={() => setShowPayModal(false)}>
                <Icon name="close" size={22} color={colors.textDark} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSub}>
              Select which Co-op Esusu contribution you are paying. Account details will be automatically pre-filled!
            </Text>

            <View style={{ gap: spacing.md, width: '100%', marginVertical: spacing.md }}>
              {MY_CONTRIBUTIONS.map(grp => (
                <TouchableOpacity
                  key={grp.id}
                  style={styles.modalGrpTile}
                  onPress={() => handleSelectContributionToPay(grp)}
                  activeOpacity={0.8}
                >
                  <View style={styles.groupCardIcon}>
                    <Icon name="bank" size={20} color={colors.primaryDeep} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.grpTileTitle}>{grp.title}</Text>
                    <Text style={styles.grpTileSub}>
                      {grp.accountNumber} · {grp.bankName}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.grpTileAmount}>₦{grp.amount}</Text>
                    <Text style={{ fontSize: 10, color: colors.primaryMid, fontWeight: '700' }}>Tap to Pay</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.grayBG },
  headerBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },

  statsStrip: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    paddingVertical: spacing.md, paddingHorizontal: spacing.lg,
  },
  stripStat: { alignItems: 'center' },
  stripValue: { fontSize: typography.sizes.h4, fontWeight: '800', color: colors.white },
  stripLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 1 },
  stripSep: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.2)' },

  tabs: {
    flexDirection: 'row', backgroundColor: colors.white,
    paddingHorizontal: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  tabBtn: { flex: 1, paddingVertical: spacing.md, alignItems: 'center' },
  tabBtnActive: { borderBottomWidth: 2, borderBottomColor: colors.primaryMid },
  tabText: { fontSize: typography.sizes.tiny, color: colors.textMuted, fontWeight: '600' },
  tabTextActive: { color: colors.primaryDeep, fontWeight: '800' },

  scroll: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.lg },

  sectionHeaderTitle: {
    fontSize: typography.sizes.h4, fontWeight: '800', color: colors.textDark, marginTop: spacing.xs,
  },

  card: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.lg },
  cardTitle: { fontSize: typography.sizes.body, fontWeight: '800', color: colors.textDark, marginBottom: spacing.sm },

  contribRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  contribStat: {},
  contribAmount: { fontSize: 28, fontWeight: '800', color: colors.primaryDeep },
  contribLabel: { fontSize: typography.sizes.tiny, color: colors.textMuted },
  contribBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#E8FFF2', paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radius.pill },
  contribBadgeText: { fontSize: typography.sizes.tiny, color: colors.successGreen, fontWeight: '700' },

  progressBar: { height: 8, backgroundColor: colors.grayBG, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primaryMid, borderRadius: 4 },
  progressNote: { fontSize: 10, color: colors.textMuted, marginTop: spacing.xs },

  payBtn: { borderRadius: radius.xl, overflow: 'hidden' },
  payGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: 15 },
  payText: { fontSize: typography.sizes.body, fontWeight: '800', color: colors.white },

  // Groups list
  groupsList: { gap: spacing.md },
  groupCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.lg,
  },
  groupCardIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.accentLight, alignItems: 'center', justifyContent: 'center' },
  groupCardTitle: { fontSize: typography.sizes.body, fontWeight: '800', color: colors.textDark },
  groupCardSub:   { fontSize: typography.sizes.tiny, color: colors.primaryMid, fontWeight: '600', marginTop: 1 },
  groupCardMeta:  { fontSize: 10, color: colors.textMuted, marginTop: 2 },
  groupCardAmount:{ fontSize: typography.sizes.body, fontWeight: '800', color: colors.primaryDeep },
  groupStatusTag: { backgroundColor: '#F3EBFB', paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.pill, marginTop: 3 },
  groupStatusText:{ fontSize: 10, color: colors.primaryDeep, fontWeight: '700' },

  groupDetailCard: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.md },
  groupDetailHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  bankAccountBox: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.grayBG, borderRadius: radius.lg, padding: spacing.md,
  },
  bankAccountText: { fontSize: typography.sizes.tiny, color: colors.textDark },
  payGroupBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: colors.primaryDeep, borderRadius: radius.lg, paddingVertical: 12,
  },
  payGroupBtnText: { fontSize: typography.sizes.small, fontWeight: '800', color: colors.white },

  // Members
  membersHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  membersCountBadge: { fontSize: typography.sizes.tiny, color: colors.primaryMid, fontWeight: '700', backgroundColor: colors.accentLight, paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.pill },
  memberRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, gap: spacing.md },
  borderBottom: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  memberInfo: { flex: 1 },
  memberNameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  memberName: { fontSize: typography.sizes.body, fontWeight: '700', color: colors.textDark },
  roleBadge: { backgroundColor: colors.accentLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.pill },
  roleText: { fontSize: 9, fontWeight: '700', color: colors.primaryDeep },
  memberSub: { fontSize: typography.sizes.tiny, color: colors.textMuted, marginTop: 2 },
  memberAmount: { fontSize: typography.sizes.small, fontWeight: '800' },
  statusPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.pill, marginTop: 2 },
  statusPillText: { fontSize: 9, fontWeight: '800' },

  // Rounds
  roundRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md },
  roundLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  roundMonth: { fontSize: typography.sizes.body, fontWeight: '700', color: colors.textDark },
  roundRecipient: { fontSize: typography.sizes.tiny, color: colors.textMuted },
  roundTotal: { fontSize: typography.sizes.body, fontWeight: '800', color: colors.primaryDeep },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: colors.white, borderTopLeftRadius: radius.xxl, borderTopRightRadius: radius.xxl, padding: spacing.xl, alignItems: 'center' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
  modalTitle: { fontSize: typography.sizes.h4, fontWeight: '800', color: colors.textDark },
  modalSub: { fontSize: typography.sizes.tiny, color: colors.textMuted, marginTop: 4, textAlign: 'left', width: '100%' },
  modalGrpTile: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.grayBG, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.xl, padding: spacing.md,
  },
  grpTileTitle: { fontSize: typography.sizes.body, fontWeight: '800', color: colors.textDark },
  grpTileSub:   { fontSize: typography.sizes.tiny, color: colors.textMuted, marginTop: 1 },
  grpTileAmount:{ fontSize: typography.sizes.body, fontWeight: '800', color: colors.primaryDeep },
});
