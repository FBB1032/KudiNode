import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, TrendingUp, Banknote, Search, ArrowUpRight, UserCheck, AlertTriangle, XCircle, X, ScrollText, History, ShieldCheck, Clock } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useAdmin } from '../context/AdminContext'

const BASE_TABS = ['Savings Groups & Circles', 'Esusu Contributions', 'Group Health Index']

const COOP_AUDIT_LOGS = [
  { id: 'COP-AUD-101', group: 'Alaba Market Women Assoc.', action: 'Monthly Esusu Disbursement Approved', officer: 'Super Admin', amount: '₦3,993,600', time: '24 May 2026, 12:30', details: 'Payout rotation cycle #4 approved to recipient batch after meeting 100% savings quota.', badge: 'badge-success' },
  { id: 'COP-AUD-102', group: 'Ikeja Business Cluster', action: 'Health Status Flagged Critical', officer: 'Ahmad Lawal (Risk Officer)', amount: '—', time: '23 May 2026, 15:40', details: 'Automated alarm: 3 consecutive missed contribution cycles from 5 cluster members.', badge: 'badge-danger' },
  { id: 'COP-AUD-103', group: 'Lekki Traders Union', action: 'Settlement Account Updated', officer: 'Peace Okon (Operations Manager)', amount: '—', time: '22 May 2026, 10:15', details: 'Collection bank node moved to dedicated GTBank Corporate Escrow Account #0234567890.', badge: 'badge-info' },
  { id: 'COP-AUD-104', group: 'Surulere Women Fund', action: 'New Esusu Circle Registered', officer: 'Peace Okon (Operations Manager)', amount: '₦162,800/mo', time: '20 May 2026, 17:00', details: '41 market women onboarded with Tier-1 collective guarantee.', badge: 'badge-purple' },
]

const kpis = [
  { label: 'Total Co-op Groups',  value: '156',    sub: '+12 this month',  accent: '#8B5CF6', bg: 'bg-violet-50 dark:bg-violet-900/20',  text: 'text-violet-600 dark:text-violet-400',   icon: <Users size={18} /> },
  { label: 'Total Members',       value: '4,782',  sub: '+8.3% this month', accent: '#3B82F6', bg: 'bg-blue-50 dark:bg-blue-900/20',      text: 'text-blue-600 dark:text-blue-400',       icon: <Users size={18} /> },
  { label: 'Total Contributions', value: '₦24.6M', sub: '+14.7% MTD',       accent: '#10B981', bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', icon: <Banknote size={18} /> },
  { label: 'Avg Contribution',    value: '₦5,130', sub: '+5.2% this month', accent: '#F59E0B', bg: 'bg-amber-50 dark:bg-amber-900/20',    text: 'text-amber-600 dark:text-amber-400',     icon: <TrendingUp size={18} /> },
]

export interface GroupItem {
  id: string
  name: string
  members: number
  contribution: string
  health: 'Healthy' | 'At Risk' | 'Critical'
  status: 'Active' | 'Pending' | 'Inactive'
  accountNumber: string
  bankName: string
}

const INITIAL_GROUPS: GroupItem[] = [
  { id: 'GRP-101', name: 'Alaba Market Women Assoc.', members: 32, contribution: '₦124,800', health: 'Healthy',  status: 'Active',   accountNumber: '0129384756', bankName: 'Wema Bank PLC' },
  { id: 'GRP-102', name: 'Lekki Traders Union',       members: 28, contribution: '₦98,240',  health: 'Healthy',  status: 'Active',   accountNumber: '0234567890', bankName: 'GTBank PLC' },
  { id: 'GRP-103', name: 'Surulere Business Circle',  members: 45, contribution: '₦176,250', health: 'Healthy',  status: 'Active',   accountNumber: '0567890123', bankName: 'Zenith Bank PLC' },
  { id: 'GRP-104', name: 'Yaba Entrepreneurs Group',  members: 19, contribution: '₦76,380',  health: 'At Risk',  status: 'Active',   accountNumber: '0987654321', bankName: 'Access Bank PLC' },
  { id: 'GRP-105', name: 'Apapa Merchant Network',    members: 38, contribution: '₦148,620', health: 'Healthy',  status: 'Active',   accountNumber: '0876543210', bankName: 'First Bank' },
  { id: 'GRP-106', name: 'Mushin Traders Coop',       members: 22, contribution: '₦43,200',  health: 'At Risk',  status: 'Pending',  accountNumber: '0765432109', bankName: 'Kuda MFB' },
  { id: 'GRP-107', name: 'Ikeja Business Cluster',    members: 14, contribution: '₦21,000',  health: 'Critical', status: 'Inactive', accountNumber: '0654321098', bankName: 'OPay' },
  { id: 'GRP-108', name: 'Surulere Women Fund',       members: 41, contribution: '₦162,800', health: 'Healthy',  status: 'Active',   accountNumber: '0543210987', bankName: 'Moniepoint MFB' },
]

const contributions = [
  { name: 'Amina Bello',    group: 'Alaba Market Women', amount: '₦8,200', date: '24 May 2026', initials: 'AB', color: 'bg-violet-500' },
  { name: 'Ngozi Chukwu',   group: 'Surulere Business',  amount: '₦7,050', date: '24 May 2026', initials: 'NC', color: 'bg-blue-500' },
  { name: 'Tayo Abiodun',   group: 'Lekki Traders',      amount: '₦5,500', date: '23 May 2026', initials: 'TA', color: 'bg-emerald-500' },
  { name: 'Taiwo Adeyemi',  group: 'Apapa Network',       amount: '₦6,400', date: '23 May 2026', initials: 'TA', color: 'bg-amber-500' },
]

const healthData = [
  { name: 'Healthy',  value: 82, color: '#10B981' },
  { name: 'At Risk',  value: 14, color: '#F59E0B' },
  { name: 'Critical', value: 4,  color: '#EF4444' },
]

function HealthBadge({ h }: { h: string }) {
  if (h === 'Healthy')  return <span className="badge-success"><UserCheck size={9} />{h}</span>
  if (h === 'At Risk')  return <span className="badge-warning"><AlertTriangle size={9} />{h}</span>
  return <span className="badge-danger"><XCircle size={9} />{h}</span>
}
function StatusBadge({ s }: { s: string }) {
  if (s === 'Active')   return <span className="badge-success">{s}</span>
  if (s === 'Pending')  return <span className="badge-warning">{s}</span>
  return <span className="badge-slate">{s}</span>
}

const c = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
const it = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.2 } } }

