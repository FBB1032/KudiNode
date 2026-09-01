import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle, XCircle, AlertCircle, Info, Search, SlidersHorizontal, ChevronRight,
  Building2, Calendar, Banknote, TrendingUp, X, Send, ShieldCheck, ScrollText, Clock, History
} from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { useTheme } from '../context/ThemeContext'
import { useAdmin } from '../context/AdminContext'

const BASE_TABS = ['Applications', 'Trust Score', 'Loan Approvals', 'Credit Limits', 'Disbursements']

export interface LoanApp {
  id: string
  name: string
  mid: string
  purpose: string
  amount: string
  status: 'New' | 'Under Review' | 'Approved' | 'Declined' | 'More Info'
  date: string
  trust: number
}

const INITIAL_APPS: LoanApp[] = [
  { id: 'APP-3841', name: 'Amina Bello',      mid: 'M-1042', purpose: 'Stock Expansion',      amount: '₦700,000',   status: 'Under Review', date: '24 May 2026', trust: 87 },
  { id: 'APP-3842', name: 'Babatunde Salami', mid: 'M-1043', purpose: 'Equipment Purchase',   amount: '₦250,000',   status: 'New',          date: '24 May 2026', trust: 63 },
  { id: 'APP-3843', name: 'Fatima Yusuf',     mid: 'M-1044', purpose: 'Working Capital',      amount: '₦1,200,000', status: 'Approved',     date: '23 May 2026', trust: 91 },
  { id: 'APP-3844', name: 'Chinedu Okafor',   mid: 'M-1045', purpose: 'Business Expansion',   amount: '₦450,000',   status: 'More Info',    date: '23 May 2026', trust: 44 },
  { id: 'APP-3845', name: 'Grace Adeyemi',    mid: 'M-1046', purpose: 'Inventory Restock',    amount: '₦320,000',   status: 'Approved',     date: '22 May 2026', trust: 78 },
  { id: 'APP-3846', name: 'Ibrahim Musa',     mid: 'M-1050', purpose: 'Market Stall Rent',    amount: '₦180,000',   status: 'Declined',     date: '22 May 2026', trust: 29 },
  { id: 'APP-3847', name: 'Tayo Abiodun',     mid: 'M-1048', purpose: 'Logistics Vehicle',   amount: '₦900,000',   status: 'Under Review', date: '21 May 2026', trust: 82 },
]

const CREDIT_AUDIT_LOGS = [
  { id: 'CAD-901', loanId: 'APP-3843', merchant: 'Fatima Yusuf (M-1044)', amount: '₦1,200,000', action: 'Approved & Disbursed', officer: 'Funke Abikin (Credit Analyst)', time: '23 May 2026, 14:10', details: 'Passed underwriting scoring with 91 trust rating. Wema disbursement batch #DISB-2940 executed.', badge: 'badge-success' },
  { id: 'CAD-902', loanId: 'APP-3845', merchant: 'Grace Adeyemi (M-1046)', amount: '₦320,000', action: 'Approved by Committee', officer: 'Peace Okon (Operations Manager)', time: '22 May 2026, 16:45', details: 'Working capital micro-loan approved under Ikeja market cluster guarantee.', badge: 'badge-success' },
  { id: 'CAD-903', loanId: 'APP-3846', merchant: 'Ibrahim Musa (M-1050)', amount: '₦180,000', action: 'Declined - High Default Probability', officer: 'Ahmad Lawal (Risk Officer)', time: '22 May 2026, 11:20', details: 'Credit score 29 below risk threshold of 60. Overdue loans detected in outside bureau.', badge: 'badge-danger' },
  { id: 'CAD-904', loanId: 'APP-3844', merchant: 'Chinedu Okafor (M-1045)', amount: '₦450,000', action: 'Additional Info Requested', officer: 'Funke Abikin (Credit Analyst)', time: '23 May 2026, 09:15', details: 'Requested 3 months recent POS turnover statement from Surulere store.', badge: 'badge-warning' },
  { id: 'CAD-905', loanId: 'LIMIT-402', merchant: 'Amina Bello (M-1042)', amount: '₦1,500,000', action: 'Credit Limit Increased', officer: 'Super Admin', time: '21 May 2026, 18:30', details: 'Tier-1 KYC verified + flawless 6-cycle Esusu repayment history.', badge: 'badge-purple' },
]

const radarData = [
  { metric: 'Repayment History', score: 88 },
  { metric: 'Business Size',     score: 72 },
  { metric: 'Co-op Score',       score: 91 },
  { metric: 'Cash Flow',         score: 65 },
  { metric: 'Overall Score',     score: 87 },
]

function AppBadge({ s }: { s: string }) {
  if (s === 'New')          return <span className="badge-info">New</span>
  if (s === 'Under Review') return <span className="badge-warning">Under Review</span>
  if (s === 'Approved')     return <span className="badge-success">Approved</span>
  if (s === 'Declined')     return <span className="badge-danger">Declined</span>
  return <span className="badge-purple">More Info Needed</span>
}

const c = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
const it = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.2 } } }

