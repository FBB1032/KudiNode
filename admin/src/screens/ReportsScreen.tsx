import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, RefreshCw, FileText, FileSpreadsheet, Download, TrendingUp, ArrowUpRight, CheckCircle2, X, ScrollText, History, Clock } from 'lucide-react'
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useTheme } from '../context/ThemeContext'
import { useAdmin } from '../context/AdminContext'

const BASE_TABS = ['Portfolio Analytics','Performance Reports','Grants','Activity Logs']
const GRAN = ['Daily','Weekly','Monthly']

const REPORTS_AUDIT_LOGS = [
  { id: 'RPT-AUD-801', title: 'CBN Regulatory Monthly Loan Portfolio Disclosure', format: 'PDF Export', requestedBy: 'Taiwo Balogun (Compliance Officer)', time: '24 May 2026, 08:30', status: 'Generated & Logged', badge: 'badge-success' },
  { id: 'RPT-AUD-802', title: 'Wema Bank Reconciliation & Settlement Ledger', format: 'CSV Data Feed', requestedBy: 'Peace Okon (Operations Manager)', time: '23 May 2026, 18:00', status: 'Dispatched to SFTP', badge: 'badge-info' },
  { id: 'RPT-AUD-803', title: 'NIBSS BVN Identity Compliance Full Audit', format: 'Excel Report', requestedBy: 'Super Admin', time: '22 May 2026, 14:15', status: 'Archived to Cold Storage', badge: 'badge-purple' },
  { id: 'RPT-AUD-804', title: 'High-Risk Default Probability Analysis', format: 'PDF Audit', requestedBy: 'Ahmad Lawal (Risk Officer)', time: '21 May 2026, 10:45', status: 'Generated', badge: 'badge-warning' },
]

const chartData = [
  { date: 'May 1',  Disbursed: 18.4, Repaid: 14.2, RepaymentRate: 77 },
  { date: 'May 3',  Disbursed: 22.1, Repaid: 17.8, RepaymentRate: 80 },
  { date: 'May 6',  Disbursed: 19.6, Repaid: 16.4, RepaymentRate: 84 },
  { date: 'May 8',  Disbursed: 27.3, Repaid: 22.9, RepaymentRate: 84 },
  { date: 'May 10', Disbursed: 31.8, Repaid: 27.1, RepaymentRate: 85 },
  { date: 'May 13', Disbursed: 25.4, Repaid: 22.3, RepaymentRate: 88 },
  { date: 'May 15', Disbursed: 34.6, Repaid: 31.2, RepaymentRate: 90 },
  { date: 'May 17', Disbursed: 29.2, Repaid: 26.8, RepaymentRate: 92 },
  { date: 'May 20', Disbursed: 38.1, Repaid: 35.4, RepaymentRate: 93 },
  { date: 'May 22', Disbursed: 32.7, Repaid: 30.6, RepaymentRate: 94 },
  { date: 'May 24', Disbursed: 41.5, Repaid: 39.2, RepaymentRate: 94 },
]
const locs = [
  { location: 'Ikeja',    disbursed: '₦72.4M',  repaid: '₦65.3M',  rate: '90.2%' },
  { location: 'Yaba',     disbursed: '₦57.5M',  repaid: '₦51.7M',  rate: '89.9%' },
  { location: 'Surulere', disbursed: '₦48.4M',  repaid: '₦44.3M',  rate: '91.5%' },
  { location: 'Lekki',    disbursed: '₦64.1M',  repaid: '₦58.3M',  rate: '90.9%' },
  { location: 'Apapa',    disbursed: '₦29.5M',  repaid: '₦26.4M',  rate: '89.5%' },
]
const kpis = [
  { label: 'Total Disbursed',  value: '₦320.6M', change: '+14.7%', accent: '#8B5CF6' },
  { label: 'Total Repaid',     value: '₦184.2M', change: '+1.0%',  accent: '#10B981' },
  { label: 'Repayment Rate',   value: '97.66%',  change: '+1.2%',  accent: '#3B82F6' },
  { label: 'Active Loans',     value: '8,213',   change: '+7.2%',  accent: '#F59E0B' },
]

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="card px-3 py-2.5 text-xs shadow-xl">
      <p className="font-bold text-slate-800 dark:text-white mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200">{p.name==='RepaymentRate'?`${p.value}%`:`₦${p.value}M`}</span>
        </div>
      ))}
    </div>
  )
}

