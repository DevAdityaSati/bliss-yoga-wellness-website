import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Mail, Lock, Globe, Clock, Phone, AlertCircle, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { registerStudent, getPasswordStrength } from '../../services/authService';

interface PremiumRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  programTitle?: string;
  onSuccessRedirectToLogin: (email: string) => void;
}

export const PremiumRegisterModal: React.FC<PremiumRegisterModalProps> = ({
  isOpen,
  onClose,
  programTitle = 'Premium Program',
  onSuccessRedirectToLogin,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('United States');
  const [timezone, setTimezone] = useState('UTC');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setSuccessMsg('');
      try {
        const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (userTz) setTimezone(userTz);
      } catch {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const passStrength = getPasswordStrength(password);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setErrorMsg('Please enter a password.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (!acceptTerms) {
      setErrorMsg('Please accept the Terms of Service to complete registration.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerStudent({
        email: email.trim().toLowerCase(),
        password,
        fullName: fullName.trim(),
        country,
        timezone,
        phone: phone.trim() || undefined,
      });

      if (result.success) {
        setSuccessMsg('Account created successfully! Redirecting to Student Login...');
        setTimeout(() => {
          setIsLoading(false);
          onClose();
          onSuccessRedirectToLogin(email.trim().toLowerCase());
        }, 1200);
      } else {
        setErrorMsg(result.message || 'Registration failed. Please try again.');
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during registration.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg my-auto p-5 sm:p-7 bg-[#161a16] border border-[#c5a059]/30 rounded-2xl sm:rounded-3xl shadow-2xl overflow-y-auto max-h-[92vh] custom-scrollbar glass-card z-10"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-5 pr-6 pl-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#c5a059] text-[11px] font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Premium Program Registration</span>
            </div>
            <h3 className="text-xl font-bold text-[#f4f1ea] font-serif">
              Enroll in {programTitle}
            </h3>
            <p className="text-xs text-[#94a388] mt-1">
              Create your Student Account to access live sessions, class schedules, and your Student Dashboard.
            </p>
          </div>

          {/* Important Notice Box */}
          <div className="mb-5 p-3.5 rounded-xl bg-[#c5a059]/10 border border-[#c5a059]/30 text-xs text-[#f4f1ea]/90 leading-relaxed flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#c5a059] shrink-0 mt-0.5" />
            <p>
              <strong className="text-[#c5a059]">Notice:</strong> Please enter a valid email address. All payment confirmations, booking confirmations, class schedules and future communication will be sent to this email.
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

          {/* Registration Form */}
          <form onSubmit={handleRegister} className="space-y-3.5">
            {/* Full Name */}
            <div>
              <label className="block text-[11px] font-semibold text-white/80 uppercase tracking-wider mb-1">
                Full Name <span className="text-[#c5a059]">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-[#f4f1ea] placeholder-white/30 focus:outline-none focus:border-[#c5a059]"
                />
              </div>
            </div>

            {/* Email Address */}
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

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-white/80 uppercase tracking-wider mb-1">
                  Password <span className="text-[#c5a059]">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-[#f4f1ea] placeholder-white/30 focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
                {password && (
                  <div className="mt-1 space-y-0.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-white/50">Strength:</span>
                      <span className="font-semibold text-white/80">{passStrength.label}</span>
                    </div>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden flex gap-0.5">
                      <div className={`h-full flex-1 transition-all ${passStrength.score >= 1 ? passStrength.color : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 transition-all ${passStrength.score >= 2 ? passStrength.color : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 transition-all ${passStrength.score >= 3 ? passStrength.color : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 transition-all ${passStrength.score >= 4 ? passStrength.color : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 transition-all ${passStrength.score >= 5 ? passStrength.color : 'bg-transparent'}`} />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-white/80 uppercase tracking-wider mb-1">
                  Confirm Password <span className="text-[#c5a059]">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-[#f4f1ea] placeholder-white/30 focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>
            </div>

            {/* Country & Timezone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-white/80 uppercase tracking-wider mb-1">
                  Country
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full pl-10 pr-2 py-2.5 rounded-xl bg-[#161a16] border border-white/10 text-xs text-[#f4f1ea] focus:outline-none focus:border-[#c5a059]"
                  >
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Germany">Germany</option>
                    <option value="Japan">Japan</option>
                    <option value="India">India</option>
                    <option value="Other">Other Country</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-white/80 uppercase tracking-wider mb-1">
                  Timezone
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    placeholder="e.g. America/New_York"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-[#f4f1ea] placeholder-white/30 focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>
            </div>

            {/* Phone Number (optional) */}
            <div>
              <label className="block text-[11px] font-semibold text-white/80 uppercase tracking-wider mb-1">
                Phone Number <span className="text-white/40 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-[#f4f1ea] placeholder-white/30 focus:outline-none focus:border-[#c5a059]"
                />
              </div>
            </div>

            {/* Accept Terms */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-white/70">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 rounded border-white/20 text-[#c5a059] focus:ring-[#c5a059] bg-white/5"
                />
                <span>
                  I accept the Bliss Yoga & Wellness{' '}
                  <a href="#terms" className="text-[#c5a059] hover:underline">
                    Terms of Service
                  </a>{' '}
                  and Privacy Policy.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 mt-2 rounded-xl bg-[#c5a059] hover:bg-[#b08c46] text-[#121412] font-semibold text-xs transition-all shadow-lg shadow-[#c5a059]/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Registering Student Account...</span>
                </>
              ) : (
                <span>Register</span>
              )}
            </button>
          </form>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
