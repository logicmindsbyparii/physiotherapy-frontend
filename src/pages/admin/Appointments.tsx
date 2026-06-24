import { useState, useEffect } from 'react';
import { Search, Plus, CheckCircle, XCircle, Clock, Edit, Trash2, X, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

interface Branch { id: number; name: string; }
interface Staff { id: number; name: string; role: string; branch_id: number; status: string; }
interface Patient { id: number; patient_id: string; name: string; }
interface Appointment {
  id: number; patient_id: number; staff_id: number; branch_id: number;
  date_time: string; duration_minutes: number; service: string;
  status: string; payment_status: string; notes: string;
  patient_name: string; patient_code: string; staff_name: string; branch_name: string;
}

const STATUS_OPTIONS = ['Scheduled', 'Confirmed', 'Arrived', 'Completed', 'Cancelled', 'Rescheduled'];
const PAY_OPTIONS = ['pending', 'paid', 'waived'];

const statusStyle: Record<string, string> = {
  Scheduled: 'bg-slate-100 text-slate-700',
  Confirmed: 'bg-blue-50 text-blue-700',
  Arrived: 'bg-amber-50 text-amber-700',
  Completed: 'bg-green-50 text-green-700',
  Cancelled: 'bg-rose-50 text-rose-700',
};
const statusIcon: Record<string, any> = {
  Scheduled: <Clock className="w-3.5 h-3.5" />,
  Confirmed: <CheckCircle className="w-3.5 h-3.5" />,
  Arrived: <AlertCircle className="w-3.5 h-3.5" />,
  Completed: <CheckCircle className="w-3.5 h-3.5" />,
  Cancelled: <XCircle className="w-3.5 h-3.5" />,
  Rescheduled: <Clock className="w-3.5 h-3.5" />,
};

const Appointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [allStaff, setAllStaff] = useState<Staff[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [modalOpen, setModalOpen] = useState(false);
  const [editingApt, setEditingApt] = useState<Appointment | null>(null);
  const [dropdownId, setDropdownId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const emptyForm = { patient_id: '', branch_id: '', staff_id: '', date_time: '', duration_minutes: 60, service: '', status: 'Confirmed', payment_status: 'pending', notes: '' };
  const [form, setForm] = useState<Record<string, any>>(emptyForm);

  const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [aRes, bRes, sRes, pRes] = await Promise.all([
        axios.get(`${API_BASE}/appointments`, auth()),
        axios.get(`${API_BASE}/branches`, auth()),
        axios.get(`${API_BASE}/staff`, auth()),
        axios.get(`${API_BASE}/patients`, auth()),
      ]);
      setAppointments(Array.isArray(aRes.data) ? aRes.data : []);
      setBranches(bRes.data);
      setAllStaff(sRes.data);
      setPatients(pRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  // Cascade: branch → active staff
  useEffect(() => {
    if (form.branch_id) {
      const fs = allStaff.filter(s => String(s.branch_id) === String(form.branch_id) && s.status === 'Active');
      setFilteredStaff(fs);
      setForm(f => {
        if (f.staff_id && fs.some(s => String(s.id) === String(f.staff_id))) return f;
        return { ...f, staff_id: '' };
      });
    } else {
      setFilteredStaff([]);
    }
  }, [form.branch_id, allStaff]);

  const openModal = (apt?: Appointment) => {
    setError('');
    if (apt) {
      setEditingApt(apt);
      setForm({
        patient_id: apt.patient_id || '', branch_id: apt.branch_id || '',
        staff_id: apt.staff_id || '', date_time: apt.date_time?.slice(0,16) || '',
        duration_minutes: apt.duration_minutes || 60, service: apt.service || '',
        status: apt.status || 'Confirmed', payment_status: apt.payment_status || 'pending',
        notes: apt.notes || ''
      });
    } else {
      setEditingApt(null);
      setForm(emptyForm);
    }
    setModalOpen(true);
    setDropdownId(null);
  };

  const saveAppointment = async () => {
    if (!form.patient_id || !form.branch_id || !form.staff_id || !form.date_time || !form.service) {
      setError('Please fill Patient, Branch, Therapist, Date/Time, and Service.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editingApt) {
        await axios.put(`${API_BASE}/appointments/${editingApt.id}`, form, auth());
      } else {
        await axios.post(`${API_BASE}/appointments`, form, auth());
      }
      fetchAll();
      setModalOpen(false);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save appointment');
    } finally { setSaving(false); }
  };

  const deleteApt = async (id: number) => {
    if (!confirm('Delete this appointment?')) return;
    try { await axios.delete(`${API_BASE}/appointments/${id}`, auth()); fetchAll(); }
    catch { alert('Failed to delete'); }
    setDropdownId(null);
  };

  const filtered = appointments.filter(a => {
    const ms = (a.patient_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.staff_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.service || '').toLowerCase().includes(searchTerm.toLowerCase());
    const mst = statusFilter === 'All' || a.status === statusFilter;
    return ms && mst;
  }).sort((a, b) => new Date(b.date_time || 0).getTime() - new Date(a.date_time || 0).getTime());

  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedData = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = appointments.filter(a => a.date_time?.startsWith(todayStr)).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Appointments</h2>
          <p className="text-sm text-slate-500">Schedule & manage patient appointments with double-booking protection.</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold text-sm shadow-sm transition-colors">
          <Plus className="w-4 h-4" /> New Appointment
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', val: appointments.length, color: 'text-slate-800' },
          { label: "Today's", val: todayCount, color: 'text-sky-600' },
          { label: 'Completed', val: appointments.filter(a=>a.status==='Completed').length, color: 'text-green-600' },
          { label: 'Cancelled', val: appointments.filter(a=>a.status==='Cancelled').length, color: 'text-rose-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border p-4 shadow-sm">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border p-4 flex flex-wrap gap-4 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input type="text" placeholder="Search patient, therapist, service..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <select className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="All">All Status</option>
          {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
        <div className="overflow-x-auto overflow-y-auto max-h-[520px]">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                {['Patient', 'Service', 'Therapist', 'Branch', 'Date & Time', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-5 py-4 font-semibold text-slate-600 text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? <tr><td colSpan={8} className="text-center py-10 text-slate-400">Loading...</td></tr>
              : paginatedData.length === 0 ? <tr><td colSpan={8} className="text-center py-10 text-slate-400">No appointments found.</td></tr>
              : paginatedData.map(a => (
                <tr key={a.id} className="hover:bg-slate-50/80 transition-colors relative">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                        {(a.patient_name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{a.patient_name || 'Unknown'}</p>
                        <p className="text-xs text-slate-400">{a.patient_code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{a.service}</td>
                  <td className="px-5 py-4 text-slate-600">{a.staff_name || '—'}</td>
                  <td className="px-5 py-4 text-slate-600">{a.branch_name || '—'}</td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-800">{a.date_time ? new Date(a.date_time).toLocaleDateString() : '—'}</p>
                    <p className="text-xs text-slate-400">{a.date_time ? new Date(a.date_time).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : ''}</p>
                    <p className="text-xs text-sky-600 font-medium mt-0.5">{a.duration_minutes ? `${a.duration_minutes} min session` : '60 min session'}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle[a.status] || 'bg-slate-100 text-slate-600'}`}>
                      {statusIcon[a.status]} {a.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 relative">
                    <button onClick={() => setDropdownId(dropdownId===a.id ? null : a.id)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="4" r="1.5"/><circle cx="10" cy="10" r="1.5"/><circle cx="10" cy="16" r="1.5"/></svg>
                    </button>
                    {dropdownId === a.id && (
                      <div className="absolute right-5 top-12 bg-white border rounded-lg shadow-lg z-20 w-36 py-1">
                        <button onClick={() => openModal(a)} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2"><Edit className="w-3.5 h-3.5" /> Edit</button>
                        <button onClick={() => deleteApt(a.id)} className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > 0 && (
          <div className="flex justify-between items-center px-5 py-4 border-t border-slate-100 bg-slate-50">
            <span className="text-sm text-slate-500">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} entries
            </span>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 text-sm font-medium border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 transition-colors">Prev</button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1.5 text-sm font-medium border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">{editingApt ? 'Edit Appointment' : 'New Appointment'}</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="bg-rose-50 text-rose-700 text-sm p-3 rounded-lg border border-rose-200">{error}</div>}

              <div><label className="block text-sm font-medium text-slate-700 mb-1">Patient *</label>
                <select className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/30" value={form.patient_id} onChange={e => setForm({...form, patient_id: e.target.value})}>
                  <option value="">Select Patient</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.patient_id} — {p.name}</option>)}
                </select></div>

              <div><label className="block text-sm font-medium text-slate-700 mb-1">Branch * <span className="text-slate-400 text-xs">(controls therapist list)</span></label>
                <select className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/30" value={form.branch_id} onChange={e => setForm({...form, branch_id: e.target.value})}>
                  <option value="">Select Branch</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select></div>

              <div><label className="block text-sm font-medium text-slate-700 mb-1">Therapist * <span className="text-slate-400 text-xs">(active at selected branch)</span></label>
                <select className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/30" value={form.staff_id} onChange={e => setForm({...form, staff_id: e.target.value})} disabled={!form.branch_id}>
                  <option value="">{form.branch_id ? 'Select Therapist' : 'Select branch first'}</option>
                  {filteredStaff.map(s => <option key={s.id} value={s.id}>{s.name} — {s.role}</option>)}
                </select></div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Date & Time *</label>
                  <input type="datetime-local" className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/30" value={form.date_time} onChange={e => setForm({...form, date_time: e.target.value})} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Duration (min)</label>
                  <input type="number" min={15} step={15} className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/30" value={form.duration_minutes} onChange={e => setForm({...form, duration_minutes: parseInt(e.target.value)||60})} /></div>
              </div>

              <div><label className="block text-sm font-medium text-slate-700 mb-1">Service *</label>
                <input className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/30" placeholder="e.g. Physiotherapy Session" value={form.service} onChange={e => setForm({...form, service: e.target.value})} /></div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Arrival Status</label>
                  <select className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/30" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                  </select></div>
              </div>

              {form.status === 'Confirmed' && (
                <div className="bg-sky-50 border border-sky-200 text-sky-800 text-xs p-3 rounded-lg">
                  ⚡ Saving a <strong>Confirmed</strong> appointment auto-generates a session invoice and updates daily session count.
                </div>
              )}

              <div><label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea rows={2} className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/30 resize-none" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
            </div>
            <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
              <button onClick={saveAppointment} disabled={saving} className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-semibold shadow-sm disabled:opacity-60">
                {saving ? 'Saving...' : editingApt ? 'Update' : 'Book Appointment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;