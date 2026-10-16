import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { BookingRecord, BookingStatus } from '../types';

const LOCAL_STORAGE_BOOKINGS = 'bliss_yoga_bookings_db';

// Pre-seeded sample bookings for rich initial dashboard presentation
const INITIAL_BOOKINGS: BookingRecord[] = [
  {
    id: 'bk-1001',
    user_id: 'usr-student-101',
    full_name: 'Sarah Jenkins',
    email: 'sarah.jenkins@example.com',
    country: 'Canada',
    timezone: 'America/Toronto',
    program_id: '12-day-bliss-transformation',
    program_title: '12-Day Bliss Transformation Program',
    class_type: 'Private',
    skill_level: 'Intermediate',
    preferred_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    preferred_time: '10:00',
    additional_notes: 'Enrolled in 12-Day Bliss Transformation. Payment verified & Admin approved.',
    status: 'Approved',
    meeting_link: 'https://meet.jit.si/BlissYoga-12Day-SarahJenkins',
    price: 300,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'bk-1002',
    user_id: 'usr-student-102',
    full_name: 'Marcus Chen',
    email: 'marcus.chen@example.com',
    country: 'Singapore',
    timezone: 'Asia/Singapore',
    program_id: '15-day-bliss-complete-wellness',
    program_title: '15-Day Bliss Complete Wellness Program',
    class_type: 'Group',
    skill_level: 'Beginner',
    preferred_date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    preferred_time: '19:00',
    additional_notes: 'Enrolled in 15-Day Bliss Complete Wellness. Payment verified & Admin approved.',
    status: 'Approved',
    meeting_link: 'https://meet.jit.si/BlissYoga-15Day-MarcusChen',
    price: 220,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'bk-1003',
    full_name: 'Elena Rostova',
    email: 'elena.rostova@example.com',
    country: 'United Kingdom',
    timezone: 'Europe/London',
    program_id: '12-day-bliss-transformation',
    program_title: '12-Day Bliss Transformation Program',
    class_type: 'Private',
    skill_level: 'Advanced',
    preferred_date: new Date(Date.now() + 86400000 * 1).toISOString().split('T')[0],
    preferred_time: '14:30',
    additional_notes: 'Recovering from lower back tension after long office work hours.',
    status: 'Approved',
    meeting_link: 'https://meet.jit.si/BlissYoga-Private-ElenaRostova',
    price: 300,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'bk-1004',
    full_name: 'David Kim',
    email: 'david.kim@example.com',
    country: 'Australia',
    timezone: 'Australia/Sydney',
    program_id: '15-day-bliss-complete-wellness',
    program_title: '15-Day Bliss Complete Wellness Program',
    class_type: 'Group',
    skill_level: 'Beginner',
    preferred_date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    preferred_time: '09:00',
    additional_notes: 'Great session last week, renewing group booking.',
    status: 'Completed',
    price: 220,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  }
];

function getLocalBookings(): BookingRecord[] {
  const data = localStorage.getItem(LOCAL_STORAGE_BOOKINGS);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_BOOKINGS, JSON.stringify(INITIAL_BOOKINGS));
    return INITIAL_BOOKINGS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_BOOKINGS;
  }
}

function saveLocalBookings(bookings: BookingRecord[]) {
  localStorage.setItem(LOCAL_STORAGE_BOOKINGS, JSON.stringify(bookings));
}

export async function createBooking(booking: Omit<BookingRecord, 'id' | 'created_at'> & { status?: BookingStatus }): Promise<{ booking: BookingRecord; error?: string }> {
  const finalStatus: BookingStatus = booking.status || 'Payment Pending Verification';
  const newBooking: BookingRecord = {
    ...booking,
    id: 'bk-' + Date.now(),
    status: finalStatus,
    price: booking.price !== undefined ? booking.price : (booking.class_type === 'Private' ? 300 : 180),
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const payload = {
        user_id: booking.user_id || 'guest',
        full_name: booking.full_name,
        student_name: booking.full_name,
        email: booking.email,
        student_email: booking.email,
        country: booking.country || 'United States',
        timezone: booking.timezone || 'UTC',
        program_id: booking.program_id,
        program_title: booking.program_title,
        class_type: booking.class_type,
        skill_level: booking.skill_level,
        duration: booking.duration,
        preferred_date: booking.preferred_date,
        booking_date: booking.preferred_date,
        preferred_time: booking.preferred_time,
        booking_time: booking.preferred_time,
        additional_notes: booking.additional_notes || '',
        status: finalStatus,
        price: newBooking.price,
        amount: newBooking.price,
        base_price: booking.base_price,
        tax_amount: booking.tax_amount,
        gateway_charges: booking.gateway_charges,
        final_amount: booking.final_amount,
      };

      const { data, error } = await supabase
        .from('bookings')
        .insert([payload])
        .select()
        .single();

      if (!error && data) {
        const formattedData: BookingRecord = {
          id: data.id,
          user_id: data.user_id,
          full_name: data.full_name || data.student_name || booking.full_name,
          email: data.email || data.student_email || booking.email,
          country: data.country || booking.country,
          timezone: data.timezone || booking.timezone,
          program_id: data.program_id || booking.program_id,
          program_title: data.program_title || booking.program_title,
          class_type: data.class_type || booking.class_type,
          skill_level: data.skill_level || booking.skill_level,
          preferred_date: data.preferred_date || data.booking_date || booking.preferred_date,
          preferred_time: data.preferred_time || data.booking_time || booking.preferred_time,
          additional_notes: data.additional_notes || booking.additional_notes || '',
          status: data.status || 'Pending',
          meeting_link: data.meeting_link,
          price: data.price || data.amount || newBooking.price,
          created_at: data.created_at || new Date().toISOString(),
        };

        const local = getLocalBookings();
        local.unshift(formattedData);
        saveLocalBookings(local);
        return { booking: formattedData };
      } else if (error) {
        console.warn('Supabase booking insert error:', error.message);
      }
    } catch (e) {
      console.warn('Supabase create booking exception:', e);
    }
  }

  // Local fallback
  const local = getLocalBookings();
  local.unshift(newBooking);
  saveLocalBookings(local);
  return { booking: newBooking };
}

