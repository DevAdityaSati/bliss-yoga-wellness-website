import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AttendanceRecord, AttendanceStatus } from '../types';
import { sendUserNotification } from './notificationService';

const LOCAL_STORAGE_ATTENDANCE = 'bliss_yoga_attendance_db';

const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-101',
    booking_id: 'bk-101',
    student_name: 'Priya Sharma',
    student_email: 'student@example.com',
    program_title: 'Hatha Yoga Foundation',
    class_date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    class_time: '10:00 AM',
    status: 'Completed',
    notes: 'Priya demonstrated great focus during the Pranayama practice.',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  }
];

function getLocalAttendance(): AttendanceRecord[] {
  const data = localStorage.getItem(LOCAL_STORAGE_ATTENDANCE);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
    return INITIAL_ATTENDANCE;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_ATTENDANCE;
  }
}

function saveLocalAttendance(records: AttendanceRecord[]) {
  localStorage.setItem(LOCAL_STORAGE_ATTENDANCE, JSON.stringify(records));
}

export async function getAllAttendanceRecords(): Promise<AttendanceRecord[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .order('class_date', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as AttendanceRecord[];
      }
    } catch (e) {
      console.warn('Supabase fetch attendance warning:', e);
    }
  }
  return getLocalAttendance();
}

export async function getStudentAttendanceHistory(studentEmail: string): Promise<AttendanceRecord[]> {
  const all = await getAllAttendanceRecords();
  return all.filter(a => a.student_email.toLowerCase() === studentEmail.toLowerCase());
}

export async function markAttendance(params: {
  bookingId: string;
  studentId?: string;
  studentName: string;
  studentEmail: string;
  programTitle: string;
  classDate: string;
  classTime: string;
  status: AttendanceStatus;
  notes?: string;
}): Promise<AttendanceRecord> {
  const existingRecords = await getAllAttendanceRecords();
  const existing = existingRecords.find(a => a.booking_id === params.bookingId);

  const record: AttendanceRecord = {
    id: existing ? existing.id : 'att-' + Date.now(),
    booking_id: params.bookingId,
    student_id: params.studentId,
    student_name: params.studentName,
    student_email: params.studentEmail,
    program_title: params.programTitle,
    class_date: params.classDate,
    class_time: params.classTime,
    status: params.status,
    notes: params.notes || '',
    created_at: existing ? existing.created_at : new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      if (existing) {
        await supabase.from('attendance').update(record).eq('id', existing.id);
      } else {
        await supabase.from('attendance').insert([record]);
      }
    } catch (e) {
      console.warn('Supabase save attendance warning:', e);
    }
  }

  const local = getLocalAttendance();
  const idx = local.findIndex(a => a.booking_id === params.bookingId);
  if (idx !== -1) {
    local[idx] = record;
  } else {
    local.unshift(record);
  }
  saveLocalAttendance(local);

  // Send Notification if student user ID available
  if (params.studentId) {
    await sendUserNotification(
      params.studentId,
      'Attendance Updated',
      `Your class status for "${params.programTitle}" on ${params.classDate} has been recorded as "${params.status}".`
    );
  }

  return record;
}
