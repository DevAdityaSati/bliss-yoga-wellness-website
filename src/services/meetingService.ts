import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { BookingRecord, MeetingRecord } from '../types';
import { sendUserNotification } from './notificationService';
import { sendEmailAutomation } from './emailService';
import { getAllBookings, updateBookingDetails } from './bookingService';

const LOCAL_STORAGE_MEETINGS = 'bliss_yoga_meetings_db';

const INITIAL_MEETINGS: MeetingRecord[] = [
  {
    id: 'mtg-101',
    booking_id: 'bk-1001',
    room_name: 'BlissYoga-Private-bk1001-A9F2',
    meeting_link: 'https://meet.jit.si/BlissYoga-Private-bk1001-A9F2',
    start_time: new Date(Date.now() + 86400000).toISOString(),
    host_name: 'Acharya Ananda',
    status: 'Scheduled',
    created_at: new Date().toISOString(),
  }
];

function getLocalMeetings(): MeetingRecord[] {
  const data = localStorage.getItem(LOCAL_STORAGE_MEETINGS);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_MEETINGS, JSON.stringify(INITIAL_MEETINGS));
    return INITIAL_MEETINGS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_MEETINGS;
  }
}

function saveLocalMeetings(items: MeetingRecord[]) {
  localStorage.setItem(LOCAL_STORAGE_MEETINGS, JSON.stringify(items));
}

export async function getAllMeetings(): Promise<MeetingRecord[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .order('start_time', { ascending: true });

      if (!error && data && data.length > 0) {
        return data as MeetingRecord[];
      }
    } catch (e) {
      console.warn('Supabase fetch meetings warning:', e);
    }
  }
  return getLocalMeetings();
}

export async function getMeetingByBookingId(bookingId: string): Promise<MeetingRecord | null> {
  const all = await getAllMeetings();
  return all.find(m => m.booking_id === bookingId) || null;
}

/**
 * Deterministically generates or reuses Jitsi meeting room and link.
 * Group Class logic: Students booking the same group class, date, & time share the SAME meeting link.
 * Private Class logic: Private sessions always receive a unique non-guessable room link.
 */
export function generateJitsiRoomAndLink(
  booking: BookingRecord,
  allBookings: BookingRecord[],
  forceUnique = false
): { roomName: string; meetingLink: string } {
  const isGroup = booking.class_type === 'Group';

  if (isGroup && !forceUnique) {
    // Search for existing approved or confirmed group booking with same program, date, and time
    const existingGroupMatch = allBookings.find(
      b =>
        b.id !== booking.id &&
        b.class_type === 'Group' &&
        b.program_id === booking.program_id &&
        b.preferred_date === booking.preferred_date &&
        b.preferred_time === booking.preferred_time &&
        (b.status === 'Approved' || b.status === 'Confirmed') &&
        b.meeting_link &&
        b.meeting_room
    );

    if (existingGroupMatch && existingGroupMatch.meeting_room && existingGroupMatch.meeting_link) {
      return {
        roomName: existingGroupMatch.meeting_room,
        meetingLink: existingGroupMatch.meeting_link,
      };
    }

    // Generate deterministic Group Room name based on program, date, time
    const cleanProg = (booking.program_id || booking.program_title || 'Class')
      .replace(/[^a-zA-Z0-9]/g, '');
    const cleanDate = (booking.preferred_date || '2026').replace(/[^a-zA-Z0-9]/g, '');
    const cleanTime = (booking.preferred_time || '1000').replace(/[^a-zA-Z0-9]/g, '');
    
    const roomName = `BlissYoga-Group-${cleanProg}-${cleanDate}-${cleanTime}`;
    return {
      roomName,
      meetingLink: `https://meet.jit.si/${roomName}`,
    };
  }

  // Private class (or force unique)
  const cleanId = (booking.id || 'bk').replace(/[^a-zA-Z0-9]/g, '').slice(-6);
  const randomHash = Math.random().toString(36).substring(2, 8).toUpperCase();
  const roomName = `BlissYoga-Private-${cleanId}-${randomHash}`;

  return {
    roomName,
    meetingLink: `https://meet.jit.si/${roomName}`,
  };
}

/**
 * Main Approval Workflow:
 * Called when Administrator clicks "Approve Booking" in Admin Dashboard.
 */
