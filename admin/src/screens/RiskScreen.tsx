import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldAlert, AlertCircle, AlertTriangle, TrendingDown, MapPin, Eye, X, Check, Lock } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useAdmin } from '../context/AdminContext'

const TABS = ['Risk Heatmap','Risk Scores','High-Risk Clusters','Fraud Alerts','Portfolio Monitor']

interface Loc { name: string; risk: 'High'|'Medium'|'Low'; merchants: number; defaultRate: string; x: number; y: number }

const locs: Loc[] = [
  { name: 'Ikeja',    risk: 'High',   merchants: 482, defaultRate: '8.4%', x: 52, y: 27 },
  { name: 'Yaba',     risk: 'High',   merchants: 316, defaultRate: '7.1%', x: 64, y: 46 },
  { name: 'Mushin',   risk: 'Medium', merchants: 274, defaultRate: '4.8%', x: 38, y: 50 },
  { name: 'Surulere', risk: 'Low',    merchants: 391, defaultRate: '1.9%', x: 50, y: 64 },
  { name: 'Apapa',    risk: 'Medium', merchants: 218, defaultRate: '4.2%', x: 30, y: 72 },
  { name: 'Lekki',    risk: 'Low',    merchants: 524, defaultRate: '1.2%', x: 76, y: 60 },
]

const riskColor: Record<string, string> = { High: '#EF4444', Medium: '#F59E0B', Low: '#10B981' }
const riskBadge: Record<string, string> = {
  High:   'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800',
  Medium: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800',
  Low:    'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800',
}

const distData = [
  { name: 'Low Risk',    value: 58, color: '#10B981' },
  { name: 'Medium Risk', value: 28, color: '#F59E0B' },
  { name: 'High Risk',   value: 14, color: '#EF4444' },
]

const insights = [
  { type: 'danger',  icon: <AlertCircle size={13} />,  text: 'High risk detected in Ikeja cluster — 48 new flags', time: '2m ago' },
  { type: 'warning', icon: <AlertTriangle size={13} />, text: 'Repayment rate dropped below 90% in Mushin',         time: '18m ago' },
  { type: 'danger',  icon: <AlertCircle size={13} />,  text: 'Fraud alert: merchant #M-2841 flagged for review',    time: '35m ago' },
  { type: 'warning', icon: <TrendingDown size={13} />, text: 'Group dissolution risk detected in Yaba cluster',     time: '1h ago' },
]
const insightBg:   Record<string,string> = { danger: 'bg-red-50 dark:bg-red-900/20',       warning: 'bg-amber-50 dark:bg-amber-900/20' }
const insightText: Record<string,string> = { danger: 'text-red-500 dark:text-red-400',     warning: 'text-amber-500 dark:text-amber-400' }

const c = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
const it = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.2 } } }

