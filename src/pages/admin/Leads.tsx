import { useState, useEffect } from 'react';
import { Search, Plus, MoreVertical, Phone, Mail, Edit, Trash2, X } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

interface Lead {
  id: number;
  name: string;
  phone: string;
  email: string;
  service: string;
  source: string;
  stage: string;
  date: string;
}

const stages = ['New', 'Follow-up', 'Interested', 'Consultation Booked', 'Converted', 'Closed'];
const sources = ['WhatsApp', 'Website', 'Instagram', 'Referral', 'Google'];
const stageStyles: Record<string, string> = {
  'New': 'bg-slate-100 text-slate-700',
  'Follow-up': 'bg-blue-50 text-blue-700',
  'Interested': 'bg-amber-50 text-amber-700',
  'Consultation Booked': 'bg-purple-50 text-purple-700',
  'Converted': 'bg-green-50 text-green-700',
  'Closed': 'bg-rose-50 text-rose-700',
};

const Leads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', service: '', source: 'WhatsApp', stage: 'New', date: '' });
  const [dropdownId, setDropdownId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/leads`, getAuthHeaders());
      setLeads(res.data);
    } catch (err) {
      console.error('Failed to fetch leads', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const getStageCount = (stage: string) => leads.filter(l => l.stage === stage).length;
  const getPercentage = (stage: string) => leads.length ? (getStageCount(stage) / leads.length) * 100 : 0;

  const filtered = leads.filter(lead => {
    const matchSearch = (lead.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || (lead.phone || '').includes(searchTerm);
    const matchStage = stageFilter === 'All' || lead.stage === stageFilter;
    const matchSource = sourceFilter === 'All' || lead.source === sourceFilter;
    return matchSearch && matchStage && matchSource;
  });

  const openModal = (lead?: Lead) => {
    if (lead) {
      setEditingLead(lead);
      setFormData({ name: lead.name, phone: lead.phone, email: lead.email, service: lead.service, source: lead.source, stage: lead.stage, date: lead.date });
    } else {
      setEditingLead(null);
      setFormData({ name: '', phone: '', email: '', service: '', source: 'WhatsApp', stage: 'New', date: new Date().toISOString().split('T')[0] });
    }
    setModalOpen(true);
    setDropdownId(null);
  };

  const saveLead = async () => {
    if (!formData.name || !formData.phone || !formData.service) {
      alert('Please fill required fields');
      return;
    }
    try {
      if (editingLead) {
        await axios.put(`${API_BASE}/leads/${editingLead.id}`, formData, getAuthHeaders());
      } else {
        await axios.post(`${API_BASE}/leads`, formData, getAuthHeaders());
      }
      fetchLeads();
      setModalOpen(false);
    } catch (err) {
      console.error('Failed to save lead', err);
      alert('Failed to save lead');
    }
  };

  const deleteLead = async (id: number) => {
    if (confirm('Delete this lead?')) {
      try {
        await axios.delete(`${API_BASE}/leads/${id}`, getAuthHeaders());
        fetchLeads();
        setDropdownId(null);
      } catch (err) {
        console.error('Failed to delete lead', err);
        alert('Failed to delete lead');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h2 className="text-2xl font-bold text-slate-900">CRM / Leads</h2><p className="text-sm text-slate-500">Track, manage, and convert your clinic inquiries (auto‑saved).</p></div>
        <button onClick={() => openModal()} className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white rounded-lg"><Plus className="w-4 h-4" /> Add Lead</button>
      </div>

      {/* Pipeline Summary */}
      <div className="grid grid-cols-5 gap-4 overflow-x-auto">
        {stages.slice(0,5).map(stage => (
          <div key={stage} className="bg-white rounded-xl border p-4 text-center min-w-[100px]">
            <p className="text-2xl font-bold">{getStageCount(stage)}</p>
            <p className="text-xs text-slate-500">{stage}</p>
            <div className="mt-2 h-1 bg-slate-100 rounded-full"><div className="h-full bg-sky-500 rounded-full" style={{ width: `${getPercentage(stage)}%` }}></div></div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border p-4 flex flex-wrap gap-4">
        <div className="relative flex-1"><Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" /><input type="text" placeholder="Search leads by name, phone..." className="w-full pl-9 pr-4 py-2 bg-slate-100 rounded-lg" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
        <select className="px-3 py-2 bg-slate-100 rounded-lg" value={stageFilter} onChange={e => setStageFilter(e.target.value)}><option value="All">All Stages</option>{stages.map(s => <option key={s} value={s}>{s}</option>)}</select>
        <select className="px-3 py-2 bg-slate-100 rounded-lg" value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}><option value="All">All Sources</option>{sources.map(s => <option key={s} value={s}>{s}</option>)}</select>
      </div>

      {/* Scrollable Table */}
      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[500px]">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 sticky top-0">
              <tr><th className="px-6 py-4 text-left">Lead</th><th>Contact</th><th>Service</th><th>Source</th><th>Stage</th><th>Date</th><th></th></tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(lead => (
                <tr key={lead.id} className="hover:bg-slate-50 relative">
                  <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center font-bold">{lead.name.charAt(0)}</div>{lead.name}</div></td>
                  <td className="px-6 py-4"><div><Phone className="w-3 h-3 inline mr-1" />{lead.phone}</div><div className="text-xs text-slate-400"><Mail className="w-3 h-3 inline mr-1" />{lead.email}</div></td>
                  <td className="px-6 py-4">{lead.service}</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 rounded text-xs">{lead.source}</span></td>
                  <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${stageStyles[lead.stage]}`}>{lead.stage}</span></td>
                  <td className="px-6 py-4 text-xs">{lead.date}</td>
                  <td className="px-6 py-4 relative">
                    <button onClick={() => setDropdownId(dropdownId === lead.id ? null : lead.id)}><MoreVertical className="w-4 h-4" /></button>
                    {dropdownId === lead.id && (
                      <div className="absolute right-6 top-12 bg-white border rounded shadow-lg z-10 w-32">
                        <button onClick={() => openModal(lead)} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2"><Edit className="w-3 h-3" /> Edit</button>
                        <button onClick={() => deleteLead(lead.id)} className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-slate-50 flex items-center gap-2"><Trash2 className="w-3 h-3" /> Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal with Labels */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">{editingLead ? 'Edit Lead' : 'Add Lead'}</h3><button onClick={() => setModalOpen(false)}><X /></button></div>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium mb-1">Full Name *</label><input type="text" className="w-full border rounded-lg p-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
              <div><label className="block text-sm font-medium mb-1">Phone Number *</label><input type="text" className="w-full border rounded-lg p-2" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
              <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" className="w-full border rounded-lg p-2" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
              <div><label className="block text-sm font-medium mb-1">Service Interest *</label><input type="text" className="w-full border rounded-lg p-2" value={formData.service} onChange={e => setFormData({...formData, service: e.target.value})} /></div>
              <div><label className="block text-sm font-medium mb-1">Source</label><select className="w-full border rounded-lg p-2" value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})}>{sources.map(s => <option key={s}>{s}</option>)}</select></div>
              <div><label className="block text-sm font-medium mb-1">Stage</label><select className="w-full border rounded-lg p-2" value={formData.stage} onChange={e => setFormData({...formData, stage: e.target.value})}>{stages.map(s => <option key={s}>{s}</option>)}</select></div>
            </div>
            <div className="flex justify-end gap-3 mt-6"><button onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded-lg">Cancel</button><button onClick={saveLead} className="px-4 py-2 bg-sky-600 text-white rounded-lg">Save</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;