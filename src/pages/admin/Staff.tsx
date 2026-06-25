import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, X, Star } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

interface Branch { id: number; name: string; }
interface StaffMember {
  id: number; name: string; email: string; role: string; dept: string;
  status: string; branch: string; branch_id: number; sessions: number; rating: number;
}

const roles = ['Lead Physiotherapist', 'Orthopedic Specialist', 'Neurological Therapist', 'Receptionist', 'Physiotherapy Assistant'];

const Staff = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [branchFilter, setBranchFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: '', dept: '', status: 'Active', branch: '', branch_id: '', sessions: 0, rating: 0 });
  const [dropdownId, setDropdownId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [staffRes, branchesRes] = await Promise.all([
        axios.get(`${API_BASE}/staff`, auth()),
        axios.get(`${API_BASE}/branches`, auth()),
      ]);
      setStaff(staffRes.data);
      setBranches(branchesRes.data);
    } catch (err) { console.error('Failed to fetch data', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = staff.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === 'All' || m.role === roleFilter;
    const matchBranch = branchFilter === 'All' || m.branch === branchFilter || String(m.branch_id) === branchFilter;
    return matchSearch && matchRole && matchBranch;
  });

  useEffect(() => { setCurrentPage(1); }, [searchTerm, roleFilter, branchFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedData = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const openModal = (member?: StaffMember) => {
    if (member) {
      setEditingStaff(member);
      setFormData({ name: member.name, email: member.email||'', role: member.role, dept: member.dept, status: member.status, branch: member.branch, branch_id: String(member.branch_id||''), sessions: member.sessions, rating: member.rating });
    } else {
      setEditingStaff(null);
      setFormData({ name: '', email: '', role: '', dept: '', status: 'Active', branch: '', branch_id: '', sessions: 0, rating: 0 });
    }
    setModalOpen(true);
    setDropdownId(null);
  };

  const saveStaff = async () => {
    if (!formData.name || !formData.role || !formData.branch_id) {
      alert('Please fill required fields (Name, Role, Branch)');
      return;
    }
    const selectedBranch = branches.find(b => String(b.id) === String(formData.branch_id));
    const payload = { ...formData, branch: selectedBranch?.name || formData.branch, branch_id: parseInt(formData.branch_id) || null };
    try {
      if (editingStaff) await axios.put(`${API_BASE}/staff/${editingStaff.id}`, payload, auth());
      else await axios.post(`${API_BASE}/staff`, payload, auth());
      fetchData();
      setModalOpen(false);
    } catch (err) { console.error('Failed to save staff', err); alert('Failed to save staff'); }
  };

  const deleteStaff = async (id: number) => {
    if (confirm('Delete this staff member?')) {
      try { await axios.delete(`${API_BASE}/staff/${id}`, auth()); fetchData(); setDropdownId(null); }
      catch (err) { alert('Failed to delete staff'); }
    }
  };

  const totalActive = staff.filter(m => m.status === 'Active').length;
  const onLeave = staff.filter(m => m.status === 'On Leave').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h2 className="text-2xl font-bold text-slate-900">Staff Management</h2><p className="text-sm text-slate-500">Manage therapists and clinic staff with branch assignments.</p></div>
        <button onClick={() => openModal()} className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold text-sm shadow-sm transition-colors"><Plus className="w-4 h-4" /> Add Staff</button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4 shadow-sm"><p className="text-2xl font-bold">{staff.length}</p><p className="text-xs text-slate-500">Total Staff</p></div>
        <div className="bg-white rounded-xl border p-4 shadow-sm"><p className="text-2xl font-bold text-green-600">{totalActive}</p><p className="text-xs text-slate-500">Active</p></div>
        <div className="bg-white rounded-xl border p-4 shadow-sm"><p className="text-2xl font-bold text-amber-600">{onLeave}</p><p className="text-xs text-slate-500">On Leave</p></div>
        <div className="bg-white rounded-xl border p-4 shadow-sm"><p className="text-2xl font-bold text-sky-600">{branches.length}</p><p className="text-xs text-slate-500">Branches</p></div>
      </div>

      <div className="bg-white rounded-2xl border p-4 flex flex-wrap gap-4 shadow-sm">
        <div className="relative flex-1 min-w-[200px]"><Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" /><input type="text" placeholder="Search staff..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
        <select className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}><option value="All">All Roles</option>{roles.map(r => <option key={r} value={r}>{r}</option>)}</select>
        <select className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none" value={branchFilter} onChange={e => setBranchFilter(e.target.value)}><option value="All">All Branches</option>{branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
        <div className="overflow-x-auto overflow-y-auto max-h-[500px]">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr><th className="px-5 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Name</th><th className="px-5 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Role</th><th className="px-5 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Branch</th><th className="px-5 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Sessions</th><th className="px-5 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Rating</th><th className="px-5 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Status</th><th></th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? <tr><td colSpan={7} className="text-center py-10 text-slate-400">Loading...</td></tr>
              : paginatedData.map(m => (
                <tr key={m.id} className="hover:bg-slate-50/80 transition-colors relative">
                  <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold">{m.name.split(' ').map(n=>n[0]).join('').slice(0,2)}</div><div><p className="font-semibold text-slate-800">{m.name}</p><p className="text-xs text-slate-400">{m.email}</p></div></div></td>
                  <td className="px-5 py-4 text-slate-600">{m.role}</td>
                  <td className="px-5 py-4 text-slate-600">{m.branch || '—'}</td>
                  <td className="px-5 py-4 font-semibold text-slate-800">{m.sessions}</td>
                  <td className="px-5 py-4"><span className="flex items-center gap-1 text-amber-500"><Star className="w-3.5 h-3.5 fill-amber-400" /> {m.rating}</span></td>
                  <td className="px-5 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${m.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>{m.status}</span></td>
                  <td className="px-5 py-4 relative">
                    <button onClick={() => setDropdownId(dropdownId===m.id ? null : m.id)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="4" r="1.5"/><circle cx="10" cy="10" r="1.5"/><circle cx="10" cy="16" r="1.5"/></svg>
                    </button>
                    {dropdownId === m.id && (
                      <div className="absolute right-5 top-12 bg-white border rounded-lg shadow-lg z-20 w-36 py-1">
                        <button onClick={() => openModal(m)} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2"><Edit className="w-3 h-3" /> Edit</button>
                        <button onClick={() => deleteStaff(m.id)} className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"><Trash2 className="w-3 h-3" /> Delete</button>
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

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5"><h3 className="text-xl font-bold text-slate-900">{editingStaff ? 'Edit Staff' : 'Add Staff'}</h3><button onClick={() => setModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button></div>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label><input className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/30" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Email</label><input type="email" className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/30" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Role *</label><select className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/30" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value, dept: e.target.value.split(' ')[0]})}><option value="">Select Role</option>{roles.map(r => <option key={r}>{r}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Branch * <span className="text-xs text-slate-400">(determines patient/appointment filtering)</span></label>
                <select className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/30" value={formData.branch_id} onChange={e => setFormData({...formData, branch_id: e.target.value})}>
                  <option value="">Select Branch</option>{branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Status</label><select className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/30" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}><option>Active</option><option>On Leave</option><option>Inactive</option></select></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Sessions</label><input type="number" className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/30" value={formData.sessions} onChange={e => setFormData({...formData, sessions: parseInt(e.target.value)||0})} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Rating (0–5)</label><input type="number" step="0.1" min={0} max={5} className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/30" value={formData.rating} onChange={e => setFormData({...formData, rating: parseFloat(e.target.value)||0})} /></div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6"><button onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded-lg text-sm hover:bg-slate-50">Cancel</button><button onClick={saveStaff} className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-semibold shadow-sm">Save</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;