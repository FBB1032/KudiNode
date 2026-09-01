import React from 'react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Store, CreditCard,
  Users, ShieldAlert, BarChart3, Settings,
  ChevronRight, LogOut, UserCog, ScrollText
} from 'lucide-react'
import { KudiNodeLogo } from './KudiNodeLogo'
import { NavView, useAdmin, ROLE_LABELS } from '../context/AdminContext'

interface NavItem {
  id: NavView
  label: string
  icon: React.ReactNode
  resource: string
}

const navItems: NavItem[] = [
  { id: 'dashboard',  label: 'Dashboard Overview',      icon: <LayoutDashboard size={16} />, resource: 'dashboard' },
  { id: 'merchants',  label: 'Merchants Management',    icon: <Store size={16} />,           resource: 'merchants' },
  { id: 'credit',     label: 'Credit & Loan Mgmt',      icon: <CreditCard size={16} />,      resource: 'credit' },
  { id: 'coop',       label: 'Co-Op & Esusu Mgmt',      icon: <Users size={16} />,           resource: 'coop' },
  { id: 'risk',       label: 'Risk & Monitoring',        icon: <ShieldAlert size={16} />,    resource: 'risk' },
  { id: 'reports',    label: 'Reports & Analytics',      icon: <BarChart3 size={16} />,      resource: 'reports' },
  { id: 'settings',   label: 'Settings & System Config', icon: <Settings size={16} />,       resource: 'settings' },
  { id: 'admin_users', label: 'Admin Management',       icon: <UserCog size={16} />,         resource: 'admin_users' },
  { id: 'audit_log',  label: 'Audit Log',               icon: <ScrollText size={16} />,      resource: 'audit_log' },
]

interface Props {
  active: NavView
  onChange: (v: NavView) => void
  onLogout?: () => void
}

export default function Sidebar({ active, onChange, onLogout }: Props) {
  const { admin, hasAnyAccess } = useAdmin()

  const visibleNavItems = navItems.filter((item) => {
    if (item.id === 'dashboard') return true
    return hasAnyAccess(item.resource)
  })

  const initials = (admin?.full_name || 'AD')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex flex-col w-[260px] bg-white/95 dark:bg-[#090E17]/95 backdrop-blur-xl border-r border-slate-200/90 dark:border-slate-800/80">
      {/* Brand Logo Header */}
      <div className="flex items-center px-5 h-16 border-b border-slate-200/80 dark:border-slate-800/80 flex-shrink-0">
        <KudiNodeLogo size="medium" />
      </div>

      {/* Nav Label */}
      <div className="px-5 pt-5 pb-2">
        <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-[0.14em]">
          Control Center
        </p>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-1 pb-3">
        {visibleNavItems.map(item => {
          const isActive = active === item.id
          return (
            <motion.button
              key={item.id}
              onClick={() => onChange(item.id)}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 relative group ${
                isActive
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/25'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className={`flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-violet-600 dark:group-hover:text-violet-400'}`}>
                {item.icon}
              </span>
              <span className="flex-1 text-left truncate">{item.label}</span>
              {isActive && <ChevronRight size={13} className="text-white/70 flex-shrink-0" />}
            </motion.button>
          )
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 border-t border-slate-200/80 dark:border-slate-800/80" />

      {/* Profile Card & Logout */}
      <div className="p-3.5 flex-shrink-0">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80">
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-sm">
              {initials}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-[#090E17] rounded-full" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight">{admin?.full_name || 'Admin'}</p>
            <p className="text-[10px] text-slate-400 font-medium truncate leading-tight mt-0.5">
              {admin?.role ? ROLE_LABELS[admin.role] : ''}
            </p>
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