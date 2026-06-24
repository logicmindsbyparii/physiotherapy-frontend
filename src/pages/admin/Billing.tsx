import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';
import {
  Receipt, Plus, Search, Download, Send, Eye, Package, Users,
  DollarSign, Clock, CheckCircle, XCircle, AlertCircle, X, Edit, Trash2
} from 'lucide-react';

// Types
interface Invoice {
  id: string;
  patient_name: string;
  patient_phone: string;
  service: string;
  amount: number;
  tax: number;
  total: number;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  date: string;
  due_date: string;
  invoice_number: string;
  therapist: string;
  branch: string;
}

interface Package {
  id: number;
  name: string;
  sessions: number;
  price: number;
  discount: number;
  validity_days: number;
  description: string;
  is_active: number;
}

interface Membership {
  id: number;
  name: string;
  price: number;
  duration_months: number;
  features: string[] | string;
  discount_on_services: number;
  is_active: number;
}

const generateInvoiceNumber = () => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV-${year}${month}-${random}`;
};

const Billing = () => {
  const [activeTab, setActiveTab] = useState<'invoices' | 'packages' | 'memberships'>('invoices');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [branchesList, setBranchesList] = useState<string[]>([]);

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const fetchData = async () => {
    try {
      const [invRes, pkgRes, memRes, branchRes] = await Promise.all([
        axios.get(`${API_BASE}/invoices`, getAuthHeaders()),
        axios.get(`${API_BASE}/packages`, getAuthHeaders()),
        axios.get(`${API_BASE}/memberships`, getAuthHeaders()),
        axios.get(`${API_BASE}/branches`, getAuthHeaders())
      ]);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const processedInvoices = invRes.data.map((inv: any) => {
        // Automatically mark as overdue if past due date
        if (inv.status === 'pending' && inv.due_date) {
          const dueDate = new Date(inv.due_date);
          if (dueDate < today) {
            return { ...inv, status: 'overdue' };
          }
        }
        return inv;
      });

      setInvoices(processedInvoices);
      setPackages(pkgRes.data);
      setMemberships(memRes.data.map((m: any) => ({
        ...m,
        features: typeof m.features === 'string' ? JSON.parse(m.features || '[]') : m.features
      })));
      setBranchesList(branchRes.data.map((b: any) => b.name));
    } catch (err) {
      console.error('Failed to fetch billing data', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Modal states
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [membershipModalOpen, setMembershipModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [editingMembership, setEditingMembership] = useState<Membership | null>(null);
  const [viewInvoiceModal, setViewInvoiceModal] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  // Form states
  const [newInvoice, setNewInvoice] = useState({
    patientName: '', patientPhone: '', service: '', amount: 0,
    therapist: '',
    branch: '',
    status: 'pending' as string,
    date: new Date().toISOString().split('T')[0]
  });

  const [newPackage, setNewPackage] = useState<Omit<Package, 'id'>>({
    name: '', sessions: 1, price: 0, discount: 0, validity_days: 30, description: '', is_active: 1
  });

  const [newMembership, setNewMembership] = useState<Omit<Membership, 'id'>>({
    name: '', price: 0, duration_months: 1, features: [] as string[], discount_on_services: 0,
    is_active: 1
  });
  const [featureInput, setFeatureInput] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Computed totals
  const totalRevenue = invoices.reduce((sum, inv) => inv.status === 'paid' ? sum + inv.total : sum, 0);
  const pendingAmount = invoices.reduce((sum, inv) => inv.status === 'pending' ? sum + inv.total : sum, 0);
  const overdueAmount = invoices.reduce((sum, inv) => inv.status === 'overdue' ? sum + inv.total : sum, 0);
  const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;

  const filteredInvoices = invoices.filter(inv => {
    const matchSearch = inv.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  }).sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());

  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE);
  const paginatedInvoices = filteredInvoices.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Invoice handlers
  const createInvoice = async () => {
    if (!newInvoice.patientName || newInvoice.amount <= 0) {
      alert('Please fill required fields');
      return;
    }
    const tax = newInvoice.amount * 0.18;
    const total = newInvoice.amount + tax;
    
    const payload = {
      patient_name: newInvoice.patientName,
      patient_phone: newInvoice.patientPhone,
      service: newInvoice.service,
      therapist: newInvoice.therapist,
      branch: newInvoice.branch,
      amount: newInvoice.amount,
      tax,
      total,
      status: newInvoice.status,
      date: newInvoice.date || (editingInvoice ? editingInvoice.date : new Date().toISOString().split('T')[0]),
      due_date: editingInvoice ? editingInvoice.due_date : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      invoice_number: editingInvoice ? editingInvoice.invoice_number : `INV-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(Math.random() * 1000)}`
    };

    try {
      if (editingInvoice) {
        await axios.put(`${API_BASE}/invoices/${editingInvoice.id}`, payload, getAuthHeaders());
      } else {
        await axios.post(`${API_BASE}/invoices`, payload, getAuthHeaders());
      }
      fetchData();
      setInvoiceModalOpen(false);
      setEditingInvoice(null);
      setNewInvoice({ patientName: '', patientPhone: '', service: '', amount: 0, therapist: '', branch: '', status: 'pending', date: new Date().toISOString().split('T')[0] });
    } catch (err) {
      console.error('Failed to save invoice', err);
      alert('Failed to save invoice');
    }
  };

  const editInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setNewInvoice({ 
      patientName: invoice.patient_name, 
      patientPhone: invoice.patient_phone, 
      service: invoice.service, 
      amount: invoice.amount, 
      therapist: invoice.therapist, 
      branch: invoice.branch, 
      status: invoice.status,
      date: invoice.date
    });
    setInvoiceModalOpen(true);
  };

  const downloadInvoice = (invoice: Invoice) => {
    // Create a simple text representation (you can replace with PDF generation later)
    const content = `INVOICE\n${invoice.invoice_number}\nPatient: ${invoice.patient_name}\nService: ${invoice.service}\nAmount: ₹${invoice.amount}\nTax: ₹${invoice.tax}\nTotal: ₹${invoice.total}\nDate: ${invoice.date}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.invoice_number}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sendInvoice = (invoice: Invoice) => {
    // Simulate WhatsApp send (you can integrate WhatsApp API later)
    const message = `Dear ${invoice.patient_name},\nYour invoice ${invoice.invoice_number} for ₹${invoice.total} is ready. Please make payment at your earliest convenience.`;
    const whatsappUrl = `https://wa.me/${invoice.patient_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const viewInvoice = (invoice: Invoice) => {
    setViewInvoiceModal(invoice);
  };

  // Package handlers
  const savePackage = async () => {
    if (!newPackage.name || newPackage.price <= 0 || newPackage.sessions <= 0) {
      alert('Please fill required fields');
      return;
    }
    try {
      if (editingPackage) {
        await axios.put(`${API_BASE}/packages/${editingPackage.id}`, newPackage, getAuthHeaders());
      } else {
        await axios.post(`${API_BASE}/packages`, newPackage, getAuthHeaders());
      }
      fetchData();
      setPackageModalOpen(false);
      setEditingPackage(null);
      setNewPackage({ name: '', sessions: 1, price: 0, discount: 0, validity_days: 30, description: '', is_active: 1 });
    } catch (err) {
      console.error('Failed to save package', err);
      alert('Failed to save package');
    }
  };

  const editPackage = (pkg: Package) => {
    setEditingPackage(pkg);
    setNewPackage(pkg);
    setPackageModalOpen(true);
  };

  const togglePackageStatus = async (id: number) => {
    const pkg = packages.find(p => p.id === id);
    if (!pkg) return;
    try {
      await axios.put(`${API_BASE}/packages/${id}`, { ...pkg, is_active: pkg.is_active ? 0 : 1 }, getAuthHeaders());
      fetchData();
    } catch (err) { console.error('Failed to toggle package', err); }
  };

  const deletePackage = async (id: number) => {
    if (confirm('Delete this package?')) {
      try {
        await axios.delete(`${API_BASE}/packages/${id}`, getAuthHeaders());
        fetchData();
      } catch (err) { console.error('Failed to delete package', err); }
    }
  };

  // Membership handlers
  const saveMembership = async () => {
    if (!newMembership.name || newMembership.price <= 0) {
      alert('Please fill required fields');
      return;
    }
    try {
      if (editingMembership) {
        await axios.put(`${API_BASE}/memberships/${editingMembership.id}`, newMembership, getAuthHeaders());
      } else {
        await axios.post(`${API_BASE}/memberships`, newMembership, getAuthHeaders());
      }
      fetchData();
      setMembershipModalOpen(false);
      setEditingMembership(null);
      setNewMembership({ name: '', price: 0, duration_months: 1, features: [], discount_on_services: 0, is_active: 1 });
      setFeatureInput('');
    } catch (err) {
      console.error('Failed to save membership', err);
      alert('Failed to save membership');
    }
  };

  const editMembership = (mem: Membership) => {
    setEditingMembership(mem);
    setNewMembership(mem);
    setMembershipModalOpen(true);
  };

  const toggleMembershipStatus = async (id: number) => {
    const mem = memberships.find(m => m.id === id);
    if (!mem) return;
    try {
      await axios.put(`${API_BASE}/memberships/${id}`, { ...mem, is_active: mem.is_active ? 0 : 1 }, getAuthHeaders());
      fetchData();
    } catch (err) { console.error('Failed to toggle membership', err); }
  };

  const deleteMembership = async (id: number) => {
    if (confirm('Delete this membership plan?')) {
      try {
        await axios.delete(`${API_BASE}/memberships/${id}`, getAuthHeaders());
        fetchData();
      } catch (err) { console.error('Failed to delete membership', err); }
    }
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setNewMembership({ ...newMembership, features: [...newMembership.features, featureInput.trim()] });
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    const currentFeatures = Array.isArray(newMembership.features) ? newMembership.features : [];
    setNewMembership({ ...newMembership, features: currentFeatures.filter((_, i) => i !== index) });
  };

  const statusStyles = {
    paid: 'bg-green-50 text-green-700',
    pending: 'bg-amber-50 text-amber-700',
    overdue: 'bg-rose-50 text-rose-700',
    cancelled: 'bg-slate-100 text-slate-500',
  };
  const statusIcons = {
    paid: <CheckCircle className="w-3.5 h-3.5" />,
    pending: <Clock className="w-3.5 h-3.5" />,
    overdue: <AlertCircle className="w-3.5 h-3.5" />,
    cancelled: <XCircle className="w-3.5 h-3.5" />,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Billing & Payments</h2>
          <p className="text-sm text-slate-500">Manage invoices, session packages, and membership plans.</p>
        </div>
        {activeTab === 'invoices' && (
          <button onClick={() => setInvoiceModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white rounded-lg text-sm font-semibold hover:bg-sky-700">
            <Plus className="w-4 h-4" /> New Invoice
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border"><div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center"><DollarSign className="w-5 h-5" /></div><p className="text-sm font-medium text-slate-500 mt-4">Total Revenue (Paid)</p><h3 className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</h3><p className="text-xs text-slate-400">{paidInvoices} paid invoices</p></div>
        <div className="bg-white p-6 rounded-2xl border"><div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600"><Clock className="w-5 h-5" /></div><p className="text-sm font-medium text-slate-500 mt-4">Pending Amount</p><h3 className="text-2xl font-bold">₹{pendingAmount.toLocaleString()}</h3></div>
        <div className="bg-white p-6 rounded-2xl border"><div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600"><AlertCircle className="w-5 h-5" /></div><p className="text-sm font-medium text-slate-500 mt-4">Overdue Amount</p><h3 className="text-2xl font-bold">₹{overdueAmount.toLocaleString()}</h3></div>
        <div className="bg-white p-6 rounded-2xl border"><div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600"><Receipt className="w-5 h-5" /></div><p className="text-sm font-medium text-slate-500 mt-4">Total Invoices</p><h3 className="text-2xl font-bold">{invoices.length}</h3></div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6">
          {['invoices', 'packages', 'memberships'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} className={`pb-3 px-1 text-sm font-medium ${activeTab === tab ? 'text-sky-600 border-b-2 border-sky-600' : 'text-slate-500'}`}>
              {tab === 'invoices' ? 'Invoices' : tab === 'packages' ? 'Session Packages' : 'Membership Plans'}
            </button>
          ))}
        </nav>
      </div>

      {/* INVOICES TAB */}
      {activeTab === 'invoices' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border p-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="Search by patient or invoice..." className="pl-9 pr-4 py-2 bg-slate-100 rounded-lg text-sm w-full" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
            <select className="px-3 py-2 bg-slate-100 rounded-lg text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="all">All Status</option><option value="paid">Paid</option><option value="pending">Pending</option><option value="overdue">Overdue</option></select>
          </div>
          <div className="bg-white rounded-2xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50"><tr><th className="text-left px-6 py-4">Invoice</th><th className="text-left px-6 py-4">Patient</th><th className="text-left px-6 py-4">Service</th><th className="text-left px-6 py-4">Amount</th><th className="text-left px-6 py-4">Status</th><th className="text-left px-6 py-4">Date</th><th></th></tr></thead>
              <tbody className="divide-y">
                {paginatedInvoices.length === 0 ? <tr><td colSpan={7} className="text-center py-10 text-slate-400">No invoices found.</td></tr> : paginatedInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4"><p className="font-semibold">{inv.invoice_number}</p><p className="text-xs text-slate-400">{inv.branch}</p></td>
                    <td className="px-6 py-4"><p className="font-semibold">{inv.patient_name}</p><p className="text-xs text-slate-400">{inv.patient_phone}</p></td>
                    <td className="px-6 py-4">{inv.service}</td>
                    <td className="px-6 py-4"><p className="font-semibold">₹{inv.total.toLocaleString()}</p><p className="text-xs text-slate-400">Tax: ₹{inv.tax}</p></td>
                    <td className="px-6 py-4"><span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[inv.status]}`}>{statusIcons[inv.status]} {inv.status}</span></td>
                    <td className="px-6 py-4">{inv.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        <button onClick={() => viewInvoice(inv)} className="p-1.5 hover:bg-slate-100 rounded-lg"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => editInvoice(inv)} className="p-1.5 hover:bg-slate-100 rounded-lg"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => downloadInvoice(inv)} className="p-1.5 hover:bg-slate-100 rounded-lg"><Download className="w-4 h-4" /></button>
                        <button onClick={() => sendInvoice(inv)} className="p-1.5 rounded-lg hover:bg-slate-100" title="Send via WhatsApp"><Send className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredInvoices.length > 0 && (
            <div className="flex justify-between items-center px-5 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
              <span className="text-sm text-slate-500">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredInvoices.length)} of {filteredInvoices.length} entries
              </span>
              <div className="flex gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 text-sm font-medium border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 transition-colors">Prev</button>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1.5 text-sm font-medium border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 transition-colors">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PACKAGES TAB */}
      {activeTab === 'packages' && (
        <div className="space-y-6">
          <div className="flex justify-end"><button onClick={() => { setEditingPackage(null); setNewPackage({ name: '', sessions: 1, price: 0, discount: 0, validity_days: 30, description: '', is_active: 1 }); setPackageModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg text-sm"><Plus className="w-4 h-4" /> Add Package</button></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map(pkg => {
              const originalPrice = Math.round(pkg.price / (1 - pkg.discount/100));
              return (
                <div key={pkg.id} className={`bg-white rounded-2xl border p-6 ${pkg.is_active ? '' : 'bg-slate-50'}`}>
                  <div className="flex justify-between"><div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center"><Package className="w-6 h-6 text-sky-600" /></div><button onClick={() => togglePackageStatus(pkg.id)} className={`text-xs px-2 py-1 rounded-full ${pkg.is_active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{pkg.is_active ? 'Active' : 'Inactive'}</button></div>
                  <h3 className="text-lg font-bold mt-4">{pkg.name}</h3>
                  <p className="text-sm text-slate-500 mb-4">{pkg.description}</p>
                  <div className="space-y-2"><div className="flex justify-between"><span>Sessions:</span><span className="font-semibold">{pkg.sessions}</span></div><div><span>Validity:</span><span className="font-semibold">{pkg.validity_days} days</span></div><div><span>Discount:</span><span className="text-green-600 font-semibold">{pkg.discount}%</span></div></div>
                  <div className="border-t pt-4 mt-4"><div className="flex justify-between items-center"><span className="text-2xl font-bold">₹{pkg.price.toLocaleString()}</span><span className="text-xs text-slate-400 line-through">₹{originalPrice.toLocaleString()}</span></div></div>
                  <div className="flex justify-end gap-2 mt-3"><button onClick={() => editPackage(pkg)} className="p-1.5 rounded-lg hover:bg-slate-100"><Edit className="w-4 h-4" /></button><button onClick={() => deletePackage(pkg.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500"><Trash2 className="w-4 h-4" /></button></div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MEMBERSHIPS TAB */}
      {activeTab === 'memberships' && (
        <div className="space-y-6">
          <div className="flex justify-end"><button onClick={() => { setEditingMembership(null); setNewMembership({ name: '', price: 0, duration_months: 1, features: [], discount_on_services: 0, is_active: 1 }); setMembershipModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg text-sm"><Plus className="w-4 h-4" /> Add Plan</button></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memberships.map(plan => (
              <div key={plan.id} className={`bg-white rounded-2xl border p-6 ${plan.is_active ? '' : 'bg-slate-50'}`}>
                <div className="flex justify-between"><div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center"><Users className="w-6 h-6 text-emerald-600" /></div><button onClick={() => toggleMembershipStatus(plan.id)} className={`text-xs px-2 py-1 rounded-full ${plan.is_active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{plan.is_active ? 'Active' : 'Inactive'}</button></div>
                <h3 className="text-lg font-bold mt-4">{plan.name}</h3>
                <p className="text-2xl font-bold text-sky-600 mt-2">₹{plan.price.toLocaleString()}<span className="text-sm text-slate-400"> / {plan.duration_months} month{plan.duration_months > 1 ? 's' : ''}</span></p>
                <div className="space-y-1 my-4">{(Array.isArray(plan.features) ? plan.features : []).map((f, idx) => <div key={idx} className="flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4 text-green-500" />{f}</div>)}</div>
                <div className="border-t pt-4"><div className="flex justify-between"><span>Discount on services:</span><span className="font-semibold text-green-600">{plan.discount_on_services}% off</span></div></div>
                <div className="flex justify-end gap-2 mt-3"><button onClick={() => editMembership(plan)} className="p-1.5 rounded-lg hover:bg-slate-100"><Edit className="w-4 h-4" /></button><button onClick={() => deleteMembership(plan.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500"><Trash2 className="w-4 h-4" /></button></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invoice View Modal */}
      {viewInvoiceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setViewInvoiceModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="border-b p-4 flex justify-between"><h3 className="text-xl font-bold">Invoice Details</h3><button onClick={() => setViewInvoiceModal(null)}><X /></button></div>
            <div className="p-6 space-y-2">
              <p><strong>Invoice No:</strong> {viewInvoiceModal.invoice_number}</p>
              <p><strong>Patient:</strong> {viewInvoiceModal.patient_name} ({viewInvoiceModal.patient_phone})</p>
              <p><strong>Service:</strong> {viewInvoiceModal.service}</p>
              <p><strong>Therapist:</strong> {viewInvoiceModal.therapist}</p>
              <p><strong>Branch:</strong> {viewInvoiceModal.branch}</p>
              <p><strong>Amount:</strong> ₹{viewInvoiceModal.amount}</p>
              <p><strong>Tax (18%):</strong> ₹{viewInvoiceModal.tax}</p>
              <p><strong>Total:</strong> ₹{viewInvoiceModal.total}</p>
              <p><strong>Status:</strong> {viewInvoiceModal.status}</p>
              <p><strong>Date:</strong> {viewInvoiceModal.date}</p>
              <p><strong>Due Date:</strong> {viewInvoiceModal.due_date}</p>
            </div>
            <div className="border-t p-4 flex justify-end"><button onClick={() => setViewInvoiceModal(null)} className="px-4 py-2 bg-slate-100 rounded-lg">Close</button></div>
          </div>
        </div>
      )}

      {/* New/Edit Invoice Modal */}
      {invoiceModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setInvoiceModalOpen(false); setEditingInvoice(null); }}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="border-b p-4 flex justify-between"><h3 className="text-xl font-bold">{editingInvoice ? 'Edit Invoice' : 'New Invoice'}</h3><button onClick={() => { setInvoiceModalOpen(false); setEditingInvoice(null); }}><X /></button></div>
            <div className="p-6 space-y-4">
              <input type="text" placeholder="Patient Name *" className="w-full border rounded-lg p-2" value={newInvoice.patientName} onChange={e => setNewInvoice({...newInvoice, patientName: e.target.value})} />
              <input type="text" placeholder="Phone" className="w-full border rounded-lg p-2" value={newInvoice.patientPhone} onChange={e => setNewInvoice({...newInvoice, patientPhone: e.target.value})} />
              <input type="text" placeholder="Service *" className="w-full border rounded-lg p-2" value={newInvoice.service} onChange={e => setNewInvoice({...newInvoice, service: e.target.value})} />
              <input type="number" placeholder="Amount (₹) *" className="w-full border rounded-lg p-2" value={newInvoice.amount || ''} onChange={e => setNewInvoice({...newInvoice, amount: parseFloat(e.target.value) || 0})} />
              <input type="date" placeholder="Date" className="w-full border rounded-lg p-2" value={newInvoice.date} onChange={e => setNewInvoice({...newInvoice, date: e.target.value})} />
              <input type="text" placeholder="Therapist" className="w-full border rounded-lg p-2" value={newInvoice.therapist} onChange={e => setNewInvoice({...newInvoice, therapist: e.target.value})} />
              <select className="w-full border rounded-lg p-2" value={newInvoice.branch} onChange={e => setNewInvoice({...newInvoice, branch: e.target.value})}><option value="">Select Branch</option>{branchesList.map(b => <option key={b} value={b}>{b}</option>)}</select>
              <select className="w-full border rounded-lg p-2" value={newInvoice.status} onChange={e => setNewInvoice({...newInvoice, status: e.target.value as any})}><option value="pending">Pending</option><option value="paid">Paid</option><option value="overdue">Overdue</option></select>
            </div>
            <div className="border-t p-4 flex justify-end gap-3"><button onClick={() => { setInvoiceModalOpen(false); setEditingInvoice(null); }} className="px-4 py-2 border rounded-lg">Cancel</button><button onClick={createInvoice} className="px-4 py-2 bg-sky-600 text-white rounded-lg">Save</button></div>
          </div>
        </div>
      )}

      {/* Package Modal */}
      {packageModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setPackageModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="border-b p-4 flex justify-between"><h3 className="text-xl font-bold">{editingPackage ? 'Edit Package' : 'Add Package'}</h3><button onClick={() => setPackageModalOpen(false)}><X /></button></div>
            <div className="p-6 space-y-4">
              <input type="text" placeholder="Package Name *" className="w-full border rounded-lg p-2" value={newPackage.name} onChange={e => setNewPackage({...newPackage, name: e.target.value})} />
              <input type="number" placeholder="Sessions *" className="w-full border rounded-lg p-2" value={newPackage.sessions} onChange={e => setNewPackage({...newPackage, sessions: parseInt(e.target.value) || 0})} />
              <input type="number" placeholder="Price *" className="w-full border rounded-lg p-2" value={newPackage.price || ''} onChange={e => setNewPackage({...newPackage, price: parseFloat(e.target.value) || 0})} />
              <input type="number" placeholder="Discount %" className="w-full border rounded-lg p-2" value={newPackage.discount} onChange={e => setNewPackage({...newPackage, discount: parseInt(e.target.value) || 0})} />
              <input type="number" placeholder="Validity (days)" className="w-full border rounded-lg p-2" value={newPackage.validity_days} onChange={e => setNewPackage({...newPackage, validity_days: parseInt(e.target.value) || 30})} />
              <textarea placeholder="Description" className="w-full border rounded-lg p-2" rows={2} value={newPackage.description} onChange={e => setNewPackage({...newPackage, description: e.target.value})} />
              <label className="flex items-center gap-2"><input type="checkbox" checked={!!newPackage.is_active} onChange={e => setNewPackage({...newPackage, is_active: e.target.checked ? 1 : 0})} /> Active</label>
            </div>
            <div className="border-t p-4 flex justify-end gap-3"><button onClick={() => setPackageModalOpen(false)}>Cancel</button><button onClick={savePackage} className="bg-sky-600 text-white px-4 py-2 rounded-lg">Save</button></div>
          </div>
        </div>
      )}

      {/* Membership Modal */}
      {membershipModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setMembershipModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="border-b p-4 flex justify-between"><h3 className="text-xl font-bold">{editingMembership ? 'Edit Plan' : 'Add Membership Plan'}</h3><button onClick={() => setMembershipModalOpen(false)}><X /></button></div>
            <div className="p-6 space-y-4">
              <input type="text" placeholder="Plan Name *" className="w-full border rounded-lg p-2" value={newMembership.name} onChange={e => setNewMembership({...newMembership, name: e.target.value})} />
              <input type="number" placeholder="Price *" className="w-full border rounded-lg p-2" value={newMembership.price || ''} onChange={e => setNewMembership({...newMembership, price: parseFloat(e.target.value) || 0})} />
              <input type="number" placeholder="Duration (months)" className="w-full border rounded-lg p-2" value={newMembership.duration_months} onChange={e => setNewMembership({...newMembership, duration_months: parseInt(e.target.value) || 1})} />
              <input type="number" placeholder="Discount on services %" className="w-full border rounded-lg p-2" value={newMembership.discount_on_services} onChange={e => setNewMembership({...newMembership, discount_on_services: parseInt(e.target.value) || 0})} />
              <div><label className="block text-sm font-medium mb-1">Features</label><div className="flex gap-2"><input type="text" placeholder="Add feature" className="flex-1 border rounded-lg p-2" value={featureInput} onChange={e => setFeatureInput(e.target.value)} /><button onClick={addFeature} type="button" className="px-3 py-2 bg-slate-100 rounded-lg">Add</button></div><div className="mt-2 space-y-1">{(Array.isArray(newMembership.features) ? newMembership.features : []).map((f, idx) => <div key={idx} className="flex justify-between bg-slate-50 p-2 rounded"><span>{f}</span><button type="button" onClick={() => removeFeature(idx)} className="text-rose-500"><X className="w-4 h-4" /></button></div>)}</div></div>
              <label className="flex items-center gap-2"><input type="checkbox" checked={!!newMembership.is_active} onChange={e => setNewMembership({...newMembership, is_active: e.target.checked ? 1 : 0})} /> Active</label>
            </div>
            <div className="border-t p-4 flex justify-end gap-3"><button onClick={() => setMembershipModalOpen(false)}>Cancel</button><button onClick={saveMembership} className="bg-sky-600 text-white px-4 py-2 rounded-lg">Save</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;