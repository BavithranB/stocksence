import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, LogIn, AlertCircle, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Login = () => {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleFillDemo = (email, password) => {
    setForm({ email, password });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(form);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please verify credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-100">
            <span className="text-white text-lg font-bold">SS</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">STOCKSENSE</h1>
          <p className="text-sm text-gray-500 mt-1">Intelligent Inventory Management</p>
        </div>

        {/* Card */}
        <div className="card p-8 shadow-sm border border-gray-100 rounded-xl bg-white">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">Sign in</h2>
            <p className="text-sm text-gray-500 mt-1">Enter your credentials to access your account.</p>
          </div>

          {/* Quick Demo Credentials Banner */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 mb-6">
            <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-2">
              Demo Credentials (Click to fill)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('admin@stocksense.com', 'admin123')}
                className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-white text-emerald-700 border border-emerald-300 rounded-lg hover:bg-emerald-50 transition-colors shadow-2xs"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('staff@stocksense.com', 'staff123')}
                className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-white text-emerald-700 border border-emerald-300 rounded-lg hover:bg-emerald-50 transition-colors shadow-2xs"
              >
                <UserCheck className="w-3.5 h-3.5" />
                Staff
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email address
                </label>
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="admin@stocksense.com"
                  className="input"
                  autoComplete="email"
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="input pr-10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center mt-6"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-sm text-gray-500 text-center mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-emerald-600 font-medium hover:text-emerald-700 transition-colors">
              Create account
            </Link>
          </p>
        </div>

        <p className="text-xs text-center text-gray-400 mt-6">
          © {new Date().getFullYear()} STOCKSENSE. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
