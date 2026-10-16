import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Calendar,
  Clock,
  DollarSign,
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  LogOut,
  RefreshCw,
  Plus,
  Trash2,
  Edit3,
  Video,
  ShieldAlert,
  Globe,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Eye,
  Check,
  X,
  FileText,
  BarChart2,
  PieChart as PieIcon,
  TrendingUp,
  Sliders,
  Star,
  Mail,
  Send,
  Copy,
  ExternalLink,
  Link2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { UserProfile, BookingRecord, ProgramItem, TestimonialItem, ContactMessage, BookingStatus, MeetingRecord, PaymentTransaction, AttendanceRecord } from '../../types';
import { getAllBookings, updateBookingStatus, updateBookingDetails, deleteBooking } from '../../services/bookingService';
import { getAllUsersLocal, updateUserProfile, getStudentLoginsFromSupabase, StudentLoginRecord } from '../../services/authService';
import { getPrograms, updateProgram } from '../../services/programService';
import { getTestimonials, updateTestimonial, deleteTestimonial, createTestimonial } from '../../services/testimonialService';
import { getAllContacts, updateContactStatus } from '../../services/contactService';
import { createMeeting, getMeetingsForBooking, approveBookingWorkflow, regenerateBookingMeetingWorkflow, resendBookingConfirmationEmail } from '../../services/meetingService';
import { getPaymentTransactions } from '../../services/paymentService';
import { getAllAttendanceRecords } from '../../services/attendanceService';
import CalendarView from './CalendarView';
import PaymentSettingsTab from './PaymentSettingsTab';
import ReportsExportTab from './ReportsExportTab';
import AttendanceTab from './AttendanceTab';
import AnalyticsTab from './AnalyticsTab';
import JitsiModal from '../LiveClass/JitsiModal';
import EmailPreviewModal from './EmailPreviewModal';

interface AdminDashboardProps {
  adminUser: UserProfile;
  onLogout: () => void;
  onNavigateHome: () => void;
}

