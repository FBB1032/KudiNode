import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle, XCircle, AlertTriangle, Info, X, Bell, Trash2, Download,
  Loader2, Eye, EyeOff, Search, Mail, Lock, User, Plus, MoreHorizontal,
  ChevronRight, ChevronDown, Shield, Zap, Star, TrendingUp, MapPin,
  UserCheck, Clock, Database, Activity, FileText, ArrowUpRight,
} from 'lucide-react'

type ToastType = 'success' | 'warning' | 'danger' | 'info'
type ModalType = 'confirm' | 'delete' | 'export'
interface Toast { id: number; type: ToastType; message: string }

const toastCfg: Record<ToastType,{icon:React.ReactNode;bg:string;text:string;label:string}> = {
  success: { icon:<CheckCircle size={15}/>,  bg:'bg-emerald-50 dark:bg-emerald-900/25 border-emerald-200 dark:border-emerald-800/60', text:'text-emerald-700 dark:text-emerald-300', label:'Success' },
  warning: { icon:<AlertTriangle size={15}/>,bg:'bg-amber-50 dark:bg-amber-900/25 border-amber-200 dark:border-amber-800/60',         text:'text-amber-700 dark:text-amber-300',   label:'Warning' },
  danger:  { icon:<XCircle size={15}/>,      bg:'bg-red-50 dark:bg-red-900/25 border-red-200 dark:border-red-800/60',                  text:'text-red-700 dark:text-red-300',       label:'Error' },
  info:    { icon:<Info size={15}/>,         bg:'bg-blue-50 dark:bg-blue-900/25 border-blue-200 dark:border-blue-800/60',              text:'text-blue-700 dark:text-blue-300',     label:'Info' },
}
const toastMsg: Record<ToastType,string> = {
  success: 'Loan approved — disbursement queued.',
  warning: 'Repayment rate below threshold.',
  danger:  'Fraud alert: merchant #M-2841 flagged.',
  info:    'New loan application #APP-3847 received.',
}
const modalCfg: Record<ModalType,{title:string;body:string;confirm:string;cClass:string;icon:React.ReactNode;iconBg:string}> = {
  confirm: { title:'Confirm Action',  body:'Are you sure you want to approve this loan? This action cannot be undone.',                  confirm:'Confirm', cClass:'btn-primary', icon:<CheckCircle size={20}/>,iconBg:'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400' },
  delete:  { title:'Delete Merchant', body:'This merchant and all associated records will be permanently removed. This cannot be undone.',confirm:'Delete',  cClass:'btn-danger',  icon:<Trash2 size={20}/>,    iconBg:'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' },
  export:  { title:'Export Report',   body:'Select a format to export. Large reports may take a few minutes to generate.',               confirm:'Export',  cClass:'btn-primary', icon:<Download size={20}/>,  iconBg:'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
}
const notifFeed = [
  { type:'danger',  icon:<XCircle size={13} className="text-red-500"/>,        bg:'bg-red-50 dark:bg-red-900/20',       text:'Fraud alert: merchant #M-2841 flagged', time:'2m ago' },
  { type:'warning', icon:<AlertTriangle size={13} className="text-amber-500"/>, bg:'bg-amber-50 dark:bg-amber-900/20',   text:'Repayment rate dropped below 90%',      time:'18m ago' },
  { type:'success', icon:<CheckCircle size={13} className="text-emerald-500"/>, bg:'bg-emerald-50 dark:bg-emerald-900/20',text:'Loan approved: ₦450,000 – Amina Bello', time:'35m ago' },
  { type:'info',    icon:<Info size={13} className="text-blue-500"/>,           bg:'bg-blue-50 dark:bg-blue-900/20',     text:'Batch disbursement ₦12.4M completed',  time:'1h ago' },
]
const c = { hidden:{}, show:{ transition:{ staggerChildren:0.05 } } }
const it = { hidden:{ opacity:0, y:12 }, show:{ opacity:1, y:0, transition:{ duration:0.2 } } }

/* ── Section wrapper ─── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div variants={it} className="space-y-3">
      <p className="section-label">{title}</p>
      {children}
    </motion.div>
  )
}

/* ── Skeleton components ─── */
function SkeletonKpi() {
  return (
    <div className="kpi-card animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700" />
        <div className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-700" />
      </div>
      <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-2" />
      <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-3" />
      <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/3 rounded-full" />
    </div>
  )
}
function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800 animate-pulse">
      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-40" />
        <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded w-24" />
      </div>
      <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-full w-16" />
      <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-5" />
    </div>
  )
}

