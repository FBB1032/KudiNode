import React from 'react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Store, CreditCard,
  Users, ShieldAlert, BarChart3, Settings,
  ChevronRight, LogOut
} from 'lucide-react'
import { KudiNodeLogo } from './KudiNodeLogo'

export type NavView =
  | 'dashboard'
  | 'merchants'
  | 'credit'
  | 'coop'
  | 'risk'
  | 'reports'
  | 'settings'

interface NavItem {
  id: NavView
  label: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { id: 'dashboard',  label: 'Dashboard Overview',      icon: <LayoutDashboard size={15} /> },
  { id: 'merchants',  label: 'Merchants Management',    icon: <Store size={15} /> },
  { id: 'credit',     label: 'Credit & Loan Mgmt',      icon: <CreditCard size={15} /> },
  { id: 'coop',       label: 'Co-Op & Esusu Mgmt',      icon: <Users size={15} /> },
  { id: 'risk',       label: 'Risk & Monitoring',        icon: <ShieldAlert size={15} /> },
  { id: 'reports',    label: 'Reports & Analytics',      icon: <BarChart3 size={15} /> },
  { id: 'settings',   label: 'Settings & System Config', icon: <Settings size={15} /> },
]

interface Props {
  active: NavView
  onChange: (v: NavView) => void
  onLogout?: () => void
}

export default function Sidebar({ active, onChange, onLogout }: Props) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex flex-col w-[260px] bg-white dark:bg-[#0D1321] border-r border-slate-200 dark:border-slate-800/80">
      {/* Official Brand Logo */}
      <div className="flex items-center px-5 h-16 border-b border-slate-200 dark:border-slate-800/80 flex-shrink-0">
        <KudiNodeLogo size="medium" />
      </div>

      {/* Nav label */}
      <div className="px-5 pt-5 pb-1.5">
        <p className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-[0.14em]">Main Navigation</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-0.5 pb-3">
        {navItems.map(item => {
          const isActive = active === item.id
          return (
            <motion.button
              key={item.id}
              onClick={() => onChange(item.id)}
              whileTap={{ scale: 0.975 }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-lg shadow-violet-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <span className={`flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>
                {item.icon}
              </span>
              <span className="flex-1 text-left">{item.label}</span>
              {isActive && <ChevronRight size={12} className="text-white/60 flex-shrink-0" />}
            </motion.button>
          )
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 border-t border-slate-200 dark:border-slate-800" />

      {/* Profile Card & Logout */}
      <div className="p-3 flex-shrink-0">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white font-bold text-xs shadow">
              AL
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-slate-900 dark:text-white truncate leading-tight">Ahmad Lawal</p>
            <p className="text-[11px] text-slate-400 truncate leading-tight">Risk Officer</p>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              title="Sign Out of Admin Console"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex-shrink-0"
            >
              <LogOut size={15} />
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
