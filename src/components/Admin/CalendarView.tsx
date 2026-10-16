import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Video,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  Plus
} from 'lucide-react';
import { BookingRecord, MeetingRecord } from '../../types';

interface CalendarViewProps {
  bookings: BookingRecord[];
  meetings: MeetingRecord[];
  onOpenBooking: (booking: BookingRecord) => void;
  onCreateMeeting: (booking: BookingRecord) => void;
}

type ViewMode = 'month' | 'week' | 'day';

export default function CalendarView({
  bookings,
  meetings,
  onOpenBooking,
  onCreateMeeting,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  // Month navigation helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper to format date string YYYY-MM-DD
  const formatDateStr = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  // Group bookings by date string
  const getBookingsForDate = (dateStr: string) => {
    return bookings.filter(b => b.preferred_date === dateStr);
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#191c19] border border-white/10 p-5 rounded-3xl glass-card">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-[#c5a059]/20 border border-[#c5a059]/40 flex items-center justify-center text-[#c5a059]">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#f4f1ea]">
              {monthNames[month]} {year}
            </h2>
            <p className="text-xs text-[#94a388]">Master Schedule of Live Classes & Bookings</p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-end">
          {/* View Mode Selector */}
          <div className="flex items-center bg-[#121412] p-1 rounded-xl border border-white/10">
            {(['month', 'week', 'day'] as ViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                  viewMode === mode
                    ? 'bg-[#c5a059] text-[#121412] font-bold shadow'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white/80 transition-colors"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Month View Grid */}
      {viewMode === 'month' && (
        <div className="bg-[#191c19] border border-white/10 rounded-3xl overflow-hidden glass-card">
          {/* Days of week header */}
          <div className="grid grid-cols-7 border-b border-white/10 bg-[#121412] text-center text-xs font-semibold text-[#94a388] py-3 uppercase tracking-wider">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 auto-rows-fr gap-px bg-white/5">
            {/* Empty offset cells */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`offset-${i}`} className="bg-[#121412]/80 min-h-[100px] p-2 opacity-30" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = formatDateStr(year, month, dayNum);
              const dayBookings = getBookingsForDate(dateStr);
              const isToday = dateStr === todayStr;

              return (
                <div
                  key={dateStr}
                  className={`bg-[#141714] min-h-[110px] p-2 flex flex-col justify-between border-t border-l border-white/5 transition-all hover:bg-white/[0.02] ${
                    isToday ? 'ring-1 ring-[#c5a059] bg-[#c5a059]/[0.03]' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday ? 'bg-[#c5a059] text-[#121412]' : 'text-[#f4f1ea]/80'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayBookings.length > 0 && (
                      <span className="text-[10px] font-semibold text-[#94a388] bg-[#94a388]/10 px-1.5 py-0.5 rounded-full border border-[#94a388]/20">
                        {dayBookings.length} session{dayBookings.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 my-1 flex-grow overflow-y-auto max-h-[90px] custom-scrollbar">
                    {dayBookings.map(b => {
                      const hasMeeting = meetings.some(m => m.booking_id === b.id);
                      return (
                        <div
                          key={b.id}
                          onClick={() => onOpenBooking(b)}
                          className={`p-1.5 rounded-lg text-[11px] cursor-pointer transition-all border ${
                            b.status === 'Approved'
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                              : b.status === 'Pending'
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                              : 'bg-white/5 border-white/10 text-white/60'
                          }`}
                        >
                          <div className="font-semibold truncate leading-tight flex items-center gap-1">
                            {hasMeeting && <Video className="w-2.5 h-2.5 text-[#c5a059] shrink-0" />}
                            <span className="truncate">{b.program_title}</span>
                          </div>
                          <div className="text-[9px] opacity-75 truncate flex items-center justify-between mt-0.5">
                            <span>{b.preferred_time}</span>
                            <span className="capitalize">{b.class_type}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week / Day View Placeholder list */}
      {viewMode !== 'month' && (
        <div className="bg-[#191c19] border border-white/10 rounded-3xl p-6 glass-card space-y-4">
          <h3 className="font-serif text-lg font-bold text-[#f4f1ea]">
            Upcoming Sessions Filtered by ({viewMode.toUpperCase()} Mode)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookings.slice(0, 8).map(b => (
              <div
                key={b.id}
                onClick={() => onOpenBooking(b)}
                className="p-4 rounded-2xl bg-[#121412] border border-white/10 hover:border-[#c5a059]/40 cursor-pointer transition-all flex items-start justify-between gap-4"
              >
                <div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/30">
                    {b.preferred_date} • {b.preferred_time}
                  </span>
                  <h4 className="font-serif font-bold text-base text-[#f4f1ea] mt-2">
                    {b.program_title}
                  </h4>
                  <p className="text-xs text-white/60 mt-0.5">
                    Student: {b.full_name} ({b.email})
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    b.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
