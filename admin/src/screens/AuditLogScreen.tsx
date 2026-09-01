import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ScrollText, RefreshCw, Loader2, Search, Filter } from 'lucide-react'
import { getAuditLog, AuditLogEntry } from '../services/api'

const ACTION_COLORS: Record<string, string> = {
  admin_login: 'badge-info',
  create_admin: 'badge-purple',
  update_admin_role: 'badge-warning',
  deactivate_admin: 'badge-danger',
  approve_merchant: 'badge-success',
  reject_merchant: 'badge-danger',
  suspend_merchant: 'badge-warning',
  create_loan: 'badge-info',
  update_loan: 'badge-warning',
  create_coop_group: 'badge-info',
  update_coop_group: 'badge-warning',
  create_risk_flag: 'badge-danger',
  update_risk_flag: 'badge-warning',
  export_report: 'badge-success',
  update_settings: 'badge-purple',
}

function actionLabel(a: string) {
  return a.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

const c = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } }
const it = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.2 } } }

export default function AuditLogScreen() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('All Actions')
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getAuditLog({
        action: actionFilter === 'All Actions' ? undefined : actionFilter,
        page,
        limit: 50,
      })
      setEntries(res.entries)
    } catch (e: any) {
      setError(e?.message || 'Could not load audit log.')
    } finally {
      setLoading(false)
    }
  }, [actionFilter, page])

  useEffect(() => { load() }, [load])

  const filtered = search.trim()
    ? entries.filter((e) =>
        (e.admin?.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (e.admin?.email || '').toLowerCase().includes(search.toLowerCase()) ||
        e.action.toLowerCase().includes(search.toLowerCase()) ||
        (e.resource_id || '').toLowerCase().includes(search.toLowerCase()))
    : entries

  return (
    <motion.div variants={c} initial="hidden" animate="show" className="space-y-4">
      <motion.div variants={it} className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Audit Log</h2>
          <p className="text-[12px] text-slate-400 mt-0.5">
            Immutable trail of administrative actions for accountability and compliance.
          </p>
        </div>
        <button onClick={() => { setPage(1); load() }} className="btn-outline h-9 gap-1.5"><RefreshCw size={14} /> Refresh</button>
      </motion.div>

      <motion.div variants={it} className="card overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 flex-1 min-w-[220px] input py-2">
            <Search size={13} className="text-slate-400 flex-shrink-0" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by admin, email, action, or resource ID..."
              className="bg-transparent text-[13px] text-slate-700 dark:text-slate-300 placeholder:text-slate-400 outline-none flex-1" />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={13} className="text-slate-400" />
            <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1) }} className="input py-2 w-44 text-[12px]">
              <option>All Actions</option>
              {Object.keys(ACTION_COLORS).map((a) => <option key={a} value={a}>{actionLabel(a)}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 text-xs gap-2">
            <Loader2 size={16} className="animate-spin" /> Loading audit trail...
          </div>
        ) : error ? (
          <div className="p-5 text-center text-xs text-red-500 font-medium">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <ScrollText size={28} className="text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400 font-medium">No audit entries found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  {['Admin', 'Action', 'Resource', 'Details', 'IP', 'Timestamp'].map((h) => (
                    <th key={h} className="table-head-cell">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {filtered.map((e) => (
                  <tr key={e.id} className="table-row">
                    <td className="table-cell whitespace-nowrap">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 text-[12px]">{e.admin?.full_name || 'Unknown'}</p>
                      <p className="text-[10px] text-slate-400">{e.admin?.email || ''}</p>
                    </td>
                    <td className="table-cell whitespace-nowrap">
                      <span className={`badge ${ACTION_COLORS[e.action] ?? 'badge-slate'}`}>{actionLabel(e.action)}</span>
                    </td>
                    <td className="table-cell whitespace-nowrap">
                      <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">{e.resource_type}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{e.resource_id ? e.resource_id.slice(0, 8) : '—'}</p>
                    </td>
                    <td className="table-cell">
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[220px] truncate">
                        {Object.keys(e.details || {}).length ? JSON.stringify(e.details) : '—'}
                      </p>
                    </td>
                    <td className="table-cell text-[11px] text-slate-400 font-mono whitespace-nowrap">{e.ip_address || '—'}</td>
                    <td className="table-cell text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(e.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}