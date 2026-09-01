import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, MoreHorizontal, Check, X, Loader2, Shield, UserPlus,
  Ban, RefreshCw, KeyRound,
} from 'lucide-react'
import {
  listAdminUsers,
  createAdminUser,
  updateAdminRole,
  deleteAdminUser,
  AdminStaffUser,
  AdminRole,
} from '../services/api'
import { ROLE_LABELS, ROLE_BADGES, useAdmin } from '../context/AdminContext'

const ALL_ROLES: AdminRole[] = [
  'super_admin',
  'operations_manager',
  'risk_officer',
  'credit_analyst',
  'compliance_officer',
]

const c = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
const it = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.2 } } }

export default function AdminUsersScreen() {
  const { admin: me, can } = useAdmin()
  const [users, setUsers] = useState<AdminStaffUser[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [roleFilter, setRoleFilter] = useState('All Roles')

  const [showAdd, setShowAdd] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState<AdminRole>('operations_manager')

  const [roleMenu, setRoleMenu] = useState<string | null>(null)
  const [pendingRole, setPendingRole] = useState<AdminRole | null>(null)

  const triggerToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await listAdminUsers({ limit: 100 })
      setUsers(res.users)
    } catch (e: any) {
      setError(e?.message || 'Could not load admin users.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const canCreate = can('admin_users', 'create')
  const canEdit = can('admin_users', 'edit')
  const canDelete = can('admin_users', 'delete')

  const filtered = users.filter(
    (u) => roleFilter === 'All Roles' || u.role === roleFilter,
  )

  const handleCreate = async () => {
    if (!newEmail || !newPassword || !newName) {
      triggerToast('Email, password and name are required.')
      return
    }
    setBusy(true)
    try {
      await createAdminUser({ email: newEmail, password: newPassword, full_name: newName, role: newRole })
      setShowAdd(false)
      setNewEmail(''); setNewPassword(''); setNewName(''); setNewRole('operations_manager')
      triggerToast('Admin account created.')
      load()
    } catch (e: any) {
      triggerToast(e?.message || 'Failed to create admin.')
    } finally {
      setBusy(false)
    }
  }

  const handleChangeRole = async (id: string, role: AdminRole) => {
    setBusy(true)
    try {
      await updateAdminRole(id, role)
      triggerToast('Role updated.')
      load()
    } catch (e: any) {
      triggerToast(e?.message || 'Failed to update role.')
    } finally {
      setBusy(false)
      setRoleMenu(null)
    }
  }

  const handleDeactivate = async (u: AdminStaffUser) => {
    if (u.id === me?.id) {
      triggerToast('You cannot deactivate your own account.')
      return
    }
    setBusy(true)
    try {
      await deleteAdminUser(u.id)
      triggerToast(`${u.full_name} deactivated.`)
      load()
    } catch (e: any) {
      triggerToast(e?.message || 'Failed to deactivate.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <motion.div variants={c} initial="hidden" animate="show" className="space-y-4">
      <motion.div variants={it} className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Admin Management</h2>
          <p className="text-[12px] text-slate-400 mt-0.5">
            Create, assign roles, and manage administrator access to the console.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-outline h-9 gap-1.5"><RefreshCw size={14} /> Refresh</button>
          {canCreate && (
            <button onClick={() => setShowAdd(true)} className="btn-primary h-9 gap-1.5">
              <UserPlus size={14} /> Add Admin
            </button>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={it} className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Admins', value: users.length, color: 'text-slate-900 dark:text-white' },
          { label: 'Active', value: users.filter((u) => u.is_active).length, color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Super Admins', value: users.filter((u) => u.role === 'super_admin').length, color: 'text-violet-600 dark:text-violet-400' },
        ].map((s) => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <Shield size={18} className="text-slate-400 flex-shrink-0" />
            <div>
              <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-[11px] text-slate-400">{s.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      <motion.div variants={it} className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <p className="text-sm font-bold text-slate-900 dark:text-white">Administrator Accounts</p>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input py-1.5 text-[12px] w-44">
            <option>All Roles</option>
            {ALL_ROLES.map((r) => <option key={r}>{ROLE_LABELS[r]}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 text-xs gap-2">
            <Loader2 size={16} className="animate-spin" /> Loading admin accounts...
          </div>
        ) : error ? (
          <div className="p-5 text-center text-xs text-red-500 font-medium">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  {['Name', 'Role', 'Status', 'Last Login', ''].map((h) => (
                    <th key={h} className="table-head-cell">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {filtered.map((u) => {
                  const isSelf = u.id === me?.id
                  return (
                    <tr key={u.id} className="table-row">
                      <td className="table-cell">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full ${isSelf ? 'bg-violet-500' : 'bg-slate-500'} flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0`}>
                            {u.full_name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white text-[13px]">
                              {u.full_name}{isSelf && <span className="text-[10px] text-violet-500 ml-1">(you)</span>}
                            </p>
                            <p className="text-[10px] text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        {canEdit && !isSelf ? (
                          <div className="relative">
                            <button onClick={() => { setRoleMenu(roleMenu === u.id ? null : u.id); setPendingRole(u.role) }} className={`badge ${ROLE_BADGES[u.role] ?? 'badge-slate'} cursor-pointer`}>
                              {ROLE_LABELS[u.role]} <MoreHorizontal size={10} />
                            </button>
                            <AnimatePresence>
                              {roleMenu === u.id && (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                  className="absolute left-0 top-full mt-1 z-20 card shadow-2xl p-1.5 min-w-[180px]">
                                  {ALL_ROLES.map((r) => (
                                    <button key={r} onClick={() => { if (pendingRole) handleChangeRole(u.id, r) }}
                                      className={`w-full text-left px-3 py-2 rounded-lg text-[12px] font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 ${u.role === r ? 'text-violet-600 dark:text-violet-400' : 'text-slate-600 dark:text-slate-300'}`}>
                                      {ROLE_LABELS[r]}
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ) : (
                          <span className={`badge ${ROLE_BADGES[u.role] ?? 'badge-slate'}`}>{ROLE_LABELS[u.role]}</span>
                        )}
                      </td>
                      <td className="table-cell">
                        <span className={`flex items-center gap-1.5 text-[12px] font-semibold ${u.is_active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {u.is_active ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="table-cell text-[11px] text-slate-400 whitespace-nowrap">
                        {u.last_login_at ? new Date(u.last_login_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never'}
                      </td>
                      <td className="table-cell">
                        {canDelete && !isSelf && (
                          <button onClick={() => handleDeactivate(u)} className="btn-icon p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30" title="Deactivate account">
                            <Ban size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Add Admin Modal */}
      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Create Admin Account</h3>
                <button onClick={() => setShowAdd(false)} className="btn-icon p-1"><X size={16} /></button>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Full Name</label>
                  <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Ibrahim Suleiman" className="input py-2 w-full mt-1 text-[12px]" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Email</label>
                  <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="admin@kudinode.ng" className="input py-2 w-full mt-1 text-[12px]" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1"><KeyRound size={11} /> Password (min 8 chars)</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="input py-2 w-full mt-1 text-[12px]" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Role</label>
                  <select value={newRole} onChange={(e) => setNewRole(e.target.value as AdminRole)} className="input py-2 w-full mt-1 text-[12px]">
                    {ALL_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowAdd(false)} className="btn-outline flex-1 text-[12px]">Cancel</button>
                <button onClick={handleCreate} disabled={busy} className="btn-primary flex-1 text-[12px] font-bold gap-1.5">
                  {busy ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Create Admin
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-6 right-6 z-50 p-3.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-2 shadow-2xl border border-slate-700">
            <Check size={14} className="text-emerald-400" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}