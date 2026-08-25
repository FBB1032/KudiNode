import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Activity,
  Server,
} from "lucide-react";
import { KudiNodeLogo } from "../components/KudiNodeLogo";
import { adminLogin } from "../services/api";

interface Props {
  onLoginSuccess: () => void;
}

export default function AdminLoginScreen({ onLoginSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter your work email and password.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await adminLogin(email.trim(), password);
      onLoginSuccess();
    } catch (err: any) {
      setError(err?.message || "Sign in failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#06090E] text-white p-4 relative overflow-hidden font-sans">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[680px] h-[680px] rounded-full bg-violet-600/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[420px] h-[420px] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-10 left-10 w-[300px] h-[300px] rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none" />

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-md bg-[#0D1321]/95 backdrop-blur-2xl border border-slate-800/90 rounded-3xl p-8 shadow-2xl shadow-black/80 relative z-10 space-y-6"
      >
        {/* Top Status Strip */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              System Online
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
            <Server size={11} className="text-violet-400" />
            <span>HQ Console v2.4</span>
          </div>
        </div>

        {/* Official Brand Logo */}
        <div className="flex flex-col items-center justify-center text-center pt-1">
          <KudiNodeLogo size="large" variant="light" />
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/80 text-red-300 text-xs flex items-center gap-2.5 font-medium shadow-sm"
          >
            <AlertCircle size={15} className="text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleCredentialsSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
              Work Email / Admin ID
            </label>
            <div className="relative">
              <Mail
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="fahdbadamasi320@gmail.com"
                className="w-full bg-[#06090E]/90 border border-slate-800 text-white placeholder:text-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-xs rounded-xl pl-10 pr-3.5 py-3 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full bg-[#06090E]/90 border border-slate-800 text-white placeholder:text-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-xs rounded-xl pl-10 pr-10 py-3 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-slate-800 bg-[#06090E] text-violet-600 focus:ring-0 cursor-pointer"
              />
              <span className="text-[11px] text-slate-400 font-medium">
                Keep session active
              </span>
            </label>
            <span className="text-[11px] text-violet-400/90 font-medium">
              Wema Sandbox 2026
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-violet-600/30 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-2 select-none"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Authenticating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Sign In to Admin Console <ArrowRight size={14} />
              </span>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800/80 text-center">
          <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1.5 font-medium">
            <ShieldCheck size={13} className="text-emerald-400" />
            256-Bit SSL Encrypted Admin Session · Connected to Backend
          </p>
        </div>
      </motion.div>
    </div>
  );
}
