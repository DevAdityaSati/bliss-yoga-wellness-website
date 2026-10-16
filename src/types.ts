export type NavigationPage =
  | 'home'
  | 'about'
  | 'programs'
  | 'program-detail'
  | 'pricing'
  | 'testimonials'
  | 'faq'
  | 'book'
  | 'contact'
  | 'admin-login'
  | 'admin-dashboard'
  | 'student-dashboard';

export type UserRole = 'student' | 'admin';

export type UserStatus = 'active' | 'suspended' | 'pending';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  country?: string;
  timezone?: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  last_login?: string;
}

export type BookingStatus = 'Pending' | 'Payment Pending Verification' | 'Pending Approval' | 'Approved' | 'Confirmed' | 'Rejected' | 'Completed' | 'Cancelled';
export type ClassType = 'Group' | 'Private';
export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  country?: string;
  timezone?: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  last_login?: string;
}

export interface LoginHistoryRecord {
  id: string;
  user_id?: string;
  email: string;
  login_time: string;
  logout_time?: string;
  ip_address?: string;
  browser?: string;
  device?: string;
  country?: string;
  status: 'Success' | 'Failed';
}

export interface BookingRecord {
  id: string;
  student_id?: string;
  user_id?: string;
  full_name: string;
  email: string;
  country: string;
  timezone: string;
  program_id: string;
  program_title: string;
  class_type: ClassType;
  skill_level: SkillLevel;
  duration?: string;
  booking_date?: string;
  preferred_date: string;
  booking_time?: string;
  preferred_time: string;
  additional_notes?: string;
  payment_status?: PaymentStatus;
  status: BookingStatus;
  meeting_link?: string;
  meeting_room?: string;
  meeting_status?: string;
  approval_date?: string;
  approved_by?: string;
  email_sent?: boolean;
  email_sent_at?: string;
  price?: number;
  base_price?: number;
  tax_amount?: number;
  gateway_charges?: number;
  final_amount?: number;
  created_at: string;
  updated_at?: string;
}

export type ContactStatus = 'unread' | 'read' | 'archived';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactStatus;
  reply_notes?: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Completed';

export interface AttendanceRecord {
  id: string;
  booking_id: string;
  student_id?: string;
  student_name: string;
  student_email: string;
  program_title: string;
  class_date: string;
  class_time: string;
  status: AttendanceStatus;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export type MeetingStatus = 'Scheduled' | 'Live' | 'Ended' | 'Cancelled';

export interface MeetingRecord {
  id: string;
  booking_id: string;
  room_name: string;
  meeting_link: string;
  start_time: string; // ISO string
  end_time?: string;
  host_name?: string;
  passcode?: string;
  status: MeetingStatus;
  created_at: string;
  updated_at?: string;
}

export type PaymentProvider = 'paypal' | 'qr_code' | 'manual';
export type PaymentStatus = 
  | 'Pending' 
  | 'Paid' 
  | 'Failed' 
  | 'Cancelled' 
  | 'Refunded' 
  | 'Verified' 
  | 'Payment Pending Verification'
  | 'Pending Verification'
  | 'Pending Manual Verification'
  | 'Under Verification' 
  | 'Rejected'
  | 'Duplicate Transaction ID'
  | 'Invalid Transaction ID';

export type VerificationStatus =
  | 'Pending Verification'
  | 'Pending Manual Verification'
  | 'Verified'
  | 'Failed'
  | 'Duplicate Transaction ID'
  | 'Invalid Transaction ID';

export interface PaymentSettings {
  enabled: boolean;
  provider: PaymentProvider;
  currency: string;
  tax_percentage: number;
  environment: 'sandbox' | 'production';
  paypal_client_id?: string;
  paypal_secret?: string;
  paypal_link?: string;
  paypal_success_url?: string;
  paypal_cancel_url?: string;
  qr_code_url?: string;
  manual_instructions?: string;
  payment_notice?: string;
}

export interface PaymentTransaction {
  id: string;
  booking_id: string;
  student_name: string;
  student_email: string;
  program_title: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  verification_status?: VerificationStatus;
  transaction_ref?: string;
  transaction_id?: string;
  payment_date?: string;
  receipt_url?: string;
  notes?: string;
  admin_notes?: string;
  created_at: string;
}

export interface EmailLog {
  id: string;
  recipient_email: string;
  template_type: string;
  subject: string;
  status: 'sent' | 'failed';
  sent_at: string;
}

export interface AuditLog {
  id: string;
  action: string;
  actor: string;
  details: string;
  timestamp: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalBookings: number;
  pendingBookings: number;
  todaysClasses: number;
  upcomingClasses: number;
  completedClasses: number;
  totalRevenue: number;
  unreadMessages: number;
}

export interface ProgramFAQ {
  question: string;
  answer: string;
}

export interface ProgramItem {
  id: string;
  title: string;
  description: string;
  groupPrice: number;
  privatePrice: number;
  duration?: string;
  image: string;
  benefits: string[];
  recommendedFor: string;
  overview?: string;
  suitableFor?: string[];
  whatYouWillLearn?: string[];
  classStructure?: string[];
  supports?: string[];
  faqs?: ProgramFAQ[];
  is_active?: boolean;
  is_premium?: boolean;
}

export interface StatItem {
  id: string;
  value: string;
  label: string;
  subtext: string;
  iconName: string;
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface CoreValueItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  email?: string;
  country: string;
  program: string;
  rating: number;
  avatar: string;
  testimonial: string;
  is_approved?: boolean;
  is_featured?: boolean;
  is_verified_student?: boolean;
  created_at?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

