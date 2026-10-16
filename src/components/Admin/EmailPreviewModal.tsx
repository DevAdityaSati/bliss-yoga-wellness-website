import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, CheckCircle2, Send, ExternalLink, ShieldCheck } from 'lucide-react';
import { BookingRecord } from '../../types';
import { generateBrandedHTMLEmail } from '../../services/emailService';

interface EmailPreviewModalProps {
  isOpen: boolean;
  booking: BookingRecord | null;
  onClose: () => void;
  onSendEmail?: (booking: BookingRecord) => Promise<void>;
}

export default function EmailPreviewModal({
  isOpen,
  booking,
  onClose,
  onSendEmail,
}: EmailPreviewModalProps) {
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen || !booking) return null;

  const meetingLink = booking.meeting_link || `https://meet.jit.si/BlissYoga_${booking.id}`;

  const { subject, html } = generateBrandedHTMLEmail('booking_approved', {
    name: booking.full_name,
    programTitle: booking.program_title,
    classType: booking.class_type,
    date: booking.preferred_date,
    time: booking.preferred_time,
    timezone: booking.timezone,
    meetingLink,
  });

  const handleSend = async () => {
    if (!onSendEmail) return;
    setSending(true);
    setSentSuccess(false);
    await onSendEmail(booking);
    setSending(false);
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 3000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-[#121412] border border-white/15 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-w-3xl w-full max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 bg-[#191c19] border-b border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#c5a059]/20 border border-[#c5a059]/40 flex items-center justify-center text-[#c5a059]">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#94a388]">
                  HTML Email Dispatch Preview
                </span>
                <h3 className="font-serif text-lg font-bold text-[#f4f1ea] leading-tight">
                  {subject}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Email Info Metadata bar */}
          <div className="px-6 py-2.5 bg-[#141714] border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-white/70">
            <div className="flex items-center gap-2">
              <span className="text-white/40 font-semibold">Recipient:</span>
              <span className="font-medium text-[#c5a059]">{booking.full_name} ({booking.email})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/40 font-semibold">Delivery Status:</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                booking.email_sent ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300'
              }`}>
                {booking.email_sent ? `SENT (${booking.email_sent_at ? new Date(booking.email_sent_at).toLocaleTimeString() : 'Delivered'})` : 'PENDING DISPATCH'}
              </span>
            </div>
          </div>

          {/* Rendered HTML Email Frame */}
          <div className="flex-grow bg-[#0c0d0c] p-4 overflow-y-auto">
            <div className="bg-[#141714] border border-white/10 rounded-2xl p-2 sm:p-6 shadow-inner max-w-xl mx-auto">
              <iframe
                srcDoc={html}
                title="Email Preview"
                className="w-full h-[450px] border-0 rounded-xl bg-[#0c0d0c]"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-[#191c19] border-t border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-xs text-white/50">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Includes active Jitsi button redirect</span>
            </div>

            <div className="flex items-center gap-3">
              {sentSuccess && (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Email Dispatched!
                </span>
              )}

              <button
                type="button"
                onClick={handleSend}
                disabled={sending}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#c5a059] to-[#d4af37] text-[#121412] font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-[#c5a059]/20"
              >
                <Send className="w-4 h-4" />
                <span>{sending ? 'Dispatching Email...' : 'Send Confirmation Email Now'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
