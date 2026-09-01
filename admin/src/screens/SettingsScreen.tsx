import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, MoreHorizontal, Shield, Server, Link2, Database, Activity, Clock, CheckCircle, Circle, Users, Settings, Key, Puzzle, X, Check, Save, Ban, ScrollText, History } from 'lucide-react'
import { useAdmin } from '../context/AdminContext'

const ALL_TABS = [
  { id: 'users',        label: 'Users & Roles',   icon: <Users size={14} />,     resource: 'admin_users', action: 'view' },
  { id: 'perms',        label: 'Permissions',     icon: <Shield size={14} />,    resource: 'admin_users', action: 'view' },
  { id: 'config',       label: 'System Config',   icon: <Settings size={14} />,  resource: 'settings',    action: 'view' },
  { id: 'integrations', label: 'Integrations',    icon: <Puzzle size={14} />,    resource: 'settings',    action: 'view' },
  { id: 'audit',        label: 'Audit Trail',     icon: <ScrollText size={14} />, resource: 'audit_log',   action: 'view' },
]

const SETTINGS_AUDIT_LOGS = [
  { id: 'SET-AUD-01', target: 'Security & Auth Subsystem', action: '2FA Requirement Enforced for Admin Tier', actor: 'Super Admin', time: '24 May 2026, 09:12', details: 'Global 2-Factor Authentication policy enabled for operations_manager, risk_officer & credit_analyst.', badge: 'badge-success' },
  { id: 'SET-AUD-02', target: 'Payment Node: Flutterwave', action: 'API Webhook Secret Rotated', actor: 'Super Admin', time: '23 May 2026, 17:30', details: 'Production settlement webhook signature keys refreshed. Automated test ping confirmed 200 OK.', badge: 'badge-purple' },
  { id: 'SET-AUD-03', target: 'Underwriting Parameter', action: 'Max Micro-Loan Threshold Updated', actor: 'Super Admin', time: '22 May 2026, 11:20', details: 'Maximum single loan cap adjusted from ₦3,500,000 to ₦5,000,000 for Tier-1 approved merchants.', badge: 'badge-info' },
  { id: 'SET-AUD-04', target: 'NIBSS BVN API Gateway', action: 'Rate Limit Throttling Adjusted', actor: 'Super Admin', time: '21 May 2026, 14:05', details: 'Direct query concurrency raised to 250 req/sec during market association onboarding drives.', badge: 'badge-warning' },
]

export interface AdminUser {
  id: string
  name: string
  initials: string
  role: string
  status: string
  lastActive: string
  color: string
}

const INITIAL_USERS: AdminUser[] = [
  { id: 'U-001', name: 'Ahmad Lawal',    initials: 'AL', role: 'Risk Officer',         status: 'Active',   lastActive: '24 May 2026, 09:41 AM', color: 'bg-violet-500' },
  { id: 'U-002', name: 'Funke Abikin',   initials: 'FA', role: 'Credit Analyst',       status: 'Active',   lastActive: '24 May 2026, 09:47 AM', color: 'bg-blue-500' },
  { id: 'U-003', name: 'Taiwo Balogun',  initials: 'TB', role: 'Compliance Officer',   status: 'Active',   lastActive: '24 May 2026, 08:55 AM', color: 'bg-emerald-500' },
  { id: 'U-004', name: 'Peace Okon',     initials: 'PO', role: 'Operations Manager',   status: 'Active',   lastActive: '23 May 2026, 11:00 PM', color: 'bg-amber-500' },
  { id: 'U-005', name: 'Daniel Johnson', initials: 'DJ', role: 'Admin',                status: 'Inactive', lastActive: '23 May 2026, 06:30 AM', color: 'bg-slate-500' },
]

const roleBadge: Record<string,string> = {
  'Risk Officer':         'badge-danger',
  'Credit Analyst':       'badge-info',
  'Compliance Officer':   'badge-warning',
  'Operations Manager':   'badge-purple',
  'Admin':                'badge-success',
}

const perms = [
  { role: 'Risk Officer',       view: 16, create: 12, edit: 14, del: 8  },
  { role: 'Credit Analyst',     view: 12, create: 10, edit: 8,  del: 2  },
  { role: 'Compliance Officer', view: 11, create: 6,  edit: 4,  del: 0  },
  { role: 'Operations Manager', view: 13, create: 7,  edit: 9,  del: 0  },
  { role: 'Admin',              view: 18, create: 15, edit: 16, del: 12 },
]

