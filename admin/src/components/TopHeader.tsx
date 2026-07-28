import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Bell, Sun, Moon, Download, X,
  AlertCircle, AlertTriangle, CheckCircle, Info,
  Store, CreditCard, Users, Check, ArrowRight
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import type { NavView } from './Sidebar'

const viewLabels: Record<NavView, string> = {
  dashboard:   'Dashboard Overview',
  merchants:   'Merchants Management',
  credit:      'Credit & Loan Management',
  coop:        'Co-Op & Esusu Management',
  risk:        'Risk & Monitoring',
  reports:     'Reports & Analytics',
  settings:    'Settings & System Configuration',
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

interface Notif { id: number; type: 'danger' | 'warning' | 'success' | 'info'; text: string; time: string }
const notifications: Notif[] = [
  { id: 1, type: 'danger',  text: 'High risk detected in Ikeja cluster', time: '2m ago' },
  { id: 2, type: 'warning', text: 'Repayment rate dropped below 90%',    time: '18m ago' },
  { id: 3, type: 'danger',  text: 'New fraud alert: merchant #M-2841',    time: '35m ago' },
  { id: 4, type: 'success', text: 'Batch disbursement ₦12.4M completed', time: '1h ago' },
]

const notifIcon: Record<string, React.ReactNode> = {
  danger:  <AlertCircle  size={13} className="text-red-500"     />,
  warning: <AlertTriangle size={13} className="text-amber-500"  />,
  success: <CheckCircle  size={13} className="text-emerald-500" />,
  info:    <Info          size={13} className="text-blue-500"   />,
}
const notifBg: Record<string, string> = {
  danger:  'bg-red-50 dark:bg-red-900/20',
  warning: 'bg-amber-50 dark:bg-amber-900/20',
  success: 'bg-emerald-50 dark:bg-emerald-900/20',
  info:    'bg-blue-50 dark:bg-blue-900/20',
}

const GLOBAL_DATABASE = [
  { category: 'Merchant', title: 'Amina Bello (M-1042)', subtitle: 'Ikeja, Lagos · Wema 0129384756', icon: <Store size={14} className="text-violet-500" /> },
  { category: 'Merchant', title: 'Babatunde Salami (M-1043)', subtitle: 'Mushin, Lagos · Wema 0198273645', icon: <Store size={14} className="text-violet-500" /> },
  { category: 'Merchant', title: 'Fatima Yusuf (M-1044)', subtitle: 'Wuse II, Abuja · Wema 0188223344', icon: <Store size={14} className="text-violet-500" /> },
  { category: 'Credit App', title: 'APP-3841: Stock Expansion (₦700,000)', subtitle: 'Amina Bello · Under Review', icon: <CreditCard size={14} className="text-blue-500" /> },
  { category: 'Credit App', title: 'APP-3843: Working Capital (₦1,200,000)', subtitle: 'Fatima Yusuf · Approved', icon: <CreditCard size={14} className="text-blue-500" /> },
  { category: 'Co-op Circle', title: 'Alaba Market Women Assoc.', subtitle: '32 Members · ₦124,800/mo', icon: <Users size={14} className="text-emerald-500" /> },
]

interface Props { activeView: NavView }

export default function TopHeader({ activeView }: Props) {
  const { toggleTheme, isDark } = useTheme()
  const [showNotif, setShowNotif] = useState(false)
  const [search, setSearch] = useState('')
  const [toastMessage, setToastMessage] = useState<string|null>(null)

  const searchResults = search.trim()
    ? GLOBAL_DATABASE.filter(item =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase())
      )
    : []

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // REAL CSV Download trigger on Export button click
  const handleRealExportCSV = () => {
    const csvContent = `ID,Merchant Name,Location,Region,KYC Status,Trust Score,Wema Account Number,Wema Account Name,Status
M-1042,Amina Bello,"Ikeja, Lagos",Lagos,Tier 1,87,0129384756,Amina Babangida Bello,Active
M-1043,Babatunde Salami,"Mushin, Lagos",Lagos,Tier 2,63,0198273645,Babatunde Salami,Active
M-1044,Fatima Yusuf,"Wuse II, Abuja",Abuja,Tier 1,91,0188223344,Fatima Yusuf,Active
M-1045,Chinedu Okafor,"Surulere, Lagos",Lagos,Tier 3,44,0177665544,Chinedu Okafor,Pending
M-1046,Grace Adeyemi,"Apapa, Lagos",Lagos,Tier 1,78,0155443322,Grace Adeyemi,Active
M-1047,Ngozi Chukwu,"Lekki Phase 1, Lagos",Lagos,Tier 2,55,0144332211,Ngozi Chukwu,Active
M-1048,Tayo Abiodun,"GRA, Port Harcourt",Port Harcourt,Tier 1,82,0133221100,Tayo Abiodun,Active`

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `kudinode_network_export_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('kudinode_network_export.csv downloaded to device!')
  }

  return (
    <header className="fixed top-0 right-0 left-[260px] z-30 h-16 flex items-center gap-3 px-6 bg-white/95 dark:bg-[#080D14]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80">
      {/* Breadcrumb */}
      <div className="flex-1 min-w-0">
        <h1 className="text-[15px] font-bold text-slate-900 dark:text-white truncate leading-tight">
          {viewLabels[activeView]}
        </h1>
        {activeView === 'dashboard' && (
          <p className="text-[11px] text-slate-400 leading-tight">
            {getGreeting()}, Ahmad — here's what's happening across the network today.
          </p>
        )}
      </div>

      {/* Global Interactive Search Input */}
      <div className="relative hidden md:block">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 w-64 xl:w-80 focus-within:ring-2 focus-within:ring-violet-500/30 focus-within:border-violet-500 transition-all">
          <Search size={13} className="text-slate-400 flex-shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search merchants, loans, accounts..."
            className="bg-transparent text-[13px] text-slate-700 dark:text-slate-300 placeholder:text-slate-400 outline-none w-full"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600 flex-shrink-0">
              <X size={12} />
            </button>
          )}
        </div>

        {/* Live Search Results Floating Panel */}
        <AnimatePresence>
          {search.trim().length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="absolute left-0 top-full mt-2 w-80 xl:w-96 card shadow-2xl z-50 p-2 border border-slate-200 dark:border-slate-800"
            >
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5 border-b border-slate-100 dark:border-slate-800">
                Search Results ({searchResults.length} matches)
              </p>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800/40">
                {searchResults.length > 0 ? (
                  searchResults.map((res, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        showToast(`Opened: ${res.title}`)
                        setSearch('')
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                        {res.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-slate-900 dark:text-white truncate">{res.title}</p>
                        <p className="text-[10px] text-slate-400 truncate">{res.subtitle}</p>
                      </div>
                      <ArrowRight size={12} className="text-slate-400 flex-shrink-0" />
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No matching records found for "{search}"
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Real Export Button (Triggers browser CSV download directly) */}
      <button onClick={handleRealExportCSV} className="btn-primary h-9 px-4 inline-flex gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
        <Download size={14} />
        Export CSV
      </button>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setShowNotif(v => !v)}
          className="btn-icon relative h-9 w-9"
        >
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#080D14]" />
        </button>

        <AnimatePresence>
          {showNotif && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotif(false)} />
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.14, ease: 'easeOut' }}
                className="absolute right-0 top-full mt-2 w-80 card shadow-2xl z-50 overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">Notifications</span>
                  <span className="badge-danger">{notifications.length} new</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-64 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors">
                      <span className={`mt-0.5 p-1 rounded-md flex-shrink-0 ${notifBg[n.type]}`}>{notifIcon[n.type]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-slate-700 dark:text-slate-300 leading-snug">{n.text}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Theme Toggle */}
      <motion.button
        onClick={toggleTheme}
        whileTap={{ scale: 0.88 }}
        className="btn-icon h-9 w-9"
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.span key="sun" initial={{ rotate: -80, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 80, opacity: 0 }} transition={{ duration: 0.18 }} className="block">
              <Sun size={16} className="text-amber-400" />
            </motion.span>
          ) : (
            <motion.span key="moon" initial={{ rotate: 80, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -80, opacity: 0 }} transition={{ duration: 0.18 }} className="block">
              <Moon size={16} className="text-slate-600" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="fixed bottom-6 right-6 z-50 p-3.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-2 shadow-2xl border border-slate-700">
            <Check size={14} className="text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
