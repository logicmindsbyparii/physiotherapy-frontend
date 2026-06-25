import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, X, User, Phone, Mail, MapPin, FileText, DollarSign, Activity } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

interface Branch { id: number; name: string; address: string; }
interface Staff { id: number; name: string; role: string; status: string; branch_id: number; }
interface Patient {
  id: number; patient_id: string; name: string; email: string; phone: string;
  age: number; gender: string; address: string; medical_notes: string;
  assigned_branch_id: number; assigned_staff_id: number;
  billing_frequency: string; base_rate_amount: number; status: string;
  branch_name: string; staff_name: string; created_at: string;
}

const FREQ_OPTIONS = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'];

const Patients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [allStaff, setAllStaff] = useState<Staff[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [dropdownId, setDropdownId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const emptyForm = {
    name: '', email: '', phone: '', age: '', gender: 'Male', address: '',
    medical_notes: '', assigned_branch_id: '', assigned_staff_id: '',
    billing_frequency: 'MONTHLY', base_rate_amount: '', status: 'active'
  };
  const [form, setForm] = useState<Record<string, any>>(emptyForm);

  const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pRes, bRes, sRes] = await Promise.all([
        axios.get(`${API_BASE}/patients`, auth()),
        axios.get(`${API_BASE}/branches`, auth()),
        axios.get(`${API_BASE}/staff`, auth()),
      ]);
      setPatients(pRes.data);
      setBranches(bRes.data);
      setAllStaff(sRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  // Cascade: when branch changes, filter active staff
  useEffect(() => {
    if (form.assigned_branch_id) {
      const fs = allStaff.filter(s => String(s.branch_id) === String(form.assigned_branch_id) && s.status === 'Active');
      setFilteredStaff(fs);
      setForm(f => {
        if (f.assigned_staff_id && fs.some(s => String(s.id) === String(f.assigned_staff_id))) return f;
        return { ...f, assigned_staff_id: '' };
      });
    } else {
      setFilteredStaff([]);
    }
  }, [form.assigned_branch_id, allStaff]);

  const openModal = (p?: Patient) => {
    if (p) {
      setEditingPatient(p);
      setForm({
        name: p.name, email: p.email, phone: p.phone, age: p.age || '',
        gender: p.gender || 'Male', address: p.address, medical_notes: p.medical_notes,
        assigned_branch_id: p.assigned_branch_id || '', assigned_staff_id: p.assigned_staff_id || '',
        billing_frequency: p.billing_frequency, base_rate_amount: p.base_rate_amount, status: p.status
      });
    } else {
      setEditingPatient(null);
      setForm(emptyForm);
    }
    setModalOpen(true);
    setDropdownId(null);
  };

  const savePatient = async () => {
    if (!form.name || !form.phone || !form.assigned_branch_id || !form.base_rate_amount) {
      alert('Please fill: Name, Phone, Branch, and Base Rate Amount');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        age: form.age ? parseInt(form.age) : null,
        base_rate_amount: parseFloat(form.base_rate_amount) || 0,
        assigned_branch_id: form.assigned_branch_id || null,
        assigned_staff_id: form.assigned_staff_id || null,
      };
      if (editingPatient) {
        await axios.put(`${API_BASE}/patients/${editingPatient.id}`, payload, auth());
      } else {
        await axios.post(`${API_BASE}/patients`, payload, auth());
      }
      fetchAll();
      setModalOpen(false);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to save patient');
    } finally { setSaving(false); }
  };

  const deletePatient = async (id: number) => {
    if (!confirm('Delete this patient?')) return;
    try { await axios.delete(`${API_BASE}/patients/${id}`, auth()); fetchAll(); }
    catch { alert('Failed to delete'); }
    setDropdownId(null);
  };

  const filtered = patients.filter(p => {
    const ms = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.patient_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone?.includes(searchTerm);
    const mst = statusFilter === 'all' || p.status === statusFilter;
    return ms && mst;
  });

  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedData = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const totalActive = patients.filter(p => p.status === 'active').length;
  const totalRevenue = patients.reduce((s, p) => s + (p.base_rate_amount || 0), 0);

  const freqColor: Record<string, string> = {
    DAILY: 'bg-purple-50 text-purple-700', WEEKLY: 'bg-blue-50 text-blue-700',
    MONTHLY: 'bg-amber-50 text-amber-700', YEARLY: 'bg-green-50 text-green-700'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Patient Management</h2>
          <p className="text-sm text-slate-500">Register patients, assign staff, and configure billing.</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold text-sm shadow-sm transition-colors">
          <Plus className="w-4 h-4" /> Register Patient
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Patients', val: patients.length, icon: User, color: 'bg-sky-50 text-sky-600' },
          { label: 'Active', val: totalActive, icon: Activity, color: 'bg-green-50 text-green-600' },
          { label: 'Inactive', val: patients.length - totalActive, icon: User, color: 'bg-slate-50 text-slate-600' },
          { label: 'Base Revenue Pool', val: `₹${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-amber-50 text-amber-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border p-5 shadow-sm">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-slate-900">{s.val}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border p-4 flex flex-wrap gap-4 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input type="text" placeholder="Search by name, ID, or phone..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm"
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <select className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
        <div className="overflow-x-auto overflow-y-auto max-h-[520px]">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                {['Patient ID', 'Name', 'Contact', 'Branch / Therapist', 'Billing', 'Base Rate', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-5 py-4 font-semibold text-slate-600 text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-10 text-slate-400">Loading...</td></tr>
              ) : paginatedData.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-slate-400">No patients found. Register your first patient!</td></tr>
              ) : paginatedData.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors relative">
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs bg-sky-50 text-sky-700 px-2 py-1 rounded">{p.patient_id}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                        {p.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{p.name}</p>
                        <p className="text-xs text-slate-400">{p.gender}{p.age ? `, ${p.age}y` : ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-slate-600"><Phone className="w-3 h-3" />{p.phone}</div>
                      {p.email && <div className="flex items-center gap-1 text-slate-400 text-xs"><Mail className="w-3 h-3" />{p.email}</div>}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-slate-700 font-medium">{p.branch_name || '—'}</p>
                    <p className="text-xs text-slate-400">{p.staff_name || 'No therapist'}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${freqColor[p.billing_frequency] || 'bg-slate-100 text-slate-600'}`}>
                      {p.billing_frequency}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-800">₹{(p.base_rate_amount || 0).toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${p.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {p.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-4 relative">
                    <button onClick={() => setDropdownId(dropdownId === p.id ? null : p.id)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="4" r="1.5"/><circle cx="10" cy="10" r="1.5"/><circle cx="10" cy="16" r="1.5"/></svg>
                    </button>
                    {dropdownId === p.id && (
                      <div className="absolute right-5 top-12 bg-white border rounded-lg shadow-lg z-20 w-36 py-1">
                        <button onClick={() => openModal(p)} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2"><Edit className="w-3.5 h-3.5" /> Edit</button>
                        <button onClick={() => deletePatient(p.id)} className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > 0 && (
          <div className="flex justify-between items-center px-5 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">{editingPatient ? 'Edit Patient' : 'Register New Patient'}</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Personal Info */}
              <div className="sm:col-span-2"><p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2"><User className="w-3.5 h-3.5" /> Personal Info</p></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                <input className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
                <input className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/30" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/30" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                <input type="number" className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/30" value={form.age} onChange={e => setForm({...form, age: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                <select className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/30" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
                  {['Male','Female','Other'].map(g => <option key={g}>{g}</option>)}
                </select></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/30" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                  <option value="active">Active</option><option value="inactive">Inactive</option>
                </select></div>
              <div className="sm:col-span-2"><label className="block text-sm font-medium text-slate-700 mb-1"><MapPin className="w-3.5 h-3.5 inline mr-1" />Address</label>
                <input className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/30" value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
              <div className="sm:col-span-2"><label className="block text-sm font-medium text-slate-700 mb-1"><FileText className="w-3.5 h-3.5 inline mr-1" />Medical Intake Notes</label>
                <textarea rows={3} className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/30 resize-none" value={form.medical_notes} onChange={e => setForm({...form, medical_notes: e.target.value})} /></div>

              {/* Branch & Staff */}
              <div className="sm:col-span-2 border-t pt-4"><p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Branch & Staff Assignment</p></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Branch *</label>
                <select className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/30" value={form.assigned_branch_id} onChange={e => setForm({...form, assigned_branch_id: e.target.value})}>
                  <option value="">Select Branch</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Assign Therapist <span className="text-slate-400 text-xs">(Active staff at branch)</span></label>
                <select className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/30" value={form.assigned_staff_id} onChange={e => setForm({...form, assigned_staff_id: e.target.value})} disabled={!form.assigned_branch_id}>
                  <option value="">{form.assigned_branch_id ? 'Select Therapist' : 'Select branch first'}</option>
                  {filteredStaff.map(s => <option key={s.id} value={s.id}>{s.name} — {s.role}</option>)}
                </select></div>

              {/* Billing */}
              <div className="sm:col-span-2 border-t pt-4"><p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2"><DollarSign className="w-3.5 h-3.5 inline mr-1" />Billing Configuration</p></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Billing Frequency</label>
                <select className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/30" value={form.billing_frequency} onChange={e => setForm({...form, billing_frequency: e.target.value})}>
                  {FREQ_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                </select></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Base Rate Amount (₹) *</label>
                <input type="number" min={0} className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/30" value={form.base_rate_amount} onChange={e => setForm({...form, base_rate_amount: e.target.value})} />
                {!editingPatient && <p className="text-xs text-amber-600 mt-1">⚡ A registration invoice will be auto-generated on save.</p>}
              </div>
            </div>
            <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={savePatient} disabled={saving} className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors disabled:opacity-60">
                {saving ? 'Saving...' : editingPatient ? 'Update Patient' : 'Register & Create Invoice'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;
