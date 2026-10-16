import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, UserCheck, AlertCircle, FileText, Search } from 'lucide-react';
import { BookingRecord, AttendanceRecord, AttendanceStatus } from '../../types';
import { getAllAttendanceRecords, markAttendance } from '../../services/attendanceService';

interface AttendanceTabProps {
  bookings: BookingRecord[];
}

export default function AttendanceTab({ bookings }: AttendanceTabProps) {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    const data = await getAllAttendanceRecords();
    setAttendanceRecords(data);
  };

  const handleStatusChange = async (booking: BookingRecord, newStatus: AttendanceStatus, notes?: string) => {
    setSavingId(booking.id);
    await markAttendance({
      bookingId: booking.id,
      studentId: booking.user_id,
      studentName: booking.full_name,
      studentEmail: booking.email,
      programTitle: booking.program_title,
      classDate: booking.preferred_date,
      classTime: booking.preferred_time,
      status: newStatus,
      notes,
    });
    await loadAttendance();
    setSavingId(null);
  };

  const approvedBookings = bookings.filter(b => b.status === 'Approved' || b.status === 'Completed');

  const filteredBookings = approvedBookings.filter(b => {
    const matchesSearch =
      b.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.program_title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-[#191c19] border border-white/10 glass-card space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#f4f1ea]">
              Student Class Attendance Ledger
            </h2>
            <p className="text-xs text-[#94a388] mt-1">
              Mark student participation status (Present, Absent, Late, Completed) and instructor notes.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student or class..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#121412] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-[#f4f1ea] focus:border-[#c5a059] outline-none"
            />
          </div>
        </div>

        {/* Attendance List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-white/80">
            <thead className="bg-[#121412] text-[#94a388] uppercase text-[10px] font-semibold tracking-wider">
              <tr>
                <th className="p-3">Student</th>
                <th className="p-3">Program / Class</th>
                <th className="p-3">Schedule</th>
                <th className="p-3">Participation Status</th>
                <th className="p-3">Instructor Feedback Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-white/40">
                    No approved bookings found matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredBookings.map(b => {
                  const record = attendanceRecords.find(a => a.booking_id === b.id);
                  const currentStatus: AttendanceStatus = record ? record.status : 'Completed';

                  return (
                    <tr key={b.id} className="hover:bg-white/[0.02]">
                      <td className="p-3">
                        <div className="font-medium text-[#f4f1ea]">{b.full_name}</div>
                        <div className="text-[10px] text-white/50">{b.email}</div>
                      </td>
                      <td className="p-3 font-serif font-bold text-[#c5a059]">{b.program_title}</td>
                      <td className="p-3 text-white/60">
                        {b.preferred_date} • {b.preferred_time}
                      </td>
                      <td className="p-3">
                        <select
                          value={currentStatus}
                          onChange={e =>
                            handleStatusChange(b, e.target.value as AttendanceStatus, record?.notes)
                          }
                          disabled={savingId === b.id}
                          className="bg-[#121412] border border-white/20 rounded-xl px-3 py-1.5 text-xs text-[#f4f1ea] font-medium outline-none focus:border-[#c5a059]"
                        >
                          <option value="Present">Present</option>
                          <option value="Completed">Completed</option>
                          <option value="Late">Late</option>
                          <option value="Absent">Absent</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          defaultValue={record?.notes || ''}
                          placeholder="Add teacher note..."
                          onBlur={e =>
                            handleStatusChange(b, currentStatus, e.target.value)
                          }
                          className="w-full bg-[#121412] border border-white/10 rounded-lg px-3 py-1 text-xs text-[#f4f1ea] outline-none focus:border-[#c5a059]"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
