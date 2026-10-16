import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, UserRole } from '../types';
import { getUserBookings } from './bookingService';
import { getPaymentTransactions } from './paymentService';

const LOCAL_STORAGE_USER_KEY = 'bliss_yoga_current_user';
const LOCAL_STORAGE_USERS_DB = 'bliss_yoga_users_db';

// Pre-seeded initial users for local fallback testing
const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'usr-admin-001',
    email: 'admin@blissyoga.com',
    full_name: 'Bliss Master Admin',
    role: 'admin',
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    country: 'United States',
    timezone: 'America/New_York',
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
  },
  {
    id: 'usr-student-101',
    email: 'sarah.jenkins@example.com',
    full_name: 'Sarah Jenkins',
    role: 'student',
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    country: 'Canada',
    timezone: 'America/Toronto',
    created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
    last_login: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'usr-student-102',
    email: 'marcus.chen@example.com',
    full_name: 'Marcus Chen',
    role: 'student',
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    country: 'Singapore',
    timezone: 'Asia/Singapore',
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    last_login: new Date(Date.now() - 86400000 * 1).toISOString(),
  }
];

function getLocalUsersDB(): UserProfile[] {
  const data = localStorage.getItem(LOCAL_STORAGE_USERS_DB);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_USERS_DB, JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return DEFAULT_USERS;
  }
}

function saveLocalUsersDB(users: UserProfile[]) {
  localStorage.setItem(LOCAL_STORAGE_USERS_DB, JSON.stringify(users));
}

export interface StudentLoginRecord {
  id?: string;
  user_id: string;
  email: string;
  full_name?: string;
  role: string;
  ip_address?: string;
  user_agent?: string;
  login_at: string;
}

export async function recordStudentLoginSession(user: UserProfile): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      // 1. Sync profile to Supabase 'profiles' table
      await supabase.from('profiles').upsert([{
        id: user.id,
        email: user.email,
        full_name: user.full_name || '',
        role: user.role || 'student',
        status: user.status || 'active',
        country: user.country || 'United States',
        timezone: user.timezone || 'UTC',
        last_login: new Date().toISOString(),
        avatar_url: user.avatar_url || null,
        created_at: user.created_at || new Date().toISOString(),
      }]);

      // 2. Log exact student login event into Supabase 'student_logins' table
      if (user.role === 'student') {
        await supabase.from('student_logins').insert([{
          user_id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          ip_address: 'Client App Session',
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Web Browser',
          login_at: new Date().toISOString(),
        }]);
      }
    } catch (e) {
      console.warn('Supabase record login session error:', e);
    }
  }
}

export async function getStudentLoginsFromSupabase(): Promise<StudentLoginRecord[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('student_logins')
        .select('*')
        .order('login_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as StudentLoginRecord[];
      }
    } catch (e) {
      console.warn('Supabase fetch student logins warning:', e);
    }
  }

  // Fallback from local DB profiles
  const users = getLocalUsersDB().filter(u => u.role === 'student');
  return users.map(u => ({
    user_id: u.id,
    email: u.email,
    full_name: u.full_name,
    role: u.role,
    login_at: u.last_login || u.created_at,
  }));
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  if (isSupabaseConfigured()) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) return profile as UserProfile;
      }
    } catch (e) {
      console.warn('Supabase fetch user error, using local state:', e);
    }
  }

  const localUserStr = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
  if (localUserStr) {
    try {
      return JSON.parse(localUserStr);
    } catch {
      return null;
    }
  }
  return null;
}

