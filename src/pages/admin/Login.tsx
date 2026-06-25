import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Mail, Lock } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
      const { token, clinicId } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('clinicId', clinicId);
      localStorage.setItem('userEmail', email); // Store the email for Topbar
      navigate('/');
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.response) {
        setError(err.response.data?.message || 'Login failed');
      } else if (err.request) {
        setError('Cannot connect to backend. Make sure it is running on port 5000.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        <div className="text-center mb-8">
          <Activity className="h-12 w-12 text-sky-600 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-slate-900">PhysioAdmin</h1>
          <p className="text-slate-500 mt-1">Clinic Management Platform</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          {error && <div className="text-sm text-rose-600 text-center">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-sky-600 hover:text-sky-500">
              Register your clinic
            </Link>
          </p>
        </div>
        <p className="text-xs text-slate-400 text-center mt-6">
          Demo: demo@physiocare.com / demo123
        </p>
      </div>
    </div>
  );
};

export default Login;