import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Lock, Mail, Eye, EyeOff, KeyRound, ArrowRight, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react'
import { KudiNodeLogo } from '../components/KudiNodeLogo'

interface Props {
  onLoginSuccess: () => void
}

export default function AdminLoginScreen({ onLoginSuccess }: Props) {
  const [step, setStep]         = useState<'CREDENTIALS' | '2FA_OTP'>('CREDENTIALS')
  const [email, setEmail]       = useState('ahmad.lawal@kudinode.com')
  const [password, setPassword] = useState('••••••••••••')
  const [otp, setOtp]           = useState('849201')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please enter your work email and password.')
      return
    }

    setError('')
    setLoading(true)

    setTimeout(() => {
      setLoading(false)
      setStep('2FA_OTP')
    }, 800)
  }

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp || otp.length < 6) {
      setError('Please enter the 6-digit 2FA code sent to your device.')
      return
    }

    setError('')
    setLoading(true)

    setTimeout(() => {
      setLoading(false)
      onLoginSuccess()
    }, 1000)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#080D14] text-white p-4 relative overflow-hidden font-sans">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] rounded-full bg-emerald-600/10 blur-[100px] pointer-events-none" />

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-md card bg-[#0D1321]/90 backdrop-blur-xl border border-slate-800 p-8 shadow-2xl relative z-10 space-y-6"
      >
        {/* Official Brand Logo */}
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <KudiNodeLogo size="large" variant="light" />
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-xl bg-red-950/40 border border-red-800/80 text-red-400 text-xs flex items-center gap-2 font-medium">
            <AlertCircle size={15} className="flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {step === 'CREDENTIALS' ? (
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              onSubmit={handleCredentialsSubmit}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Work Email / Admin ID
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="ahmad.lawal@kudinode.com"
                    className="input pl-10 py-2.5 w-full bg-slate-900/80 border-slate-800 text-white placeholder:text-slate-600 focus:border-purple-500 text-xs rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="input pl-10 pr-10 py-2.5 w-full bg-slate-900/80 border-slate-800 text-white placeholder:text-slate-600 focus:border-purple-500 text-xs rounded-xl outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-purple-600 focus:ring-0"
                  />
                  <span className="text-[11px] text-slate-400">Remember this workstation</span>
                </label>
                <button type="button" className="text-[11px] text-purple-400 hover:underline">
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary h-11 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 rounded-xl gap-2 mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Validating Credentials...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Continue to 2FA <ArrowRight size={14} />
                  </span>
                )}
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="step2"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              onSubmit={handleOtpSubmit}
              className="space-y-4 text-xs"
            >
              <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/60 text-center space-y-1">
                <ShieldCheck size={24} className="text-emerald-400 mx-auto" />
                <p className="font-bold text-white text-xs">Two-Factor Authentication Required</p>
                <p className="text-[11px] text-slate-400">
                  Enter the 6-digit security code sent to <span className="text-slate-200 font-bold">{email}</span>
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  6-Digit Verification Code
                </label>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    placeholder="849201"
                    className="input pl-10 py-3 w-full bg-slate-900/80 border-slate-800 text-white font-mono font-extrabold text-base tracking-[0.4em] text-center focus:border-purple-500 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setStep('CREDENTIALS')}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <ArrowLeft size={12} /> Back to Sign In
                </button>
                <button type="button" className="text-[11px] text-purple-400 hover:underline">
                  Resend Code
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 rounded-xl gap-2 mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying 2FA Code...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Verify Code & Enter Admin Console <CheckCircle2 size={15} />
                  </span>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="pt-4 border-t border-slate-800/80 text-center">
          <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
            <ShieldCheck size={13} className="text-emerald-500" />
            256-Bit SSL Encrypted Session · Connected to Wema Banking Rails
          </p>
        </div>
      </motion.div>
    </div>
  )
}
