import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Sprout, Lock, Mail, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { useAuth, DEMO_PERSONAS } from '../../context/AuthContext';

export const Login: React.FC = () => {
  const { login, switchPersona } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirectUrl = searchParams.get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login({ email, password });
      navigate(redirectUrl);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = async (key: keyof typeof DEMO_PERSONAS) => {
    const p = DEMO_PERSONAS[key];
    setEmail(p.email);
    setPassword(p.password);
    setIsLoading(true);
    try {
      await switchPersona(key);
      navigate(p.role === 'FARMER' ? '/farmer' : p.role === 'SUPER_ADMIN' ? '/admin' : p.role === 'LOGISTICS_PROVIDER' ? '/logistics' : '/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-agro-100 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-agro-600 flex items-center justify-center text-white">
              <Sprout className="w-6 h-6" />
            </div>
            <span className="text-2xl font-extrabold text-agro-950 font-display">
              Agro<span className="text-harvest-400">Direct</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-agro-900">Sign in to your account</h2>
          <p className="text-xs text-charcoal-400">Access your orders, dashboard, and agricultural wallets</p>
        </div>

        {/* Demo Fast Login Buttons */}
        <div className="bg-cream-100 p-3.5 rounded-2xl border border-agro-100 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-agro-700 block text-center">
            ⚡ Quick Demo Logins (1-Click)
          </span>
          <div className="grid grid-cols-2 gap-1.5 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => handleDemoFill('CUSTOMER')}
              className="p-2 bg-white hover:bg-agro-50 border border-gray-200 rounded-lg text-left text-charcoal-800 transition-colors"
            >
              🛍️ Lagos Customer
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('FARMER_OBEGU')}
              className="p-2 bg-white hover:bg-agro-50 border border-gray-200 rounded-lg text-left text-emerald-800 transition-colors"
            >
              🌱 Obegu Farms (Abia)
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('LOGISTICS')}
              className="p-2 bg-white hover:bg-agro-50 border border-gray-200 rounded-lg text-left text-blue-800 transition-colors"
            >
              🚚 SwiftAgro Fleet
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('ADMIN')}
              className="p-2 bg-white hover:bg-agro-50 border border-gray-200 rounded-lg text-left text-purple-800 transition-colors"
            >
              🛡️ Super Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-charcoal-700 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@agrodirect.ng"
                className="w-full pl-9 pr-3.5 py-2.5 bg-cream-100 border border-gray-200 rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-agro-500"
              />
              <Mail className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-charcoal-700 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 bg-cream-100 border border-gray-200 rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-agro-500"
              />
              <Lock className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-agro-600 hover:bg-agro-700 text-white font-bold text-sm py-3.5 rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
          >
            <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-charcoal-500 border-t border-gray-100 pt-4">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-agro-700 hover:underline">
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
};
