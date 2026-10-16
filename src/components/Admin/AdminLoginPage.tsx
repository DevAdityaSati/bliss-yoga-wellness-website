import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Mail, Lock, Sparkles, ArrowRight, AlertCircle, KeyRound, Leaf } from 'lucide-react';
import { loginAdmin } from '../../services/authService';
import { UserProfile } from '../../types';

interface AdminLoginPageProps {
  onLoginSuccess: (admin: UserProfile) => void;
  onNavigateHome: () => void;
}

export default function AdminLoginPage({ onLoginSuccess, onNavigateHome }: AdminLoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setForgotMsg('');

    try {
      const { user, error } = await loginAdmin(email, password);
      if (error || !user) {
        setErrorMsg(error || 'Invalid administrator credentials.');
      } else {
        onLoginSuccess(user);
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setForgotMsg('An administrative password reset email has been initiated to your studio mailbox.');
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 bg-[#0c0e0c] text-[#f4f1ea] overflow-hidden">
      {/* Animated Subtle Background Light Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-32 -left-32 w-96 h-96 bg-[#c5a059]/20 rounded-full blur-[120px] pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#94a388]/20 rounded-full blur-[120px] pointer-events-none"
      />

      {/* Main Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md p-8 sm:p-10 rounded-[2.5rem] bg-[#141814]/80 border border-white/15 backdrop-blur-3xl shadow-2xl space-y-8"
      >
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 group transition-transform hover:scale-105"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1e221d] to-[#121412] border border-[#c5a059]/40 flex items-center justify-center shadow-lg">
              <Leaf className="w-5 h-5 text-[#94a388]" />
            </div>
            <span className="font-serif text-xl font-semibold text-[#f4f1ea]">
              Bliss Yoga <span className="text-[#c5a059]">&</span> Wellness
            </span>
          </button>

          <div className="pt-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-[#c5a059] text-[11px] font-semibold uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>Studio Admin Console</span>
            </div>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl text-[#f4f1ea] font-normal">
            Administrator Authentication
          </h1>
          <p className="text-xs text-white/50 font-light max-w-xs mx-auto">
            Restricted portal for schedule management, bookings, student rosters & studio analytics.
          </p>
        </div>

        {/* Alert Notifications */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </motion.div>
        )}

        {forgotMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5"
          >
            <KeyRound className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{forgotMsg}</span>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[11px] font-semibold text-white/70 uppercase tracking-wider mb-2">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="youradmin@studio.com"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-[#f4f1ea] placeholder-white/30 focus:outline-none focus:border-[#c5a059] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-white/70 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-[#f4f1ea] placeholder-white/30 focus:outline-none focus:border-[#c5a059] transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-white/70 hover:text-white">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded bg-white/10 border-white/20 text-[#c5a059] focus:ring-0 cursor-pointer"
              />
              <span>Remember Me</span>
            </label>

            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-[#c5a059] hover:underline text-xs"
            >
              Forgot Password?
            </button>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl text-xs font-bold uppercase tracking-widest text-[#121412] gold-gradient gold-gradient-hover shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-[#121412] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Login to Dashboard</span>
                  <ArrowRight className="w-4 h-4 text-[#121412]" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-center pt-2">
          <button
            onClick={onNavigateHome}
            className="text-xs text-white/50 hover:text-white transition-colors"
          >
            ← Return to Public Website
          </button>
        </div>
      </motion.div>
    </div>
  );
}