export default function AdminDashboard({ adminUser, onLogout, onNavigateHome }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'calendar' | 'bookings' | 'attendance' | 'payment_settings' | 'students' | 'programs' | 'testimonials' | 'contacts' | 'reports'
  >('overview');
  const [loading, setLoading] = useState(true);

  // Data states
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [meetings, setMeetings] = useState<MeetingRecord[]>([]);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [studentLogins, setStudentLogins] = useState<StudentLoginRecord[]>([]);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);

  // Jitsi Live Class launcher modal
  const [jitsiModal, setJitsiModal] = useState<{ isOpen: boolean; roomName: string; programTitle: string }>({
    isOpen: false,
    roomName: '',
    programTitle: '',
  });

  // Workflow states
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedBookingId, setCopiedBookingId] = useState<string | null>(null);
  const [previewEmailBooking, setPreviewEmailBooking] = useState<BookingRecord | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Search & Filter States
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('all');
  const [studentSearch, setStudentSearch] = useState('');
  const [testimonialSearch, setTestimonialSearch] = useState('');
  const [testimonialFilter, setTestimonialFilter] = useState<'all' | 'approved' | 'hidden' | 'verified' | 'unverified'>('all');

  // Edit / Modal States
  const [editingBooking, setEditingBooking] = useState<BookingRecord | null>(null);
  const [deletingBooking, setDeletingBooking] = useState<BookingRecord | null>(null);
  const [deletingTestimonial, setDeletingTestimonial] = useState<TestimonialItem | null>(null);
  const [meetingUrlInput, setMeetingUrlInput] = useState('');
  const [editingProgram, setEditingProgram] = useState<ProgramItem | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(null);
  const [selectedContact, setSelectedContact] = useState<ContactMessage | null>(null);
  const [contactReplyText, setContactReplyText] = useState('');

  // New Testimonial Form
  const [newTestimonial, setNewTestimonial] = useState({
    name: '',
    country: 'United States',
    program: 'Hatha Yoga for All Levels',
    rating: 5,
    avatar: '',
    testimonial: '',
  });

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [bksRes, prgsRes, tstsRes, cntsRes, txnsRes, attsRes, stdLogsRes] = await Promise.allSettled([
        getAllBookings(),
        getPrograms(),
        getTestimonials(),
        getAllContacts(),
        getPaymentTransactions(),
        getAllAttendanceRecords(),
        getStudentLoginsFromSupabase(),
      ]);

      setBookings(bksRes.status === 'fulfilled' && Array.isArray(bksRes.value) ? bksRes.value : []);
      setPrograms(prgsRes.status === 'fulfilled' && Array.isArray(prgsRes.value) ? prgsRes.value : []);
      setTestimonials(tstsRes.status === 'fulfilled' && Array.isArray(tstsRes.value) ? tstsRes.value : []);
      setContacts(cntsRes.status === 'fulfilled' && Array.isArray(cntsRes.value) ? cntsRes.value : []);
      setPayments(txnsRes.status === 'fulfilled' && Array.isArray(txnsRes.value) ? txnsRes.value : []);
      setAttendanceRecords(attsRes.status === 'fulfilled' && Array.isArray(attsRes.value) ? attsRes.value : []);
      setStudentLogins(stdLogsRes.status === 'fulfilled' && Array.isArray(stdLogsRes.value) ? stdLogsRes.value : []);
      setStudents(getAllUsersLocal());
    } catch (e) {
      console.warn('Error fetching admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  // Handler for booking status update
  const handleBookingStatusChange = async (id: string, status: BookingStatus, meetingLink?: string) => {
    const updated = await updateBookingStatus(id, status, meetingLink);
    if (updated) {
      setBookings(prev => prev.map(b => b.id === id ? updated : b));
      setEditingBooking(null);
    }
  };

  const handleApproveBooking = async (bookingId: string) => {
    const result = await approveBookingWorkflow(bookingId, adminUser.email);
    if (result.success && result.booking) {
      setBookings(prev => prev.map(b => b.id === bookingId ? result.booking! : b));
      showToast(`✨ Booking approved! Jitsi meeting link generated & email dispatched.`);
    } else {
      showToast(`Approval failed: ${result.error || 'Please try again.'}`);
    }
  };

  const handleRegenerateMeeting = async (bookingId: string) => {
    const result = await regenerateBookingMeetingWorkflow(bookingId, adminUser.email);
    if (result.success && result.booking) {
      setBookings(prev => prev.map(b => b.id === bookingId ? result.booking! : b));
      showToast(`⚡ Meeting regenerated and updated confirmation email dispatched!`);
    } else {
      showToast(`Failed to regenerate meeting.`);
    }
  };

  const handleCopyLink = (booking: BookingRecord) => {
    const link = booking.meeting_link || `https://meet.jit.si/BlissYoga_${booking.id}`;
    navigator.clipboard.writeText(link);
    setCopiedBookingId(booking.id);
    setTimeout(() => setCopiedBookingId(null), 2500);
    showToast(`Copied Jitsi Meeting link to clipboard!`);
  };

  const handleResendEmail = async (booking: BookingRecord) => {
    await resendBookingConfirmationEmail(booking);
    setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, email_sent: true, email_sent_at: new Date().toISOString() } : b));
    showToast(`📧 Confirmation email re-dispatched to ${booking.email}`);
  };

  const handleOpenMeeting = (booking: BookingRecord) => {
    if (booking.meeting_room) {
      setJitsiModal({
        isOpen: true,
        roomName: booking.meeting_room,
        programTitle: booking.program_title,
      });
    } else if (booking.meeting_link) {
      window.open(booking.meeting_link, '_blank');
    } else {
      showToast('No meeting link generated yet. Please click Approve or Generate Meeting.');
    }
  };

  const confirmDeleteBookingAction = async () => {
    if (!deletingBooking) return;
    const idToDelete = deletingBooking.id;
    await deleteBooking(idToDelete);
    setBookings(prev => prev.filter(b => b.id !== idToDelete));
    if (editingBooking?.id === idToDelete) {
      setEditingBooking(null);
    }
    setDeletingBooking(null);
  };

  const confirmDeleteTestimonialAction = async () => {
    if (!deletingTestimonial) return;
    const idToDelete = deletingTestimonial.id;
    await deleteTestimonial(idToDelete);
    setTestimonials(prev => prev.filter(t => t.id !== idToDelete));
    setDeletingTestimonial(null);
  };

  const handleDeleteBooking = async (id: string) => {
    const bk = bookings.find(b => b.id === id);
    if (bk) {
      setDeletingBooking(bk);
    } else {
      await deleteBooking(id);
      setBookings(prev => prev.filter(b => b.id !== id));
    }
  };

  const handleStudentStatusToggle = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    await updateUserProfile(userId, { status: newStatus as any });
    setStudents(prev => prev.map(s => s.id === userId ? { ...s, status: newStatus as any } : s));
  };

  const handleSaveProgram = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingProgram) return;
    const updated = await updateProgram(editingProgram.id, editingProgram);
    if (updated) {
      setPrograms(prev => prev.map(p => p.id === updated.id ? updated : p));
      setEditingProgram(null);
    }
  };

  const handleAddTestimonial = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTestimonial.name || !newTestimonial.testimonial) return;
    const created = await createTestimonial({
      ...newTestimonial,
      is_approved: true,
      is_featured: true,
    });
    setTestimonials(prev => [created, ...prev]);
    setNewTestimonial({
      name: '',
      country: 'United States',
      program: 'Hatha Yoga for All Levels',
      rating: 5,
      avatar: '',
      testimonial: '',
    });
  };

  const handleToggleTestimonialApprove = async (id: string, current: boolean) => {
    const updated = await updateTestimonial(id, { is_approved: !current });
    if (updated) {
      setTestimonials(prev => prev.map(t => t.id === id ? updated : t));
      showToast(!current ? 'Review approved and published' : 'Review hidden');
    }
  };

  const handleToggleTestimonialFeatured = async (id: string, current: boolean) => {
    const updated = await updateTestimonial(id, { is_featured: !current });
    if (updated) {
      setTestimonials(prev => prev.map(t => t.id === id ? updated : t));
      showToast(!current ? 'Marked review as Featured' : 'Removed from Featured');
    }
  };

  const handleToggleTestimonialVerified = async (id: string, current: boolean) => {
    const updated = await updateTestimonial(id, { is_verified_student: !current });
    if (updated) {
      setTestimonials(prev => prev.map(t => t.id === id ? updated : t));
      showToast(!current ? 'Marked reviewer as Verified Student' : 'Removed Verified Student badge');
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    const item = testimonials.find(t => t.id === id);
    if (item) {
      setDeletingTestimonial(item);
    } else {
      await deleteTestimonial(id);
      setTestimonials(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleUpdateContact = async (id: string, status: 'unread' | 'read' | 'archived', replyNotes?: string) => {
    const updated = await updateContactStatus(id, status, replyNotes);
    if (updated) {
      setContacts(prev => prev.map(c => c.id === id ? updated : c));
      setSelectedContact(updated);
    }
  };

  const handleExportStudentLoginsCSV = () => {
    if (studentLogins.length === 0) return;
    const headers = ['User ID', 'Email', 'Full Name', 'Role', 'Login Timestamp', 'Client Agent'];
    const rows = studentLogins.map(l => [
      `"${l.user_id}"`,
      `"${l.email}"`,
      `"${l.full_name || ''}"`,
      `"${l.role}"`,
      `"${l.login_at}"`,
      `"${(l.user_agent || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `supabase_student_logins_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculations for Metrics
  const totalStudents = students.filter(s => s.role === 'student').length;
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === 'Pending').length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysClasses = bookings.filter(b => b.preferred_date === todayStr && b.status === 'Approved').length;
  const upcomingClasses = bookings.filter(b => b.status === 'Approved').length;
  const completedClasses = bookings.filter(b => b.status === 'Completed').length;
  const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.price || (b.class_type === 'Private' ? 300 : 180)), 0);
  const unreadMessages = contacts.filter(c => c.status === 'unread').length;

  // Chart data
  const monthlyChartData = [
    { month: 'Jan', bookings: 12, revenue: 240 },
    { month: 'Feb', bookings: 18, revenue: 360 },
    { month: 'Mar', bookings: 25, revenue: 520 },
    { month: 'Apr', bookings: 30, revenue: 680 },
    { month: 'May', bookings: 42, revenue: 940 },
    { month: 'Jun', bookings: 55, revenue: 1250 },
    { month: 'Jul', bookings: bookings.length, revenue: totalRevenue },
  ];

  const countryDistribution = [
    { name: 'United States', value: 40, color: '#c5a059' },
    { name: 'Canada', value: 25, color: '#94a388' },
    { name: 'United Kingdom', value: 15, color: '#3b82f6' },
    { name: 'Singapore', value: 10, color: '#a855f7' },
    { name: 'Other', value: 10, color: '#64748b' },
  ];

  // Filtering Bookings
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = (b.full_name || '').toLowerCase().includes(bookingSearch.toLowerCase()) ||
                          (b.email || '').toLowerCase().includes(bookingSearch.toLowerCase()) ||
                          (b.program_title || '').toLowerCase().includes(bookingSearch.toLowerCase());
    const matchesStatus = bookingStatusFilter === 'all' || b.status === bookingStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtering Students
  const filteredStudents = students.filter(s =>
    (s.full_name || '').toLowerCase().includes(studentSearch.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0d0f0d] text-[#f4f1ea] pt-20 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Admin Header Bar */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#141814] border border-white/10 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-semibold tracking-widest px-3 py-1 rounded-full bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/30 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" /> Production Admin Console
              </span>
              <span className="text-[10px] text-white/50">
                Connected to Supabase (yqgffpxiydscfoljrbaw)
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#f4f1ea] font-medium">
              Studio Management Console
            </h1>
            <p className="text-xs text-white/60 font-light mt-0.5">
              Logged in as <strong className="text-[#c5a059]">{adminUser.email}</strong> • Realtime sync active
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAllAdminData}
              className="px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs font-semibold hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#c5a059] ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Data</span>
            </button>

            <button
              onClick={onNavigateHome}
              className="px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs font-semibold hover:bg-white/10 transition-colors"
            >
              Public Website
            </button>

            <button
              onClick={onLogout}
              className="p-2.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 transition-colors"
              title="Logout Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview & Analytics', icon: BarChart2 },
            { id: 'calendar', label: 'Calendar Schedule', icon: Calendar },
            { id: 'bookings', label: `Bookings (${pendingBookings} Pending)`, icon: Clock },
            { id: 'attendance', label: 'Attendance Ledger', icon: Users },
            { id: 'payment_settings', label: 'Payment Gateway', icon: DollarSign },
            { id: 'students', label: `Students (${totalStudents})`, icon: Users },
            { id: 'programs', label: `Programs (${programs.length})`, icon: Sliders },
            { id: 'testimonials', label: `Testimonials (${testimonials.length})`, icon: Star },
            { id: 'contacts', label: `Inbox (${unreadMessages} Unread)`, icon: Mail },
            { id: 'reports', label: 'Export Reports', icon: FileText },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#c5a059] text-[#121412] shadow-lg font-bold'
                    : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW & ANALYTICS */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-3xl bg-[#141814] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-semibold text-white/50">Total Students</span>
                  <Users className="w-5 h-5 text-[#c5a059]" />
                </div>
                <p className="font-serif text-3xl font-medium text-[#f4f1ea]">{totalStudents}</p>
                <p className="text-[11px] text-[#94a388]">Global registered accounts</p>
              </div>

              <div className="p-6 rounded-3xl bg-[#141814] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-semibold text-white/50">Total Bookings</span>
                  <Calendar className="w-5 h-5 text-[#3b82f6]" />
                </div>
                <p className="font-serif text-3xl font-medium text-[#f4f1ea]">{totalBookings}</p>
                <p className="text-[11px] text-amber-300">{pendingBookings} pending approval</p>
              </div>

              <div className="p-6 rounded-3xl bg-[#141814] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-semibold text-white/50">Est. Revenue</span>
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="font-serif text-3xl font-medium text-emerald-400">${totalRevenue}.00</p>
                <p className="text-[11px] text-emerald-300/80">From group & private sessions</p>
              </div>

              <div className="p-6 rounded-3xl bg-[#141814] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-semibold text-white/50">Unread Messages</span>
                  <MessageSquare className="w-5 h-5 text-purple-400" />
                </div>
                <p className="font-serif text-3xl font-medium text-[#f4f1ea]">{unreadMessages}</p>
                <p className="text-[11px] text-purple-300">Contact form submissions</p>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Revenue & Bookings Trend Chart */}
              <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-[#141814] border border-white/10 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-xl font-medium text-[#f4f1ea]">Monthly Booking Growth</h3>
                    <p className="text-xs text-white/50">Session bookings & revenue trend over time</p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-[#c5a059]" />
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyChartData}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#c5a059" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#c5a059" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e221d', borderColor: '#334155', borderRadius: '12px' }} />
                      <Area type="monotone" dataKey="revenue" stroke="#c5a059" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Country Distribution Pie */}
              <div className="lg:col-span-4 p-6 sm:p-8 rounded-3xl bg-[#141814] border border-white/10 space-y-6">
                <div>
                  <h3 className="font-serif text-xl font-medium text-[#f4f1ea]">Students by Country</h3>
                  <p className="text-xs text-white/50">Geographic distribution of practitioners</p>
                </div>

                <div className="h-48 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={countryDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {countryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1e221d', borderRadius: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-1.5 text-xs">
                  {countryDistribution.map(item => (
                    <div key={item.name} className="flex items-center justify-between text-white/70">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-mono text-white/90">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CALENDAR SCHEDULE */}
        {activeTab === 'calendar' && (
          <CalendarView
            bookings={bookings}
            meetings={meetings}
            onOpenBooking={(b) => setEditingBooking(b)}
            onCreateMeeting={async (b) => {
              const mtg = await createMeeting(b.id, b.user_id, b.full_name, b.program_title, b.preferred_date, b.preferred_time);
              setMeetings(prev => [...prev, mtg]);
              loadAllAdminData();
            }}
          />
        )}

        {/* TAB 3: BOOKINGS MANAGEMENT */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#141814] p-4 rounded-2xl border border-white/10">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search student, email or program..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-[#f4f1ea] focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-[#c5a059]" />
                <select
                  value={bookingStatusFilter}
                  onChange={(e) => setBookingStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-[#f4f1ea] focus:outline-none"
                >
                  <option value="all" className="bg-[#141814]">All Statuses</option>
                  <option value="Payment Pending Verification" className="bg-[#141814]">Payment Pending Verification</option>
                  <option value="Pending" className="bg-[#141814]">Pending</option>
                  <option value="Approved" className="bg-[#141814]">Approved</option>
                  <option value="Completed" className="bg-[#141814]">Completed</option>
                  <option value="Rejected" className="bg-[#141814]">Rejected</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-white/10 bg-[#141814]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-white/5 text-white/60 uppercase tracking-wider text-[10px] border-b border-white/10">
                  <tr>
                    <th className="p-4">Student & Contact</th>
                    <th className="p-4">Program & Type</th>
                    <th className="p-4">Date & Timezone</th>
                    <th className="p-4">Payment & Status</th>
                    <th className="p-4">Jitsi Meeting & Email</th>
                    <th className="p-4 text-right">Workflow Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {filteredBookings.map((b) => {
                    const isApproved = b.status === 'Approved' || b.status === 'Confirmed';
                    const hasLink = Boolean(b.meeting_link);

                    return (
                      <tr key={b.id} className="hover:bg-white/[0.02] transition-colors group">
                        {/* Student Info */}
                        <td className="p-4 align-top">
                          <div className="font-semibold text-[#f4f1ea] text-sm">{b.full_name}</div>
                          <div className="text-[11px] text-white/50">{b.email}</div>
                          <div className="text-[10px] text-white/30 mt-0.5">{b.country}</div>
                        </td>

                        {/* Program Details */}
                        <td className="p-4 align-top">
                          <div className="font-medium text-[#c5a059]">{b.program_title}</div>
                          <div className="text-[10px] text-white/60 mt-0.5 flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              b.class_type === 'Private' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            }`}>
                              {b.class_type || 'Group'}
                            </span>
                            <span>• {b.skill_level}</span>
                          </div>
                        </td>

                        {/* Preferred Date & Time */}
                        <td className="p-4 align-top">
                          <div className="font-medium text-white/90">{b.preferred_date}</div>
                          <div className="text-[11px] text-white/60">{b.preferred_time}</div>
                          <div className="text-[10px] text-white/40">{b.timezone}</div>
                        </td>

                        {/* Status Badges */}
                        <td className="p-4 align-top space-y-1.5">
                          <div>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-block ${
                              isApproved ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                              b.status === 'Payment Pending Verification' || b.status === 'Pending Approval' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse' :
                              b.status === 'Completed' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                              'bg-red-500/20 text-red-300 border border-red-500/30'
                            }`}>
                              {b.status || 'Pending Approval'}
                            </span>
                          </div>

                          <div className="text-[10px] text-white/50 flex items-center gap-1">
                            <span>Payment:</span>
                            <span className={`font-semibold ${
                              b.payment_status === 'Paid' || isApproved ? 'text-emerald-400' : 'text-amber-400'
                            }`}>
                              {b.payment_status || (isApproved ? 'Paid' : 'Pending Verification')}
                            </span>
                          </div>
                        </td>

                        {/* Jitsi Meeting & Email Status */}
                        <td className="p-4 align-top space-y-1.5">
                          {/* Meeting Badge */}
                          <div className="flex items-center gap-1.5">
                            <Video className="w-3.5 h-3.5 text-[#c5a059]" />
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              hasLink ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-white/10 text-white/40'
                            }`}>
                              Meeting: {hasLink ? (b.meeting_status || 'Generated') : 'Pending'}
                            </span>
                          </div>

                          {/* Room Name or Link indicator */}
                          {hasLink ? (
                            <div className="text-[10px] text-[#c5a059] truncate max-w-[150px] font-mono bg-white/5 px-2 py-0.5 rounded border border-white/10">
                              {b.meeting_room || b.meeting_link?.replace('https://meet.jit.si/', '')}
                            </div>
                          ) : (
                            <div className="text-[10px] text-white/30 italic">No link generated</div>
                          )}

                          {/* Email Status Badge */}
                          <div className="flex items-center gap-1 text-[10px]">
                            <Mail className={`w-3 h-3 ${b.email_sent ? 'text-emerald-400' : 'text-white/30'}`} />
                            <span className={b.email_sent ? 'text-emerald-300 font-medium' : 'text-white/40'}>
                              {b.email_sent ? `Sent ${b.email_sent_at ? new Date(b.email_sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}` : 'Email Not Dispatched'}
                            </span>
                          </div>
                        </td>

                        {/* Action Buttons Toolbar */}
                        <td className="p-4 align-top text-right">
                          <div className="flex flex-wrap items-center justify-end gap-1.5">
                            {/* Approve Button */}
                            {!isApproved && (
                              <button
                                onClick={() => handleApproveBooking(b.id)}
                                className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 border border-emerald-500/30 hover:text-black font-semibold text-[11px] transition-all flex items-center gap-1 shadow-md"
                                title="Approve Booking & Send Jitsi Invite"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                            )}

                            {/* Open / Launch Meeting */}
                            {hasLink && (
                              <button
                                onClick={() => handleOpenMeeting(b)}
                                className="px-2 py-1.5 rounded-xl bg-[#c5a059]/20 text-[#c5a059] hover:bg-[#c5a059] hover:text-black border border-[#c5a059]/40 font-semibold text-[11px] transition-all flex items-center gap-1"
                                title="Open Jitsi Meeting Room"
                              >
                                <Video className="w-3.5 h-3.5" />
                                <span>Join</span>
                              </button>
                            )}

                            {/* Copy Meeting Link */}
                            {hasLink && (
                              <button
                                onClick={() => handleCopyLink(b)}
                                className="p-1.5 rounded-xl bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-all border border-white/10"
                                title="Copy Jitsi Meeting Link"
                              >
                                {copiedBookingId === b.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}

                            {/* Regenerate Meeting Link */}
                            <button
                              onClick={() => handleRegenerateMeeting(b.id)}
                              className="p-1.5 rounded-xl bg-white/10 text-white/80 hover:bg-[#c5a059]/30 hover:text-[#c5a059] transition-all border border-white/10"
                              title="Regenerate Jitsi Room Link"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>

                            {/* Preview Email */}
                            <button
                              onClick={() => setPreviewEmailBooking(b)}
                              className="p-1.5 rounded-xl bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-all border border-white/10"
                              title="Preview Confirmation Email"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Send Email Again */}
                            <button
                              onClick={() => handleResendEmail(b)}
                              className="p-1.5 rounded-xl bg-white/10 text-white/80 hover:bg-blue-500/30 hover:text-blue-300 transition-all border border-white/10"
                              title="Resend Confirmation Email"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>

                            {/* Reject Button */}
                            {b.status !== 'Rejected' && (
                              <button
                                onClick={() => handleBookingStatusChange(b.id, 'Rejected')}
                                className="p-1.5 rounded-xl bg-red-500/15 text-red-300 hover:bg-red-500/30 transition-all border border-red-500/20"
                                title="Reject Booking"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Edit Details */}
                            <button
                              onClick={() => setEditingBooking(b)}
                              className="p-1.5 rounded-xl bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-all border border-white/10"
                              title="Edit Booking Details"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Booking */}
                            <button
                              onClick={() => handleDeleteBooking(b.id)}
                              className="p-1.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/25 transition-all border border-red-500/20"
                              title="Delete Booking Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: ATTENDANCE LEDGER */}
        {activeTab === 'attendance' && (
          <AttendanceTab bookings={bookings} />
        )}

        {/* TAB 5: PAYMENT GATEWAY & CONFIGURATION */}
        {activeTab === 'payment_settings' && (
          <PaymentSettingsTab />
        )}

        {/* TAB 6: STUDENTS MANAGEMENT */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-[#141814] p-4 rounded-2xl border border-white/10">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search student name or email..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-[#f4f1ea] focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-white/10 bg-[#141814]">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-white/60 uppercase tracking-wider text-[10px] border-b border-white/10">
                  <tr>
                    <th className="p-4">Student Name</th>
                    <th className="p-4">Country & Timezone</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Last Active</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-semibold text-[#f4f1ea]">{s.full_name} <br/><span className="text-[11px] text-white/50 font-normal">{s.email}</span></td>
                      <td className="p-4">{s.country || 'Global'} <br/><span className="text-[10px] text-white/40">{s.timezone}</span></td>
                      <td className="p-4 uppercase font-mono text-[10px] text-[#c5a059]">{s.role}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                          s.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="p-4 text-white/50">{s.last_login ? new Date(s.last_login).toLocaleString() : 'Recent'}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleStudentStatusToggle(s.id, s.status)}
                          className={`px-3 py-1 rounded-xl text-[10px] font-semibold transition-colors ${
                            s.status === 'suspended' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                          }`}
                        >
                          {s.status === 'suspended' ? 'Activate Account' : 'Suspend Account'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Supabase Student Login Ledger */}
            <div className="pt-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-[#c5a059]" />
                  <h4 className="font-serif text-lg font-medium text-[#f4f1ea]">
                    Supabase Database: Student Login Activity Log
                  </h4>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowSqlModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-white/80 font-medium transition-all"
                  >
                    Supabase SQL Setup Code
                  </button>

                  <button
                    onClick={handleExportStudentLoginsCSV}
                    disabled={studentLogins.length === 0}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-semibold text-xs transition-all disabled:opacity-40"
                  >
                    Export Logins CSV
                  </button>

                  <span className="text-[10px] uppercase tracking-wider font-semibold px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Live Sync
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto rounded-3xl border border-white/10 bg-[#141814]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/5 text-white/60 uppercase tracking-wider text-[10px] border-b border-white/10">
                    <tr>
                      <th className="p-4">Student Email</th>
                      <th className="p-4">Name / ID</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Login Timestamp</th>
                      <th className="p-4">Client Agent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/80">
                    {studentLogins.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-white/40 italic">
                          No Supabase login records captured yet. Log in as a student to test live tracking!
                        </td>
                      </tr>
                    ) : (
                      studentLogins.map((log, index) => (
                        <tr key={log.id || index} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 font-semibold text-[#c5a059]">{log.email}</td>
                          <td className="p-4">{log.full_name || 'Student'} <br/><span className="text-[10px] text-white/40">{log.user_id}</span></td>
                          <td className="p-4 uppercase font-mono text-[10px] text-emerald-400">{log.role || 'student'}</td>
                          <td className="p-4 text-white/70">{new Date(log.login_at).toLocaleString()}</td>
                          <td className="p-4 text-[10px] text-white/40 truncate max-w-xs">{log.user_agent || log.ip_address || 'Browser Session'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PROGRAM MANAGEMENT */}
        {activeTab === 'programs' && (
          <div className="space-y-6">
            <h3 className="font-serif text-2xl font-medium text-[#f4f1ea]">Manage Yoga & Wellness Programs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {programs.map((p) => (
                <div key={p.id} className="p-6 rounded-3xl bg-[#141814] border border-white/10 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-serif text-xl font-medium text-[#f4f1ea]">{p.title}</h4>
                      <p className="text-xs text-white/60 line-clamp-2 mt-1">{p.description}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${p.is_active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/50'}`}>
                      {p.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#c5a059] font-medium pt-2 border-t border-white/5">
                    <span>Group: ${p.groupPrice}/session</span>
                    <span>Private: ${p.privatePrice}/session</span>
                  </div>

                  <button
                    onClick={() => setEditingProgram(p)}
                    className="w-full py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span>Edit Program Details</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Edit Program Modal */}
            {editingProgram && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
                <div className="w-full max-w-lg p-6 rounded-3xl bg-[#161a16] border border-white/15 space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="font-serif text-lg text-[#f4f1ea]">Edit Program: {editingProgram.title}</h3>
                    <button onClick={() => setEditingProgram(null)}><X className="w-5 h-5 text-white/60" /></button>
                  </div>
                  <form onSubmit={handleSaveProgram} className="space-y-3">
                    <div>
                      <label className="block text-white/70 mb-1">Title</label>
                      <input
                        type="text"
                        value={editingProgram.title}
                        onChange={(e) => setEditingProgram({ ...editingProgram, title: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-white/70 mb-1">Description</label>
                      <textarea
                        rows={3}
                        value={editingProgram.description}
                        onChange={(e) => setEditingProgram({ ...editingProgram, description: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-white/70 mb-1">Group Price ($)</label>
                        <input
                          type="number"
                          value={editingProgram.groupPrice}
                          onChange={(e) => setEditingProgram({ ...editingProgram, groupPrice: Number(e.target.value) })}
                          className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-white/70 mb-1">Private Price ($)</label>
                        <input
                          type="number"
                          value={editingProgram.privatePrice}
                          onChange={(e) => setEditingProgram({ ...editingProgram, privatePrice: Number(e.target.value) })}
                          className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white"
                        />
                      </div>
                    </div>
                    <button type="submit" className="w-full py-3 rounded-2xl gold-gradient text-[#121412] font-bold uppercase tracking-wider mt-2">Save Changes</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: TESTIMONIAL & REVIEWS MANAGEMENT */}
        {activeTab === 'testimonials' && (() => {
          // Calculate helper stats
          const totalReviews = testimonials.length;
          const approvedCount = testimonials.filter(t => t.is_approved !== false).length;
          const hiddenCount = testimonials.filter(t => t.is_approved === false).length;

          // Attendance matching helper
          const getAttendanceMatch = (t: TestimonialItem) => {
            if (t.is_verified_student === true) return { isVerified: true, booking: null };
            const match = bookings.find(b =>
              (t.email && b.email && b.email.trim().toLowerCase() === t.email.trim().toLowerCase()) ||
              (t.name && b.full_name && b.full_name.trim().toLowerCase() === t.name.trim().toLowerCase())
            );
            return { isVerified: Boolean(match), booking: match || null };
          };

          const verifiedCount = testimonials.filter(t => getAttendanceMatch(t).isVerified).length;
          const unverifiedCount = totalReviews - verifiedCount;

          // Filter testimonials
          const filteredTestimonials = testimonials.filter(t => {
            const searchLower = testimonialSearch.toLowerCase().trim();
            const matchesSearch = !searchLower ||
              t.name.toLowerCase().includes(searchLower) ||
              (t.email && t.email.toLowerCase().includes(searchLower)) ||
              t.program.toLowerCase().includes(searchLower) ||
              t.testimonial.toLowerCase().includes(searchLower);

            if (!matchesSearch) return false;

            const { isVerified } = getAttendanceMatch(t);
            if (testimonialFilter === 'approved') return t.is_approved !== false;
            if (testimonialFilter === 'hidden') return t.is_approved === false;
            if (testimonialFilter === 'verified') return isVerified;
            if (testimonialFilter === 'unverified') return !isVerified;
            return true;
          });

          return (
            <div className="space-y-6">
              {/* Summary Metric Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="p-4 rounded-2xl bg-[#141814] border border-white/10 space-y-1">
                  <span className="text-[11px] text-white/50 uppercase tracking-wider font-semibold">Total Reviews</span>
                  <div className="text-2xl font-bold text-[#f4f1ea]">{totalReviews}</div>
                </div>
                <div className="p-4 rounded-2xl bg-[#141814] border border-emerald-500/20 bg-emerald-500/5 space-y-1">
                  <span className="text-[11px] text-emerald-400 uppercase tracking-wider font-semibold">Approved & Public</span>
                  <div className="text-2xl font-bold text-emerald-300">{approvedCount}</div>
                </div>
                <div className="p-4 rounded-2xl bg-[#141814] border border-amber-500/20 bg-amber-500/5 space-y-1">
                  <span className="text-[11px] text-amber-400 uppercase tracking-wider font-semibold">Hidden / Pending</span>
                  <div className="text-2xl font-bold text-amber-300">{hiddenCount}</div>
                </div>
                <div className="p-4 rounded-2xl bg-[#141814] border border-blue-500/20 bg-blue-500/5 space-y-1">
                  <span className="text-[11px] text-blue-400 uppercase tracking-wider font-semibold">Verified Attendees</span>
                  <div className="text-2xl font-bold text-blue-300">{verifiedCount}</div>
                </div>
                <div className="p-4 rounded-2xl bg-[#141814] border border-purple-500/20 bg-purple-500/5 col-span-2 md:col-span-1 space-y-1">
                  <span className="text-[11px] text-purple-400 uppercase tracking-wider font-semibold">Non-Attendees / Visitors</span>
                  <div className="text-2xl font-bold text-purple-300">{unverifiedCount}</div>
                </div>
              </div>

              {/* Controls & Search Bar */}
              <div className="flex flex-col md:flex-row gap-3 items-center justify-between p-4 rounded-2xl bg-[#141814] border border-white/10">
                <div className="relative w-full md:w-80">
                  <input
                    type="text"
                    placeholder="Search reviews by name, email, text..."
                    value={testimonialSearch}
                    onChange={(e) => setTestimonialSearch(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                  {(['all', 'approved', 'hidden', 'verified', 'unverified'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setTestimonialFilter(f)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all whitespace-nowrap ${
                        testimonialFilter === f
                          ? 'bg-[#c5a059] text-[#121412] font-semibold'
                          : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {f === 'all' ? 'All Reviews' : f === 'verified' ? 'Verified Attendees' : f === 'unverified' ? 'Non-Attendees' : f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add New Testimonial Form */}
              <div className="p-6 rounded-3xl bg-[#141814] border border-white/10 space-y-4">
                <h4 className="font-serif text-lg font-medium text-[#f4f1ea]">Add Official Practitioner Testimonial</h4>
                <form onSubmit={handleAddTestimonial} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <input
                    type="text"
                    placeholder="Student Name"
                    required
                    value={newTestimonial.name}
                    onChange={(e) => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-[#c5a059]"
                  />
                  <input
                    type="text"
                    placeholder="Country (e.g. United States)"
                    required
                    value={newTestimonial.country}
                    onChange={(e) => setNewTestimonial({ ...newTestimonial, country: e.target.value })}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-[#c5a059]"
                  />
                  <input
                    type="text"
                    placeholder="Program Name"
                    value={newTestimonial.program}
                    onChange={(e) => setNewTestimonial({ ...newTestimonial, program: e.target.value })}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-[#c5a059]"
                  />
                  <textarea
                    placeholder="Testimonial quote / experience..."
                    required
                    rows={2}
                    value={newTestimonial.testimonial}
                    onChange={(e) => setNewTestimonial({ ...newTestimonial, testimonial: e.target.value })}
                    className="md:col-span-3 p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-[#c5a059]"
                  />
                  <button type="submit" className="md:col-span-3 py-3 rounded-xl gold-gradient text-[#121412] font-bold uppercase tracking-wider hover:opacity-90 transition-opacity">
                    Publish Official Testimonial
                  </button>
                </form>
              </div>

              {/* Reviews List Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTestimonials.length === 0 ? (
                  <div className="md:col-span-2 p-8 text-center rounded-2xl bg-[#141814] border border-white/10 text-white/50 text-sm">
                    No reviews found matching the selected filter or search term.
                  </div>
                ) : (
                  filteredTestimonials.map((t) => {
                    const { isVerified, booking } = getAttendanceMatch(t);
                    return (
                      <div key={t.id} className="p-5 rounded-2xl bg-[#141814] border border-white/10 hover:border-white/20 transition-all space-y-3.5 text-xs">
                        {/* Header Row */}
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold text-sm text-[#f4f1ea]">{t.name}</div>
                            {t.email && <div className="text-[11px] text-white/50">{t.email}</div>}
                            <div className="text-[11px] text-[#94a388]">{t.country} • {t.program}</div>
                          </div>
                          <div className="flex flex-col items-end gap-1.5">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                              t.is_approved !== false
                                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                                : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                            }`}>
                              {t.is_approved !== false ? 'Approved & Public' : 'Hidden / Unapproved'}
                            </span>
                            {t.is_featured && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/30">
                                ⭐ Featured
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Attendance Verification Badge */}
                        <div className="pt-1 pb-1">
                          {isVerified ? (
                            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] flex items-center justify-between">
                              <span className="flex items-center gap-1.5 font-medium">
                                ✓ Verified Program Attendee
                              </span>
                              {booking && (
                                <span className="text-[10px] text-emerald-400/80">
                                  Matched Booking #{booking.id.slice(-6)}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] flex items-center justify-between">
                              <span className="flex items-center gap-1.5 font-medium">
                                ⚠️ Non-Attendee / Community Review
                              </span>
                              <span className="text-[10px] text-purple-300/70">
                                No booking record found
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Review Content */}
                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-white/80 italic font-light leading-relaxed">
                          "{t.testimonial}"
                        </div>

                        {/* Action Toolbar */}
                        <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2 flex-wrap text-[11px]">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleTestimonialApprove(t.id, t.is_approved !== false)}
                              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                                t.is_approved !== false
                                  ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                              }`}
                            >
                              {t.is_approved !== false ? 'Hide Review' : 'Approve & Publish'}
                            </button>
                            <button
                              onClick={() => handleToggleTestimonialFeatured(t.id, Boolean(t.is_featured))}
                              className="px-2.5 py-1 rounded-lg bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                            >
                              {t.is_featured ? 'Unfeature' : '⭐ Feature'}
                            </button>
                            <button
                              onClick={() => handleToggleTestimonialVerified(t.id, isVerified)}
                              className="px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-300 hover:bg-blue-500/25 transition-colors"
                            >
                              {isVerified ? 'Remove Verified Badge' : '✓ Mark Verified'}
                            </button>
                          </div>
                          <button
                            onClick={() => handleDeleteTestimonial(t.id)}
                            className="px-2.5 py-1 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })()}

        {/* TAB 8: CONTACT MANAGEMENT */}
        {activeTab === 'contacts' && (
          <div className="space-y-6">
            <h3 className="font-serif text-2xl font-medium text-[#f4f1ea]">Contact Form Inquiries</h3>
            <div className="space-y-3">
              {contacts.map((c) => (
                <div key={c.id} className="p-5 rounded-2xl bg-[#141814] border border-white/10 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-[#f4f1ea] text-sm">{c.name}</span> ({c.email})
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${c.status === 'unread' ? 'bg-amber-500/20 text-amber-300' : 'bg-white/10 text-white/50'}`}>
                      {c.status}
                    </span>
                  </div>
                  <p className="font-medium text-[#c5a059]">{c.subject || 'General Inquiry'}</p>
                  <p className="text-white/70">{c.message}</p>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    {c.status === 'unread' && (
                      <button onClick={() => handleUpdateContact(c.id, 'read')} className="px-3 py-1 rounded-xl bg-white/5 text-white/80 hover:bg-white/10">Mark Read</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 9: REPORTS EXPORT */}
        {activeTab === 'reports' && (
          <ReportsExportTab
            bookings={bookings}
            students={students}
            payments={payments}
            attendance={attendanceRecords}
            messages={contacts}
          />
        )}
      </div>

      {/* Edit Booking Modal */}
      {editingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <div className="relative w-full max-w-lg p-6 rounded-3xl bg-[#161a16] border border-white/15 text-[#f4f1ea] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#c5a059]">Edit Booking Details</h3>
                <p className="text-[11px] text-white/50">ID: {editingBooking.id}</p>
              </div>
              <button
                onClick={() => setEditingBooking(null)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-white/60 font-semibold mb-1">Student Name & ID</label>
                <input
                  type="text"
                  value={editingBooking.full_name}
                  onChange={(e) => setEditingBooking({ ...editingBooking, full_name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-white/60 font-semibold mb-1">Student ID (user_id / student_id)</label>
                  <input
                    type="text"
                    value={editingBooking.student_id || editingBooking.user_id || ''}
                    onChange={(e) => setEditingBooking({ ...editingBooking, student_id: e.target.value, user_id: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-[11px]"
                    placeholder="usr-student-id"
                  />
                </div>
                <div>
                  <label className="block text-white/60 font-semibold mb-1">Student Email</label>
                  <input
                    type="email"
                    value={editingBooking.email}
                    onChange={(e) => setEditingBooking({ ...editingBooking, email: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-white/60 font-semibold mb-1">Program ID</label>
                  <input
                    type="text"
                    value={editingBooking.program_id}
                    onChange={(e) => setEditingBooking({ ...editingBooking, program_id: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-white/60 font-semibold mb-1">Program Title</label>
                  <input
                    type="text"
                    value={editingBooking.program_title}
                    onChange={(e) => setEditingBooking({ ...editingBooking, program_title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-white/60 font-semibold mb-1">Booking Date</label>
                  <input
                    type="date"
                    value={editingBooking.preferred_date || editingBooking.booking_date || ''}
                    onChange={(e) => setEditingBooking({ ...editingBooking, preferred_date: e.target.value, booking_date: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-white/60 font-semibold mb-1">Booking Time</label>
                  <input
                    type="time"
                    value={editingBooking.preferred_time || editingBooking.booking_time || ''}
                    onChange={(e) => setEditingBooking({ ...editingBooking, preferred_time: e.target.value, booking_time: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-white/60 font-semibold mb-1">Payment Status</label>
                  <select
                    value={editingBooking.payment_status || 'Pending'}
                    onChange={(e) => setEditingBooking({ ...editingBooking, payment_status: e.target.value as any })}
                    className="w-full bg-[#161a16] border border-white/10 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Verified">Verified</option>
                    <option value="Payment Pending Verification">Payment Pending Verification</option>
                    <option value="Failed">Failed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white/60 font-semibold mb-1">Booking Status</label>
                  <select
                    value={editingBooking.status}
                    onChange={(e) => setEditingBooking({ ...editingBooking, status: e.target.value as any })}
                    className="w-full bg-[#161a16] border border-white/10 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Completed">Completed</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-white/60 font-semibold mb-1">Live Class Meeting Link</label>
                <input
                  type="url"
                  value={editingBooking.meeting_link || ''}
                  onChange={(e) => setEditingBooking({ ...editingBooking, meeting_link: e.target.value })}
                  placeholder="https://meet.jit.si/BlissYoga-..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-[11px]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  if (editingBooking) {
                    setDeletingBooking(editingBooking);
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Permanently Delete Booking"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Booking</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setEditingBooking(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (editingBooking) {
                      await updateBookingDetails(editingBooking.id, editingBooking);
                      setEditingBooking(null);
                      // Refresh data
                      const updated = await getAllBookings();
                      setBookings(updated);
                    }
                  }}
                  className="px-5 py-2 rounded-xl gold-gradient text-[#121412] font-bold text-xs"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Jitsi Live Video Class Modal */}
      <JitsiModal
        isOpen={jitsiModal.isOpen}
        onClose={() => setJitsiModal({ isOpen: false, roomName: '', programTitle: '' })}
        roomName={jitsiModal.roomName}
        programTitle={jitsiModal.programTitle}
        userName={adminUser.full_name || 'Admin Instructor'}
      />

      {/* Supabase SQL Setup Code Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <div className="relative w-full max-w-2xl p-6 rounded-3xl bg-[#161a16] border border-white/15 text-[#f4f1ea] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#c5a059]" />
                <h3 className="font-serif text-xl font-bold">Supabase SQL Schema Script</h3>
              </div>
              <button onClick={() => setShowSqlModal(false)} className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-white/60">
              Run this SQL script in your <strong className="text-[#c5a059]">Supabase SQL Editor</strong> to create or update all required tables (<code className="text-[#c5a059]">profiles</code>, <code className="text-[#c5a059]">bookings</code>, <code className="text-[#c5a059]">payments</code>, <code className="text-[#c5a059]">payment_settings</code>, <code className="text-[#c5a059]">attendance</code>, etc.) and safe columns.
            </p>

            <div className="relative p-4 rounded-2xl bg-black/60 border border-white/10 font-mono text-[11px] text-emerald-300 overflow-x-auto max-h-72">
              <pre>{`-- Bliss Yoga & Wellness - Complete Database & Payment Setup Script
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES TABLE (Students & Admins)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  country TEXT DEFAULT 'United States',
  timezone TEXT DEFAULT 'UTC',
  phone TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- 2. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  country TEXT NOT NULL,
  timezone TEXT NOT NULL,
  program_id TEXT NOT NULL,
  program_title TEXT NOT NULL,
  class_type TEXT NOT NULL DEFAULT 'Group',
  skill_level TEXT DEFAULT 'All Levels',
  booking_date DATE,
  preferred_date DATE,
  booking_time TIME,
  preferred_time TIME,
  duration TEXT DEFAULT '60 Minutes',
  base_price NUMERIC DEFAULT 180.00,
  tax_amount NUMERIC DEFAULT 0.00,
  gateway_charges NUMERIC DEFAULT 0.00,
  final_amount NUMERIC DEFAULT 180.00,
  price NUMERIC DEFAULT 180.00,
  additional_notes TEXT,
  payment_status TEXT DEFAULT 'Pending',
  status TEXT DEFAULT 'Pending',
  meeting_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'Pending';

-- 3. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  student_email TEXT NOT NULL,
  student_name TEXT NOT NULL,
  transaction_id TEXT UNIQUE NOT NULL DEFAULT ('TXN-' || UPPER(SUBSTRING(gen_random_uuid()::text FROM 1 FOR 8))),
  amount NUMERIC(10, 2) NOT NULL DEFAULT 180.00,
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_method TEXT NOT NULL DEFAULT 'Card',
  payment_status TEXT NOT NULL DEFAULT 'Pending',
  gateway_reference TEXT,
  receipt_url TEXT,
  notes TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'Pending';

-- 4. PAYMENT SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.payment_settings (
  id TEXT PRIMARY KEY DEFAULT 'default_settings',
  bank_name TEXT DEFAULT 'Global Wellness Bank',
  account_title TEXT DEFAULT 'Bliss Yoga & Wellness Studio',
  account_number TEXT DEFAULT 'XXXX-XXXX-8899',
  routing_number TEXT DEFAULT '021000021',
  iban TEXT DEFAULT 'US90WELLNESS0012345678',
  swift_code TEXT DEFAULT 'GWUS33XXX',
  upi_id TEXT DEFAULT 'blissyoga@bank',
  paypal_email TEXT DEFAULT 'payments@blissyoga.com',
  instructions TEXT DEFAULT 'Please include your Booking ID as reference in payment notes.',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TESTIMONIALS & REVIEWS TABLES
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'United States',
  program TEXT NOT NULL DEFAULT 'Hatha Yoga & Wellness',
  rating INTEGER DEFAULT 5,
  avatar TEXT,
  testimonial TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  country TEXT DEFAULT 'United States',
  program TEXT DEFAULT 'Hatha Yoga & Wellness',
  rating INTEGER DEFAULT 5,
  review_text TEXT NOT NULL,
  avatar_url TEXT,
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Profiles Read" ON public.profiles;
DROP POLICY IF EXISTS "Public Insert Booking" ON public.bookings;
DROP POLICY IF EXISTS "Public Delete Booking" ON public.bookings;
DROP POLICY IF EXISTS "Public Insert Payments" ON public.payments;
DROP POLICY IF EXISTS "Public Read Payment Settings" ON public.payment_settings;

DROP POLICY IF EXISTS "Public Read Testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Public Insert Testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Public Delete Testimonials" ON public.testimonials;

DROP POLICY IF EXISTS "Public Read Reviews" ON public.reviews;
DROP POLICY IF EXISTS "Public Insert Reviews" ON public.reviews;
DROP POLICY IF EXISTS "Public Delete Reviews" ON public.reviews;

CREATE POLICY "Public Profiles Read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public Insert Booking" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Delete Booking" ON public.bookings FOR DELETE USING (true);
CREATE POLICY "Public Insert Payments" ON public.payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Read Payment Settings" ON public.payment_settings FOR SELECT USING (true);

CREATE POLICY "Public Read Testimonials" ON public.testimonials FOR SELECT USING (true);
CREATE POLICY "Public Insert Testimonials" ON public.testimonials FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Delete Testimonials" ON public.testimonials FOR DELETE USING (true);

CREATE POLICY "Public Read Reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Public Insert Reviews" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Delete Reviews" ON public.reviews FOR DELETE USING (true);
`}</pre>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-white/40">Tables: <code className="text-emerald-400">profiles</code>, <code className="text-emerald-400">bookings</code>, <code className="text-emerald-400">payments</code>, <code className="text-emerald-400">payment_settings</code></span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`-- Bliss Yoga & Wellness - Complete Database & Payment Setup Script
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  country TEXT DEFAULT 'United States',
  timezone TEXT DEFAULT 'UTC',
  phone TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- 2. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  country TEXT NOT NULL,
  timezone TEXT NOT NULL,
  program_id TEXT NOT NULL,
  program_title TEXT NOT NULL,
  class_type TEXT NOT NULL DEFAULT 'Group',
  skill_level TEXT DEFAULT 'All Levels',
  booking_date DATE,
  preferred_date DATE,
  booking_time TIME,
  preferred_time TIME,
  duration TEXT DEFAULT '60 Minutes',
  base_price NUMERIC DEFAULT 180.00,
  tax_amount NUMERIC DEFAULT 0.00,
  gateway_charges NUMERIC DEFAULT 0.00,
  final_amount NUMERIC DEFAULT 180.00,
  price NUMERIC DEFAULT 180.00,
  additional_notes TEXT,
  payment_status TEXT DEFAULT 'Pending',
  status TEXT DEFAULT 'Pending',
  meeting_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'Pending';

-- 3. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  student_email TEXT NOT NULL,
  student_name TEXT NOT NULL,
  transaction_id TEXT UNIQUE NOT NULL DEFAULT ('TXN-' || UPPER(SUBSTRING(gen_random_uuid()::text FROM 1 FOR 8))),
  amount NUMERIC(10, 2) NOT NULL DEFAULT 180.00,
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_method TEXT NOT NULL DEFAULT 'Card',
  payment_status TEXT NOT NULL DEFAULT 'Pending',
  gateway_reference TEXT,
  receipt_url TEXT,
  notes TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'Pending';

-- 4. PAYMENT SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.payment_settings (
  id TEXT PRIMARY KEY DEFAULT 'default_settings',
  bank_name TEXT DEFAULT 'Global Wellness Bank',
  account_title TEXT DEFAULT 'Bliss Yoga & Wellness Studio',
  account_number TEXT DEFAULT 'XXXX-XXXX-8899',
  routing_number TEXT DEFAULT '021000021',
  iban TEXT DEFAULT 'US90WELLNESS0012345678',
  swift_code TEXT DEFAULT 'GWUS33XXX',
  upi_id TEXT DEFAULT 'blissyoga@bank',
  paypal_email TEXT DEFAULT 'payments@blissyoga.com',
  instructions TEXT DEFAULT 'Please include your Booking ID as reference in payment notes.',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TESTIMONIALS & REVIEWS TABLES
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'United States',
  program TEXT NOT NULL DEFAULT 'Hatha Yoga & Wellness',
  rating INTEGER DEFAULT 5,
  avatar TEXT,
  testimonial TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  country TEXT DEFAULT 'United States',
  program TEXT DEFAULT 'Hatha Yoga & Wellness',
  rating INTEGER DEFAULT 5,
  review_text TEXT NOT NULL,
  avatar_url TEXT,
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Profiles Read" ON public.profiles;
DROP POLICY IF EXISTS "Public Insert Booking" ON public.bookings;
DROP POLICY IF EXISTS "Public Delete Booking" ON public.bookings;
DROP POLICY IF EXISTS "Public Insert Payments" ON public.payments;
DROP POLICY IF EXISTS "Public Read Payment Settings" ON public.payment_settings;

DROP POLICY IF EXISTS "Public Read Testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Public Insert Testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Public Delete Testimonials" ON public.testimonials;

DROP POLICY IF EXISTS "Public Read Reviews" ON public.reviews;
DROP POLICY IF EXISTS "Public Insert Reviews" ON public.reviews;
DROP POLICY IF EXISTS "Public Delete Reviews" ON public.reviews;

CREATE POLICY "Public Profiles Read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public Insert Booking" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Delete Booking" ON public.bookings FOR DELETE USING (true);
CREATE POLICY "Public Insert Payments" ON public.payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Read Payment Settings" ON public.payment_settings FOR SELECT USING (true);

-- Testimonials & Reviews Policies
CREATE POLICY "Public Read Testimonials" ON public.testimonials FOR SELECT USING (true);
CREATE POLICY "Public Insert Testimonials" ON public.testimonials FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Delete Testimonials" ON public.testimonials FOR DELETE USING (true);

CREATE POLICY "Public Read Reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Public Insert Reviews" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Delete Reviews" ON public.reviews FOR DELETE USING (true);
`);
                  setCopiedSql(true);
                  setTimeout(() => setCopiedSql(false), 2000);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#c5a059] text-[#121412] font-bold text-xs hover:bg-[#d4af37] transition-all flex items-center gap-2 cursor-pointer"
              >
                {copiedSql ? 'Copied SQL!' : 'Copy SQL Script'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Booking Modal */}
      {deletingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#161a16] border border-[#c5a059]/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-3 rounded-2xl bg-red-500/20 border border-red-500/30">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#f4f1ea]">Confirm Delete Booking</h3>
                <p className="text-xs text-white/60">This action cannot be undone.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 text-xs text-white/80">
              <p><span className="text-white/50">Student:</span> <strong className="text-[#f4f1ea]">{deletingBooking.full_name}</strong></p>
              <p><span className="text-white/50">Program:</span> <span className="text-[#c5a059]">{deletingBooking.program_title}</span></p>
              <p><span className="text-white/50">Date & Time:</span> {deletingBooking.preferred_date} • {deletingBooking.preferred_time}</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingBooking(null)}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteBookingAction}
                className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs shadow-lg shadow-red-500/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Permanently Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Testimonial Modal */}
      {deletingTestimonial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#161a16] border border-[#c5a059]/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-3 rounded-2xl bg-red-500/20 border border-red-500/30">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#f4f1ea]">Confirm Delete Testimonial</h3>
                <p className="text-xs text-white/60">This action cannot be undone.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1 text-xs text-white/80">
              <p><span className="text-white/50">Author:</span> <strong className="text-[#f4f1ea]">{deletingTestimonial.name}</strong></p>
              <p className="line-clamp-2 italic text-white/70">"{deletingTestimonial.testimonial}"</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingTestimonial(null)}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteTestimonialAction}
                className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs shadow-lg shadow-red-500/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Permanently Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HTML Email Preview Modal */}
      <EmailPreviewModal
        isOpen={Boolean(previewEmailBooking)}
        booking={previewEmailBooking}
        onClose={() => setPreviewEmailBooking(null)}
        onSendEmail={async (b) => {
          await handleResendEmail(b);
        }}
      />

      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl bg-[#1c221c] border border-[#c5a059]/50 text-[#f4f1ea] font-medium text-xs shadow-2xl flex items-center gap-3 backdrop-blur-xl"
          >
            <div className="w-8 h-8 rounded-xl bg-[#c5a059]/20 border border-[#c5a059]/40 flex items-center justify-center text-[#c5a059] shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
