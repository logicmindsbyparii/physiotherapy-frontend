import { useState, useEffect } from 'react';
import {
  TrendingUp, Calendar, DollarSign, Users, Activity, Award,
  Download, Filter, BarChart3
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

// Types (match your existing ones)
interface Invoice {
  id: string;
  patientName: string;
  amount: number;
  total: number;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  date: string;
  service: string;
  therapist: string;
  branch: string;
}

interface Appointment {
  id: number;
  patient: string;
  service: string;
  therapist: string;
  date_time: string;
  status: string;
}

// Generate last 6 months labels
const getLast6Months = () => {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toLocaleString('default', { month: 'short' }));
  }
  return months;
};

// Color palette
const Reports = () => {
  // State for aggregated data
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [appointmentTrend, setAppointmentTrend] = useState<any[]>([]);
  const [serviceDistribution, setServiceDistribution] = useState<any[]>([]);
  const [therapistPerformance, setTherapistPerformance] = useState<any[]>([]);
  const [branchComparison, setBranchComparison] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [totalPatients, setTotalPatients] = useState(0);
  const [avgRevenuePerAppointment, setAvgRevenuePerAppointment] = useState(0);
  const [dateRange, setDateRange] = useState('week');

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  // Load and process data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invRes, aptRes, patRes] = await Promise.all([
          axios.get(`${API_BASE}/invoices`, getAuthHeaders()),
          axios.get(`${API_BASE}/appointments`, getAuthHeaders()),
          axios.get(`${API_BASE}/patients`, getAuthHeaders())
        ]);

        let invoices: Invoice[] = invRes.data;
        let appointments: Appointment[] = aptRes.data;
        let patients: any[] = patRes.data;

        // Apply date range filter
        const now = new Date();
        const pastDate = new Date();
        if (dateRange === 'week') pastDate.setDate(now.getDate() - 7);
        else if (dateRange === 'month') pastDate.setDate(now.getDate() - 30);
        else if (dateRange === 'quarter') pastDate.setDate(now.getDate() - 90);
        else if (dateRange === 'year') pastDate.setFullYear(now.getFullYear() - 1);

        const filterByDate = (dateStr: string) => dateStr ? new Date(dateStr) >= pastDate : false;

        invoices = invoices.filter(inv => filterByDate(inv.date));
        appointments = appointments.filter(apt => filterByDate(apt.date_time));

        // Compute totals
        const paidTotal = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0);
        setTotalRevenue(paidTotal);
        setTotalAppointments(appointments.length);
        setTotalPatients(patients.length);
        
        setAvgRevenuePerAppointment(appointments.length ? Math.round(paidTotal / appointments.length) : 0);

        // Revenue by month (last 6 months)
        const months = getLast6Months();
        const monthlyRevenue = months.map(month => {
          const monthInvoices = invoices.filter(inv => {
            const invDate = new Date(inv.date);
            const invMonth = invDate.toLocaleString('default', { month: 'short' });
            return invMonth === month && inv.status === 'paid';
          });
          const total = monthInvoices.reduce((sum, inv) => sum + inv.total, 0);
          return { month, revenue: total };
        });
        setRevenueData(monthlyRevenue);

        // Appointment trend by month
        const monthlyAppointments = months.map(month => {
          const count = appointments.filter(apt => {
            if (!apt.date_time) return false;
            const aptDate = new Date(apt.date_time);
            const aptMonth = aptDate.toLocaleString('default', { month: 'short' });
            return aptMonth === month;
          }).length;
          return { month, appointments: count };
        });
        setAppointmentTrend(monthlyAppointments);

        // Service distribution (top 5)
        const serviceMap = new Map<string, number>();
        invoices.forEach(inv => {
          const service = inv.service.split('(')[0].trim();
          serviceMap.set(service, (serviceMap.get(service) || 0) + inv.total);
        });
        const sortedServices = Array.from(serviceMap.entries())
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);
        setServiceDistribution(sortedServices);

        // Therapist performance (revenue generated)
        const therapistMap = new Map<string, number>();
        invoices.filter(inv => inv.status === 'paid').forEach(inv => {
          therapistMap.set(inv.therapist, (therapistMap.get(inv.therapist) || 0) + inv.total);
        });
        const therapistData = Array.from(therapistMap.entries())
          .map(([name, revenue]) => ({ name, revenue }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);
        setTherapistPerformance(therapistData);

        // Lead conversion by stage (removed)

        // Branch comparison
        const branchMap = new Map<string, number>();
        invoices.filter(inv => inv.status === 'paid').forEach(inv => {
          branchMap.set(inv.branch, (branchMap.get(inv.branch) || 0) + inv.total);
        });
        const branchData = Array.from(branchMap.entries()).map(([name, revenue]) => ({ name, revenue }));
        setBranchComparison(branchData);
      } catch (err) {
        console.error('Failed to load report data', err);
      }
    };
    
    fetchData();
    fetchData();
  }, [dateRange]);

  // Export report as CSV
  const exportReport = () => {
    const csvRows = [
      ['Metric', 'Value'],
      ['Total Revenue', `₹${totalRevenue.toLocaleString()}`],
      ['Total Appointments', totalAppointments],
      ['Total Active Patients', totalPatients],
      ['Avg Revenue per Appointment', `₹${avgRevenuePerAppointment.toLocaleString()}`],
      [''],
      ['Monthly Revenue Trend', ''],
      ...revenueData.map(d => [d.month, `₹${d.revenue.toLocaleString()}`]),
      [''],
      ['Top Services by Revenue', ''],
      ...serviceDistribution.map(s => [s.name, `₹${s.value.toLocaleString()}`]),
    ];
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clinic_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Reports & Analytics</h2>
          <p className="text-sm text-slate-500">Insights into revenue, appointments, and performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportReport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none"
          >
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
            <option value="quarter">Last 90 days</option>
            <option value="year">Last 12 months</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-sm font-medium text-slate-500 mb-1">Total Revenue</p>
          <h3 className="text-2xl font-bold text-slate-900">₹{totalRevenue.toLocaleString()}</h3>
          <p className="text-xs text-slate-400 mt-1">From paid invoices</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500 mb-1">Total Appointments</p>
          <h3 className="text-2xl font-bold text-slate-900">{totalAppointments}</h3>
          <p className="text-xs text-slate-400 mt-1">All time</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500 mb-1">Active Patients</p>
          <h3 className="text-2xl font-bold text-slate-900">{totalPatients}</h3>
          <p className="text-xs text-slate-400 mt-1">Total registered</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500 mb-1">Avg Revenue / Appt</p>
          <h3 className="text-2xl font-bold text-slate-900">₹{avgRevenuePerAppointment.toLocaleString()}</h3>
          <p className="text-xs text-slate-400 mt-1">Per appointment</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-sky-600" />
            Revenue Trend (Last 6 Months)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `₹${value}`} />
              <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#0284c7" fill="#38bdf8" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Appointment Trend */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-600" />
            Appointment Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={appointmentTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="appointments" stroke="#0284c7" strokeWidth={2} dot={{ fill: '#0284c7' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Services by Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-600" />
            Top Services by Revenue
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={serviceDistribution} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={(value) => `₹${value}`} />
              <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={12} />
              <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
              <Bar dataKey="value" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Therapist Performance */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-sky-600" />
            Therapist Performance (Revenue)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={therapistPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis tickFormatter={(value) => `₹${value}`} />
              <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#38bdf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>



        {/* Branch Comparison */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5 text-sky-600" />
            Branch Revenue Comparison
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={branchComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis tickFormatter={(value) => `₹${value}`} />
              <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#7dd3fc" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Empty state if no data */}
      {totalRevenue === 0 && totalAppointments === 0 && (
        <div className="bg-slate-50 rounded-2xl p-12 text-center">
          <Activity className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700">No data yet</h3>
          <p className="text-slate-500 mt-1">Add invoices and appointments to see analytics.</p>
        </div>
      )}
    </div>
  );
};

export default Reports;