export async function getAllBookings(): Promise<BookingRecord[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const mapped: BookingRecord[] = data.map((b: any) => ({
          id: String(b.id),
          user_id: b.user_id || 'usr-guest',
          full_name: b.full_name || b.student_name || 'Guest Student',
          email: b.email || b.student_email || 'student@example.com',
          country: b.country || 'United States',
          timezone: b.timezone || 'UTC',
          program_id: b.program_id || 'hatha-yoga',
          program_title: b.program_title || 'Yoga Program',
          class_type: b.class_type || 'Group',
          skill_level: b.skill_level || 'All Levels',
          preferred_date: b.preferred_date || b.booking_date || new Date().toISOString().split('T')[0],
          preferred_time: b.preferred_time || b.booking_time || '10:00',
          additional_notes: b.additional_notes || '',
          status: (b.status || 'Pending Approval') as BookingStatus,
          payment_status: b.payment_status || (b.status === 'Approved' || b.status === 'Confirmed' ? 'Paid' : 'Pending Verification'),
          meeting_link: b.meeting_link || '',
          meeting_room: b.meeting_room || '',
          meeting_status: b.meeting_status || (b.meeting_link ? 'Generated' : 'Pending'),
          approval_date: b.approval_date || '',
          approved_by: b.approved_by || '',
          email_sent: b.email_sent ?? Boolean(b.email_sent_at),
          email_sent_at: b.email_sent_at || '',
          price: Number(b.price || b.amount || 180),
          created_at: b.created_at || new Date().toISOString(),
        }));

        if (mapped.length > 0) {
          saveLocalBookings(mapped);
          return mapped;
        }
      }
    } catch (e) {
      console.warn('Supabase fetch bookings error:', e);
    }
  }

  return getLocalBookings();
}

export async function getUserBookings(emailOrUserId: string): Promise<BookingRecord[]> {
  const all = await getAllBookings();
  return all.filter(
    b => b.user_id === emailOrUserId || b.email.toLowerCase() === emailOrUserId.toLowerCase()
  );
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
  meetingLink?: string
): Promise<BookingRecord | null> {
  const updates: Partial<BookingRecord> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (meetingLink !== undefined) {
    updates.meeting_link = meetingLink;
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', bookingId)
        .select()
        .single();

      if (!error && data) {
        const local = getLocalBookings();
        const idx = local.findIndex(b => b.id === bookingId);
        if (idx !== -1) {
          local[idx] = { ...local[idx], ...updates };
          saveLocalBookings(local);
        }
        return data as BookingRecord;
      }
    } catch (e) {
      console.warn('Supabase update booking error:', e);
    }
  }

  // Local fallback
  const local = getLocalBookings();
  const idx = local.findIndex(b => b.id === bookingId);
  if (idx !== -1) {
    local[idx] = { ...local[idx], ...updates };
    saveLocalBookings(local);
    return local[idx];
  }
  return null;
}

export async function updateBookingDetails(
  bookingId: string,
  updatedData: Partial<BookingRecord>
): Promise<BookingRecord | null> {
  const updates = {
    ...updatedData,
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const payload: any = { ...updates };
      if (updates.student_id) payload.student_id = updates.student_id;
      if (updates.preferred_date) payload.booking_date = updates.preferred_date;
      if (updates.preferred_time) payload.booking_time = updates.preferred_time;

      const { data, error } = await supabase
        .from('bookings')
        .update(payload)
        .eq('id', bookingId)
        .select()
        .single();

      if (!error && data) {
        const local = getLocalBookings();
        const idx = local.findIndex(b => b.id === bookingId);
        if (idx !== -1) {
          local[idx] = { ...local[idx], ...updates };
          saveLocalBookings(local);
        }
        return data as BookingRecord;
      }
    } catch (e) {
      console.warn('Supabase update booking details error:', e);
    }
  }

  // Local fallback
  const local = getLocalBookings();
  const idx = local.findIndex(b => b.id === bookingId);
  if (idx !== -1) {
    local[idx] = { ...local[idx], ...updates };
    saveLocalBookings(local);
    return local[idx];
  }
  return null;
}

export async function deleteBooking(bookingId: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('bookings').delete().eq('id', bookingId);
    } catch (e) {
      console.warn('Supabase delete booking error:', e);
    }
  }

  const local = getLocalBookings();
  const filtered = local.filter(b => b.id !== bookingId);
  saveLocalBookings(filtered);
  return true;
}
