import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, BookingRecord, NotificationItem, AttendanceRecord } from '../../types';
import { getUserBookings, createBooking } from '../../services/bookingService';
import { getUserNotifications, markNotificationAsRead } from '../../services/notificationService';
import { getStudentAttendanceHistory } from '../../services/attendanceService';
import { updateUserProfile, getStudentLoginsFromSupabase, StudentLoginRecord } from '../../services/authService';
import JitsiModal from '../LiveClass/JitsiModal';
import ClassCountdown from '../LiveClass/ClassCountdown';
import {
  Calendar,
  Clock,
  Video,
  User,
  Globe,
  Bell,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Sparkles,
  Plus,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Check,
  CreditCard,
  UserCheck
} from 'lucide-react';

interface StudentDashboardProps {
  user: UserProfile;
  onLogout: () => void;
  onNavigateHome: () => void;
  onOpenBookingModal: () => void;
}

export default function StudentDashboard({
  user: initialUser,
  onLogout,
  onNavigateHome,
  onOpenBookingModal,
}: StudentDashboardProps) {
  const [user, setUser] = useState<UserProfile>(initialUser);
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'attendance' | 'profile' | 'notifications' | 'logins'>('overview');
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [myLogins, setMyLogins] = useState<StudentLoginRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Live Jitsi Modal State
  const [jitsiModal, setJitsiModal] = useState<{
    isOpen: boolean;
    roomName: string;
    programTitle: string;
  }>({ isOpen: false, roomName: '', programTitle: '' });

  // Profile Edit State
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [country, setCountry] = useState(user?.country || 'United States');
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (initialUser && initialUser.id) {
      setUser(initialUser);
      setFullName(initialUser.full_name || '');
      setCountry(initialUser.country || 'United States');
      setTimezone(initialUser.timezone || 'UTC');
      setAvatarUrl(initialUser.avatar_url || '');
    }
  }, [initialUser]);

  const loadData = async () => {
    if (!user || !user.email) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const userBks = await getUserBookings(user.email || '');
      setBookings(userBks || []);

      const userAtt = await getStudentAttendanceHistory(user.email || '');
      setAttendance(userAtt || []);

      const notifs = user.id ? await getUserNotifications(user.id) : [];
      setNotifications(notifs || []);

      const logs = await getStudentLoginsFromSupabase();
      const userLogs = (logs || []).filter(l => l?.email && l.email.toLowerCase() === (user.email || '').toLowerCase());
      setMyLogins(userLogs);
    } catch (e) {
      console.warn('Error loading student dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);
    const { user: updated, error } = await updateUserProfile(user.id, {
      full_name: fullName,
      country,
      timezone,
      avatar_url: avatarUrl,
    });

    if (error || !updated) {
      setProfileMessage({ type: 'error', text: error || 'Failed to update profile.' });
    } else {
      setUser(updated);
      setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
    }
  };

  const handleMarkNotifRead = async (notifId: string) => {
    await markNotificationAsRead(notifId);
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, is_read: true } : n));
  };

  const upcomingBookings = bookings.filter(b => b.status === 'Approved' || b.status === 'Pending');
  const pastBookings = bookings.filter(b => b.status === 'Completed' || b.status === 'Rejected' || b.status === 'Cancelled');
  const unreadNotifCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-[#121412] text-[#f4f1ea] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Welcome Header Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-white/[0.06] via-white/[0.03] to-transparent border border-white/10 glass-card shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-[#c5a059]/40 shadow-xl shrink-0 bg-[#1e221d]">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.full_name || 'Student'} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-serif text-2xl text-[#c5a059] font-bold">
                  {(user?.full_name || 'Practitioner').charAt(0)}
                </div>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-semibold tracking-wider px-2.5 py-0.5 rounded-full bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/30">
                  Student Practitioner
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Admin Approved Student
                </span>
                <span className="text-[10px] text-white/50 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-[#94a388]" /> {user?.country || 'Global'} ({user?.timezone || 'UTC'})
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-4xl text-[#f4f1ea]">
                Welcome back, <span className="italic text-[#94a388]">{user?.full_name || 'Practitioner'}</span>
              </h1>
              <p className="text-xs text-white/60 font-light mt-0.5">
                Verified 12-Day Transformation / 15-Day Complete Wellness Practitioner • Access Authorized
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Supabase DB Synced</span>
            </div>

            <button
              onClick={onOpenBookingModal}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-semibold uppercase tracking-wider text-[#121412] gold-gradient gold-gradient-hover shadow-lg transition-all"
            >
              <Plus className="w-4 h-4 text-[#121412]" />
              <span>Book New Session</span>
            </button>

            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors text-xs font-semibold shadow-sm"
              title="Logout of Student Sanctuary"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-[#c5a059] text-[#121412] shadow-md'
                : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Overview & Upcoming</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'bookings'
                ? 'bg-[#c5a059] text-[#121412] shadow-md'
                : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Booking History ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'attendance'
                ? 'bg-[#c5a059] text-[#121412] shadow-md'
                : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Attendance History ({attendance.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'bg-[#c5a059] text-[#121412] shadow-md'
                : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 relative ${
              activeTab === 'notifications'
                ? 'bg-[#c5a059] text-[#121412] shadow-md'
                : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
            {unreadNotifCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('logins')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'logins'
                ? 'bg-[#c5a059] text-[#121412] shadow-md'
                : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Supabase Logins ({myLogins.length})</span>
          </button>
        </div>

        {/* Student Portal Program Scope Banner */}
        <div className="my-6 p-4 rounded-2xl bg-gradient-to-r from-[#1c221c] via-[#161a16] to-[#121412] border border-[#c5a059]/40 text-xs text-[#f4f1ea] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xl">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#c5a059]/20 border border-[#c5a059]/40 flex items-center justify-center text-[#c5a059] shrink-0 mt-0.5 md:mt-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-[#f4f1ea] flex items-center gap-2">
                <span>Student Portal Scope Note</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/30">
                  12-Day & 15-Day Intensive Programs
                </span>
              </h4>
              <p className="text-white/80 text-[11px] mt-0.5 leading-relaxed">
                This Student Login Portal is designed for students enrolled in <strong>12-Day</strong> or <strong>15-Day Intensive Programs</strong> when opting to quick-book those sessions. 12 & 15-Day program students access their live Jitsi <strong>"JOIN CLASS"</strong> buttons both here in the portal and via email. Standard short sessions deliver join links directly to student email inboxes upon approval.
              </p>
            </div>
          </div>
          <div className="shrink-0 text-[10px] uppercase tracking-wider font-semibold px-3 py-1.5 rounded-xl bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/30">
            Intensive Portal Active
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {/* Quick Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#c5a059] block">
                    Upcoming Classes
                  </span>
                  <p className="font-serif text-3xl font-medium text-[#f4f1ea]">{upcomingBookings.length}</p>
                  <p className="text-[11px] text-white/50">Scheduled live online sessions</p>
                </div>

                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#94a388] block">
                    Completed Sessions
                  </span>
                  <p className="font-serif text-3xl font-medium text-[#f4f1ea]">
                    {pastBookings.filter(b => b.status === 'Completed').length}
                  </p>
                  <p className="text-[11px] text-white/50">Total hours of practice logged</p>
                </div>

                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 block">
                    Account Status
                  </span>
                  <p className="font-serif text-xl font-medium text-[#f4f1ea] capitalize">{user.status}</p>
                  <p className="text-[11px] text-white/50">Active practitioner membership</p>
                </div>
              </div>

              {/* Upcoming Live Sessions Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-2xl font-medium text-[#f4f1ea] flex items-center gap-2">
                    <Video className="w-5 h-5 text-[#c5a059]" />
                    <span>Your Scheduled Live Classes</span>
                  </h3>
                  <button
                    onClick={loadData}
                    className="text-xs text-white/60 hover:text-white flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh
                  </button>
                </div>

                {upcomingBookings.length === 0 ? (
                  <div className="p-10 rounded-3xl bg-white/[0.02] border border-white/10 text-center space-y-4">
                    <Calendar className="w-12 h-12 text-white/20 mx-auto" />
                    <p className="text-sm text-white/60">You have no upcoming yoga sessions booked.</p>
                    <button
                      onClick={onOpenBookingModal}
                      className="px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-[#121412] gold-gradient shadow-lg"
                    >
                      Book Your First Session
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {upcomingBookings.map((bk) => (
                      <div
                        key={bk.id}
                        className="p-6 rounded-3xl bg-white/[0.04] border border-white/10 space-y-5 hover:border-[#c5a059]/40 transition-colors shadow-lg relative"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/30">
                              {bk.program_title}
                            </span>
                            <h4 className="font-serif text-xl font-medium text-[#f4f1ea] mt-2">
                              {bk.class_type} Practice ({bk.skill_level})
                            </h4>
                          </div>

                          <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${
                            bk.status === 'Approved'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {bk.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs text-white/70 bg-black/30 p-3.5 rounded-2xl border border-white/5">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#c5a059]" />
                            <span>{bk.preferred_date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#c5a059]" />
                            <span>{bk.preferred_time} ({bk.timezone})</span>
                          </div>
                        </div>

                        {/* Live Countdown & Jitsi Launch Button */}
                        <ClassCountdown
                          targetDate={bk.preferred_date}
                          targetTime={bk.preferred_time}
                          status={bk.status}
                          onJoin={() => {
                            const room = bk.meeting_link
                              ? bk.meeting_link.split('/').pop() || `BlissYoga_${bk.id}`
                              : `BlissYoga_${bk.id}`;
                            setJitsiModal({
                              isOpen: true,
                              roomName: room,
                              programTitle: bk.program_title,
                            });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'bookings' && (
            <motion.div
              key="bookings"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <h3 className="font-serif text-2xl font-medium text-[#f4f1ea]">
                All Booking Records
              </h3>

              <div className="overflow-x-auto rounded-3xl border border-white/10 bg-white/[0.02]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/5 text-white/60 uppercase tracking-wider text-[10px] border-b border-white/10">
                    <tr>
                      <th className="p-4">Program</th>
                      <th className="p-4">Type & Level</th>
                      <th className="p-4">Date & Time</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Meeting</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/80">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-semibold text-[#f4f1ea]">{b.program_title}</td>
                        <td className="p-4">{b.class_type} • {b.skill_level}</td>
                        <td className="p-4">{b.preferred_date} at {b.preferred_time}</td>
                        <td className="p-4">${Number(b.price || (b.class_type === 'Private' ? 300 : 180)).toFixed(2)}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                            b.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300' :
                            b.status === 'Pending' ? 'bg-amber-500/20 text-amber-300' :
                            b.status === 'Completed' ? 'bg-blue-500/20 text-blue-300' :
                            'bg-red-500/20 text-red-300'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="p-4">
                          {b.meeting_link ? (
                            <a
                              href={b.meeting_link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#c5a059] hover:underline flex items-center gap-1"
                            >
                              <span>Join</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-white/30">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'attendance' && (
            <motion.div
              key="attendance"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <h3 className="font-serif text-2xl font-medium text-[#f4f1ea]">
                Attendance & Practice History
              </h3>

              {attendance.length === 0 ? (
                <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 text-center text-xs text-white/50">
                  No attendance records logged yet. Your teacher will mark attendance upon session completion.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-3xl border border-white/10 bg-white/[0.02]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white/5 text-white/60 uppercase tracking-wider text-[10px] border-b border-white/10">
                      <tr>
                        <th className="p-4">Program</th>
                        <th className="p-4">Date & Time</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Teacher Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {attendance.map((att) => (
                        <tr key={att.id} className="hover:bg-white/[0.02]">
                          <td className="p-4 font-serif font-bold text-[#c5a059]">{att.program_title}</td>
                          <td className="p-4 text-white/70">{att.class_date} at {att.class_time}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                              att.status === 'Completed' || att.status === 'Present'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}>
                              {att.status}
                            </span>
                          </td>
                          <td className="p-4 text-white/60 italic">{att.notes || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-2xl mx-auto p-8 rounded-3xl bg-white/[0.03] border border-white/10 space-y-6"
            >
              <h3 className="font-serif text-2xl font-medium text-[#f4f1ea]">
                Profile Settings
              </h3>

              {profileMessage && (
                <div className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 ${
                  profileMessage.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-200'
                    : 'bg-red-500/10 border border-red-500/30 text-red-200'
                }`}>
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{profileMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-[#f4f1ea] focus:outline-none focus:border-[#c5a059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-1.5">
                    Email Address (Read-only)
                  </label>
                  <input
                    type="email"
                    readOnly
                    value={user.email}
                    className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/40 cursor-not-allowed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-1.5">
                      Country
                    </label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-[#f4f1ea] focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-1.5">
                      Timezone
                    </label>
                    <input
                      type="text"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-[#f4f1ea] focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-1.5">
                    Profile Photo URL
                  </label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-[#f4f1ea] focus:outline-none focus:border-[#c5a059]"
                  />
                </div>

                <button
                  type="submit"
                  className="px-8 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider text-[#121412] gold-gradient gold-gradient-hover shadow-lg"
                >
                  Save Changes
                </button>
              </form>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-3xl mx-auto space-y-4"
            >
              <h3 className="font-serif text-2xl font-medium text-[#f4f1ea]">
                Live Notifications
              </h3>

              {notifications.length === 0 ? (
                <p className="text-xs text-white/50 p-6 rounded-2xl bg-white/[0.02] border border-white/10 text-center">
                  No notifications found.
                </p>
              ) : (
                <div className="space-y-3">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkNotifRead(n.id)}
                      className={`p-5 rounded-2xl border transition-colors cursor-pointer flex items-start gap-4 ${
                        n.is_read
                          ? 'bg-white/[0.02] border-white/5 text-white/70'
                          : 'bg-[#c5a059]/10 border-[#c5a059]/30 text-[#f4f1ea]'
                      }`}
                    >
                      <Bell className="w-5 h-5 text-[#c5a059] shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm">{n.title}</h4>
                          <span className="text-[10px] text-white/40">{new Date(n.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-white/80 mt-1">{n.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'logins' && (
            <motion.div
              key="logins"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-serif text-xl font-medium text-[#f4f1ea]">
                      Supabase Security & Login Activity
                    </h3>
                  </div>
                  <p className="text-xs text-white/60">
                    All your student portal sign-ins are recorded securely into the cloud Supabase database table <code className="text-emerald-400 font-mono text-[11px]">student_logins</code>.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={loadData}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/80 flex items-center gap-2 transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-3xl border border-white/10 bg-[#141814]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/5 text-white/60 uppercase tracking-wider text-[10px] border-b border-white/10">
                    <tr>
                      <th className="p-4">Login Time</th>
                      <th className="p-4">Account Email</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Device / Client Agent</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/80">
                    {myLogins.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-white/40 italic">
                          No login history found for this session yet.
                        </td>
                      </tr>
                    ) : (
                      myLogins.map((log, idx) => (
                        <tr key={log.id || idx} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 font-mono text-emerald-400 font-medium">
                            {new Date(log.login_at).toLocaleString()}
                          </td>
                          <td className="p-4 font-semibold text-[#c5a059]">{log.email}</td>
                          <td className="p-4 uppercase text-[10px] tracking-wider font-bold text-emerald-300">{log.role}</td>
                          <td className="p-4 text-[10px] text-white/50 max-w-xs truncate">{log.user_agent || 'Web Browser Session'}</td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Authenticated
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Jitsi Live Video Class Modal */}
      <JitsiModal
        isOpen={jitsiModal.isOpen}
        onClose={() => setJitsiModal({ isOpen: false, roomName: '', programTitle: '' })}
        roomName={jitsiModal.roomName}
        programTitle={jitsiModal.programTitle}
        userName={user.full_name || 'Practitioner'}
      />
    </div>
  );
}
