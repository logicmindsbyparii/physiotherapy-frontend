import { useState, useEffect, useRef } from 'react';
import { Bell, Menu, X, } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const Topbar = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [toastMsg, setToastMsg] = useState('');
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const [appRes, invRes] = await Promise.all([
          axios.get(`${API_BASE}/appointments`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
          axios.get(`${API_BASE}/invoices`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
        ]);
        
        const apps = appRes.data || [];
        const invs = invRes.data || [];
        
        const todayStr = new Date().toISOString().split('T')[0];
        
        const newNotifs: any[] = [];
        
        // Add notification for today's appointments
        const todaysApps = apps.filter((a: any) => a.date === todayStr);
        if (todaysApps.length > 0) {
          newNotifs.push({
            title: `New appointments today!`,
            desc: `You have ${todaysApps.length} appointment(s) scheduled for today.`,
            time: 'Just now'
          });
        }
        
        // Add notification for recently paid invoices
        const paidInvs = invs.filter((i: any) => i.status === 'paid').slice(-2);
        paidInvs.forEach((inv: any) => {
          newNotifs.push({
            title: 'Invoice Paid',
            desc: `${inv.patient_name} paid invoice #${inv.invoice_number}.`,
            time: 'Recently'
          });
        });

        if (newNotifs.length === 0) {
          newNotifs.push({ title: 'System', desc: 'Welcome back! You have no new alerts.', time: 'Just now' });
        }
        
        setNotifications(newNotifs.reverse());
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };
    fetchNotifications();

    const checkAppointments = async () => {
      try {
        const appRes = await axios.get(`${API_BASE}/appointments`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        const apps = appRes.data || [];
        const now = new Date();
        apps.forEach((apt: any) => {
          if (apt.date_time && apt.status === 'Confirmed') {
            const aptTime = new Date(apt.date_time);
            const diffMs = aptTime.getTime() - now.getTime();
            // Notify if appointment is within 15 minutes (past or future)
            if (Math.abs(diffMs) <= 15 * 60000) {
              const notified = localStorage.getItem(`notified_${apt.id}`);
              if (!notified) {
                setToastMsg(`Reminder: ${apt.patient_name || 'Patient'} has an appointment at ${aptTime.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`);
                setTimeout(() => setToastMsg(''), 10000);
                localStorage.setItem(`notified_${apt.id}`, 'true');
                setNotifications(prev => [{ title: 'Appointment Alert', desc: `${apt.patient_name || 'Patient'} is scheduled for ${aptTime.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}!`, time: 'Just now' }, ...prev]);
              }
            }
          }
        });
      } catch (e) {}
    };

    checkAppointments();
    const interval = setInterval(checkAppointments, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <>
    {/* Live Notification Popup */}
    {toastMsg && (
      <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce shadow-sky-500/20">
        <Bell className="w-5 h-5 text-sky-400" />{toastMsg}
      </div>
    )}
    
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <button className="lg:hidden text-slate-500 hover:text-slate-900">
          <Menu className="w-6 h-6" />
        </button>
        <div className="relative hidden sm:block">
          {/* Search bar removed as per requirements */}
        </div>
      </div>

      <div className="flex items-center gap-4 relative">
        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>
        
        {/* Notifications Dropdown */}
        {showNotifications && (
          <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">Notifications ({notifications.length})</h3>
              <button onClick={() => setShowNotifications(false)}><X className="w-4 h-4 text-slate-400 hover:text-slate-600" /></button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((notif, index) => (
                <div key={index} className="p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer">
                  <p className="text-sm font-medium text-slate-900">{notif.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{notif.desc}</p>
                  <p className="text-[10px] text-slate-400 mt-2">{notif.time}</p>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-slate-100 flex justify-between">
              <button onClick={() => setNotifications([])} className="text-sm font-semibold text-rose-600 hover:text-rose-700">Clear all</button>
              <button onClick={() => setShowNotifications(false)} className="text-sm font-semibold text-sky-600 hover:text-sky-700">Mark all as read</button>
            </div>
          </div>
        )}
        
        <div className="h-8 w-px bg-slate-200 mx-2"></div>
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900">{localStorage.getItem('userEmail') || 'Admin User'}</p>
            <p className="text-xs text-slate-500">Super Admin</p>
          </div>
          <img 
            src={`https://ui-avatars.com/api/?name=${localStorage.getItem('userEmail') || 'Admin'}&background=0D8ABC&color=fff`} 
            alt="Admin" 
            className="w-9 h-9 rounded-full border border-slate-200"
          />
        </div>
      </div>
    </header>
    </>
  );
};

export default Topbar;