export async function approveBookingWorkflow(
  bookingId: string,
  adminEmail = 'admin@blissyogawellness.com'
): Promise<{ success: boolean; booking: BookingRecord | null; error?: string }> {
  try {
    const allBookings = await getAllBookings();
    const targetBooking = allBookings.find(b => b.id === bookingId);

    if (!targetBooking) {
      return { success: false, booking: null, error: 'Booking record not found' };
    }

    // Generate or lookup Jitsi meeting link based on Group/Private logic
    const { roomName, meetingLink } = generateJitsiRoomAndLink(targetBooking, allBookings);

    const nowIso = new Date().toISOString();

    const updatedData: Partial<BookingRecord> = {
      status: 'Approved',
      payment_status: 'Paid',
      meeting_link: meetingLink,
      meeting_room: roomName,
      meeting_status: 'Generated',
      approval_date: nowIso,
      approved_by: adminEmail,
      email_sent: true,
      email_sent_at: nowIso,
    };

    // Update in Supabase & Local Storage
    const updatedBooking = await updateBookingDetails(bookingId, updatedData);

    // Save/Update Meeting Record in `meetings` table/storage
    const startTime = targetBooking.preferred_date
      ? `${targetBooking.preferred_date}T10:00:00Z`
      : nowIso;

    await createOrUpdateMeetingRecord({
      bookingId,
      roomName,
      meetingLink,
      startTime,
      hostName: 'Bliss Yoga Instructor',
    });

    // Automatically send Confirmation Email to Student
    await sendEmailAutomation({
      to: targetBooking.email,
      template: 'booking_approved',
      data: {
        name: targetBooking.full_name,
        programTitle: targetBooking.program_title,
        classType: targetBooking.class_type,
        date: targetBooking.preferred_date,
        time: targetBooking.preferred_time,
        timezone: targetBooking.timezone,
        meetingLink,
      },
    });

    // In-app Notification
    if (targetBooking.user_id) {
      await sendUserNotification(
        targetBooking.user_id,
        '✨ Session Approved!',
        `Your booking for "${targetBooking.program_title}" has been approved! Your Jitsi live class link is now active.`
      );
    }

    return {
      success: true,
      booking: updatedBooking || ({ ...targetBooking, ...updatedData } as BookingRecord),
    };
  } catch (e: any) {
    console.error('Approval workflow exception:', e);
    return { success: false, booking: null, error: e.message || 'Approval failed' };
  }
}

/**
 * Regenerate Meeting link specifically for a booking
 */
export async function regenerateBookingMeetingWorkflow(
  bookingId: string,
  adminEmail = 'admin@blissyogawellness.com'
): Promise<{ success: boolean; booking: BookingRecord | null }> {
  const allBookings = await getAllBookings();
  const target = allBookings.find(b => b.id === bookingId);
  if (!target) return { success: false, booking: null };

  const { roomName, meetingLink } = generateJitsiRoomAndLink(target, allBookings, true);
  const nowIso = new Date().toISOString();

  const updatedData: Partial<BookingRecord> = {
    meeting_link: meetingLink,
    meeting_room: roomName,
    meeting_status: 'Generated',
    email_sent: true,
    email_sent_at: nowIso,
  };

  const updated = await updateBookingDetails(bookingId, updatedData);

  // Resend updated email
  await sendEmailAutomation({
    to: target.email,
    template: 'booking_approved',
    data: {
      name: target.full_name,
      programTitle: target.program_title,
      classType: target.class_type,
      date: target.preferred_date,
      time: target.preferred_time,
      timezone: target.timezone,
      meetingLink,
    },
  });

  return { success: true, booking: updated || ({ ...target, ...updatedData } as BookingRecord) };
}

/**
 * Resends confirmation email for a booking with existing meeting link
 */
export async function resendBookingConfirmationEmail(booking: BookingRecord): Promise<boolean> {
  const link = booking.meeting_link || `https://meet.jit.si/BlissYoga_${booking.id}`;
  const nowIso = new Date().toISOString();

  await sendEmailAutomation({
    to: booking.email,
    template: 'booking_approved',
    data: {
      name: booking.full_name,
      programTitle: booking.program_title,
      classType: booking.class_type,
      date: booking.preferred_date,
      time: booking.preferred_time,
      timezone: booking.timezone,
      meetingLink: link,
    },
  });

  await updateBookingDetails(booking.id, {
    email_sent: true,
    email_sent_at: nowIso,
  });

  return true;
}

export async function createOrUpdateMeetingRecord(params: {
  bookingId: string;
  roomName: string;
  meetingLink: string;
  startTime: string;
  hostName?: string;
}): Promise<MeetingRecord> {
  const existing = await getMeetingByBookingId(params.bookingId);

  const record: MeetingRecord = {
    id: existing ? existing.id : 'mtg-' + Date.now(),
    booking_id: params.bookingId,
    room_name: params.roomName,
    meeting_link: params.meetingLink,
    start_time: params.startTime,
    host_name: params.hostName || 'Bliss Yoga Instructor',
    status: 'Scheduled',
    created_at: existing ? existing.created_at : new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      if (existing) {
        await supabase.from('meetings').update(record).eq('id', existing.id);
      } else {
        await supabase.from('meetings').insert([record]);
      }
    } catch (e) {
      console.warn('Supabase meeting record warning:', e);
    }
  }

  const local = getLocalMeetings();
  const idx = local.findIndex(m => m.booking_id === params.bookingId);
  if (idx !== -1) {
    local[idx] = record;
  } else {
    local.push(record);
  }
  saveLocalMeetings(local);

  return record;
}

export async function createMeeting(
  bookingId: string,
  studentUserId?: string,
  studentName?: string,
  programTitle?: string,
  preferredDate?: string,
  preferredTime?: string
): Promise<MeetingRecord> {
  const result = await approveBookingWorkflow(bookingId);
  const rec = await getMeetingByBookingId(bookingId);
  if (rec) return rec;
  return {
    id: 'mtg-' + Date.now(),
    booking_id: bookingId,
    room_name: result.booking?.meeting_room || `BlissYoga_${bookingId}`,
    meeting_link: result.booking?.meeting_link || `https://meet.jit.si/BlissYoga_${bookingId}`,
    start_time: new Date().toISOString(),
    status: 'Scheduled',
    created_at: new Date().toISOString()
  };
}

export async function getMeetingsForBooking(bookingId: string): Promise<MeetingRecord[]> {
  const meeting = await getMeetingByBookingId(bookingId);
  return meeting ? [meeting] : [];
}
