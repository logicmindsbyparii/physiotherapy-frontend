import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Users, Calendar, DollarSign, TrendingUp, Download,
  CheckCircle, Search, X, Activity, Clock, ArrowUpRight,
  UserPlus, AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';
const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const Dashboard = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Global search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ patients: any[]; appointments: any[]; invoices: any[] } | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appRes, patRes, invRes] = await Promise.all([
          axios.get(`${API_BASE}/appointments`, auth()),
          axios.get(`${API_BASE}/patients`, auth()),
          axios.get(`${API_BASE}/invoices`, auth()),
        ]);
        setAppointments(Array.isArray(appRes.data) ? appRes.data : []);
        setPatients(Array.isArray(patRes.data) ? patRes.data : []);
        setInvoices(Array.isArray(invRes.data) ? invRes.data : []);
      } catch (err) { console.error('Dashboard fetch failed', err); }
    };
    fetchData();
  }, []);

  // Debounced global search
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults(null); return; }
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/search?q=${encodeURIComponent(searchQuery)}`, auth());
        setSearchResults(res.data);
      } catch { setSearchResults(null); }
      finally { setSearchLoading(false); }
    }, 350);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [searchQuery]);

  // Close search on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchQuery(''); setSearchResults(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const showToast = (msg: string) => { setToastMessage(msg); setTimeout(() => setToastMessage(null), 3000); };

  const todayStr = new Date().toISOString().split('T')[0];
  const todaysAppointments = appointments.filter(a => (a.date_time || '').startsWith(todayStr));
  const monthlyRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.total || i.amount || 0), 0);
  const pendingRevenue = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + (i.total || i.amount || 0), 0);
  const activePatients = patients.filter(p => p.status === 'active').length;

  const stats = [
    { name: 'Total Patients', value: patients.length, sub: `${activePatients} active`, icon: Users, color: 'text-sky-600 bg-sky-50', link: '/patients' },
    { name: "Today's Appointments", value: todaysAppointments.length, sub: `${appointments.length} total`, icon: Calendar, color: 'text-indigo-600 bg-indigo-50', link: '/appointments' },
    { name: 'Revenue (Paid)', value: `₹${monthlyRevenue.toLocaleString()}`, sub: `₹${pendingRevenue.toLocaleString()} pending`, icon: DollarSign, color: 'text-green-600 bg-green-50', link: '/billing' },
    { name: 'New Patients (30d)', value: patients.filter(p => {
      if (!p.created_at) return false;
      return new Date(p.created_at) > new Date(Date.now() - 30*86400000);
    }).length, sub: 'Last 30 days', icon: UserPlus, color: 'text-amber-600 bg-amber-50', link: '/patients' },
  ];

  const handleExport = () => {
    const rows = [['Date', 'Patient', 'Service', 'Therapist', 'Status', 'Payment']];
    appointments.forEach(a => rows.push([a.date_time || '', a.patient_name || '', a.service || '', a.staff_name || '', a.status || '', a.payment_status || '']));
    const csv = rows.map(r => r.join(',')).join('\n');
    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    link.download = `dashboard_${todayStr}.csv`;
    link.click();
  };

  const statusColor: Record<string, string> = {
    Scheduled: 'bg-slate-100 text-slate-600',
    Confirmed: 'bg-blue-50 text-blue-700',
    Arrived: 'bg-amber-50 text-amber-700',
    Completed: 'bg-green-50 text-green-700',
    Cancelled: 'bg-rose-50 text-rose-600',
  };

  const totalSearchHits = (searchResults?.patients?.length || 0) + (searchResults?.appointments?.length || 0) + (searchResults?.invoices?.length || 0);

  return (
    <div className="space-y-6 relative">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
          <p className="text-sm text-slate-500">Welcome back. Here's what's happening at your clinics today.</p>
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 shadow-sm">
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      {/* Global Search */}
      <div ref={searchRef} className="relative">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search patients, appointments, invoices..."
            className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchLoading && <Activity className="w-4 h-4 absolute right-4 top-3.5 text-slate-300 animate-spin" />}
          {searchQuery && !searchLoading && (
            <button onClick={() => { setSearchQuery(''); setSearchResults(null); }} className="absolute right-4 top-3.5 text-slate-300 hover:text-slate-500">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Dropdown */}
        {searchResults && searchQuery && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
            {totalSearchHits === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">No results found for "{searchQuery}"</div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {(searchResults.patients?.length || 0) > 0 && (
                  <div className="p-3">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Patients</p>
                    {searchResults.patients.map((p: any) => (
                      <Link key={p.id} to="/patients" onClick={() => { setSearchQuery(''); setSearchResults(null); }}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold">
                          {p.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{p.name}</p>
                          <p className="text-xs text-slate-400">{p.patient_id}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                {(searchResults.appointments?.length || 0) > 0 && (
                  <div className="p-3">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Appointments</p>
                    {searchResults.appointments.map((a: any) => (
                      <Link key={a.id} to="/appointments" onClick={() => { setSearchQuery(''); setSearchResults(null); }}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                        <Calendar className="w-4 h-4 text-indigo-400" />
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{a.service}</p>
                          <p className="text-xs text-slate-400">{a.date_time ? new Date(a.date_time).toLocaleDateString() : '—'}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                {(searchResults.invoices?.length || 0) > 0 && (
                  <div className="p-3">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Invoices</p>
                    {searchResults.invoices.map((i: any) => (
                      <Link key={i.id} to="/billing" onClick={() => { setSearchQuery(''); setSearchResults(null); }}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{i.patient_name}</p>
                          <p className="text-xs text-slate-400">{i.invoice_number}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Link key={stat.name} to={stat.link} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-sky-100 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-sky-400 transition-colors" />
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">{stat.name}</p>
            <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
            <p className="text-xs text-slate-400 mt-1">{stat.sub}</p>
          </Link>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Appointments */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-sky-500" /> Today's Appointments
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{new Date().toDateString()} · {todaysAppointments.length} scheduled</p>
            </div>
            <Link to="/appointments" className="text-sm font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {todaysAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Calendar className="w-10 h-10 mb-3 text-slate-200" />
                <p className="font-medium">No appointments today</p>
                <p className="text-xs mt-1">
                  <Link to="/appointments" className="text-sky-500 hover:underline">Schedule one now →</Link>
                </p>
              </div>
            ) : todaysAppointments.slice(0, 6).map((app) => (
              <div key={app.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/80 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                    {(app.patient_name || '?').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{app.patient_name || 'Unknown Patient'}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {app.service || '—'}
                      {app.staff_name && <span className="mx-1">·</span>}
                      {app.staff_name && <span>{app.staff_name}</span>}
                      {app.branch_name && <span className="text-slate-300 mx-1">·</span>}
                      {app.branch_name && <span className="text-slate-400">{app.branch_name}</span>}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">
                    {app.date_time ? new Date(app.date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                  </p>
                  <span className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${statusColor[app.status] || 'bg-slate-100 text-slate-600'}`}>
                    {app.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {todaysAppointments.length > 6 && (
            <div className="p-4 border-t border-slate-100 text-center">
              <Link to="/attendance" className="text-sm text-sky-600 font-semibold hover:underline">
                + {todaysAppointments.length - 6} more — Open Daily Check →
              </Link>
            </div>
          )}
        </div>

        {/* AI Insights Panel */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-sky-500 rounded-full blur-3xl opacity-20 pointer-events-none" />
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            Live Insights
          </h3>
          <div className="space-y-4 relative z-10">
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700">
              <div className="flex items-start gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-300">
                  <strong className="text-white">Pending invoices:</strong> {invoices.filter(i => i.status === 'pending').length} invoices worth ₹{pendingRevenue.toLocaleString()} awaiting payment.
                </p>
              </div>
              <Link to="/billing" className="text-xs font-bold text-sky-400 hover:text-sky-300">View Billing →</Link>
            </div>
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700">
              <div className="flex items-start gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-300">
                  <strong className="text-white">Revenue:</strong> ₹{monthlyRevenue.toLocaleString()} collected from {invoices.filter(i=>i.status==='paid').length} paid invoices.
                </p>
              </div>
            </div>
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700">
              <div className="flex items-start gap-2 mb-2">
                <Users className="w-4 h-4 text-sky-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-300">
                  <strong className="text-white">Patient base:</strong> {activePatients} active patients across all branches.
                </p>
              </div>
              <button onClick={() => showToast('Auto-assigning leads to available staff...')} className="text-xs font-bold text-sky-400 hover:text-sky-300">
                Auto-assign Leads →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