export default function CoopScreen() {
  const { isSuperAdmin } = useAdmin()
  const TABS = isSuperAdmin ? [...BASE_TABS, 'Audit Trail'] : BASE_TABS
  const [tab, setTab] = useState(0)
  const [groupsList] = useState<GroupItem[]>(INITIAL_GROUPS)
  const [search, setSearch] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<GroupItem | null>(null)

  const filtered = groupsList.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.accountNumber.includes(search)
  )

  return (
    <motion.div variants={c} initial="hidden" animate="show" className="space-y-4">
      <motion.div variants={it} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Co-Op & Esusu Management</h2>
          <p className="text-[12px] text-slate-400 mt-0.5">Monitor savings groups, esusu contributions, and group health index</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={it} className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`px-4 py-3 text-[13px] font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5 ${tab===i ? 'border-violet-600 text-violet-600 dark:text-violet-400 dark:border-violet-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            {t === 'Audit Trail' && <ScrollText size={13} />}
            {t}
            {t === 'Audit Trail' && (
              <span className="px-1.5 py-0.2 rounded-full bg-violet-500/20 text-violet-400 text-[10px] font-bold">
                Super Admin
              </span>
            )}
          </button>
        ))}
      </motion.div>

      {TABS[tab] === 'Audit Trail' && isSuperAdmin ? (
        <motion.div variants={it} className="card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <History size={16} className="text-violet-500" />
                Co-Operative & Esusu Governance Audit Trail
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Audit trail of collective pool payouts, member status modifications, and escrow adjustments
              </p>
            </div>
            <span className="badge-purple">Immutable Ledger</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  {['Audit ID', 'Co-Op Circle', 'Operation Event', 'Amount', 'Audit Details', 'Authorizing Officer', 'Timestamp'].map(h => (
                    <th key={h} className="table-head-cell">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {COOP_AUDIT_LOGS.map(log => (
                  <tr key={log.id} className="table-row">
                    <td className="table-cell font-mono text-[11px] font-bold text-slate-500">{log.id}</td>
                    <td className="table-cell font-bold text-slate-900 dark:text-white text-xs whitespace-nowrap">{log.group}</td>
                    <td className="table-cell whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${log.badge}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="table-cell font-mono font-bold text-xs text-slate-900 dark:text-white whitespace-nowrap">
                      {log.amount}
                    </td>
                    <td className="table-cell text-[11px] text-slate-600 dark:text-slate-300 max-w-xs">
                      {log.details}
                    </td>
                    <td className="table-cell text-xs text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
                      {log.officer}
                    </td>
                    <td className="table-cell text-[11px] text-slate-400 whitespace-nowrap font-mono">
                      {log.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      ) : (
        <>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map(k => (
          <motion.div key={k.label} variants={it} className="kpi-card" style={{ '--kpi-color': k.accent } as any}>
            <div className="flex items-start justify-between mb-3">
              <span className={`p-2.5 rounded-xl ${k.bg} ${k.text}`}>{k.icon}</span>
            </div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{k.label}</p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-0.5">{k.value}</p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1 font-semibold"><TrendingUp size={10} />{k.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Table + Right col */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <motion.div variants={it} className="card overflow-hidden xl:col-span-2">
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 flex-1 input py-2">
              <Search size={13} className="text-slate-400 flex-shrink-0" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search groups by name or account..." className="bg-transparent text-[13px] placeholder:text-slate-400 outline-none flex-1 text-slate-700 dark:text-slate-300" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                <tr>{['Group Name','Collection Account','Members','Contributions','Health','Status','Action'].map(h => <th key={h} className="table-head-cell">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {filtered.map((g) => (
                  <tr key={g.id} className="table-row">
                    <td className="table-cell font-semibold text-slate-900 dark:text-white text-[13px]">{g.name}</td>
                    <td className="table-cell">
                      <p className="font-mono text-[12px] font-bold text-slate-800 dark:text-slate-200">{g.accountNumber}</p>
                      <p className="text-[10px] text-slate-400">{g.bankName}</p>
                    </td>
                    <td className="table-cell text-slate-500">{g.members}</td>
                    <td className="table-cell font-semibold text-slate-800 dark:text-slate-200">{g.contribution}</td>
                    <td className="table-cell"><HealthBadge h={g.health} /></td>
                    <td className="table-cell"><StatusBadge s={g.status} /></td>
                    <td className="table-cell">
                      <button onClick={() => setSelectedGroup(g)} className="btn-outline h-8 px-3 text-[11px] text-violet-600">Inspect</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <div className="space-y-4">
          {/* Recent Contributions */}
          <motion.div variants={it} className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-slate-900 dark:text-white">Recent Contributions</p>
              <button className="text-[11px] text-violet-600 dark:text-violet-400 font-semibold flex items-center gap-0.5 hover:underline">View all<ArrowUpRight size={11} /></button>
            </div>
            <div className="space-y-3">
              {contributions.map((c, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full ${c.color} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>{c.initials}</div>
                    <div>
                      <p className="text-[12px] font-semibold text-slate-800 dark:text-slate-200">{c.name}</p>
                      <p className="text-[10px] text-slate-400">{c.group}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] font-bold text-emerald-600 dark:text-emerald-400">{c.amount}</p>
                    <p className="text-[10px] text-slate-400">{c.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Health Chart */}
          <motion.div variants={it} className="card p-5">
            <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">Group Health Index</p>
            <p className="text-[11px] text-slate-400 mb-3">Based on contribution & repayment data</p>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={healthData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={4}>
                  {healthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
      </>
      )}

      {/* Inspect Group Modal */}
      <AnimatePresence>
        {selectedGroup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{selectedGroup.name}</h3>
                <button onClick={() => setSelectedGroup(null)} className="btn-icon p-1"><X size={16} /></button>
              </div>

              <div className="space-y-2.5 text-[12px]">
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Collection Account</span>
                  <span className="font-bold font-mono text-slate-900 dark:text-white">{selectedGroup.accountNumber} ({selectedGroup.bankName})</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Active Members</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedGroup.members} Members</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Monthly Contribution</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedGroup.contribution}</span>
                </div>
              </div>

              <button onClick={() => setSelectedGroup(null)} className="btn-primary w-full text-[12px]">Close Inspection</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