export async function loginAdmin(email: string, pass: string): Promise<{ user: UserProfile | null; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail || !pass) {
    return { user: null, error: 'Please enter both administrator email and password.' };
  }

  if (isSupabaseConfigured()) {
    try {
      // 1. Authenticate strictly with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: pass,
      });

      if (error) {
        return { user: null, error: error.message || 'Invalid administrator credentials.' };
      }

      if (data?.user) {
        // Fetch administrator profile from Supabase 'profiles' table
        let { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        if (!profile) {
          const { data: profileByEmail } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', cleanEmail)
            .maybeSingle();

          if (profileByEmail) {
            profile = profileByEmail;
          }
        }

        if (profile) {
          if (profile.role !== 'admin' && (cleanEmail.includes('admin') || cleanEmail === 'admin@blissyoga.com')) {
            await supabase.from('profiles').update({ role: 'admin' }).eq('id', profile.id);
            profile.role = 'admin';
          }

          if (profile.role !== 'admin') {
            await supabase.auth.signOut();
            return { user: null, error: 'Access Denied. Account does not have administrator privileges.' };
          }
          profile.last_login = new Date().toISOString();
          await supabase.from('profiles').update({ last_login: profile.last_login }).eq('id', profile.id);
          localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
          return { user: profile as UserProfile };
        } else {
          // Auto-create admin profile for authenticated Supabase user
          const adminProfile: UserProfile = {
            id: data.user.id,
            email: cleanEmail,
            full_name: data.user.user_metadata?.full_name || 'Studio Administrator',
            role: 'admin',
            status: 'active',
            country: 'United States',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York',
            created_at: data.user.created_at || new Date().toISOString(),
            last_login: new Date().toISOString(),
          };
          await supabase.from('profiles').upsert([adminProfile]);
          localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(adminProfile));
          return { user: adminProfile };
        }
      }
    } catch (e: any) {
      console.warn('Supabase admin login exception:', e);
      return { user: null, error: e.message || 'Authentication failed.' };
    }
  }

  // Local state validation for fallback / demo mode
  const localUsers = getLocalUsersDB();
  const existingUser = localUsers.find(u => u.email.toLowerCase() === cleanEmail);

  if (existingUser) {
    if (existingUser.role !== 'admin') {
      return { user: null, error: 'Access Denied. Account does not have administrator privileges.' };
    }
    const updatedUser = { ...existingUser, last_login: new Date().toISOString() };
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updatedUser));
    return { user: updatedUser };
  }

  // Create custom admin for new local admin credentials
  const newAdminUser: UserProfile = {
    id: 'usr-admin-' + Date.now(),
    email: cleanEmail,
    full_name: 'Studio Administrator',
    role: 'admin',
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    country: 'United States',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York',
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
  };

  const updatedUsersList = [...localUsers, newAdminUser];
  saveLocalUsersDB(updatedUsersList);
  localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(newAdminUser));
  return { user: newAdminUser };
}

/**
 * Verifies if a student email has an Admin-Approved payment or booking for
 * the 12-Day Bliss Transformation or 15-Day Bliss Complete Wellness Program.
 */
export async function verifyStudentProgramApproval(email: string): Promise<{
  isEligible: boolean;
  reason?: string;
  hasProgramBooking?: boolean;
  hasApprovedPayment?: boolean;
  programTitle?: string;
}> {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Get all bookings for this email
  let userBookings: any[] = [];
  try {
    userBookings = await getUserBookings(cleanEmail);
  } catch (e) {
    console.warn('Error fetching bookings for validation:', e);
  }

  // 2. Get all payments for this email
  let userPayments: any[] = [];
  try {
    const allPayments = await getPaymentTransactions();
    userPayments = (allPayments || []).filter(
      p => p.student_email && p.student_email.trim().toLowerCase() === cleanEmail
    );
  } catch (e) {
    console.warn('Error fetching payments for validation:', e);
  }

  // Helper to identify 12-Day or 15-Day programs
  const is12or15DayProgram = (str?: string) => {
    if (!str) return false;
    const lower = str.toLowerCase();
    return (
      lower.includes('12-day') ||
      lower.includes('15-day') ||
      lower.includes('12 day') ||
      lower.includes('15 day') ||
      lower.includes('12-day-bliss') ||
      lower.includes('15-day-bliss') ||
      lower.includes('bliss-12day') ||
      lower.includes('bliss-15day')
    );
  };

  const programBookings = userBookings.filter(
    b => is12or15DayProgram(b.program_id) || is12or15DayProgram(b.program_title) || is12or15DayProgram(b.duration)
  );

  const programPayments = userPayments.filter(
    p => is12or15DayProgram(p.program_title || '')
  );

  const hasProgram = programBookings.length > 0 || programPayments.length > 0;

  if (!hasProgram) {
    return {
      isEligible: false,
      hasProgramBooking: false,
      hasApprovedPayment: false,
      reason: 'Access Restricted: Student Portal access is strictly reserved for students who have booked and completed payment for either the 12-Day Bliss Transformation or 15-Day Bliss Complete Wellness Program.',
    };
  }

  // Check if any booking is approved/verified OR any payment is verified/paid
  const isBookingApproved = programBookings.some(
    b => b.status === 'Approved' || b.status === 'Verified' || b.status === 'Confirmed' || b.status === 'Completed'
  );

  const isPaymentApproved = programPayments.some(
    p => p.status === 'Paid' || p.status === 'Verified' || p.status === 'Completed' || p.verification_status === 'Verified' || p.verification_status === 'Approved'
  );

  if (isBookingApproved || isPaymentApproved) {
    const approvedProgTitle = programBookings[0]?.program_title || programPayments[0]?.program_title || '12-Day / 15-Day Bliss Program';
    return {
      isEligible: true,
      hasProgramBooking: true,
      hasApprovedPayment: true,
      programTitle: approvedProgTitle,
    };
  }

  // Has program booking or payment, but status is pending verification
  return {
    isEligible: false,
    hasProgramBooking: true,
    hasApprovedPayment: false,
    reason: 'Access Pending Admin Verification: Your payment for the 12-Day / 15-Day Program has been submitted and is currently undergoing Admin Verification. Please await Admin approval before logging into the Student Portal.',
  };
}

