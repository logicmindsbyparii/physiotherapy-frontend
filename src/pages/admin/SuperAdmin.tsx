import { useState, useEffect } from 'react';
import axios from 'axios';
import { Building, Users, DollarSign, Activity } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const SuperAdmin = () => {
  const [clinics, setClinics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Simple "super admin" auth bypass or special token for demo purposes
  // In a real SaaS, super admins would have a separate login and JWT
  useEffect(() => {
    const fetchSuperAdminData = async () => {
      try {
        setLoading(true);
        // We will need a new endpoint for this: GET /api/super-admin/clinics
        const res = await axios.get(`${API_BASE}/super-admin/clinics`);
        setClinics(res.data);
      } catch (err) {
        console.error('Failed to fetch super admin data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSuperAdminData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading super admin dashboard...</div>;
  }

  const totalClinics = clinics.length;
  const totalRevenue = clinics.reduce((sum, c) => sum + (c.total_revenue || 0), 0);
  const totalPatients = clinics.reduce((sum, c) => sum + (c.patient_count || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">SaaS Platform Overview</h1>
            <p className="text-slate-500 mt-1">Super Admin Dashboard - Monitor all registered clinics and global metrics.</p>
          </div>
          <div className="bg-sky-100 text-sky-800 px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2">
            <Activity className="w-4 h-4" /> System Online
          </div>
        </div>

        {/* Global Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <Building className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Active Clinics</p>
              <h2 className="text-3xl font-bold text-slate-900">{totalClinics}</h2>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <DollarSign className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Global Revenue Processed</p>
              <h2 className="text-3xl font-bold text-slate-900">₹{totalRevenue.toLocaleString()}</h2>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Patients Managed</p>
              <h2 className="text-3xl font-bold text-slate-900">{totalPatients}</h2>
            </div>
          </div>
        </div>

        {/* Clinics Table */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-slate-900">Registered Clinics</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b">
                <tr>
                  <th className="px-6 py-4">Clinic ID</th>
                  <th className="px-6 py-4">Clinic Name</th>
                  <th className="px-6 py-4">Admin Email</th>
                  <th className="px-6 py-4">Total Revenue</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clinics.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-mono text-slate-500">#{c.id.toString().padStart(4, '0')}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{c.clinic_name || 'Unnamed Clinic'}</td>
                    <td className="px-6 py-4 text-slate-600">{c.email}</td>
                    <td className="px-6 py-4 font-semibold text-emerald-600">₹{(c.total_revenue || 0).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{new Date(c.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdmin;