const sysInfo = [
  { label: 'Platform Version', value: 'v2.1.0',                     icon: <Activity size={14} />,  color: 'text-violet-500', good: true },
  { label: 'Environment',      value: 'Production',                   icon: <Server size={14} />,   color: 'text-blue-500',   good: true },
  { label: 'Database Status',  value: 'Healthy',                      icon: <Database size={14} />, color: 'text-emerald-500',good: true },
  { label: 'Last Backup',      value: '24 May 2026 03:00 AM',         icon: <Clock size={14} />,    color: 'text-amber-500',  good: true },
  { label: 'Uptime',           value: '99.98%',                       icon: <CheckCircle size={14}/>,color:'text-emerald-500',good: true },
]

const configs = [
  { title: 'Loan Thresholds',        icon: <Shield size={14} className="text-violet-500" />,  pairs: [['Max Loan Amount','₦5,000,000'],['Min Credit Score','60'],['Default Term','12 months'],['Interest Rate','4.5% monthly']] },
  { title: 'Notification Settings',  icon: <Activity size={14} className="text-blue-500" />,  pairs: [['Email Alerts','Enabled'],['SMS Notifications','Enabled'],['Push Notifications','Enabled'],['Daily Summary','08:00 AM']] },
  { title: 'Security Settings',      icon: <Key size={14} className="text-amber-500" />,       pairs: [['2FA Required','Admins only'],['Session Timeout','30 minutes'],['IP Whitelist','Enabled'],['Audit Logs','Enabled']] },
  { title: 'Data Retention',         icon: <Database size={14} className="text-emerald-500" />,pairs: [['Transaction Logs','7 years'],['User Activity','2 years'],['Backup Frequency','Daily'],['Archive Policy','Cold storage']] },
]

const integrations = [
  { name: 'Paystack',        type: 'Payment Gateway',      status: 'Connected', icon: <Link2 size={16} />,    iconBg: 'bg-blue-50 dark:bg-blue-900/20 text-blue-500' },
  { name: 'Flutterwave',     type: 'Payment Gateway',      status: 'Connected', icon: <Link2 size={16} />,    iconBg: 'bg-amber-50 dark:bg-amber-900/20 text-amber-500' },
  { name: 'NIBSS BVN API',   type: 'Identity Verification',status: 'Active',    icon: <Shield size={16} />,   iconBg: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' },
  { name: 'CRC Credit Bureau',type:'Credit Scoring',       status: 'Active',    icon: <CheckCircle size={16}/>,iconBg:'bg-violet-50 dark:bg-violet-900/20 text-violet-600' },
  { name: 'Termii SMS',      type: 'Notifications',        status: 'Connected', icon: <Activity size={16} />, iconBg: 'bg-pink-50 dark:bg-pink-900/20 text-pink-500' },
  { name: 'SendGrid',        type: 'Email Service',        status: 'Pending',   icon: <Server size={16} />,   iconBg: 'bg-slate-100 dark:bg-slate-800 text-slate-500' },
]

const c = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
const it = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.2 } } }

function PermBar({ val, max = 18 }: { val: number; max?: number }) {
  const pct = (val / max) * 100
  const color = pct >= 80 ? 'bg-violet-500' : pct >= 50 ? 'bg-blue-500' : pct >= 25 ? 'bg-amber-500' : 'bg-slate-400'
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex-shrink-0">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] text-slate-500">{val}/{max}</span>
    </div>
  )
}