export default function RiskScreen() {
  const { can } = useAdmin()
  const [tab, setTab] = useState(0)
  const [hover, setHover] = useState<string|null>(null)
  const [selectedLoc, setSelectedLoc] = useState<Loc|null>(null)
  const [selectedRiskFilter, setSelectedRiskFilter] = useState('All Risk Levels')

  const filteredLocs = locs.filter(l =>
    selectedRiskFilter === 'All Risk Levels' || `${l.risk} Risk` === selectedRiskFilter
  )

  return (
    <motion.div variants={c} initial="hidden" animate="show" className="space-y-4">
      <motion.div variants={it} className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Risk & Monitoring</h2>
          <p className="text-[12px] text-slate-400 mt-0.5">Real-time risk heatmap, fraud detection, and portfolio monitoring</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={selectedRiskFilter} onChange={e => setSelectedRiskFilter(e.target.value)} className="input py-1.5 text-[12px] w-auto pr-8">
            <option>All Risk Levels</option>
            <option>High Risk</option>
            <option>Medium Risk</option>
            <option>Low Risk</option>
          </select>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={it} className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        {TABS.map((t,i) => (
          <button key={t} onClick={() => setTab(i)} className={`px-4 py-3 text-[13px] font-semibold whitespace-nowrap border-b-2 transition-colors ${tab===i?'border-violet-600 text-violet-600 dark:text-violet-400 dark:border-violet-400':'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>{t}</button>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Map */}
        <motion.div variants={it} className="card p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Lagos State Risk Heatmap</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">Real-time merchant risk distribution</p>
            </div>
            <div className="flex items-center gap-3">
              {Object.entries(riskColor).map(([k,v]) => (
                <span key={k} className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="w-2 h-2 rounded-full" style={{ background: v }} />{k}
                </span>
              ))}
            </div>
          </div>

          <div className="relative w-full rounded-2xl overflow-hidden bg-slate-800 dark:bg-slate-900" style={{ height: 320 }}>
            {/* Grid lines */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1E293B" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              <path d="M0,78% Q20%,72% 45%,76% T90%,80% L100%,100% L0,100%Z" fill="#0F172A" opacity="0.6" />
              <path d="M0,78% Q20%,72% 45%,76% T100%,80%" fill="none" stroke="#38BDF8" strokeWidth="1" opacity="0.3" />
            </svg>

            {filteredLocs.map(loc => (
              <div
                key={loc.name}
                className="absolute cursor-pointer"
                style={{ left: `${loc.x}%`, top: `${loc.y}%`, transform: 'translate(-50%,-50%)' }}
                onMouseEnter={() => setHover(loc.name)}
                onMouseLeave={() => setHover(null)}
                onClick={() => setSelectedLoc(loc)}
              >
                {loc.risk === 'High' && (
                  <span className="absolute inset-0 rounded-full animate-ping opacity-40" style={{ background: riskColor[loc.risk] }} />
                )}
                <div className="relative z-10 w-7 h-7 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-lg transition-transform hover:scale-125" style={{ background: riskColor[loc.risk] }}>
                  <MapPin size={11} className="text-white" />
                </div>
                <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-bold text-white px-1.5 py-0.5 rounded shadow-md" style={{ background: riskColor[loc.risk] }}>{loc.name}</div>

                {hover === loc.name && (
                  <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 card p-3 text-xs w-40 shadow-2xl z-30">
                    <p className="font-bold text-slate-900 dark:text-white mb-1.5">{loc.name}</p>
                    <div className="space-y-1 text-slate-500 dark:text-slate-400">
                      <p>Risk: <span className="font-bold" style={{ color: riskColor[loc.risk] }}>{loc.risk}</span></p>
                      <p>Merchants: <span className="font-semibold text-slate-700 dark:text-slate-300">{loc.merchants}</span></p>
                      <p>Default Rate: <span className="font-bold" style={{ color: riskColor[loc.risk] }}>{loc.defaultRate}</span></p>
                    </div>
                  </motion.div>
                )}
              </div>
            ))}

            <div className="absolute bottom-3 left-3 card p-2.5">
              <p className="text-[10px] font-bold text-slate-400 mb-1.5">Risk Legend</p>
              {Object.entries(riskColor).map(([k,v]) => (
                <div key={k} className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: v }} />{k} Risk
                </div>
              ))}
            </div>
          </div>

          {/* Location table */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-slate-100 dark:border-slate-800">
                {['Location','Merchants','Default Rate','Risk Level','Action'].map(h => <th key={h} className="table-head-cell">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {filteredLocs.map(l => (
                  <tr key={l.name} className="table-row">
                    <td className="table-cell font-semibold text-slate-900 dark:text-white">{l.name}</td>
                    <td className="table-cell text-slate-500">{l.merchants}</td>
                    <td className="table-cell font-bold" style={{ color: riskColor[l.risk] }}>{l.defaultRate}</td>
                    <td className="table-cell"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${riskBadge[l.risk]}`}>{l.risk} Risk</span></td>
                    <td className="table-cell">
                      <button onClick={() => setSelectedLoc(l)} className="btn-ghost h-7 px-2 text-[11px] text-violet-600">
                        <Eye size={11} /> Inspect Cluster
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Right col */}
        <div className="space-y-4">
          <motion.div variants={it} className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert size={14} className="text-violet-500" />
              <p className="text-sm font-bold text-slate-900 dark:text-white">Risk Insights</p>
            </div>
            <div className="space-y-2.5">
              {insights.map((ins,i) => (
                <div key={i} className={`flex items-start gap-2.5 p-3 rounded-xl ${insightBg[ins.type]}`}>
                  <span className={`mt-0.5 flex-shrink-0 ${insightText[ins.type]}`}>{ins.icon}</span>
                  <div>
                    <p className="text-[12px] text-slate-700 dark:text-slate-300 leading-snug font-medium">{ins.text}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{ins.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={it} className="card p-5">
            <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">Risk Distribution</p>
            <p className="text-[11px] text-slate-400 mb-3">Across 12,842 merchants</p>
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie data={distData} cx="50%" cy="50%" innerRadius={46} outerRadius={68} paddingAngle={3} dataKey="value">
                  {distData.map((e,i) => <Cell key={i} fill={e.color} stroke="transparent" />)}
                </Pie>
                <Tooltip content={({ active, payload }) => active && payload?.length ? <div className="card px-2.5 py-1.5 text-xs shadow-xl"><span className="font-bold text-slate-700 dark:text-slate-200">{payload[0].name}: </span><span>{payload[0].value}%</span></div> : null} />
                <Legend iconType="circle" iconSize={7} formatter={v => <span className="text-[11px] text-slate-500 dark:text-slate-400">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>

      {/* Inspect Cluster Modal */}
      <AnimatePresence>
        {selectedLoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Cluster Audit: {selectedLoc.name}</h3>
                <button onClick={() => setSelectedLoc(null)} className="btn-icon p-1"><X size={16} /></button>
              </div>

              <div className="space-y-2 text-[12px]">
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Risk Assessment</span>
                  <span className="font-bold" style={{ color: riskColor[selectedLoc.risk] }}>{selectedLoc.risk} Risk</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Active Merchants</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedLoc.merchants}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">30-Day Default Rate</span>
                  <span className="font-bold text-red-500">{selectedLoc.defaultRate}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button onClick={() => setSelectedLoc(null)} className="btn-outline flex-1 text-[12px]">Close</button>
                {can('risk', 'edit') && (
                  <button onClick={() => { alert(`Risk monitoring alert dispatched to ${selectedLoc.name} cluster merchants.`); setSelectedLoc(null); }} className="btn-primary flex-1 text-[12px] bg-red-600 hover:bg-red-700 text-white font-bold gap-1.5">
                    <Lock size={13} /> Freeze Cluster Node
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
