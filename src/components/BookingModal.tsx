import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, Clock, Globe, Sparkles, ShieldCheck, CreditCard, QrCode, AlertCircle, ExternalLink, Copy, Check, Lock, Layers, Calendar, Repeat, Sliders } from 'lucide-react';
import { PROGRAMS } from '../data/content';
import { WORLD_COUNTRIES, COMMON_TIMEZONES } from '../data/countries';
import { createBooking } from '../services/bookingService';
import { getPaymentSettings, submitPaymentVerification } from '../services/paymentService';
import { sendEmailAutomation } from '../services/emailService';
import { PaymentSettings } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  initialProgramId?: string;
  onClose: () => void;
}

export default function BookingModal({ isOpen, initialProgramId, onClose }: BookingModalProps) {
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [selectedProgram, setSelectedProgram] = useState(initialProgramId || 'hatha-yoga');
  const [format, setFormat] = useState<'group' | 'private'>('group');
  const [level, setLevel] = useState<string>('Beginner');
  const [country, setCountry] = useState<string>('United States');
  
  // Timezone state
  const [detectedZone, setDetectedZone] = useState<string>('UTC');
  const [selectedZone, setSelectedZone] = useState<string>('UTC');
  const [useAutoZone, setUseAutoZone] = useState<boolean>(true);
  
  // Date & Time Slot
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];
  
  const [selectedDate, setSelectedDate] = useState<string>(defaultDateStr);
  const [timeSelectionMode, setTimeSelectionMode] = useState<'preset' | 'custom'>('custom');
  const [selectedPresetSlot, setSelectedPresetSlot] = useState<string>('07:00 AM Local Time (Morning Practice)');
  const [customTimeValue, setCustomTimeValue] = useState<string>('08:30');
  
  // User info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  // Multi-day program custom schedule & frequency states
  const isMultiDayProgram = selectedProgram === '12-day-bliss-transformation' || selectedProgram === '15-day-bliss-complete-wellness';
  const totalDaysCount = selectedProgram === '12-day-bliss-transformation' ? 12 : selectedProgram === '15-day-bliss-complete-wellness' ? 15 : 1;

  const [schedulePattern, setSchedulePattern] = useState<'alternate' | 'thrice_weekly' | 'twice_weekly' | 'gap_2' | 'gap_3' | 'daily' | 'custom'>('alternate');
  const [customScheduleNotes, setCustomScheduleNotes] = useState<string>('');
  const [showAllDatesPreview, setShowAllDatesPreview] = useState<boolean>(false);

  const calculateProgramDates = (start: string, pattern: string, count: number): string[] => {
    const dates: string[] = [];
    if (!start) return dates;
    let curr = new Date(start);
    if (isNaN(curr.getTime())) curr = new Date();

    for (let i = 0; i < count; i++) {
      dates.push(curr.toISOString().split('T')[0]);
      if (pattern === 'daily') {
        curr.setDate(curr.getDate() + 1);
      } else if (pattern === 'alternate') {
        curr.setDate(curr.getDate() + 2);
      } else if (pattern === 'gap_2') {
        curr.setDate(curr.getDate() + 3);
      } else if (pattern === 'gap_3') {
        curr.setDate(curr.getDate() + 4);
      } else if (pattern === 'thrice_weekly') {
        const day = curr.getDay();
        if (day === 1 || day === 3) curr.setDate(curr.getDate() + 2);
        else curr.setDate(curr.getDate() + 3);
      } else if (pattern === 'twice_weekly') {
        const day = curr.getDay();
        if (day === 1 || day === 2) curr.setDate(curr.getDate() + 3);
        else curr.setDate(curr.getDate() + 4);
      } else {
        curr.setDate(curr.getDate() + 2);
      }
    }
    return dates;
  };

  const getPatternLabel = (pat: string) => {
    switch (pat) {
      case 'alternate': return 'Alternate Days (Every 2nd Day)';
      case 'thrice_weekly': return '3 Times / Week (e.g. Mon, Wed, Fri)';
      case 'twice_weekly': return '2 Times / Week (e.g. Tue & Thu)';
      case 'gap_2': return '2 Days Gap (Every 3rd Day)';
      case 'gap_3': return '3 Days Gap (Every 4th Day)';
      case 'daily': return 'Daily Continuous (12/15 Days Straight)';
      case 'custom': return 'Custom Range / Flex Schedule';
      default: return 'Alternate Days';
    }
  };

  const calculatedDates = isMultiDayProgram ? calculateProgramDates(selectedDate, schedulePattern, totalDaysCount) : [];

  // Payment states
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<'paypal' | 'qr' | 'both'>('both');
  const [transactionRef, setTransactionRef] = useState('');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [receiptScreenshot, setReceiptScreenshot] = useState<string>('');
  const [receiptFileError, setReceiptFileError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verificationResultStatus, setVerificationResultStatus] = useState<string>('Pending Manual Verification');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to format custom time 24h to 12h display
  const getFormattedCustomTime = (time24: string) => {
    if (!time24) return '08:30 AM Local Time (Custom Schedule)';
    const [hStr, mStr] = time24.split(':');
    let h = parseInt(hStr, 10);
    const m = mStr || '00';
    if (isNaN(h)) return '08:30 AM Local Time (Custom Schedule)';
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    const formattedH = h < 10 ? `0${h}` : `${h}`;
    return `${formattedH}:${m} ${ampm} Local Time (Custom Schedule)`;
  };

  const activeTimeSlotDisplay = timeSelectionMode === 'preset'
    ? selectedPresetSlot
    : getFormattedCustomTime(customTimeValue);

  // Load payment settings on mount
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      setDetectedZone(tz);
      setSelectedZone(tz);
    } catch {
      setDetectedZone('UTC');
      setSelectedZone('UTC');
    }

    if (isOpen) {
      setStep('details');
      setIsSubmitted(false);
      setIsSubmitting(false);
      setVerificationError(null);
      setReceiptFileError(null);
      setReceiptScreenshot('');
      setTransactionRef('');
      if (initialProgramId) {
        setSelectedProgram(initialProgramId);
      }
    }

    getPaymentSettings().then(setPaymentSettings);
  }, [isOpen, initialProgramId]);

  if (!isOpen) return null;

  const currentProg = PROGRAMS.find((p) => p.id === selectedProgram) || PROGRAMS[0];
  const isGroup = format === 'group';
  const basePrice = isGroup ? currentProg.groupPrice : currentProg.privatePrice;
  const taxRate = paymentSettings?.tax_percentage ?? 5;
  const taxAmount = isGroup ? 0 : (basePrice * taxRate) / 100;
  const totalAmount = basePrice + taxAmount;
  const currencySymbol = paymentSettings?.currency === 'INR' ? '₹' : paymentSettings?.currency === 'EUR' ? '€' : paymentSettings?.currency === 'GBP' ? '£' : '$';

  const activeZoneDisplay = useAutoZone ? detectedZone : selectedZone;

  // Safe PayPal URL validator
  const getSafePayPalLink = (rawUrl?: string): string => {
    if (!rawUrl || typeof rawUrl !== 'string') return 'https://paypal.me/blissyogawellness';
    const trimmed = rawUrl.trim();
    if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
      return trimmed;
    }
    return `https://${trimmed}`;
  };

  const safePayPalLink = getSafePayPalLink(paymentSettings?.paypal_link);

  const handleCopyPayPalLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(safePayPalLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleReceiptUpload = (e: ChangeEvent<HTMLInputElement>) => {
    setReceiptFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Security Check 1: Max File Size 5MB
    if (file.size > 5 * 1024 * 1024) {
      setReceiptFileError('Screenshot file size exceeds 5MB limit. Please upload a smaller image.');
      e.target.value = '';
      return;
    }

    // Security Check 2: MIME Type Image Only
    if (!file.type.startsWith('image/')) {
      setReceiptFileError('Security restriction: Only image files (PNG, JPG, WEBP, GIF) are allowed.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      setReceiptFileError('Could not process screenshot. Please try another image.');
    };
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setReceiptScreenshot(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleNextToPayment = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setAmountPaid(totalAmount);
    setVerificationError(null);
    setStep('payment');
  };

  const handleFinalSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setVerificationError(null);

    const autoTxn = 'PAY-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
    const cleanTxn = transactionRef.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '') || autoTxn;
    if (!name.trim()) {
      setVerificationError('Please enter your full name.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setVerificationError('Please enter a valid email address.');
      return;
    }
    if (!paymentDate) {
      setVerificationError('Please select the payment date.');
      return;
    }
    if (!amountPaid || amountPaid <= 0) {
      setVerificationError('Amount paid must be greater than $0.00.');
      return;
    }

    setIsSubmitting(true);
    try {
      const scheduleSummaryText = isMultiDayProgram && calculatedDates.length > 0
        ? `[Schedule Pattern: ${getPatternLabel(schedulePattern)} | Session Range: ${calculatedDates[0]} to ${calculatedDates[calculatedDates.length - 1]} (${totalDaysCount} Sessions)${customScheduleNotes ? ` | Custom Note: ${customScheduleNotes}` : ''}]`
        : '';
      const finalAdditionalNotes = notes.trim()
        ? (scheduleSummaryText ? `${scheduleSummaryText}\n${notes.trim()}` : notes.trim())
        : scheduleSummaryText;

      const { booking } = await createBooking({
        full_name: name.trim(),
        email: email.trim().toLowerCase(),
        country: country || 'United States',
        timezone: activeZoneDisplay,
        program_id: selectedProgram,
        program_title: currentProg.title,
        class_type: format === 'group' ? 'Group' : 'Private',
        skill_level: (level.includes('Beginner') ? 'Beginner' : level.includes('Intermediate') ? 'Intermediate' : 'Advanced') as any,
        duration: currentProg.duration,
        preferred_date: selectedDate,
        preferred_time: activeTimeSlotDisplay,
        additional_notes: finalAdditionalNotes,
        price: amountPaid || totalAmount,
        base_price: basePrice,
        tax_amount: taxAmount,
        gateway_charges: 0,
        final_amount: amountPaid || totalAmount,
        status: 'Payment Pending Verification',
      });

      const verifyResult = await submitPaymentVerification({
        bookingId: booking.id,
        studentName: name.trim(),
        studentEmail: email.trim().toLowerCase(),
        programTitle: currentProg.title,
        amount: amountPaid || totalAmount,
        currency: paymentSettings?.currency || 'USD',
        paymentDate: paymentDate,
        transactionId: cleanTxn,
        receiptScreenshot: receiptScreenshot || undefined,
      });

      if (!verifyResult.success) {
        setVerificationError(verifyResult.error || 'Payment confirmation failed verification.');
        setIsSubmitting(false);
        return; // DO NOT MARK AS PAID
      }

      setVerificationResultStatus(verifyResult.verificationStatus || 'Pending Manual Verification');

      // Email automation dispatch: booking, payment, and schedule details
      sendEmailAutomation({
        to: email.trim().toLowerCase(),
        template: 'booking_confirmation',
        data: {
          name,
          programTitle: currentProg.title,
          classType: format === 'group' ? 'Group' : 'Private',
          date: selectedDate,
          time: activeTimeSlotDisplay,
          status: verifyResult.verificationStatus || 'Payment Pending Verification',
        },
      });

      sendEmailAutomation({
        to: email.trim().toLowerCase(),
        template: 'payment_confirmation',
        data: {
          name,
          programTitle: currentProg.title,
          amount: (amountPaid || totalAmount).toFixed(2),
          txnRef: cleanTxn,
          provider: 'PayPal',
        },
      });

      sendEmailAutomation({
        to: email.trim().toLowerCase(),
        template: 'schedule_details',
        data: {
          name,
          programTitle: currentProg.title,
          date: selectedDate,
          time: activeTimeSlotDisplay,
          timezone: activeZoneDisplay,
        },
      });

      setIsSubmitted(true);
    } catch (err: any) {
      console.warn('Booking submit error:', err);
      setVerificationError(err?.message || 'Server validation error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setStep('details');
    setName('');
    setEmail('');
    setTransactionRef('');
    onClose();
  };

  const levelOptions = [
    'Beginner',
    'Intermediate',
    'Advanced',
    'Senior / Gentle Chair',
    'Working Professional',
    'Therapeutic Care',
  ];

  const timeSlots = [
    '07:00 AM Local Time (Morning Practice)',
    '10:00 AM Local Time (Mid-Morning Flow)',
    '02:00 PM Local Time (Afternoon Reset)',
    '06:30 PM Local Time (Evening Unwind)',
    '08:30 PM Local Time (Night Meditation)',
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md">
        {/* Backdrop Click Handler */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-transparent"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-2xl bg-[#181a18] text-[#f4f1ea] rounded-2xl sm:rounded-[2.5rem] shadow-2xl border border-white/10 z-10 my-auto p-5 sm:p-8 sage-glow max-h-[88vh] overflow-y-auto custom-scrollbar"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-[#f4f1ea] hover:bg-white/20 transition-colors border border-white/10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {!isSubmitted ? (
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#c5a059]">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Worldwide Live Online Studio</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl text-[#f4f1ea] font-semibold mt-1">
                  {step === 'details' ? 'Book Your Online Session' : 'Complete Booking Payment'}
                </h2>
                <p className="text-xs text-white/60 mt-1 font-light leading-relaxed">
                  {step === 'details'
                    ? 'Join practitioners from around the globe. Live interactive instruction synchronized with your timezone.'
                    : 'Select your preferred gateway and submit proof to confirm your slot.'}
                </p>
              </div>

              {step === 'details' ? (
                <form onSubmit={handleNextToPayment} className="space-y-5 text-xs">
                  {/* Automatic Timezone Banner */}
                  <div className="p-3.5 rounded-2xl bg-[#121412] border border-[#c5a059]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-[#c5a059]/15 border border-[#c5a059]/40 text-[#c5a059]">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#94a388] animate-ping" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#94a388] block">
                          Detected Time Zone
                        </span>
                        <span className="font-medium text-[#f4f1ea]">
                          {activeZoneDisplay}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setUseAutoZone(true)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                          useAutoZone
                            ? 'bg-[#c5a059] text-[#121412] font-semibold'
                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        Auto-Detected
                      </button>
                      <button
                        type="button"
                        onClick={() => setUseAutoZone(false)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                          !useAutoZone
                            ? 'bg-[#c5a059] text-[#121412] font-semibold'
                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        Select Manual
                      </button>
                    </div>
                  </div>

                  {!useAutoZone && (
                    <div className="space-y-1.5 p-3 rounded-xl bg-white/5 border border-white/10">
                      <label className="font-medium text-[#f4f1ea] block">Choose Preferred Time Zone</label>
                      <select
                        value={selectedZone}
                        onChange={(e) => setSelectedZone(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-[#121412] border border-white/15 text-[#f4f1ea] font-medium focus:outline-none focus:ring-2 focus:ring-[#c5a059] [&>option]:bg-[#181a18] [&>option]:text-[#f4f1ea]"
                      >
                        <option value={detectedZone}>Auto-Detected ({detectedZone})</option>
                        {COMMON_TIMEZONES.map((tz) => (
                          <option key={tz.value} value={tz.value}>
                            {tz.label} ({tz.offset})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Country Selection */}
                  <div className="space-y-1.5">
                    <label className="font-medium text-[#f4f1ea] flex items-center justify-between">
                      <span>Your Country</span>
                      <span className="text-[10px] text-white/50 font-normal">All Countries Supported</span>
                    </label>
                    <select
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full p-3 rounded-xl bg-[#121412] border border-white/15 text-[#f4f1ea] font-medium focus:outline-none focus:ring-2 focus:ring-[#c5a059] [&>option]:bg-[#181a18] [&>option]:text-[#f4f1ea]"
                    >
                      <option value="" disabled>-- Select Your Country --</option>
                      {WORLD_COUNTRIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Program Selection */}
                  <div className="space-y-1.5">
                    <label className="font-medium text-[#f4f1ea] block">Select Yoga Program</label>
                    <select
                      value={selectedProgram}
                      onChange={(e) => setSelectedProgram(e.target.value)}
                      className="w-full p-3 rounded-xl bg-[#121412] border border-white/15 text-[#f4f1ea] font-medium focus:outline-none focus:ring-2 focus:ring-[#c5a059] [&>option]:bg-[#181a18] [&>option]:text-[#f4f1ea]"
                    >
                      {PROGRAMS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title} (Group ${p.groupPrice} / Private ${p.privatePrice})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Class Format & Practice Level */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Class Format */}
                    <div className="space-y-1.5">
                      <label className="font-medium text-[#f4f1ea] block">Class Format</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setFormat('group')}
                          className={`p-2.5 rounded-xl border text-center transition-all ${
                            format === 'group'
                              ? 'bg-[#c5a059]/20 border-[#c5a059] font-semibold text-[#f4f1ea] shadow-xs'
                              : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                          }`}
                        >
                          <span className="block font-medium text-xs">Group Class</span>
                          <span className="text-xs font-serif font-bold text-[#c5a059]">
                            ${currentProg.groupPrice} <span className="text-[10px] text-white/40">(Taxes Inc.)</span>
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFormat('private')}
                          className={`p-2.5 rounded-xl border text-center transition-all ${
                            format === 'private'
                              ? 'bg-[#c5a059]/20 border-[#c5a059] font-semibold text-[#f4f1ea] shadow-xs'
                              : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                          }`}
                        >
                          <span className="block font-medium text-xs">Private Session</span>
                          <span className="text-xs font-serif font-bold text-[#c5a059]">
                            ${currentProg.privatePrice} <span className="text-[10px] text-white/40">(+ Taxes/Fees)</span>
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Practice Level */}
                    <div className="space-y-1.5">
                      <label className="font-medium text-[#f4f1ea] block">Practice Level</label>
                      <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-[#121412] border border-white/15 text-[#f4f1ea] font-medium focus:outline-none focus:ring-2 focus:ring-[#c5a059] [&>option]:bg-[#181a18] [&>option]:text-[#f4f1ea]"
                      >
                        {levelOptions.map((lvl) => (
                          <option key={lvl} value={lvl}>
                            {lvl}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Pricing Notice */}
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-white/70 italic">
                    {isGroup
                      ? `Group Class Price: USD $${currentProg.groupPrice} (Taxes Included).`
                      : `Private Session Price: USD $${currentProg.privatePrice} + applicable taxes and payment gateway charges calculated at checkout.`}
                  </div>

                  {/* Date & Time Picker */}
                  <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label className="font-medium text-[#f4f1ea] flex items-center gap-1.5 text-xs">
                        <Clock className="w-4 h-4 text-[#c5a059]" />
                        <span>Class Schedule & Local Time</span>
                      </label>
                      <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setTimeSelectionMode('custom')}
                          className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                            timeSelectionMode === 'custom'
                              ? 'bg-[#c5a059] text-[#121412] font-semibold shadow-xs'
                              : 'text-white/60 hover:text-white'
                          }`}
                        >
                          Custom Time
                        </button>
                        <button
                          type="button"
                          onClick={() => setTimeSelectionMode('preset')}
                          className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                            timeSelectionMode === 'preset'
                              ? 'bg-[#c5a059] text-[#121412] font-semibold shadow-xs'
                              : 'text-white/60 hover:text-white'
                          }`}
                        >
                          Preset Slots
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-white/70 block mb-1 font-medium">Preferred Date</label>
                        <input
                          type="date"
                          required
                          min={new Date().toISOString().split('T')[0]}
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-[#121412] border border-white/15 text-[#f4f1ea] focus:outline-none focus:ring-2 focus:ring-[#c5a059] text-xs"
                        />
                      </div>

                      <div>
                        {timeSelectionMode === 'custom' ? (
                          <div>
                            <label className="text-[11px] text-white/70 block mb-1 font-medium">Choose Manual Time</label>
                            <input
                              type="time"
                              required
                              value={customTimeValue}
                              onChange={(e) => setCustomTimeValue(e.target.value)}
                              className="w-full p-2.5 rounded-xl bg-[#121412] border border-white/15 text-[#f4f1ea] font-mono focus:outline-none focus:ring-2 focus:ring-[#c5a059] text-xs"
                            />
                          </div>
                        ) : (
                          <div>
                            <label className="text-[11px] text-white/70 block mb-1 font-medium">Select Time Slot</label>
                            <select
                              value={selectedPresetSlot}
                              onChange={(e) => setSelectedPresetSlot(e.target.value)}
                              className="w-full p-2.5 rounded-xl bg-[#121412] border border-white/15 text-[#f4f1ea] font-medium focus:outline-none focus:ring-2 focus:ring-[#c5a059] text-xs [&>option]:bg-[#181a18] [&>option]:text-[#f4f1ea]"
                            >
                              {timeSlots.map((slot) => (
                                <option key={slot} value={slot}>
                                  {slot}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Custom Schedule & Frequency Selector for 12-Day & 15-Day Programs */}
                  {isMultiDayProgram && (
                    <div className="space-y-3.5 p-4 rounded-2xl bg-[#121412] border border-[#c5a059]/40 shadow-xl text-xs">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-[#c5a059]/20 border border-[#c5a059]/40 flex items-center justify-center text-[#c5a059] shrink-0">
                            <Calendar className="w-4 h-4 text-[#c5a059]" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-xs text-[#f4f1ea] flex items-center gap-1.5">
                              <span>Custom {totalDaysCount}-Day Session Schedule & Frequency</span>
                              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/40 font-bold uppercase">
                                Flexible Pace
                              </span>
                            </h4>
                            <p className="text-[10px] text-white/60">
                              Choose your preferred pace for your {totalDaysCount} sessions (e.g. alternate days, 2-3 days gap, or weekly routine).
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Schedule Pattern Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          { id: 'alternate', label: 'Alternate Days', desc: 'Every 2nd Day (Most Popular)' },
                          { id: 'thrice_weekly', label: '3 Times / Week', desc: 'Mon, Wed, Fri routine' },
                          { id: 'twice_weekly', label: '2 Times / Week', desc: 'Tue & Thu routine' },
                          { id: 'gap_2', label: '2 Days Gap', desc: 'Every 3rd Day' },
                          { id: 'gap_3', label: '3 Days Gap', desc: 'Every 4th Day' },
                          { id: 'daily', label: 'Daily (Consecutive)', desc: `${totalDaysCount} Days in a Row` },
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setSchedulePattern(opt.id as any)}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                              schedulePattern === opt.id
                                ? 'bg-[#c5a059]/25 border-[#c5a059] text-[#f4f1ea] font-semibold ring-1 ring-[#c5a059]'
                                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                            }`}
                          >
                            <div className="font-medium text-[11px] text-[#f4f1ea] flex items-center justify-between">
                              <span>{opt.label}</span>
                              {schedulePattern === opt.id && <Check className="w-3.5 h-3.5 text-[#c5a059]" />}
                            </div>
                            <div className="text-[9px] text-white/50 mt-0.5 leading-tight">{opt.desc}</div>
                          </button>
                        ))}
                      </div>

                      {/* Custom Note or Specific Days Off Input */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-white/70 font-medium flex items-center gap-1">
                          <Sliders className="w-3 h-3 text-[#c5a059]" />
                          <span>Custom Preferences / Exclude Days (Optional)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Prefer Mon/Wed/Fri mornings, skip Aug 15th holiday"
                          value={customScheduleNotes}
                          onChange={(e) => setCustomScheduleNotes(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-[#191c19] border border-white/15 text-[#f4f1ea] placeholder-white/30 text-xs focus:outline-none focus:ring-2 focus:ring-[#c5a059]"
                        />
                      </div>

                      {/* Calculated Date Range Summary & Session Badges */}
                      {calculatedDates.length > 0 && (
                        <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-2">
                          <div className="flex items-center justify-between text-[11px] flex-wrap gap-1">
                            <span className="text-white/70 font-medium flex items-center gap-1.5">
                              <Repeat className="w-3.5 h-3.5 text-[#c5a059]" />
                              Calculated {totalDaysCount}-Session Schedule Span:
                            </span>
                            <span className="text-[#c5a059] font-mono font-bold bg-[#c5a059]/15 px-2.5 py-1 rounded-lg border border-[#c5a059]/30">
                              {calculatedDates[0]} → {calculatedDates[calculatedDates.length - 1]}
                            </span>
                          </div>

                          {/* Generated Session Date Badges */}
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {calculatedDates.slice(0, showAllDatesPreview ? calculatedDates.length : 6).map((dStr, idx) => (
                              <span key={idx} className="text-[10px] px-2 py-0.5 rounded-lg bg-white/10 border border-white/10 text-white/90 font-mono">
                                #{idx + 1}: <strong className="text-[#c5a059]">{dStr}</strong>
                              </span>
                            ))}
                            {calculatedDates.length > 6 && (
                              <button
                                type="button"
                                onClick={() => setShowAllDatesPreview(!showAllDatesPreview)}
                                className="text-[10px] text-[#c5a059] hover:underline font-semibold ml-1 cursor-pointer"
                              >
                                {showAllDatesPreview ? 'Show Fewer' : `+${calculatedDates.length - 6} More Dates`}
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Contact Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="font-medium text-[#f4f1ea] block mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Your Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-[#f4f1ea] placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#c5a059]"
                      />
                    </div>

                    <div>
                      <label className="font-medium text-[#f4f1ea] block mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="your.email@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-[#f4f1ea] placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#c5a059]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-medium text-[#f4f1ea] block mb-1">Additional Notes / Health Concerns (Optional)</label>
                    <textarea
                      rows={2}
                      placeholder="Share injury history or specific practice goals..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-[#f4f1ea] placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#c5a059]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-full text-xs font-bold tracking-widest uppercase text-[#121412] gold-gradient gold-gradient-hover shadow-lg shadow-[#c5a059]/20 transition-all mt-4"
                  >
                    Proceed to Payment (USD ${basePrice.toFixed(0)}{!isGroup ? ' + Taxes' : ''})
                  </button>
                </form>
              ) : (
                /* Payment Confirmation Form Step */
                <form onSubmit={handleFinalSubmit} className="space-y-5 text-xs">
                  {/* Total Amount & Payment Instructions */}
                  <div className="p-4 rounded-2xl bg-[#121412] border border-[#c5a059]/30 space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-white/70 font-medium">Program Title:</span>
                      <span className="font-bold text-[#c5a059] text-sm">{currentProg.title}</span>
                    </div>
                    {isMultiDayProgram && calculatedDates.length > 0 && (
                      <div className="flex items-center justify-between border-b border-white/10 pb-2 text-[11px]">
                        <span className="text-white/70 font-medium flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#c5a059]" />
                          Custom Schedule:
                        </span>
                        <span className="font-semibold text-[#f4f1ea] text-right">
                          {getPatternLabel(schedulePattern)} ({calculatedDates[0]} → {calculatedDates[calculatedDates.length - 1]})
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 font-medium">Total Amount to Pay:</span>
                      <span className="font-serif font-bold text-lg text-[#c5a059]">
                        {currencySymbol}{(amountPaid || totalAmount).toFixed(2)} {paymentSettings?.currency || 'USD'}
                      </span>
                    </div>
                  </div>

                  {/* Payment Methods (Link, QR, or Both) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-[#f4f1ea] block">Step 1: Choose Payment Method & Transfer</label>
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        <Lock className="w-3 h-3 text-emerald-400" />
                        256-Bit SSL Encrypted
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedMethod('both')}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                          selectedMethod === 'both'
                            ? 'bg-[#c5a059]/20 border-[#c5a059] text-[#c5a059] shadow-sm'
                            : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                        }`}
                      >
                        <Layers className="w-4 h-4" />
                        <span className="text-[11px] font-semibold">Show Both</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedMethod('paypal')}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                          selectedMethod === 'paypal'
                            ? 'bg-[#c5a059]/20 border-[#c5a059] text-[#c5a059] shadow-sm'
                            : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span className="text-[11px] font-semibold">PayPal Link</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedMethod('qr')}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                          selectedMethod === 'qr'
                            ? 'bg-[#c5a059]/20 border-[#c5a059] text-[#c5a059] shadow-sm'
                            : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                        }`}
                      >
                        <QrCode className="w-4 h-4" />
                        <span className="text-[11px] font-semibold">PayPal QR</span>
                      </button>
                    </div>

                    {/* Both (Unified Link & QR) View */}
                    {selectedMethod === 'both' && (
                      <div className="p-4 rounded-2xl bg-[#121412] border border-white/10 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                          {/* PayPal Direct Link Box */}
                          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center space-y-3 flex flex-col items-center justify-between h-full">
                            <div>
                              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#0070ba] mb-1">
                                <CreditCard className="w-4 h-4" />
                                <span>Direct PayPal Link</span>
                              </div>
                              <p className="text-[11px] text-white/70">Click to transfer securely via your browser:</p>
                            </div>

                            <div className="space-y-2 w-full">
                              <a
                                href={safePayPalLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0070ba] text-white font-bold text-xs hover:bg-[#003087] transition-all shadow-md"
                              >
                                <span>Open PayPal</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>

                              <button
                                type="button"
                                onClick={handleCopyPayPalLink}
                                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-white/80 text-[11px] font-medium border border-white/10 transition-colors"
                              >
                                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#c5a059]" />}
                                <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
                              </button>
                            </div>
                          </div>

                          {/* PayPal QR Code Box */}
                          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center space-y-2 flex flex-col items-center justify-between h-full">
                            <div>
                              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#c5a059] mb-1">
                                <QrCode className="w-4 h-4" />
                                <span>PayPal QR Code</span>
                              </div>
                              <p className="text-[11px] text-white/70">Scan with phone camera or PayPal app:</p>
                            </div>

                            {paymentSettings?.qr_code_url ? (
                              <img
                                src={paymentSettings.qr_code_url}
                                alt="PayPal Payment QR Code"
                                className="w-32 h-32 mx-auto rounded-xl border border-white/20 object-contain bg-white p-1.5 shadow-md"
                              />
                            ) : (
                              <div className="w-32 h-32 mx-auto rounded-xl border border-dashed border-[#c5a059]/40 bg-black/40 flex flex-col items-center justify-center text-[#c5a059] text-[11px] font-medium p-3 text-center">
                                <QrCode className="w-6 h-6 mb-1 opacity-70" />
                                <span>PayPal QR Code active</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* PayPal Link Only View */}
                    {selectedMethod === 'paypal' && (
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-3">
                        <p className="text-xs text-white/80">Click below to open official PayPal portal and complete your transfer:</p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                          <a
                            href={safePayPalLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#0070ba] text-white font-bold text-xs hover:bg-[#003087] transition-all shadow-md w-full sm:w-auto"
                          >
                            <span>Open PayPal Portal</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          <button
                            type="button"
                            onClick={handleCopyPayPalLink}
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white/80 text-xs font-medium border border-white/10 transition-colors w-full sm:w-auto"
                          >
                            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#c5a059]" />}
                            <span>{copiedLink ? 'Link Copied!' : 'Copy PayPal Link'}</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* PayPal QR Only View */}
                    {selectedMethod === 'qr' && (
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2.5">
                        <p className="text-xs text-white/80">Scan this QR Code using your mobile phone camera or PayPal app:</p>
                        {paymentSettings?.qr_code_url ? (
                          <img
                            src={paymentSettings.qr_code_url}
                            alt="PayPal Payment QR Code"
                            className="w-44 h-44 mx-auto rounded-2xl border border-white/20 object-contain bg-white p-2 shadow-xl"
                          />
                        ) : (
                          <div className="w-44 h-44 mx-auto rounded-2xl border border-dashed border-[#c5a059]/40 bg-black/40 flex flex-col items-center justify-center text-[#c5a059] text-xs font-medium p-4 text-center">
                            <QrCode className="w-8 h-8 mb-2 opacity-80" />
                            <span>PayPal Payment QR Code</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Step 2: Payment Confirmation Form */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                    <h4 className="font-semibold text-xs text-[#c5a059] uppercase tracking-wider border-b border-white/10 pb-2">
                      Step 2: Payment Confirmation Form
                    </h4>

                    {/* Server Error Alert Banner */}
                    {verificationError && (
                      <div className="p-3.5 rounded-xl bg-red-500/20 border border-red-500/50 text-red-200 text-xs flex items-start gap-2.5 leading-relaxed">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-semibold text-red-300">Verification Error</strong>
                          <p>{verificationError}</p>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Full Name */}
                      <div>
                        <label className="font-medium text-white/90 block mb-1">
                          Full Name <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your full name"
                          className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-[#f4f1ea] placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#c5a059]"
                        />
                      </div>

                      {/* Registered Email Address */}
                      <div>
                        <label className="font-medium text-white/90 block mb-1">
                          Registered Email Address <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-[#f4f1ea] placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#c5a059]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Program/Class Name */}
                      <div>
                        <label className="font-medium text-white/90 block mb-1">
                          Program / Class <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={currentProg.title}
                          className="w-full p-2.5 rounded-xl bg-white/10 border border-white/10 text-white/70 cursor-not-allowed font-medium"
                        />
                      </div>

                      {/* Amount Paid */}
                      <div>
                        <label className="font-medium text-white/90 block mb-1">
                          Amount Paid ({paymentSettings?.currency || 'USD'}) <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          required
                          value={amountPaid || totalAmount}
                          onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                          className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-[#f4f1ea] focus:outline-none focus:ring-2 focus:ring-[#c5a059]"
                        />
                      </div>

                      {/* Payment Date */}
                      <div>
                        <label className="font-medium text-white/90 block mb-1">
                          Payment Date <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="date"
                          required
                          value={paymentDate}
                          onChange={(e) => setPaymentDate(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-[#f4f1ea] focus:outline-none focus:ring-2 focus:ring-[#c5a059]"
                        />
                      </div>
                    </div>

                    {/* Screenshot of Payment Receipt */}
                    <div>
                      <label className="font-medium text-white/90 block mb-1">
                        Screenshot of Payment Receipt (Max 5MB)
                      </label>
                      
                      {receiptFileError && (
                        <div className="mb-2 p-2.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-[11px] flex items-center gap-2">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{receiptFileError}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleReceiptUpload}
                          className="block w-full text-xs text-white/70 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#c5a059]/20 file:text-[#c5a059] hover:file:bg-[#c5a059]/30"
                        />
                        {receiptScreenshot && (
                          <div className="relative shrink-0">
                            <img src={receiptScreenshot} alt="Receipt preview" className="w-12 h-12 object-cover rounded-lg border border-white/20" />
                            <button
                              type="button"
                              onClick={() => {
                                setReceiptScreenshot('');
                                setReceiptFileError(null);
                              }}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* MANDATORY PAYMENT NOTICE */}
                  <div className="p-3.5 rounded-2xl bg-[#c5a059]/10 border border-[#c5a059]/30 text-[11px] text-[#f4f1ea] leading-relaxed flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-[#c5a059] shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-semibold text-[#c5a059] mb-1">Gentle Note</strong>
                      <p className="mb-1">Please ensure your email address is correct.</p>
                      <p className="mb-1">Your payment confirmation, booking confirmation and future class information will be sent to this email.</p>
                      <p>Please note that any payment gateway charges, taxes or transaction fees are payable by the student so that the program fee received by Bliss Yoga & Wellness remains the advertised amount.</p>
                    </div>
                  </div>

                  {/* Submit Button (Disabled until required fields complete) */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setStep('details')}
                      className="px-5 py-3 rounded-full text-xs font-semibold text-white/70 hover:text-white bg-white/5 border border-white/10"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={
                        !name.trim() ||
                        !email.trim() ||
                        !paymentDate ||
                        !amountPaid ||
                        isSubmitting
                      }
                      className="flex-1 py-4 rounded-full text-xs font-bold tracking-widest uppercase text-[#121412] gold-gradient gold-gradient-hover shadow-lg shadow-[#c5a059]/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Verifying Transaction...' : `Submit Payment Confirmation (${currencySymbol}${(amountPaid || totalAmount).toFixed(2)})`}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* Submission Confirmation Screen */
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#c5a059]/20 border border-[#c5a059] flex items-center justify-center text-[#c5a059] mx-auto">
                <CheckCircle className="w-8 h-8 text-[#c5a059]" />
              </div>

              <h3 className="font-serif text-2xl text-[#f4f1ea] font-semibold">
                Booking Request & Payment Submitted!
              </h3>

              <div className={`p-3 rounded-full text-xs font-bold uppercase tracking-wider inline-block ${
                verificationResultStatus === 'Verified'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                Status: {verificationResultStatus}
              </div>

              <p className="text-xs text-white/70 max-w-md mx-auto leading-relaxed">
                Thank you, <strong className="text-[#f4f1ea]">{name}</strong> ({country}). Your booking request for <strong className="text-[#f4f1ea]">{currentProg.title}</strong> has been logged under status <strong className={verificationResultStatus === 'Verified' ? 'text-emerald-300' : 'text-amber-300'}>{verificationResultStatus}</strong>.
              </p>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left text-xs space-y-2 max-w-md mx-auto">
                <div className="flex items-center gap-2 text-[#c5a059] font-semibold">
                  <Sparkles className="w-4 h-4 text-[#c5a059]" />
                  <span>Next Steps for Approval & Class Link</span>
                </div>
                <div className="text-white/70 text-[11px] space-y-1.5 leading-relaxed">
                  <p>• <strong>Payment Verification:</strong> An administrator will review and verify your payment submission.</p>
                  <p>• <strong>Class Access Delivery:</strong></p>
                  <div className="pl-3 border-l-2 border-[#c5a059]/40 space-y-1 text-white/80">
                    <p>• <strong>12-Day & 15-Day Programs:</strong> Access your "JOIN CLASS" Jitsi button in your <strong>Student Portal</strong> AND via <strong>Gmail/Email</strong>.</p>
                    <p>• <strong>All Other Sessions:</strong> Your "JOIN CLASS" button will be delivered directly to your <strong>Email ({email})</strong> upon admin approval.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="px-8 py-3 rounded-full text-xs font-bold uppercase tracking-wider text-[#121412] gold-gradient hover:opacity-90 transition-opacity"
              >
                Done
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
