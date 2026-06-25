import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Patients from './pages/admin/Patients';
import Appointments from './pages/admin/Appointments';
import Attendance from './pages/admin/Attendance';
import Leads from './pages/admin/Leads';
import Staff from './pages/admin/Staff';
import Branches from './pages/admin/Branches';
import Billing from './pages/admin/Billing';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';
import Login from './pages/admin/Login';
import Register from './pages/admin/Register';
import SuperAdmin from './pages/admin/SuperAdmin';
import PrivateRoute from './components/admin/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/super-admin" element={<SuperAdmin />} />

        <Route path="/" element={
          <PrivateRoute>
            <AdminLayout />
          </PrivateRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="patients" element={<Patients />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="leads" element={<Leads />} />
          <Route path="staff" element={<Staff />} />
          <Route path="branches" element={<Branches />} />
          <Route path="billing" element={<Billing />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;