import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Calendar, CheckCircle, Clock, MessageSquare, Plus, Trash2,
  Package, X, RefreshCw, DollarSign, AlertCircle, User
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';
const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

interface AppointmentRow {
  id: number;
  patient_name: string;
  patient_code: string;
  staff_name: string;
  branch_name: string;
  date_time: string;
  service: string;
  status: string;
  payment_status: string;
  duration_minutes: number;
  // Patient billing info
  billing_frequency?: string;
  base_rate_amount?: number;
}

interface PatientPackage {
  id: string; patientName: string; packageName: string;
  isMembership: boolean; totalSessions: number; usedSessions: number;
  paymentStatus: string; expiryDate: string;
}

const cycleLabel: Record<string, string> = {
  DAILY: 'Daily', WEEKLY: 'Weekly', MONTHLY: 'Monthly', YEARLY: 'Yearly',
  daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly',
};

const Attendance = () => {
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'attendance' | 'packages'>('attendance');
  const [savingId, setSavingId] = useState<number | null>(null);
  const [toastMsg, setToastMsg] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Per-appointment local overrides (checkin, amount, date)
  const [checkins, setCheckins] = useState<Record<number, boolean>>({});
  const [paymentAmounts, setPaymentAmounts] = useState<Record<number, string>>({});
  const [attendanceDates, setAttendanceDates] = useState<Record<number, string>>({});

  // Patient packages (local storage)
  const [patientPackages, setPatientPackages] = useState<PatientPackage[]>(() =>
    JSON.parse(localStorage.getItem('patient_packages') || '[]'));
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [newPkg, setNewPkg] = useState<PatientPackage>({
    id: '', patientName: '', packageName: '', isMembership: false,
    totalSessions: 5, usedSessions: 0, paymentStatus: 'Paid',
    expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  });

  const todayStr = new Date().toISOString().split('T')[0];

  const toast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000); };

  const [invoices, setInvoices] = useState<any[]>([]);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const [aptRes, invRes] = await Promise.all([
        axios.get(`${API_BASE}/appointments`, auth()),
        axios.get(`${API_BASE}/invoices`, auth())
      ]);
      const aptData = Array.isArray(aptRes.data) ? aptRes.data : [];
      setAppointments(aptData);
      setInvoices(Array.isArray(invRes.data) ? invRes.data : []);

      // Pre-fill checkins for appointments that are already Arrived/Completed
      const initialCheckins: Record<number, boolean> = {};
      aptData.forEach(a => {
        if (a.status === 'Arrived' || a.status === 'Completed') {
          initialCheckins[a.id] = true;
        }
      });
      // Merge with any existing local toggle state to avoid overwriting mid-edit
      setCheckins(prev => ({ ...initialCheckins, ...prev }));
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);
  useEffect(() => { localStorage.setItem('patient_packages', JSON.stringify(patientPackages)); }, [patientPackages]);

  // Filter today's appointments by date_time field (new schema)
  const todaysAppointments = appointments.filter(a => {
    const dt = a.date_time || '';
    return dt.startsWith(todayStr);
  }).sort((a, b) => new Date(b.date_time || 0).getTime() - new Date(a.date_time || 0).getTime());

  const totalPages = Math.ceil(todaysAppointments.length / ITEMS_PER_PAGE);
  const paginatedData = todaysAppointments.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const getInitials = (name: string) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  // Mark Present + optionally save status to backend
  const handleCheckin = (id: number) => {
    setCheckins(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Save attendance: update appointment status to Arrived + payment_status to paid if amount set
  const handleSaveAttendance = async (apt: AppointmentRow) => {
    const checked = checkins[apt.id];
    setSavingId(apt.id);
    try {
      const newStatus = checked ? 'Arrived' : apt.status;
      await axios.put(`${API_BASE}/appointments/${apt.id}`, {
        patient_id: apt.patient_name ? undefined : null,
        staff_id: undefined,
        branch_id: undefined,
        date_time: apt.date_time,
        duration_minutes: apt.duration_minutes || 60,
        service: apt.service,
        status: newStatus,
        payment_status: apt.payment_status,
        notes: `Attendance recorded on ${attendanceDates[apt.id] || todayStr}`
      }, auth());
      await fetchAppointments();
      toast(`✅ Attendance saved for ${apt.patient_name}`);
    } catch (err: any) {
      toast(`❌ ${err?.response?.data?.message || 'Save failed'}`);
    } finally {
      setSavingId(null);
    }
  };

  const sendReminder = (name: string, phone?: string) => {
    const msg = `Hello ${name},\nThis is a gentle reminder regarding your physiotherapy session today. Please arrive on time. Thank you!`;
    const url = phone
      ? `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const recordSession = (pkg: PatientPackage) => {
    if (!pkg.isMembership && pkg.usedSessions >= pkg.totalSessions) return alert('All sessions used!');
    setPatientPackages(prev => prev.map(p => p.id === pkg.id ? { ...p, usedSessions: p.usedSessions + 1 } : p));
  };

  const presentCount = todaysAppointments.filter(a => checkins[a.id]).length;
  const collectedToday = invoices.filter(i => i.date === todayStr && i.status === 'paid').reduce((s, i) => s + (i.total || i.amount || 0), 0);


  return (
    <div className="space-y-6 relative">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-pulse">
          <CheckCircle className="w-5 h-5 text-green-400" />{toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Daily Check & Packages</h2>
          <p className="text-sm text-slate-500">Live appointment check-in — updates status & auto-generates invoices.</p>
        </div>
        <button onClick={fetchAppointments} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 shadow-sm transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Today Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Today's Appointments", val: todaysAppointments.length, icon: Calendar, color: 'text-sky-600 bg-sky-50' },
          { label: 'Present', val: presentCount, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
          { label: 'Absent / Pending', val: todaysAppointments.length - presentCount, icon: AlertCircle, color: 'text-amber-600 bg-amber-50' },
          { label: 'Amount Collected', val: `₹${collectedToday.toLocaleString()}`, icon: DollarSign, color: 'text-purple-600 bg-purple-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border p-4 shadow-sm">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${s.color}`}>
              <s.icon className="w-4 h-4" />
            </div>
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className="text-xl font-bold text-slate-900">{s.val}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6">
          <button onClick={() => setActiveTab('attendance')} className={`pb-3 px-1 text-sm font-medium ${activeTab === 'attendance' ? 'text-sky-600 border-b-2 border-sky-600' : 'text-slate-500'}`}>
            Daily Attendance
          </button>
          <button onClick={() => setActiveTab('packages')} className={`pb-3 px-1 text-sm font-medium ${activeTab === 'packages' ? 'text-sky-600 border-b-2 border-sky-600' : 'text-slate-500'}`}>
            Patient Plans & Packages
          </button>
        </nav>
      </div>

      {/* ATTENDANCE TAB */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
          <div className="p-5 border-b bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-600" />
              Today's Schedule — {new Date().toDateString()}
              <span className="ml-2 bg-sky-100 text-sky-700 text-xs font-bold px-2 py-0.5 rounded-full">{todaysAppointments.length} appts</span>
            </h3>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading appointments...</div>
          ) : todaysAppointments.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No appointments scheduled for today.</p>
              <p className="text-slate-400 text-sm mt-1">Appointments created in the Appointments module appear here automatically.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left px-5 py-3 font-semibold text-slate-600 text-xs uppercase">Patient</th>
                    <th className="text-left px-5 py-3 font-semibold text-slate-600 text-xs uppercase">Therapist / Branch</th>
                    <th className="text-left px-5 py-3 font-semibold text-slate-600 text-xs uppercase">Time</th>
                    <th className="text-left px-5 py-3 font-semibold text-slate-600 text-xs uppercase">Present</th>
                    <th className="text-left px-5 py-3 font-semibold text-slate-600 text-xs uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedData.map(apt => {
                    const isPresent = checkins[apt.id];
                    return (
                      <tr key={apt.id} className={`hover:bg-slate-50 transition-colors ${isPresent ? 'bg-green-50/30' : ''}`}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold">
                              {getInitials(apt.patient_name)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{apt.patient_name || 'Unknown'}</p>
                              <p className="text-xs text-slate-400">{apt.patient_code} · {apt.service}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-700">{apt.staff_name || '—'}</p>
                          <p className="text-xs text-slate-400">{apt.branch_name || '—'}</p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1 text-slate-700">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {apt.date_time ? new Date(apt.date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{apt.duration_minutes || 60} min</p>
                        </td>
                        <td className="px-5 py-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!isPresent}
                              onChange={() => handleCheckin(apt.id)}
                              className="w-4 h-4 rounded accent-sky-600"
                            />
                            <span className={`text-xs font-bold ${isPresent ? 'text-green-600' : 'text-slate-400'}`}>
                              {isPresent ? 'Present' : 'Absent'}
                            </span>
                          </label>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSaveAttendance(apt)}
                              disabled={savingId === apt.id}
                              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                            >
                              {savingId === apt.id ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={() => sendReminder(apt.patient_name)}
                              className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                              title="Send WhatsApp reminder"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {todaysAppointments.length > 0 && (
              <div className="flex justify-between items-center px-5 py-4 border-t border-slate-100 bg-slate-50">
                <span className="text-sm text-slate-500">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, todaysAppointments.length)} of {todaysAppointments.length} entries
                </span>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 text-sm font-medium border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 transition-colors">Prev</button>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1.5 text-sm font-medium border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 transition-colors">Next</button>
                </div>
              </div>
            )}
            </>
          )}
        </div>
      )}

      {/* PACKAGES TAB */}
      {activeTab === 'packages' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button onClick={() => { setNewPkg({ id: '', patientName: '', packageName: '', isMembership: false, totalSessions: 5, usedSessions: 0, paymentStatus: 'Paid', expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0] }); setIsPackageModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-semibold hover:bg-sky-700 shadow-sm">
              <Plus className="w-4 h-4" /> Assign Package / Plan
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {patientPackages.length === 0 ? (
              <div className="col-span-full p-12 bg-white rounded-2xl border text-center text-slate-500 shadow-sm">
                <Package className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p>No active patient packages. Assign a package to get started.</p>
              </div>
            ) : patientPackages.map(pkg => {
              const progress = pkg.isMembership ? 0 : (pkg.usedSessions / pkg.totalSessions) * 100;
              const isExpired = new Date(pkg.expiryDate) < new Date();
              return (
                <div key={pkg.id} className="bg-white p-6 rounded-2xl border shadow-sm relative overflow-hidden">
                  {isExpired && <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">EXPIRED</div>}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">{pkg.patientName}</h3>
                      <p className="text-sm text-sky-600 font-medium">{pkg.packageName} <span className="text-slate-400">({pkg.isMembership ? 'Membership' : 'Sessions'})</span></p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${pkg.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{pkg.paymentStatus}</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-500">Sessions Used</span>
                        <span className="font-bold">{pkg.usedSessions}{!pkg.isMembership && ` / ${pkg.totalSessions}`}</span>
                      </div>
                      {!pkg.isMembership && <div className="w-full bg-slate-100 rounded-full h-2"><div className={`h-full rounded-full ${progress === 100 ? 'bg-rose-500' : 'bg-sky-500'}`} style={{ width: `${progress}%` }} /></div>}
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Expires:</span>
                      <span className={`font-semibold ${isExpired ? 'text-rose-600' : 'text-slate-900'}`}>{pkg.expiryDate}</span>
                    </div>
                    <div className="pt-3 border-t flex gap-2">
                      <button onClick={() => recordSession(pkg)} disabled={!pkg.isMembership && pkg.usedSessions >= pkg.totalSessions}
                        className="flex-1 bg-sky-50 text-sky-600 hover:bg-sky-100 disabled:opacity-50 py-2 rounded-lg text-sm font-semibold">Record Session</button>
                      <button onClick={() => setPatientPackages(prev => prev.filter(p => p.id !== pkg.id))} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Package Modal */}
      {isPackageModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setIsPackageModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="border-b p-4 flex justify-between items-center">
              <h3 className="font-bold text-lg">Assign Package or Plan</h3>
              <button onClick={() => setIsPackageModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium mb-1">Patient Name</label>
                <input className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/30" value={newPkg.patientName} onChange={e => setNewPkg({ ...newPkg, patientName: e.target.value })} /></div>
              <div><label className="block text-sm font-medium mb-1">Package / Plan Name</label>
                <input className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/30" value={newPkg.packageName} onChange={e => setNewPkg({ ...newPkg, packageName: e.target.value })} /></div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={newPkg.isMembership} onChange={e => setNewPkg({ ...newPkg, isMembership: e.target.checked })} className="w-4 h-4 accent-sky-600" />
                <span className="text-sm font-medium">Unlimited Membership (no session cap)</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                {!newPkg.isMembership && <div><label className="block text-sm font-medium mb-1">Total Sessions</label>
                  <input type="number" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/30" value={newPkg.totalSessions} onChange={e => setNewPkg({ ...newPkg, totalSessions: parseInt(e.target.value) || 0 })} /></div>}
                <div><label className="block text-sm font-medium mb-1">Payment Status</label>
                  <select className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/30" value={newPkg.paymentStatus} onChange={e => setNewPkg({ ...newPkg, paymentStatus: e.target.value })}>
                    <option>Paid</option><option>Pending</option>
                  </select></div>
              </div>
              <div><label className="block text-sm font-medium mb-1">Expiry Date</label>
                <input type="date" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/30" value={newPkg.expiryDate} onChange={e => setNewPkg({ ...newPkg, expiryDate: e.target.value })} /></div>
            </div>
            <div className="border-t p-4 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
              <button onClick={() => setIsPackageModalOpen(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-slate-100">Cancel</button>
              <button onClick={() => {
                if (!newPkg.patientName) return alert('Patient name required');
                setPatientPackages(prev => [...prev, { ...newPkg, id: Date.now().toString() }]);
                setIsPackageModalOpen(false);
              }} className="px-4 py-2 bg-sky-600 text-white text-sm font-semibold rounded-lg hover:bg-sky-700">Save Package</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