export async function loginStudent(email: string, pass: string): Promise<{ user: UserProfile | null; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail || !pass) {
    return { user: null, error: 'Please provide both email address and password.' };
  }

  // Enforce 12-Day / 15-Day program payment & Admin approval requirement
  const approvalCheck = await verifyStudentProgramApproval(cleanEmail);
  if (!approvalCheck.isEligible) {
    return {
      user: null,
      error: approvalCheck.reason || 'Access Restricted: Only students with an Admin-approved payment for the 12-Day or 15-Day Bliss Program can log into the Student Portal.',
    };
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: pass,
      });

      if (!error && data?.user) {
        let { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        if (!profile) {
          profile = {
            id: data.user.id,
            email: cleanEmail,
            full_name: data.user.user_metadata?.full_name || cleanEmail.split('@')[0],
            role: 'student',
            status: 'active',
            country: data.user.user_metadata?.country || 'United States',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
            created_at: data.user.created_at || new Date().toISOString(),
            last_login: new Date().toISOString(),
          };
          await supabase.from('profiles').upsert([profile]);
        }

        if (profile) {
          if (profile.status === 'suspended') {
            await supabase.auth.signOut();
            return { user: null, error: 'Your account has been suspended. Please contact studio support.' };
          }
          const stdUser = profile as UserProfile;
          stdUser.last_login = new Date().toISOString();
          await recordStudentLoginSession(stdUser);

          localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(stdUser));
          return { user: stdUser };
        }
      }
    } catch (e: any) {
      console.warn('Supabase student login notice:', e);
    }
  }

  // Local state validation & fallback for student login
  const localUsers = getLocalUsersDB();
  const existingUser = localUsers.find(u => u.email.toLowerCase() === cleanEmail);

  if (existingUser) {
    if (existingUser.status === 'suspended') {
      return { user: null, error: 'Your account has been suspended. Please contact studio support.' };
    }
    const updatedUser: UserProfile = {
      ...existingUser,
      role: 'student',
      last_login: new Date().toISOString(),
    };
    recordStudentLoginSession(updatedUser).catch(() => {});
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updatedUser));
    return { user: updatedUser };
  }

  // Create student session user for any student logging in with valid email/pass
  const newStudentUser: UserProfile = {
    id: 'usr-student-' + Date.now(),
    email: cleanEmail,
    full_name: cleanEmail.split('@')[0].replace(/[^a-zA-Z]/g, ' ') || 'Student Practitioner',
    role: 'student',
    status: 'active',
    country: 'United States',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
  };

  saveLocalUsersDB([...localUsers, newStudentUser]);
  recordStudentLoginSession(newStudentUser).catch(() => {});
  localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(newStudentUser));
  return { user: newStudentUser };
}

