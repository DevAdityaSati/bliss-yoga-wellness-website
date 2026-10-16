import { useState, useEffect } from 'react';
import { Clock, Video, CheckCircle2, Lock, AlertCircle, Sparkles } from 'lucide-react';

interface ClassCountdownProps {
  targetDate: string; // ISO or YYYY-MM-DD
  targetTime?: string; // e.g., '10:00 AM'
  onJoin: () => void;
  meetingLink?: string;
  status?: string;
}

export default function ClassCountdown({
  targetDate,
  targetTime = '10:00 AM',
  onJoin,
  meetingLink,
  status = 'Approved',
}: ClassCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isLive: boolean;
    isPast: boolean;
    canJoin: boolean;
    minsUntilUnlock: number;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isLive: false,
    isPast: false,
    canJoin: false,
    minsUntilUnlock: 0,
  });

  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const parseTargetDateTime = () => {
      if (!targetDate) return Date.now();
      let dt = new Date(targetDate);
      if (isNaN(dt.getTime())) {
        const parts = targetDate.split('-');
        if (parts.length === 3) {
          dt = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        } else {
          dt = new Date();
        }
      }

      if (targetTime) {
        const timeMatch = targetTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
        if (timeMatch) {
          let hours = parseInt(timeMatch[1], 10);
          const minutes = parseInt(timeMatch[2], 10);
          const ampm = timeMatch[3];
          if (ampm) {
            if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
            if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
          }
          dt.setHours(hours, minutes, 0, 0);
        }
      }
      return dt.getTime();
    };

    const targetMs = parseTargetDateTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = targetMs - now;

      const fifteenMinsMs = 15 * 60 * 1000;
      const twoHoursMs = 120 * 60 * 1000;

      // Class is live & joinable if current time is within 15 mins before start OR up to 2 hours after start
      if (diff <= fifteenMinsMs && diff >= -twoHoursMs) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isLive: true,
          isPast: false,
          canJoin: true,
          minsUntilUnlock: 0,
        });
        return;
      }

      // Past session
      if (diff < -twoHoursMs) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isLive: false,
          isPast: true,
          canJoin: false,
          minsUntilUnlock: 0,
        });
        return;
      }

      // Future session (> 15 minutes before start)
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      const minsUntilUnlock = Math.ceil((diff - fifteenMinsMs) / (1000 * 60));

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isLive: false,
        isPast: false,
        canJoin: false,
        minsUntilUnlock: Math.max(1, minsUntilUnlock),
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [targetDate, targetTime]);

  if (status !== 'Approved' && status !== 'Confirmed' && status !== 'Completed') {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-300 font-medium">
        <Clock className="w-4 h-4 text-amber-400 shrink-0 animate-spin" />
        <span>Waiting for Admin Approval & Payment Verification.</span>
      </div>
    );
  }

  if (timeLeft.isPast) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white/50">
        <CheckCircle2 className="w-4 h-4 text-blue-400" />
        <span>Session Completed</span>
      </div>
    );
  }

  if (timeLeft.isLive && timeLeft.canJoin) {
    return (
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold animate-pulse">
          <span className="w-2 h-2 rounded-full bg-emerald-400" /> CLASS ROOM LIVE NOW
        </div>
        <button
          onClick={onJoin}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#c5a059] via-[#d4af37] to-[#c5a059] text-[#121412] font-bold text-xs uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#c5a059]/25 flex items-center gap-2 cursor-pointer"
        >
          <Video className="w-4 h-4 text-[#121412]" />
          <span>JOIN CLASS NOW</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Countdown display */}
        <div className="flex items-center gap-2 bg-[#191c19] border border-white/10 rounded-2xl px-4 py-2.5">
          <Clock className="w-4 h-4 text-[#c5a059]" />
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#f4f1ea]">
            <span className="text-center"><strong className="text-[#c5a059]">{String(timeLeft.days).padStart(2, '0')}</strong><span className="text-[9px] text-white/40 block font-sans">d</span></span> :
            <span className="text-center"><strong className="text-[#c5a059]">{String(timeLeft.hours).padStart(2, '0')}</strong><span className="text-[9px] text-white/40 block font-sans">h</span></span> :
            <span className="text-center"><strong className="text-[#c5a059]">{String(timeLeft.minutes).padStart(2, '0')}</strong><span className="text-[9px] text-white/40 block font-sans">m</span></span> :
            <span className="text-center"><strong className="text-[#c5a059]">{String(timeLeft.seconds).padStart(2, '0')}</strong><span className="text-[9px] text-white/40 block font-sans">s</span></span>
          </div>
        </div>

        {/* Locked Join Button until 15 mins before class */}
        <div className="relative">
          <button
            disabled={!timeLeft.canJoin}
            onClick={() => {
              if (!timeLeft.canJoin) {
                setShowTooltip(true);
                setTimeout(() => setShowTooltip(false), 4000);
              } else {
                onJoin();
              }
            }}
            className="px-5 py-2.5 rounded-2xl bg-white/10 text-white/40 border border-white/10 font-bold text-xs uppercase tracking-wider cursor-not-allowed flex items-center gap-2 transition-all hover:bg-white/15"
            title="Class room unlocks 15 minutes before start time"
          >
            <Lock className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>JOIN CLASS</span>
          </button>

          {showTooltip && (
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-20 w-64 p-3 rounded-2xl bg-[#1a1e1a] border border-[#c5a059]/40 text-[11px] text-[#f4f1ea] shadow-2xl space-y-1 text-center animate-in fade-in slide-in-from-bottom-1">
              <p className="font-bold text-[#c5a059] flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Room Locked
              </p>
              <p className="text-white/80 leading-tight">
                The Jitsi live video class room unlocks automatically <strong>15 minutes</strong> before your scheduled start time.
              </p>
            </div>
          )}
        </div>
      </div>

      <p className="text-[10px] text-white/50 flex items-center gap-1">
        <Sparkles className="w-3 h-3 text-[#c5a059]" />
        <span>Room unlocks 15 mins prior to class ({targetTime}).</span>
      </p>
    </div>
  );
}

