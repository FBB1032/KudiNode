import React from 'react'
import { motion } from 'framer-motion'
import { ShieldX } from 'lucide-react'
import { useAdmin, ROLE_LABELS } from '../context/AdminContext'

export default function ForbiddenState({ resource }: { resource: string }) {
  const { admin } = useAdmin()
  const roleLabel = admin?.role ? ROLE_LABELS[admin.role] : 'Unknown role'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center text-center py-20"
    >
      <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center justify-center mb-4">
        <ShieldX size={30} className="text-red-500" />
      </div>
      <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
        Access Restricted
      </h2>
      <p className="text-[12px] text-slate-400 mt-1.5 max-w-md leading-relaxed">
        Your role (<span className="font-bold text-slate-600 dark:text-slate-300">{roleLabel}</span>)
        does not have permission to view <span className="font-bold text-slate-600 dark:text-slate-300">{resource}</span>.
        Contact a Super Admin if you believe this is a mistake.
      </p>
    </motion.div>
  )
}