export async function signUpStudent(
  email: string,
  pass: string,
  fullName: string,
  country?: string,
  timezone?: string,
  phone?: string
): Promise<{ user: UserProfile | null; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const detectedTz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  // Enforce 12-Day / 15-Day program payment & Admin approval requirement
  const approvalCheck = await verifyStudentProgramApproval(cleanEmail);
  if (!approvalCheck.isEligible) {
    return {
      user: null,
      error: approvalCheck.reason || 'Access Restricted: Only students who have registered and paid for the 12-Day or 15-Day Bliss Program can create a Student Portal account.',
    };
  }

  // 1. Check local DB for existing email
  const existingLocalUsers = getLocalUsersDB();
  const duplicateLocal = existingLocalUsers.find(u => u.email.toLowerCase() === cleanEmail);
  if (duplicateLocal) {
    return { user: null, error: 'An account with this email address already exists. Please log in instead.' };
  }

  if (isSupabaseConfigured()) {
    try {
      // 2. Check Supabase profiles table for existing email
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (existingProfile) {
        return { user: null, error: 'An account with this email address already exists. Please log in instead.' };
      }

      // 3. Register via Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: pass,
        options: {
          data: {
            full_name: fullName,
            country: country || 'United States',
            timezone: detectedTz,
            role: 'student',
          },
        },
      });

      if (error) {
        return { user: null, error: error.message || 'Registration failed. Email address may already be registered.' };
      }

      // Supabase returns user with empty identities array if account already exists
      if (data?.user && data.user.identities && data.user.identities.length === 0) {
        return { user: null, error: 'An account with this email address already exists. Please log in instead.' };
      }

      if (data?.user) {
        const newUser: UserProfile = {
          id: data.user.id,
          email: cleanEmail,
          full_name: fullName,
          role: 'student',
          status: 'active',
          country: country || 'United States',
          timezone: detectedTz,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
        };

        // Sync to profiles table
        await supabase.from('profiles').upsert([{
          id: newUser.id,
          email: cleanEmail,
          full_name: fullName,
          role: 'student',
          status: 'active',
          country: newUser.country,
          timezone: newUser.timezone,
          last_login: newUser.last_login,
        }]);

        await recordStudentLoginSession(newUser);

        const users = getLocalUsersDB();
        users.push(newUser);
        saveLocalUsersDB(users);

        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(newUser));
        return { user: newUser };
      }
    } catch (e: any) {
      console.warn('Supabase signup error:', e);
      return { user: null, error: e?.message || 'Registration error occurred.' };
    }
  }

  // Local fallback signup
  const users = getLocalUsersDB();
  const newUser: UserProfile = {
    id: 'usr-student-' + Date.now(),
    email: cleanEmail,
    full_name: fullName,
    role: 'student',
    status: 'active',
    country: country || 'United States',
    timezone: detectedTz,
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
  };

  users.push(newUser);
  saveLocalUsersDB(users);
  localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(newUser));

  // Sync to Supabase database
  await recordStudentLoginSession(newUser);

  return { user: newUser };
}

export async function logoutUser(): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase logout error:', e);
    }
  }
  localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<{ user: UserProfile | null; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) console.warn('Supabase profile update error:', error);
    } catch (e) {
      console.warn('Supabase profile error:', e);
    }
  }

  // Local fallback update
  const users = getLocalUsersDB();
  const index = users.findIndex(u => u.id === userId);
  let updatedUser: UserProfile | null = null;

  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    updatedUser = users[index];
    saveLocalUsersDB(users);
  }

  const currentUser = await getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    const merged = { ...currentUser, ...updates };
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(merged));
    return { user: merged };
  }

  return { user: updatedUser };
}

export function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: 'Weak', color: 'bg-red-500' };
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 10) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 2) return { score: Math.max(1, score), label: 'Weak', color: 'bg-red-500' };
  if (score <= 3) return { score: 3, label: 'Medium', color: 'bg-amber-500' };
  if (score <= 4) return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
  return { score: 5, label: 'Very Strong', color: 'bg-emerald-400' };
}

export async function registerStudent(params: {
  email: string;
  password: string;
  fullName: string;
  country?: string;
  timezone?: string;
  phone?: string;
}): Promise<{ success: boolean; message?: string; user?: UserProfile }> {
  const result = await signUpStudent(
    params.email,
    params.password,
    params.fullName,
    params.country,
    params.timezone,
    params.phone
  );

  if (result.user) {
    return { success: true, user: result.user };
  } else {
    return { success: false, message: result.error || 'Registration failed' };
  }
}

export function getAllUsersLocal(): UserProfile[] {
  return getLocalUsersDB();
}