export default function UIStatesScreen() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [modal, setModal] = useState<ModalType|null>(null)
  const [drawer, setDrawer] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [accordion, setAccordion] = useState<number|null>(null)
  const [tab, setTab] = useState(0)

  const addToast = (type: ToastType) => {
    const id = Date.now()
    setToasts(p => [...p, { id, type, message: toastMsg[type] }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4500)
  }
  const simulateLoad = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 2200)
  }

  return (
    <motion.div variants={c} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={it}>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Component Library</h2>
        <p className="text-[12px] text-slate-400 mt-0.5">Live interactive showcase of every UI primitive used across KudiNode Admin</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">

        {/* ── Buttons ── */}
        <Section title="Button Variants">
          <div className="card p-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              <button className="btn-primary h-9 px-4"><Zap size={13} />Primary</button>
              <button className="btn-outline h-9 px-4"><Shield size={13} />Outline</button>
              <button className="btn-ghost h-9 px-4"><Star size={13} />Ghost</button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="btn-danger h-9 px-4"><Trash2 size={13} />Danger</button>
              <button className="btn-success h-9 px-4"><CheckCircle size={13} />Success</button>
              <button className="btn-icon h-9 w-9"><MoreHorizontal size={15} /></button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={simulateLoad} className="btn-primary h-9 px-4 min-w-[120px]">
                {loading ? <><Loader2 size={13} className="animate-spin" />Loading...</> : <><Zap size={13} />Click Me</>}
              </button>
              <button disabled className="btn-primary h-9 px-4 opacity-40 cursor-not-allowed">Disabled</button>
            </div>
          </div>
        </Section>

        {/* ── Badges ── */}
        <Section title="Badge & Status Indicators">
          <div className="card p-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              <span className="badge-success"><CheckCircle size={9} />Active</span>
              <span className="badge-warning"><AlertTriangle size={9} />Pending</span>
              <span className="badge-danger"><XCircle size={9} />Suspended</span>
              <span className="badge-info"><Info size={9} />New</span>
              <span className="badge-purple"><Zap size={9} />Premium</span>
              <span className="badge-slate">Default</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="badge-success"><UserCheck size={9} />Tier 1 Verified</span>
              <span className="badge-warning"><Shield size={9} />Tier 2</span>
              <span className="badge-danger">Tier 3</span>
            </div>
            <div className="space-y-2 pt-1">
              {[['Trust Score — 87','87%','bg-emerald-500'],['Trust Score — 62','62%','bg-amber-500'],['Trust Score — 31','31%','bg-red-500']].map(([label,w,color])=>(
                <div key={label} className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-500 w-32 flex-shrink-0">{label}</span>
                  <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full`} style={{ width: w }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── Form Inputs ── */}
        <Section title="Form Inputs & Validation">
          <div className="card p-4 space-y-3">
            <div>
              <label className="label"><Mail size={11} className="inline mr-1" />Email address</label>
              <input placeholder="admin@kudinode.ng" className="input" />
            </div>
            <div>
              <label className="label"><Lock size={11} className="inline mr-1" />Password</label>
              <div className="relative">
                <input type={showPw?'text':'password'} placeholder="••••••••••" className="input pr-10" />
                <button onClick={()=>setShowPw(p=>!p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw?<EyeOff size={14}/>:<Eye size={14}/>}
                </button>
              </div>
            </div>
            <div>
              <label className="label">Input with error</label>
              <input defaultValue="invalid@" className="input-error" />
              <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><XCircle size={10}/>Please enter a valid email address</p>
            </div>
            <div className="flex items-center gap-2 input py-2 px-3">
              <Search size={13} className="text-slate-400 flex-shrink-0"/>
              <input placeholder="Search merchants, loans..." className="bg-transparent text-[13px] placeholder:text-slate-400 outline-none flex-1 text-slate-700 dark:text-slate-300"/>
            </div>
          </div>
        </Section>

        {/* ── Toast Alerts ── */}
        <Section title="Alert & Toast Messages">
          <div className="card p-4 space-y-2.5">
            {(['success','warning','danger','info'] as ToastType[]).map(type => {
              const cfg = toastCfg[type]
              return (
                <div key={type} className={`flex items-start gap-3 p-3 rounded-xl border ${cfg.bg}`}>
                  <span className={`mt-0.5 flex-shrink-0 ${cfg.text}`}>{cfg.icon}</span>
                  <div className="flex-1">
                    <p className={`text-[12px] font-bold ${cfg.text}`}>{cfg.label}</p>
                    <p className={`text-[11px] mt-0.5 opacity-90 ${cfg.text}`}>{toastMsg[type]}</p>
                  </div>
                </div>
              )
            })}
            <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
              {(['success','warning','danger','info'] as ToastType[]).map(t=>(
                <button key={t} onClick={()=>addToast(t)} className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg border ${toastCfg[t].bg} ${toastCfg[t].text}`}>
                  Fire {toastCfg[t].label}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* ── Modals ── */}
        <Section title="Dialogs & Confirmation Modals">
          <div className="card p-4 space-y-2">
            {(['confirm','delete','export'] as ModalType[]).map(m=>(
              <button key={m} onClick={()=>setModal(m)} className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group">
                <div className="flex items-center gap-3">
                  <span className={`p-2 rounded-lg ${modalCfg[m].iconBg}`}>{modalCfg[m].icon}</span>
                  <div>
                    <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200">{modalCfg[m].title}</p>
                    <p className="text-[11px] text-slate-400">{m==='confirm'?'Approve a loan application':m==='delete'?'Remove a merchant record':'Generate and download data'}</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-600 transition-colors flex-shrink-0" />
              </button>
            ))}
          </div>
        </Section>

        {/* ── Notifications Drawer ── */}
        <Section title="Notification Drawer & Tabs">
          <div className="card overflow-hidden">
            <div className="flex border-b border-slate-100 dark:border-slate-800">
              {['All','Unread','Alerts'].map((t,i)=>(
                <button key={t} onClick={()=>setTab(i)} className={`flex-1 py-2.5 text-[12px] font-semibold border-b-2 transition-colors ${tab===i?'border-violet-600 text-violet-600 dark:text-violet-400':'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>{t}</button>
              ))}
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-800/50 max-h-52 overflow-y-auto">
              {notifFeed.map((n,i)=>(
                <div key={i} className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors`}>
                  <span className={`mt-0.5 p-1.5 rounded-lg flex-shrink-0 ${n.bg}`}>{n.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-slate-700 dark:text-slate-300 font-medium leading-snug">{n.text}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1"><Clock size={9}/>{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button className="text-[11px] text-violet-600 dark:text-violet-400 font-semibold hover:underline">Mark all read</button>
              <button onClick={()=>setDrawer(true)} className="btn-primary h-7 px-3 text-[11px]"><Bell size={11}/>Open Drawer</button>
            </div>
          </div>
        </Section>

        {/* ── Skeleton Loading ── */}
        <Section title="Skeleton Loading States">
          <div className="space-y-3">
            <SkeletonKpi />
            <div className="card overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 animate-pulse">
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-32" />
              </div>
              {[0,1,2].map(i=><SkeletonRow key={i} />)}
            </div>
          </div>
        </Section>

        {/* ── Empty States ── */}
        <Section title="Empty States">
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon:<FileText size={24} className="text-slate-300 dark:text-slate-600"/>, label:'No Merchants', sub:'Try a different filter' },
              { icon:<Database size={24} className="text-slate-300 dark:text-slate-600"/>, label:'No Data',       sub:'Nothing to display yet' },
              { icon:<Bell size={24} className="text-slate-300 dark:text-slate-600"/>,    label:'No Alerts',    sub:'All clear right now' },
            ].map(e=>(
              <div key={e.label} className="card p-4 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-2">{e.icon}</div>
                <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">{e.label}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{e.sub}</p>
                <button className="mt-2 text-[10px] text-violet-600 dark:text-violet-400 font-semibold hover:underline">Reset</button>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Accordion ── */}
        <Section title="Accordion / Expandable Panels">
          <div className="card overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
            {[
              { title:'KYC Verification Requirements', body:'Merchants must submit a valid government-issued ID, proof of business address, and BVN verification to achieve Tier 1 status.' },
              { title:'Loan Eligibility Criteria',      body:'Applicants need a minimum trust score of 60, at least 3 months of transaction history, and no active defaults on record.' },
              { title:'Co-op Group Formation Rules',   body:'A minimum of 10 members required. Each member must be KYC-verified. The group must maintain a healthy repayment rate above 85%.' },
            ].map((item,i)=>(
              <div key={i}>
                <button onClick={()=>setAccordion(accordion===i?null:i)} className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors text-left">
                  <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-200">{item.title}</span>
                  <motion.span animate={{ rotate: accordion===i?180:0 }} transition={{ duration:0.2 }}><ChevronDown size={15} className="text-slate-400"/></motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {accordion===i && (
                    <motion.div initial={{ height:0,opacity:0 }} animate={{ height:'auto',opacity:1 }} exit={{ height:0,opacity:0 }} transition={{ duration:0.2 }} className="overflow-hidden">
                      <p className="px-5 pb-4 text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed">{item.body}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </Section>

      </div>

      {/* ── Live Toast Stack ── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t=>{
            const cfg = toastCfg[t.type]
            return (
              <motion.div key={t.id} initial={{ opacity:0,x:60,scale:0.95 }} animate={{ opacity:1,x:0,scale:1 }} exit={{ opacity:0,x:60,scale:0.95 }} transition={{ duration:0.2 }}
                className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl w-80 ${cfg.bg}`}>
                <span className={`flex-shrink-0 ${cfg.text}`}>{cfg.icon}</span>
                <div className="flex-1">
                  <p className={`text-[12px] font-bold ${cfg.text}`}>{cfg.label}</p>
                  <p className={`text-[11px] opacity-90 ${cfg.text}`}>{t.message}</p>
                </div>
                <button onClick={()=>setToasts(p=>p.filter(x=>x.id!==t.id))} className={`flex-shrink-0 opacity-60 hover:opacity-100 ${cfg.text}`}><X size={13}/></button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* ── Modal ── */}
      <AnimatePresence>
        {modal && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 backdrop-blur-sm" onClick={()=>setModal(null)} />
            <motion.div initial={{ opacity:0,scale:0.94,y:16 }} animate={{ opacity:1,scale:1,y:0 }} exit={{ opacity:0,scale:0.94 }} className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
              <div className="card w-full max-w-md p-6 shadow-2xl pointer-events-auto">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`p-2.5 rounded-xl flex-shrink-0 ${modalCfg[modal].iconBg}`}>{modalCfg[modal].icon}</span>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{modalCfg[modal].title}</h3>
                  </div>
                  <button onClick={()=>setModal(null)} className="btn-icon p-1.5 flex-shrink-0"><X size={15}/></button>
                </div>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed mb-5">{modalCfg[modal].body}</p>
                {modal==='export' && (
                  <div className="mb-5 grid grid-cols-3 gap-2">
                    {['PDF','Excel','CSV'].map(f=>(
                      <label key={f} className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 text-[12px] font-semibold text-slate-700 dark:text-slate-300">
                        <input type="radio" name="fmt" className="accent-violet-600" defaultChecked={f==='PDF'}/>{f}
                      </label>
                    ))}
                  </div>
                )}
                <div className="flex gap-3 justify-end">
                  <button onClick={()=>setModal(null)} className="btn-outline">Cancel</button>
                  <button onClick={()=>setModal(null)} className={modalCfg[modal].cClass}>{modalCfg[modal].confirm}</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Drawer ── */}
      <AnimatePresence>
        {drawer && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" onClick={()=>setDrawer(false)} />
            <motion.div initial={{ x:'100%' }} animate={{ x:0 }} exit={{ x:'100%' }} transition={{ type:'spring',damping:30,stiffness:300 }} className="fixed right-0 inset-y-0 w-80 bg-white dark:bg-[#111827] border-l border-slate-200 dark:border-slate-800 z-50 flex flex-col shadow-2xl">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">Notifications Center</p>
                  <p className="text-[11px] text-slate-400">{notifFeed.length} unread alerts</p>
                </div>
                <button onClick={()=>setDrawer(false)} className="btn-icon p-1.5"><X size={15}/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {notifFeed.map((n,i)=>(
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer hover:opacity-90 transition-opacity ${n.bg}`}>
                    <span className="mt-0.5 flex-shrink-0">{n.icon}</span>
                    <div>
                      <p className="text-[12px] text-slate-700 dark:text-slate-300 font-medium leading-snug">{n.text}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                <button className="w-full btn-primary py-2.5 text-[13px]"><Bell size={13}/>Mark All as Read</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
