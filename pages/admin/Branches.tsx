import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  X,
  Check,
  MoreVertical,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

// Type definitions
interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  manager: string;
  staff_count: number;
  appointments_this_month: number;
  revenue: number;
  status: 'active' | 'inactive';
}

const Branches = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState<Partial<Branch>>({
    name: '',
    address: '',
    phone: '',
    email: '',
    manager: '',
    status: 'active',
  });

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const fetchBranches = async () => {
    try {
      const [resB, resS, resI] = await Promise.all([
        axios.get(`${API_BASE}/branches`, getAuthHeaders()),
        axios.get(`${API_BASE}/staff`, getAuthHeaders()),
        axios.get(`${API_BASE}/invoices`, getAuthHeaders())
      ]);

      const staff = resS.data;
      const invoices = resI.data;

      const updatedBranches = resB.data.map((b: Branch) => {
        const branchStaff = staff.filter((s: any) => s.branch === b.name);
        const branchInvoices = invoices.filter((i: any) => i.branch === b.name);
        const revenue = branchInvoices.filter((i: any) => i.status === 'paid').reduce((sum: number, i: any) => sum + i.amount, 0);
        const appointments = branchInvoices.length; // Approximate appointments by invoices
        
        return {
          ...b,
          staff_count: branchStaff.length,
          revenue,
          appointments_this_month: appointments
        };
      });

      setBranches(updatedBranches);
    } catch (err) {
      console.error('Failed to fetch branches', err);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const totalBranches = branches.filter(b => b.status === 'active').length;
  const totalStaff = branches.reduce((sum, b) => sum + (b.staff_count || 0), 0);
  const totalAppointments = branches.reduce((sum, b) => sum + (b.appointments_this_month || 0), 0);
  const totalRevenue = branches.reduce((sum, b) => sum + (b.revenue || 0), 0);
  const avgRevenuePerBranch = branches.length ? totalRevenue / branches.length : 0;

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Open modal for add/edit
  const openModal = (branch?: Branch) => {
    if (branch) {
      setEditingBranch(branch);
      setFormData(branch);
    } else {
      setEditingBranch(null);
      setFormData({
        name: '',
        address: '',
        phone: '',
        email: '',
        manager: '',
        status: 'active',
      });
    }
    setIsModalOpen(true);
  };

  // Save branch (add or update)
  const saveBranch = async () => {
    if (!formData.name || !formData.address || !formData.phone) return;
    try {
      if (editingBranch) {
        await axios.put(`${API_BASE}/branches/${editingBranch.id}`, formData, getAuthHeaders());
      } else {
        await axios.post(`${API_BASE}/branches`, {
          ...formData,
          staff_count: 0,
          appointments_this_month: 0,
          revenue: 0,
        }, getAuthHeaders());
      }
      fetchBranches();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save branch', err);
      alert('Failed to save branch');
    }
  };

  // Delete branch
  const deleteBranch = async (id: number) => {
    if (confirm('Are you sure you want to delete this branch? This action cannot be undone.')) {
      try {
        await axios.delete(`${API_BASE}/branches/${id}`, getAuthHeaders());
        fetchBranches();
      } catch (err) {
        console.error('Failed to delete branch', err);
      }
    }
  };

  // Toggle branch status
  const toggleStatus = async (id: number) => {
    const b = branches.find(x => x.id === id);
    if (!b) return;
    try {
      await axios.put(`${API_BASE}/branches/${id}`, {
        ...b,
        status: b.status === 'active' ? 'inactive' : 'active'
      }, getAuthHeaders());
      fetchBranches();
    } catch (err) {
      console.error('Failed to toggle status', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Branches Management</h2>
          <p className="text-sm text-slate-500">Manage multiple clinic locations, staff, and performance.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white rounded-lg text-sm font-semibold hover:bg-sky-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add New Branch
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500 mb-1">Active Branches</p>
          <h3 className="text-2xl font-bold text-slate-900">{totalBranches}</h3>
          <p className="text-xs text-slate-400 mt-1">Total: {branches.length} locations</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500 mb-1">Total Staff</p>
          <h3 className="text-2xl font-bold text-slate-900">{totalStaff}</h3>
          <p className="text-xs text-slate-400 mt-1">Across all branches</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500 mb-1">Monthly Appointments</p>
          <h3 className="text-2xl font-bold text-slate-900">{totalAppointments.toLocaleString()}</h3>
          <p className="text-xs text-slate-400 mt-1">This month</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500 mb-1">Total Revenue (MTD)</p>
          <h3 className="text-2xl font-bold text-slate-900">₹{totalRevenue.toLocaleString()}</h3>
          <p className="text-xs text-slate-400 mt-1">Avg: ₹{Math.round(avgRevenuePerBranch).toLocaleString()}/branch</p>
        </div>
      </div>

      {/* Revenue Comparison (simple horizontal bar chart) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-sky-600" />
          Branch Revenue Comparison
        </h3>
        <div className="space-y-4">
          {branches.filter(b => b.status === 'active').map((branch) => {
            const maxRevenue = Math.max(...branches.map(b => b.revenue));
            const percentage = (branch.revenue / maxRevenue) * 100;
            return (
              <div key={branch.id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{branch.name}</span>
                  <span className="text-slate-600">₹{branch.revenue.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-sky-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Branches List - Card View (matches your existing design style) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {branches.map((branch) => (
          <div 
            key={branch.id} 
            className={`bg-white rounded-2xl border transition-all duration-200 hover:shadow-md ${
              branch.status === 'active' ? 'border-slate-200' : 'border-slate-100 bg-slate-50/50'
            }`}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{branch.name}</h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                      branch.status === 'active' 
                        ? 'bg-green-50 text-green-700' 
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {branch.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => openModal(branch)}
                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                    title="Edit branch"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deleteBranch(branch.id)}
                    className="p-2 rounded-lg hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors"
                    title="Delete branch"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => toggleStatus(branch.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      branch.status === 'active' 
                        ? 'hover:bg-amber-50 text-slate-500 hover:text-amber-600' 
                        : 'hover:bg-emerald-50 text-slate-500 hover:text-emerald-600'
                    }`}
                    title={branch.status === 'active' ? 'Deactivate' : 'Activate'}
                  >
                    {branch.status === 'active' ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2 text-slate-600">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{branch.address}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-4 h-4" />
                  <span>{branch.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-4 h-4" />
                  <span>{branch.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Users className="w-4 h-4" />
                  <span>Manager: {branch.manager}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
                <div className="text-center">
                  <p className="text-xs text-slate-500">Staff</p>
                  <p className="text-lg font-bold text-slate-900">{branch.staff_count || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500">Appointments</p>
                  <p className="text-lg font-bold text-slate-900">{branch.appointments_this_month || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500">Revenue</p>
                  <p className="text-lg font-bold text-slate-900">₹{(branch.revenue || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">
                {editingBranch ? 'Edit Branch' : 'Add New Branch'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Branch Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="e.g., Main Clinic - Downtown"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Full address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Contact number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="branch@physiocare.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Manager Name</label>
                <input
                  type="text"
                  name="manager"
                  value={formData.manager || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Branch manager name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status || 'active'}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveBranch}
                className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors"
              >
                {editingBranch ? 'Update Branch' : 'Add Branch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Branches;