const c = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
const it = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.2 } } }

export default function ReportsScreen() {
  const { can, isSuperAdmin } = useAdmin()
  const TABS = isSuperAdmin ? [...BASE_TABS, 'Audit Trail'] : BASE_TABS
  const [tab, setTab] = useState(0)
  const [gran, setGran] = useState('Daily')
  const [from, setFrom] = useState('2026-05-01')
  const [to, setTo] = useState('2026-05-24')
  const [downloadModal, setDownloadModal] = useState<string|null>(null)
  const { isDark } = useTheme()

  const grid = isDark ? '#1E293B' : '#E2E8F0'
  const tick = isDark ? '#64748B' : '#94A3B8'

  const handleDownload = (type: string) => {
    setDownloadModal(type)
  }

  return (
    <motion.div variants={c} initial="hidden" animate="show" className="space-y-4">
      <motion.div variants={it} className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Reports & Analytics</h2>
          <p className="text-[12px] text-slate-400 mt-0.5">Portfolio performance, disbursement trends, and export tools</p>
        </div>
        {can('reports', 'export') && (
          <button onClick={() => handleDownload('PDF Financial Audit Report')} className="btn-primary h-9 gap-1.5"><RefreshCw size={13} />Generate Report</button>
        )}
      </motion.div>

      {/* Tabs */}
      <motion.div variants={it} className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        {TABS.map((t,i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`px-4 py-3 text-[13px] font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5 ${tab===i?'border-violet-600 text-violet-600 dark:text-violet-400 dark:border-violet-400':'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
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
                Reports Generation & Data Extraction Audit Trail
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Audit trail of regulatory disclosures, credit bureau batches, and executive financial exports
              </p>
            </div>
            <span className="badge-purple">Immutable Ledger</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  {['Audit ID', 'Report Document Title', 'Format', 'Requesting Officer', 'Export Status', 'Timestamp'].map(h => (
                    <th key={h} className="table-head-cell">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {REPORTS_AUDIT_LOGS.map(log => (
                  <tr key={log.id} className="table-row">
                    <td className="table-cell font-mono text-[11px] font-bold text-slate-500">{log.id}</td>
                    <td className="table-cell font-bold text-slate-900 dark:text-white text-xs">{log.title}</td>
                    <td className="table-cell whitespace-nowrap">
                      <span className="badge-slate font-mono text-[10px]">{log.format}</span>
                    </td>
                    <td className="table-cell text-xs text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
                      {log.requestedBy}
                    </td>
                    <td className="table-cell whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${log.badge}`}>
                        {log.status}
                      </span>
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

      {/* Date + Granularity */}
      <motion.div variants={it} className="card p-4 flex flex-wrap items-center gap-3">
        <Calendar size={14} className="text-violet-500 flex-shrink-0" />
        <span className="text-[12px] font-semibold text-slate-500">Date Range:</span>
        <input type="date" value={from} onChange={e=>setFrom(e.target.value)} className="input py-1.5 text-[12px] w-38" />
        <span className="text-slate-400 text-xs">to</span>
        <input type="date" value={to} onChange={e=>setTo(e.target.value)} className="input py-1.5 text-[12px] w-38" />
        <div className="flex items-center gap-1 ml-auto">
          <span className="text-[12px] font-semibold text-slate-400 mr-1">Group By:</span>
          {GRAN.map(g => (
            <button key={g} onClick={() => setGran(g)} className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${gran===g?'bg-violet-600 text-white shadow-sm':'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>{g}</button>
          ))}
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map(k => (
          <motion.div key={k.label} variants={it} className="kpi-card" style={{ '--kpi-color': k.accent } as any}>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{k.label}</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{k.value}</p>
            <span className="stat-pill-up mt-2 inline-flex"><TrendingUp size={10} />{k.change}</span>
          </motion.div>
        ))}
      </div>

      {/* Chart + Export */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <motion.div variants={it} className="card p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Disbursement vs Repayment Trend ({gran})</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">₦M amounts · Repayment Rate %</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid stroke={grid} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: tick }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="l" tick={{ fontSize: 10, fill: tick }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="r" orientation="right" domain={[70,100]} tick={{ fontSize: 10, fill: tick }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip content={<ChartTooltip />} />
              <Legend iconType="circle" iconSize={7} formatter={v => <span className="text-[11px] text-slate-500 dark:text-slate-400">{v}</span>} />
              <Bar yAxisId="l" dataKey="Disbursed"    fill="#8B5CF6" radius={[3,3,0,0]} maxBarSize={18} />
              <Bar yAxisId="l" dataKey="Repaid"       fill="#10B981" radius={[3,3,0,0]} maxBarSize={18} />
              <Line yAxisId="r" type="monotone" dataKey="RepaymentRate" stroke="#F59E0B" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </motion.div>

        <div className="space-y-4">
          <motion.div variants={it} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-slate-900 dark:text-white">Top Performing Locations</p>
              <button className="text-[11px] text-violet-600 dark:text-violet-400 font-semibold flex items-center gap-0.5 hover:underline">Expand<ArrowUpRight size={11} /></button>
            </div>
            <table className="w-full text-xs">
              <thead><tr className="border-b border-slate-100 dark:border-slate-800">
                {['Location','Disbursed','Repaid','Rate'].map(h => <th key={h} className="table-head-cell py-2 px-2">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {locs.map((l,i) => (
                  <tr key={i} className="table-row">
                    <td className="table-cell px-2 py-2 font-semibold text-slate-800 dark:text-slate-200">{l.location}</td>
                    <td className="table-cell px-2 py-2 text-slate-500">{l.disbursed}</td>
                    <td className="table-cell px-2 py-2 text-slate-500">{l.repaid}</td>
                    <td className="table-cell px-2 py-2 font-bold text-emerald-600 dark:text-emerald-400">{l.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          {can('reports', 'export') && (
            <motion.div variants={it} className="card p-5">
              <p className="text-sm font-bold text-slate-900 dark:text-white mb-3">Export Report</p>
              <div className="space-y-2">
                {[
                  { label: 'Download PDF',   icon: <FileText size={15} />,        bg: 'bg-red-50 dark:bg-red-900/20 text-red-500' },
                  { label: 'Download Excel', icon: <FileSpreadsheet size={15} />, bg: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' },
                  { label: 'Download CSV',   icon: <Download size={15} />,        bg: 'bg-blue-50 dark:bg-blue-900/20 text-blue-500' },
                ].map(e => (
                  <button key={e.label} onClick={() => handleDownload(e.label)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left">
                    <span className={`p-2 rounded-lg flex-shrink-0 ${e.bg}`}>{e.icon}</span>
                    <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 flex-1">{e.label}</span>
                    <Download size={13} className="text-slate-400 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
      </>
      )}

      {/* Download Confirmation Modal */}
      <AnimatePresence>
        {downloadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Export Ready</h3>
                <button onClick={() => setDownloadModal(null)} className="btn-icon p-1"><X size={16} /></button>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 size={24} className="text-emerald-500 flex-shrink-0" />
                <div>
                  <p className="text-[13px] font-bold text-emerald-800 dark:text-emerald-300">{downloadModal} Generated</p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">Range: {from} to {to} ({gran})</p>
                </div>
              </div>

              <button onClick={() => setDownloadModal(null)} className="btn-primary w-full text-[12px] font-bold">Download File to Device</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
