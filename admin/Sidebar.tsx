import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, Users, UserCircle,
  Building2, Receipt, BarChart3, Settings, LogOut, Activity, UserPlus, CheckSquare
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard',      icon: LayoutDashboard, path: '/' },
  { name: 'Patients',       icon: UserPlus,        path: '/patients' },
  { name: 'Appointments',   icon: CalendarDays,    path: '/appointments' },
  { name: 'Daily Check',    icon: CheckSquare,     path: '/attendance' },
  { name: 'Staff',          icon: UserCircle,      path: '/staff' },
  { name: 'Branches',       icon: Building2,       path: '/branches' },
  { name: 'Billings',       icon: Receipt,         path: '/billing' },
  { name: 'Reports',        icon: BarChart3,       path: '/reports' },
  { name: 'Settings',       icon: Settings,        path: '/settings' },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800">
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2 text-white mb-8">
          <Activity className="h-8 w-8 text-sky-500" />
          <span className="text-xl font-bold tracking-tight">PhysioAdmin</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-sky-500 text-white' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors w-full text-left text-rose-400"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;