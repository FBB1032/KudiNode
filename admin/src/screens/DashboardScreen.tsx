import React from 'react'
import { motion } from 'framer-motion'
import {
  Store, CreditCard, AlertTriangle, Banknote,
  TrendingUp, TrendingDown, ArrowUpRight, MoreHorizontal,
  AlertCircle, CheckCircle, Clock, Activity,
} from 'lucide-react'
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Area, AreaChart,
} from 'recharts'
import { useTheme } from '../context/ThemeContext'

const kpis = [
  { label: 'Total Merchants',       value: '12,842', change: '+8.7%',  up: true,  goodDown: false, sub: 'vs last week',  icon: <Store size={18} />,        accent: '#8B5CF6', bg: 'bg-violet-50 dark:bg-violet-900/20',  text: 'text-violet-600 dark:text-violet-400' },
  { label: 'Active Loans',          value: '8,213',  change: '+11.2%', up: true,  goodDown: false, sub: 'vs last week',  icon: <CreditCard size={18} />,   accent: '#3B82F6', bg: 'bg-blue-50 dark:bg-blue-900/20',      text: 'text-blue-600 dark:text-blue-400' },
  { label: 'Portfolio Default Rate',value: '2.34%',  change: '-0.48%', up: false, goodDown: true,  sub: 'vs last week',  icon: <AlertTriangle size={18} />, accent: '#F59E0B', bg: 'bg-amber-50 dark:bg-amber-900/20',    text: 'text-amber-600 dark:text-amber-400' },
  { label: 'Disbursed (MTD)',       value: '₦320.6M',change: '+14.2%', up: true,  goodDown: false, sub: 'vs last month', icon: <Banknote size={18} />,      accent: '#10B981', bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400' },
]

const donutData = [
  { name: 'Active Loans', value: 41, color: '#8B5CF6' },
  { name: 'Repaid',       value: 28, color: '#10B981' },
  { name: 'Overdue',      value: 19, color: '#F59E0B' },
  { name: 'Defaulted',    value: 12, color: '#EF4444' },
]

const trendData = [
  { month: 'Jan', Disbursed: 180, Repaid: 120 }, { month: 'Feb', Disbursed: 210, Repaid: 150 },
  { month: 'Mar', Disbursed: 195, Repaid: 165 }, { month: 'Apr', Disbursed: 240, Repaid: 180 },
  { month: 'May', Disbursed: 260, Repaid: 200 }, { month: 'Jun', Disbursed: 290, Repaid: 220 },
  { month: 'Jul', Disbursed: 275, Repaid: 240 }, { month: 'Aug', Disbursed: 310, Repaid: 255 },
  { month: 'Sep', Disbursed: 295, Repaid: 260 }, { month: 'Oct', Disbursed: 330, Repaid: 270 },
  { month: 'Nov', Disbursed: 315, Repaid: 280 }, { month: 'Dec', Disbursed: 345, Repaid: 295 },
]

const alerts = [
  { type: 'danger',  icon: <AlertCircle size={13} />,  text: 'High risk detected in Ikeja cluster',   time: '2m ago' },
  { type: 'warning', icon: <AlertTriangle size={13} />, text: 'Repayment rate dropped below 90%',      time: '18m ago' },
  { type: 'danger',  icon: <AlertCircle size={13} />,  text: 'Fraud alert: merchant #M-2841 flagged', time: '35m ago' },
  { type: 'success', icon: <CheckCircle size={13} />,  text: 'Batch disbursement ₦12.4M completed',   time: '1h ago' },
]
const alertColor: Record<string, string> = {
  danger:  'text-red-500',
  warning: 'text-amber-500',
  success: 'text-emerald-500',
  info:    'text-blue-500',
}
const alertBg: Record<string, string> = {
  danger:  'bg-red-50 dark:bg-red-900/20',
  warning: 'bg-amber-50 dark:bg-amber-900/20',
  success: 'bg-emerald-50 dark:bg-emerald-900/20',
  info:    'bg-blue-50 dark:bg-blue-900/20',
}

const coopGroups = [
  { name: 'Alaba Market Women Assoc.', members: 32, contributions: '₦124,800', growth: '+9.8%',  trend: [40,55,48,62,58,71] },
  { name: 'Lekki Traders Union',       members: 28, contributions: '₦98,240',  growth: '+7.2%',  trend: [30,35,33,42,40,46] },
  { name: 'Surulere Business Circle',  members: 45, contributions: '₦176,250', growth: '+12.4%', trend: [60,70,65,88,82,98] },
  { name: 'Yaba Entrepreneurs Group',  members: 19, contributions: '₦76,380',  growth: '+5.6%',  trend: [20,24,22,28,26,30] },
  { name: 'Apapa Merchant Network',    members: 38, contributions: '₦148,620', growth: '+8.1%',  trend: [50,58,55,66,62,72] },
]

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const pts = data.map((v, i) => ({ v, i }))
  return (
    <ResponsiveContainer width={60} height={28}>
      <AreaChart data={pts} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
        <defs>
          <linearGradient id={`sg-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#sg-${color})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="card px-3 py-2 text-xs shadow-xl">
      <p className="font-bold text-slate-800 dark:text-white mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-slate-500 dark:text-slate-400">{p.name}:</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">₦{p.value}M</span>
        </div>
      ))}
    </div>
  )
}

const c = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }
const i = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.22 } } }

export default function DashboardScreen() {
  const { isDark } = useTheme()
  const grid = isDark ? '#1E293B' : '#E2E8F0'
  const tick = isDark ? '#64748B' : '#94A3B8'

  return (
    <motion.div variants={c} initial="hidden" animate="show" className="space-y-4">

      {/* KPI strip */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map(k => (
          <motion.div key={k.label} variants={i} className="kpi-card" style={{ '--kpi-color': k.accent } as any}>
            <div className="flex items-start justify-between mb-3">
              <span className={`p-2.5 rounded-xl ${k.bg} ${k.text}`}>{k.icon}</span>
              <MoreHorizontal size={14} className="text-slate-300 dark:text-slate-600 cursor-pointer hover:text-slate-500 mt-0.5" />
            </div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{k.label}</p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-0.5 tracking-tight">{k.value}</p>
            <div className="mt-2.5 flex items-center gap-2">
              {k.up === k.goodDown
                ? <span className="stat-pill-down"><TrendingDown size={10} />{k.change}</span>
                : <span className="stat-pill-up"><TrendingUp size={10} />{k.change}</span>
              }
              <span className="text-[11px] text-slate-400">{k.sub}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Donut */}
        <motion.div variants={i} className="card p-5 xl:col-span-2">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Portfolio Summary</p>
              <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">₦1.48B Total Portfolio</p>
            </div>
            <button className="btn-icon"><MoreHorizontal size={15} /></button>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={donutData} cx="50%" cy="50%" innerRadius={62} outerRadius={88} paddingAngle={3} dataKey="value">
                {donutData.map((e, idx) => <Cell key={idx} fill={e.color} stroke="transparent" />)}
                <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 19, fontWeight: 800, fill: isDark ? '#F1F5F9' : '#0F172A' }}>₦1.48B</text>
                <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 10, fill: '#94A3B8' }}>Total Portfolio</text>
              </Pie>
              <Tooltip content={({ active, payload }) => active && payload?.length ? <div className="card px-3 py-1.5 text-xs shadow-xl"><span className="font-bold text-slate-800 dark:text-white">{payload[0].name}</span><span className="text-slate-400 ml-2">{payload[0].value}%</span></div> : null} />
              <Legend iconType="circle" iconSize={7} formatter={v => <span className="text-[11px] text-slate-500 dark:text-slate-400">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Line chart */}
        <motion.div variants={i} className="card p-5 xl:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Loan Trend — 12 Months</p>
              <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">Disbursed vs Repaid</p>
            </div>
            <div className="flex items-center gap-4">
              {[{ label: 'Disbursed', color: '#8B5CF6' }, { label: 'Repaid', color: '#10B981' }].map(l => (
                <span key={l.label} className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="w-6 h-0.5 rounded-full" style={{ background: l.color }} />{l.label}
                </span>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={214}>
            <LineChart data={trendData} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
              <CartesianGrid stroke={grid} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: tick }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: tick }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="Disbursed" stroke="#8B5CF6" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#8B5CF6' }} />
              <Line type="monotone" dataKey="Repaid"    stroke="#10B981" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#10B981' }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Alerts */}
        <motion.div variants={i} className="card xl:col-span-2">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-violet-500" />
              <span className="text-sm font-bold text-slate-900 dark:text-white">Recent Alerts</span>
            </div>
            <button className="text-[11px] text-violet-600 dark:text-violet-400 font-semibold flex items-center gap-0.5 hover:underline">View all<ArrowUpRight size={11} /></button>
          </div>
          <div className="p-3 space-y-2">
            {alerts.map((a, idx) => (
              <div key={idx} className={`flex items-start gap-3 p-3 rounded-xl ${alertBg[a.type]}`}>
                <span className={`mt-0.5 flex-shrink-0 ${alertColor[a.type]}`}>{a.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-slate-700 dark:text-slate-300 font-medium leading-snug">{a.text}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1"><Clock size={9} />{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Co-op table */}
        <motion.div variants={i} className="card xl:col-span-3">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Top Performing Co-op Groups</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Ranked by contribution volume this month</p>
            </div>
            <button className="text-[11px] text-violet-600 dark:text-violet-400 font-semibold flex items-center gap-0.5 hover:underline">View all<ArrowUpRight size={11} /></button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-slate-100 dark:border-slate-800">
                {['Group', 'Members', 'Contributions', 'Trend', 'Growth'].map(h => (
                  <th key={h} className="table-head-cell">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
                {coopGroups.map((g, idx) => (
                  <tr key={idx} className="table-row">
                    <td className="table-cell font-semibold text-slate-800 dark:text-slate-100">{g.name}</td>
                    <td className="table-cell text-slate-500">{g.members}</td>
                    <td className="table-cell font-semibold text-slate-700 dark:text-slate-300">{g.contributions}</td>
                    <td className="px-4 py-2"><Sparkline data={g.trend} color="#10B981" /></td>
                    <td className="table-cell"><span className="stat-pill-up"><TrendingUp size={9} />{g.growth}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