export default function CreditScreen() {
  const { can, isSuperAdmin } = useAdmin()
  const TABS = isSuperAdmin ? [...BASE_TABS, 'Audit Trail'] : BASE_TABS
  const [tab, setTab] = useState(0)
  const [apps, setApps] = useState<LoanApp[]>(INITIAL_APPS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sel, setSel] = useState<LoanApp>(INITIAL_APPS[0])
  const [activeModal, setActiveModal] = useState<'APPROVE' | 'DECLINE' | 'MORE_INFO' | null>(null)
  const [actionReason, setActionReason] = useState('')
  const { isDark } = useTheme()

  const grid = isDark ? '#1E293B' : '#E2E8F0'
  const tick = isDark ? '#64748B' : '#94A3B8'

  const filteredApps = apps.filter(a =>
    (a.name.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase()) || a.purpose.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter === 'All' || a.status === statusFilter)
  )

  const stages = [
    { label: 'New Applications', count: apps.filter(a => a.status === 'New').length, icon: <Info size={16} />,          bg: 'bg-blue-50 dark:bg-blue-900/20',   text: 'text-blue-600 dark:text-blue-400',   border: 'border-l-blue-500' },
    { label: 'Under Review',     count: apps.filter(a => a.status === 'Under Review').length, icon: <AlertCircle size={16} />,   bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-l-amber-500' },
    { label: 'Approved',         count: apps.filter(a => a.status === 'Approved').length, icon: <CheckCircle size={16} />,   bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-l-emerald-500' },
    { label: 'Declined',         count: apps.filter(a => a.status === 'Declined').length, icon: <XCircle size={16} />,       bg: 'bg-red-50 dark:bg-red-900/20',     text: 'text-red-600 dark:text-red-400',     border: 'border-l-red-500' },
  ]

  const handleUpdateStatus = (newStatus: 'Approved' | 'Declined' | 'More Info') => {
    setApps(prev => prev.map(a => a.id === sel.id ? { ...a, status: newStatus } : a))
    setSel(prev => ({ ...prev, status: newStatus }))
    setActiveModal(null)
    setActionReason('')
  }

  return (
    <motion.div variants={c} initial="hidden" animate="show" className="space-y-4">
      <motion.div variants={it} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Credit & Loan Management</h2>
          <p className="text-[12px] text-slate-400 mt-0.5">Review applications, analyse trust scores, and manage disbursements</p>
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

      {/* When Audit Trail tab is active */}
      {TABS[tab] === 'Audit Trail' && isSuperAdmin ? (
        <motion.div variants={it} className="card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <History size={16} className="text-violet-500" />
                Credit Underwriting & Loan Disbursement Audit Trail
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Every credit score recalculation, loan approval, rejection, and manual threshold override
              </p>
            </div>
            <span className="badge-purple">Immutable Ledger</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  {['Audit ID', 'Loan / Merchant', 'Action & Status', 'Amount', 'Audit Details', 'Authorized Officer', 'Timestamp'].map(h => (
                    <th key={h} className="table-head-cell">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {CREDIT_AUDIT_LOGS.map(log => (
                  <tr key={log.id} className="table-row">
                    <td className="table-cell font-mono text-[11px] font-bold text-slate-500">{log.id}</td>
                    <td className="table-cell whitespace-nowrap">
                      <p className="font-bold text-slate-900 dark:text-white text-xs">{log.merchant}</p>
                      <p className="text-[10px] text-slate-400">{log.loanId}</p>
                    </td>
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

      {/* Stage counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stages.map(s => (
          <motion.div key={s.label} variants={it} className={`card p-4 border-l-4 ${s.border}`}>
            <div className="flex items-center gap-3">
              <span className={`p-2 rounded-lg ${s.bg} ${s.text}`}>{s.icon}</span>
              <div>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{s.count}</p>
                <p className="text-[11px] text-slate-400 font-medium">{s.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Table + Review Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Applications table */}
        <motion.div variants={it} className="card overflow-hidden xl:col-span-3">
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 flex-1 input py-2">
              <Search size={13} className="text-slate-400 flex-shrink-0" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by applicant or ID..."
                className="bg-transparent text-[13px] text-slate-700 dark:text-slate-300 placeholder:text-slate-400 outline-none flex-1"
              />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input py-2 w-36">
              <option value="All">All Status</option>
              <option value="New">New</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Declined">Declined</option>
              <option value="More Info">More Info</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                <tr>{['Applicant','Purpose','Amount','Trust','Status','Date',''].map(h => <th key={h} className="table-head-cell">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {filteredApps.map(a => (
                  <tr key={a.id} onClick={() => setSel(a)} className={`table-row cursor-pointer ${sel.id === a.id ? 'bg-violet-50 dark:bg-violet-900/10' : ''}`}>
                    <td className="table-cell">
                      <p className="font-semibold text-slate-900 dark:text-white text-[13px]">{a.name}</p>
                      <p className="text-[10px] text-slate-400">{a.mid}</p>
                    </td>
                    <td className="table-cell text-[12px] text-slate-500 whitespace-nowrap">{a.purpose}</td>
                    <td className="table-cell font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap text-[13px]">{a.amount}</td>
                    <td className="table-cell">
                      <span className={`font-extrabold text-[13px] ${a.trust>=80?'text-emerald-600 dark:text-emerald-400':a.trust>=60?'text-amber-600 dark:text-amber-400':'text-red-600 dark:text-red-400'}`}>{a.trust}</span>
                    </td>
                    <td className="table-cell"><AppBadge s={a.status} /></td>
                    <td className="table-cell text-[11px] text-slate-400 whitespace-nowrap">{a.date}</td>
                    <td className="table-cell"><ChevronRight size={13} className={sel.id===a.id ? 'text-violet-500' : 'text-slate-300 dark:text-slate-600'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Review Panel */}
        <motion.div variants={it} className="card p-5 xl:col-span-2 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-violet-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {sel.name.split(' ').map(n=>n[0]).join('')}
            </div>
            <div className="flex-1">
              <p className="font-bold text-slate-900 dark:text-white text-sm">{sel.name}</p>
              <p className="text-[11px] text-slate-400">{sel.mid} · {sel.id}</p>
            </div>
            <AppBadge s={sel.status} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: <Banknote size={12} />,   label: 'Requested', value: sel.amount },
              { icon: <Building2 size={12} />,  label: 'Purpose',   value: sel.purpose },
              { icon: <Calendar size={12} />,   label: 'Applied',   value: sel.date },
              { icon: <TrendingUp size={12} />, label: 'Trust Score',value: String(sel.trust) },
            ].map(r => (
              <div key={r.label} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mb-1">{r.icon}{r.label}</p>
                <p className="text-[13px] font-bold text-slate-800 dark:text-slate-200">{r.value}</p>
              </div>
            ))}
          </div>

          {/* Radar */}
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Trust Score Breakdown</p>
            <ResponsiveContainer width="100%" height={170}>
              <RadarChart data={radarData} margin={{ top: 0, right: 12, bottom: 0, left: 12 }}>
                <PolarGrid stroke={grid} />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9, fill: tick }} />
                <PolarRadiusAxis angle={30} domain={[0,100]} tick={{ fontSize: 8, fill: tick }} />
                <Radar dataKey="score" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.2} strokeWidth={2} />
                <Tooltip content={({ active, payload }) => active && payload?.length ? <div className="card px-2 py-1.5 text-xs shadow"><span className="font-bold text-slate-700 dark:text-slate-200">{payload[0].payload.metric}: </span><span className="text-violet-600 dark:text-violet-400 font-bold">{payload[0].value}</span></div> : null} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Interactive Actions */}
          {can('credit', 'edit') ? (
            <div className="space-y-2 pt-1">
              <button onClick={() => setActiveModal('APPROVE')} className="w-full btn-primary py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 text-[12px]">
                <CheckCircle size={14} /> Approve Loan & Disburse
              </button>
              <button onClick={() => setActiveModal('MORE_INFO')} className="w-full py-2.5 border border-amber-400 dark:border-amber-600 text-amber-600 dark:text-amber-400 text-[12px] font-bold rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors flex items-center justify-center gap-1.5">
                <AlertCircle size={14} /> Request Additional Proof
              </button>
              <button onClick={() => setActiveModal('DECLINE')} className="w-full py-2.5 border border-red-400 dark:border-red-600 text-red-600 dark:text-red-400 text-[12px] font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex items-center justify-center gap-1.5">
                <XCircle size={14} /> Decline Application
              </button>
            </div>
          ) : (
            <div className="pt-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-center">
              <p className="text-[11px] text-slate-400 font-semibold">You have read-only access to loan data</p>
            </div>
          )}
        </motion.div>
      </div>
      </>
      )}

      {/* Action Dialog Modal */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  {activeModal === 'APPROVE' ? 'Approve Loan Application' : activeModal === 'DECLINE' ? 'Decline Application' : 'Request Additional Details'}
                </h3>
                <button onClick={() => setActiveModal(null)} className="btn-icon p-1"><X size={16} /></button>
              </div>

              <p className="text-[12px] text-slate-500">
                Application: <span className="font-bold text-slate-900 dark:text-white">{sel.id}</span> ({sel.name} - {sel.amount})
              </p>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Admin Audit Note / Reason (Sent to Mobile App)</label>
                <textarea
                  rows={3}
                  value={actionReason}
                  onChange={e => setActionReason(e.target.value)}
                  placeholder="e.g. Approved based on 91 Trust Score & 6-month trade history..."
                  className="input py-2 w-full mt-1 text-[12px]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button onClick={() => setActiveModal(null)} className="btn-outline flex-1 text-[12px]">Cancel</button>
                <button
                  onClick={() => handleUpdateStatus(activeModal === 'APPROVE' ? 'Approved' : activeModal === 'DECLINE' ? 'Declined' : 'More Info')}
                  className={`btn-primary flex-1 text-[12px] font-bold ${activeModal === 'APPROVE' ? 'bg-emerald-600' : activeModal === 'DECLINE' ? 'bg-red-600' : 'bg-amber-600'}`}
                >
                  <Send size={13} /> Confirm Action
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
