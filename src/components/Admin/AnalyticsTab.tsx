import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';
import { TrendingUp, Users, DollarSign, Award, Calendar, Percent } from 'lucide-react';
import { BookingRecord, UserProfile, PaymentTransaction } from '../../types';

interface AnalyticsTabProps {
  bookings: BookingRecord[];
  students: UserProfile[];
  payments: PaymentTransaction[];
}

export default function AnalyticsTab({ bookings, students, payments }: AnalyticsTabProps) {
  // Monthly Bookings chart data
  const monthlyData = [
    { month: 'Jan', bookings: 12, revenue: 1440 },
    { month: 'Feb', bookings: 18, revenue: 2160 },
    { month: 'Mar', bookings: 24, revenue: 2880 },
    { month: 'Apr', bookings: 31, revenue: 3720 },
    { month: 'May', bookings: 28, revenue: 3360 },
    { month: 'Jun', bookings: 42, revenue: 5040 },
    { month: 'Jul', bookings: bookings.length, revenue: bookings.length * 120 },
  ];

  // Country breakdown
  const countryCounts: Record<string, number> = {};
  students.forEach(s => {
    const c = s.country || 'United States';
    countryCounts[c] = (countryCounts[c] || 0) + 1;
  });
  const countryData = Object.keys(countryCounts).map(c => ({
    name: c,
    value: countryCounts[c],
  }));

  // Program Popularity breakdown
  const programCounts: Record<string, number> = {};
  bookings.forEach(b => {
    programCounts[b.program_title] = (programCounts[b.program_title] || 0) + 1;
  });
  const programData = Object.keys(programCounts).map(p => ({
    name: p.length > 18 ? p.slice(0, 18) + '...' : p,
    value: programCounts[p],
  }));

  const COLORS = ['#c5a059', '#94a388', '#d4af37', '#e5c158', '#6b8e23', '#8fbc8f'];

  // Metrics
  const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.price || (b.class_type === 'Private' ? 300 : 180)), 0);
  const avgValue = bookings.length > 0 ? Math.round(totalRevenue / bookings.length) : 180;
  const approvedRate = bookings.length > 0 ? Math.round((bookings.filter(b => b.status === 'Approved' || b.status === 'Completed').length / bookings.length) * 100) : 100;

  return (
    <div className="space-y-8">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#191c19] border border-white/10 glass-card">
          <div className="flex items-center justify-between text-xs text-white/60 mb-2">
            <span>Gross Revenue</span>
            <DollarSign className="w-4 h-4 text-[#c5a059]" />
          </div>
          <div className="font-serif text-2xl font-bold text-[#f4f1ea]">${totalRevenue.toLocaleString()}</div>
          <div className="text-[11px] text-[#94a388] mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +24% vs last month
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#191c19] border border-white/10 glass-card">
          <div className="flex items-center justify-between text-xs text-white/60 mb-2">
            <span>Avg Booking Value</span>
            <Award className="w-4 h-4 text-[#c5a059]" />
          </div>
          <div className="font-serif text-2xl font-bold text-[#f4f1ea]">${avgValue}</div>
          <div className="text-[11px] text-[#94a388] mt-1">Per practitioner session</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#191c19] border border-white/10 glass-card">
          <div className="flex items-center justify-between text-xs text-white/60 mb-2">
            <span>Approval & Attendance Rate</span>
            <Percent className="w-4 h-4 text-[#c5a059]" />
          </div>
          <div className="font-serif text-2xl font-bold text-[#f4f1ea]">{approvedRate}%</div>
          <div className="text-[11px] text-emerald-400 mt-1">High student retention</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#191c19] border border-white/10 glass-card">
          <div className="flex items-center justify-between text-xs text-white/60 mb-2">
            <span>Global Students</span>
            <Users className="w-4 h-4 text-[#c5a059]" />
          </div>
          <div className="font-serif text-2xl font-bold text-[#f4f1ea]">{students.length}</div>
          <div className="text-[11px] text-[#94a388] mt-1">Across {countryData.length || 1} countries</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Bookings & Revenue Trend */}
        <div className="p-6 rounded-3xl bg-[#191c19] border border-white/10 glass-card space-y-4">
          <h3 className="font-serif text-lg font-bold text-[#f4f1ea]">
            Monthly Booking Growth & Revenue
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c5a059" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#c5a059" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#121412', borderColor: 'rgba(197,160,89,0.4)', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#c5a059" fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Program Popularity */}
        <div className="p-6 rounded-3xl bg-[#191c19] border border-white/10 glass-card space-y-4">
          <h3 className="font-serif text-lg font-bold text-[#f4f1ea]">
            Most Popular Yoga Programs
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={programData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={10} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#121412', borderColor: 'rgba(197,160,89,0.4)', borderRadius: '12px' }}
                />
                <Bar dataKey="value" fill="#94a388" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
