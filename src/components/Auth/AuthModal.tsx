import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, Globe, Clock, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Phone, Sparkles } from 'lucide-react';
import { loginStudent, signUpStudent } from '../../services/authService';
import { UserProfile } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  initialMode?: 'login' | 'signup';
  initialEmail?: string;
}

export default function AuthModal({ isOpen, onClose, onSuccess, initialMode = 'login', initialEmail = '' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState(initialEmail);
  const [rememberMe, setRememberMe] = useState(true);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('United States');
  const [timezone, setTimezone] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    setMode(initialMode);
    setErrorMsg('');
    setSuccessMsg('');
    if (initialEmail) setEmail(initialEmail);
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setPhone('');

    // Auto detect user's timezone
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) setTimezone(tz);
    } catch {
      setTimezone('UTC');
    }
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const validateEmailFormat = (str: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(str.trim());
  };

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-white/20' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass)) score++;

    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-400' };
    if (score === 3) return { score, label: 'Fair', color: 'bg-amber-400' };
    if (score === 4) return { score, label: 'Good', color: 'bg-blue-400' };
    return { score, label: 'Strong', color: 'bg-emerald-400' };
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (!validateEmailFormat(email)) {
      setErrorMsg('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'login') {
        const { user, error } = await loginStudent(email, password);
        if (error || !user) {
          setErrorMsg(error || 'Incorrect email or password.');
        } else {
          setSuccessMsg('Welcome back! Authentication successful.');
          setTimeout(() => {
            onSuccess(user);
            onClose();
          }, 800);
        }
      } else if (mode === 'signup') {
        if (!fullName.trim()) {
          setErrorMsg('Please enter your full name.');
          setLoading(false);
          return;
        }

        if (password.length < 8) {
          setErrorMsg('Password must be at least 8 characters long.');
          setLoading(false);
          return;
        }

        if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
          setErrorMsg('Password must contain uppercase, lowercase, number, and special character.');
          setLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          setErrorMsg('Passwords do not match.');
          setLoading(false);
          return;
        }

        if (!acceptTerms) {
          setErrorMsg('Please accept the Terms & Conditions to proceed.');
          setLoading(false);
          return;
        }

        const { user, error } = await signUpStudent(email, password, fullName, country, timezone, phone);
        if (error || !user) {
          const isAlreadyRegistered = error?.toLowerCase().includes('exist') || error?.toLowerCase().includes('registered') || error?.toLowerCase().includes('log in');
          if (isAlreadyRegistered) {
            setErrorMsg('An account with this email already exists! Switched to Sign In mode.');
            setMode('login');
          } else {
            setErrorMsg(error || 'Failed to create account.');
          }
        } else {
          try {
            localStorage.setItem('bliss_registered_email', email.trim().toLowerCase());
          } catch {}
          setSuccessMsg('Registration successful! Logging into your portal...');
          setTimeout(() => {
            onSuccess(user);
            onClose();
          }, 800);
        }
      } else if (mode === 'forgot') {
        setSuccessMsg(`Password reset instructions have been dispatched to ${email}. Check your inbox.`);
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const passStrength = getPasswordStrength(password);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md my-auto p-5 sm:p-6 bg-[#161a16] border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-y-auto max-h-[88vh] custom-scrollbar glass-card z-10"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Title */}
          <div className="mb-5 text-center">
            <h3 className="font-serif text-2xl font-bold text-[#f4f1ea]">
              {mode === 'login' ? 'Student Login' : 'Reset Password'}
            </h3>
            <p className="text-xs text-[#94a388] mt-1">
              {mode === 'login'
                ? 'Access your booked programs, live meeting links, and student dashboard.'
                : 'Enter your registered email to receive password reset instructions.'}
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {/* Success Message */}
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}

          {/* Notice for Student Portal Applicability */}
          {mode === 'login' && (
            <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-br from-[#c5a059]/20 via-[#1e231d] to-[#141814] border border-[#c5a059]/40 text-[#f4f1ea] text-xs leading-relaxed space-y-2 shadow-lg">
              <div className="flex items-center gap-2 font-bold text-[#c5a059] uppercase tracking-wider text-[11px]">
                <Sparkles className="w-4 h-4 text-[#c5a059] shrink-0" />
                <span>Student Portal Access Notice</span>
              </div>
              <p className="text-white/90">
                <strong>Important:</strong> The Student Login Portal is created exclusively for students who register or quick-book our <strong>12-Day</strong> or <strong>15-Day Intensive Programs</strong>.
              </p>
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-[11px] text-white/80 space-y-1">
                <p>• <strong>12-Day & 15-Day Students:</strong> Access your live Jitsi "JOIN CLASS" button both here in your <strong>Student Portal</strong> and via <strong>Gmail/Email</strong>.</p>
                <p>• <strong>All Other Sessions:</strong> No login required! Your "JOIN CLASS" button is delivered directly to your <strong>Email</strong> inbox upon admin approval.</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-white/80 uppercase tracking-wider mb-1">
                Email Address <span className="text-[#c5a059]">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-[#f4f1ea] placeholder-white/30 focus:outline-none focus:border-[#c5a059]"
                />
              </div>
            </div>

            {mode === 'login' && (
              <div>
                <label className="block text-[11px] font-semibold text-white/80 uppercase tracking-wider mb-1">
                  Password <span className="text-[#c5a059]">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-[#f4f1ea] placeholder-white/30 focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-white/70 hover:text-white">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-white/20 bg-white/5 text-[#c5a059] focus:ring-[#c5a059]"
                  />
                  <span>Remember Me</span>
                </label>

                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-[#c5a059] hover:underline text-xs"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 rounded-xl text-xs font-bold uppercase tracking-wider text-[#121412] gold-gradient gold-gradient-hover shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-[#121412] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'Login' : 'Send Reset Link'}</span>
                  <ArrowRight className="w-4 h-4 text-[#121412]" />
                </>
              )}
            </button>
          </form>

          {mode === 'forgot' && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs text-white/60 hover:text-white transition-colors"
              >
                ← Back to Login
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
