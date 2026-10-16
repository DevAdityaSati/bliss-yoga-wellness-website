import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Printer, CheckCircle2, Filter } from 'lucide-react';
import { BookingRecord, UserProfile, PaymentTransaction, AttendanceRecord, ContactMessage } from '../../types';
import { exportToCSV, exportToExcel, printOrExportPDF } from '../../services/reportService';

interface ReportsExportTabProps {
  bookings: BookingRecord[];
  students: UserProfile[];
  payments: PaymentTransaction[];
  attendance: AttendanceRecord[];
  messages: ContactMessage[];
}

type ReportType = 'bookings' | 'students' | 'payments' | 'attendance' | 'messages';

export default function ReportsExportTab({
  bookings,
  students,
  payments,
  attendance,
  messages,
}: ReportsExportTabProps) {
  const [selectedReport, setSelectedReport] = useState<ReportType>('bookings');
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  const triggerExport = (format: 'csv' | 'excel' | 'pdf') => {
    let filename = `Bliss_Yoga_${selectedReport.toUpperCase()}`;
    let headers: string[] = [];
    let rows: (string | number | boolean)[][] = [];

    if (selectedReport === 'bookings') {
      headers = ['Booking ID', 'Student Name', 'Email', 'Program', 'Class Type', 'Date', 'Time', 'Status', 'Meeting Link'];
      rows = bookings.map(b => [
        b.id,
        b.full_name,
        b.email,
        b.program_title,
        b.class_type,
        b.preferred_date,
        b.preferred_time,
        b.status,
        b.meeting_link || 'N/A'
      ]);
    } else if (selectedReport === 'students') {
      headers = ['Student ID', 'Full Name', 'Email', 'Country', 'Timezone', 'Status', 'Registered At'];
      rows = students.map(s => [
        s.id,
        s.full_name,
        s.email,
        s.country || 'Global',
        s.timezone || 'UTC',
        s.status,
        new Date(s.created_at).toLocaleDateString()
      ]);
    } else if (selectedReport === 'payments') {
      headers = ['Ref ID', 'Student Name', 'Email', 'Program', 'Amount', 'Currency', 'Provider', 'Status', 'Date'];
      rows = payments.map(p => [
        p.transaction_ref || p.id,
        p.student_name,
        p.student_email,
        p.program_title,
        p.amount,
        p.currency,
        p.provider,
        p.status,
        new Date(p.created_at).toLocaleDateString()
      ]);
    } else if (selectedReport === 'attendance') {
      headers = ['Record ID', 'Student Name', 'Email', 'Program', 'Class Date', 'Time', 'Status', 'Notes'];
      rows = attendance.map(a => [
        a.id,
        a.student_name,
        a.student_email,
        a.program_title,
        a.class_date,
        a.class_time,
        a.status,
        a.notes || ''
      ]);
    } else if (selectedReport === 'messages') {
      headers = ['Message ID', 'Name', 'Email', 'Subject', 'Message', 'Status', 'Received Date'];
      rows = messages.map(m => [
        m.id,
        m.name,
        m.email,
        m.subject,
        m.message,
        m.status,
        new Date(m.created_at).toLocaleDateString()
      ]);
    }

    if (format === 'csv') {
      exportToCSV(filename, headers, rows);
    } else if (format === 'excel') {
      exportToExcel(filename, headers, rows);
    } else if (format === 'pdf') {
      printOrExportPDF(`${selectedReport.toUpperCase()} REPORT`, headers, rows);
    }

    setExportSuccess(`Successfully generated ${format.toUpperCase()} report for ${selectedReport}.`);
    setTimeout(() => setExportSuccess(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-[#191c19] border border-white/10 glass-card space-y-6">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#f4f1ea]">
            Export System Reports & Data Logs
          </h2>
          <p className="text-xs text-[#94a388] mt-1">
            Download production reports in CSV, Excel (.xls), or PDF format for audit and compliance.
          </p>
        </div>

        {/* Report Category Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { id: 'bookings', label: 'Bookings', count: bookings.length },
            { id: 'students', label: 'Students', count: students.length },
            { id: 'payments', label: 'Payments', count: payments.length },
            { id: 'attendance', label: 'Attendance', count: attendance.length },
            { id: 'messages', label: 'Messages', count: messages.length },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setSelectedReport(item.id as ReportType)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                selectedReport === item.id
                  ? 'bg-[#c5a059] text-[#121412] font-bold border-[#c5a059] shadow-lg shadow-[#c5a059]/10'
                  : 'bg-[#121412] text-white/70 border-white/10 hover:border-white/20'
              }`}
            >
              <span className="block text-xs uppercase tracking-wider opacity-70">{item.label}</span>
              <span className="text-xl font-bold block mt-1">{item.count} Records</span>
            </button>
          ))}
        </div>

        {/* Export Action Controls */}
        <div className="p-6 rounded-2xl bg-[#121412] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#c5a059]" />
            <span className="text-xs text-[#f4f1ea] font-medium">Ready to export {selectedReport.toUpperCase()} dataset</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => triggerExport('csv')}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-[#f4f1ea] transition-all flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-[#c5a059]" /> CSV Export
            </button>
            <button
              onClick={() => triggerExport('excel')}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-[#f4f1ea] transition-all flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Excel Sheet (.xls)
            </button>
            <button
              onClick={() => triggerExport('pdf')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#d4af37] text-[#121412] text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all flex items-center gap-2"
            >
              <Printer className="w-4 h-4" /> Export PDF / Print
            </button>
          </div>
        </div>

        {exportSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {exportSuccess}
          </div>
        )}
      </div>
    </div>
  );
}