export default function SettingsScreen() {
  const { can, isSuperAdmin } = useAdmin()
  const [tab, setTab] = useState(0)

  const TABS = ALL_TABS.filter((t) => can(t.resource, t.action))
  // Reset tab if no longer visible
  const validTab = TABS.length > 0 ? Math.min(tab, TABS.length - 1) : 0
  if (validTab !== tab && validTab >= 0) setTab(validTab)
  const currentTabId = TABS[validTab]?.id || 'users'
  const [usersList, setUsersList] = useState<AdminUser[]>(INITIAL_USERS)
  const [roleFilter, setRoleFilter] = useState('All Roles')
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [saveToast, setSaveToast] = useState(false)

  // New user state
  const [newUserName, setNewUserName] = useState('')
  const [newUserRole, setNewUserRole] = useState('Credit Analyst')

  const filteredUsers = usersList.filter(u =>
    roleFilter === 'All Roles' || u.role === roleFilter
  )

  const handleAddUserSubmit = () => {
    if (!newUserName) return
    const initials = newUserName.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()
    const created: AdminUser = {
      id: `U-00${usersList.length + 1}`,
      name: newUserName,
      initials,
      role: newUserRole,
      status: 'Active',
      lastActive: 'Just now',
      color: 'bg-violet-500',
    }
    setUsersList([...usersList, created])
    setShowAddUserModal(false)
    setNewUserName('')
  }

  const handleSaveConfig = () => {
    setSaveToast(true)
    setTimeout(() => setSaveToast(false), 3000)
  }

  return (
    <motion.div variants={c} initial="hidden" animate="show" className="space-y-4">
      <motion.div variants={it} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Settings & System Configuration</h2>
          <p className="text-[12px] text-slate-400 mt-0.5">Manage users, roles, permissions, integrations, and platform config</p>
        </div>
        {can('settings', 'edit') && (
          <button onClick={handleSaveConfig} className="btn-primary h-9 gap-1.5"><Save size={14} />Save Configurations</button>
        )}
      </motion.div>

      {/* Notification toast when saved */}
      <AnimatePresence>
        {saveToast && (
          <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }} className="p-3 rounded-xl bg-emerald-500 text-white font-bold text-xs flex items-center justify-between">
            <span>System Configurations Saved & Dispatched Successfully!</span>
            <Check size={16} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <motion.div variants={it} className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        {TABS.length === 0 ? (
          <div className="px-4 py-3 text-[12px] text-slate-400 font-medium">No settings tabs available for your role.</div>
        ) : TABS.map((t, i) => (
          <button key={t.label} onClick={() => setTab(i)} className={`flex items-center gap-2 px-4 py-3 text-[13px] font-semibold whitespace-nowrap border-b-2 transition-colors ${tab===i?'border-violet-600 text-violet-600 dark:text-violet-400 dark:border-violet-400':'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            <span className={tab===i?'text-violet-500':'text-slate-400'}>{t.icon}</span>{t.label}
          </button>
        ))}
      </motion.div>

      {/* ── Users & Roles ── */}
      {currentTabId === 'users' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <motion.div variants={it} className="card overflow-hidden xl:col-span-2">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
              <p className="text-sm font-bold text-slate-900 dark:text-white">Users</p>
              <div className="flex gap-2">
                <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="input py-1.5 text-[12px] w-40">
                  <option>All Roles</option>
                  {['Risk Officer','Credit Analyst','Compliance Officer','Operations Manager','Admin'].map(r=><option key={r}>{r}</option>)}
                </select>
                {can('admin_users', 'create') && (
                  <button onClick={() => setShowAddUserModal(true)} className="btn-primary h-8 px-3 text-[12px]"><Plus size={12} />Add User</button>
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                  <tr>{['Name','Role','Status','Last Active',''].map(h=><th key={h} className="table-head-cell">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="table-row">
                      <td className="table-cell">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full ${u.color} flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0`}>{u.initials}</div>
                          <div><p className="font-semibold text-slate-900 dark:text-white text-[13px]">{u.name}</p><p className="text-[10px] text-slate-400">{u.id}</p></div>
                        </div>
                      </td>
                      <td className="table-cell"><span className={roleBadge[u.role] ?? 'badge-slate'}>{u.role}</span></td>
                      <td className="table-cell">
                        <span className={`flex items-center gap-1.5 text-[12px] font-semibold ${u.status==='Active'?'text-emerald-600 dark:text-emerald-400':'text-slate-400'}`}>
                          <Circle size={7} className={u.status==='Active'?'fill-emerald-500 text-emerald-500':'fill-slate-400 text-slate-400'} />{u.status}
                        </span>
                      </td>
                      <td className="table-cell text-[11px] text-slate-400 whitespace-nowrap">{u.lastActive}</td>
                      <td className="table-cell"><button className="btn-icon p-1.5"><MoreHorizontal size={14} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          <div className="space-y-4">
            <motion.div variants={it} className="card p-5">
              <p className="text-sm font-bold text-slate-900 dark:text-white mb-3">System Information</p>
              <div className="space-y-2.5">
                {sysInfo.map((s,i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <span className={s.color}>{s.icon}</span>{s.label}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">{s.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Tab 1: Permissions */}
      {currentTabId === 'perms' && (
        <motion.div variants={it} className="card p-5 space-y-4">
          <p className="text-sm font-bold text-slate-900 dark:text-white">Role Permission Matrix</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-slate-100 dark:border-slate-800">{['Role','View Access','Create Access','Edit Access','Delete Access'].map(h=><th key={h} className="table-head-cell">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {perms.map((p,i) => (
                  <tr key={i} className="table-row">
                    <td className="table-cell font-semibold text-slate-900 dark:text-white">{p.role}</td>
                    <td className="table-cell"><PermBar val={p.view} /></td>
                    <td className="table-cell"><PermBar val={p.create} /></td>
                    <td className="table-cell"><PermBar val={p.edit} /></td>
                    <td className="table-cell"><PermBar val={p.del} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Tab 2: System Config */}
      {currentTabId === 'config' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {configs.map((cfg,i) => (
            <motion.div key={i} variants={it} className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                {cfg.icon}
                <p className="text-sm font-bold text-slate-900 dark:text-white">{cfg.title}</p>
              </div>
              <div className="space-y-2 text-xs">
                {cfg.pairs.map(([k,v]) => (
                  <div key={k} className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
                    <span className="text-slate-500">{k}</span>
                    <span className="font-bold text-slate-900 dark:text-white">{v}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Tab 3: Integrations */}
      {currentTabId === 'integrations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {integrations.map((ing,i) => (
            <motion.div key={i} variants={it} className="card p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`p-2.5 rounded-xl ${ing.iconBg}`}>{ing.icon}</span>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{ing.name}</p>
                  <p className="text-[10px] text-slate-400">{ing.type}</p>
                </div>
              </div>
              <span className={`badge-${ing.status==='Connected'||ing.status==='Active'?'success':'warning'}`}>{ing.status}</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Tab 4: Audit Trail (Super Admin) */}
      {currentTabId === 'audit' && (
        <motion.div variants={it} className="card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <History size={16} className="text-violet-500" />
                Security, Configuration & Key Rotation Audit Trail
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Audit trail of platform configuration updates, API key rotations, authentication policies, and security alerts
              </p>
            </div>
            <span className="badge-purple">Super Admin View</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  {['Audit ID', 'Subsystem / Target', 'Configuration Action', 'Audit Details', 'Authorizing Officer', 'Timestamp'].map(h => (
                    <th key={h} className="table-head-cell">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {SETTINGS_AUDIT_LOGS.map(log => (
                  <tr key={log.id} className="table-row">
                    <td className="table-cell font-mono text-[11px] font-bold text-slate-500">{log.id}</td>
                    <td className="table-cell font-bold text-slate-900 dark:text-white text-xs whitespace-nowrap">{log.target}</td>
                    <td className="table-cell whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${log.badge}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="table-cell text-[11px] text-slate-600 dark:text-slate-300 max-w-xs">
                      {log.details}
                    </td>
                    <td className="table-cell text-xs text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
                      {log.actor}
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
      )}

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Add New Admin User</h3>
                <button onClick={() => setShowAddUserModal(false)} className="btn-icon p-1"><X size={16} /></button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Full Name</label>
                  <input value={newUserName} onChange={e => setNewUserName(e.target.value)} placeholder="e.g. Ibrahim Suleiman" className="input py-2 w-full mt-1 text-[12px]" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Role</label>
                  <select value={newUserRole} onChange={e => setNewUserRole(e.target.value)} className="input py-2 w-full mt-1 text-[12px]">
                    {['Risk Officer','Credit Analyst','Compliance Officer','Operations Manager','Admin'].map(r=><option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowAddUserModal(false)} className="btn-outline flex-1 text-[12px]">Cancel</button>
                <button onClick={handleAddUserSubmit} className="btn-primary flex-1 text-[12px] font-bold gap-1.5">
                  <Check size={14} /> Add User
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
