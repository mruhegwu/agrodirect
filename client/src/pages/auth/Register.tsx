import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Sprout, Lock, Mail, Phone, User as UserIcon, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const [searchParams] = useSearchParams();
  const initialRole = (searchParams.get('role') as UserRole) || 'CUSTOMER';

  const [role, setRole] = useState<UserRole>(initialRole);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+234');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await register({
        full_name: fullName,
        email,
        phone,
        password,
        role
      });
      if (role === 'FARMER') {
        navigate('/farmer/verification');
      } else if (role === 'LOGISTICS_PROVIDER') {
        navigate('/logistics');
      } else {
        navigate('/shop');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
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
          <h2 className="text-xl font-bold text-agro-900">Create your account</h2>
          <p className="text-xs text-charcoal-400">Join Nigeria's trusted agricultural network</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-cream-100 p-1 rounded-xl text-xs font-semibold text-charcoal-600 border border-gray-200">
          <button
            type="button"
            onClick={() => setRole('CUSTOMER')}
            className={`py-2 rounded-lg transition-all ${
              role === 'CUSTOMER' ? 'bg-white text-agro-900 shadow-xs font-bold' : 'hover:text-agro-600'
            }`}
          >
            Buyer
          </button>
          <button
            type="button"
            onClick={() => setRole('FARMER')}
            className={`py-2 rounded-lg transition-all ${
              role === 'FARMER' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'hover:text-emerald-600'
            }`}
          >
            Farmer
          </button>
          <button
            type="button"
            onClick={() => setRole('LOGISTICS_PROVIDER')}
            className={`py-2 rounded-lg transition-all ${
              role === 'LOGISTICS_PROVIDER' ? 'bg-white text-blue-800 shadow-xs font-bold' : 'hover:text-blue-600'
            }`}
          >
            Logistics
          </button>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-charcoal-700 mb-1">Full Legal Name</label>
            <div className="relative">
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Chief Emeka Nwachukwu"
                className="w-full pl-9 pr-3.5 py-2.5 bg-cream-100 border border-gray-200 rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-agro-500"
              />
              <UserIcon className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-charcoal-700 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full pl-9 pr-3.5 py-2.5 bg-cream-100 border border-gray-200 rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-agro-500"
              />
              <Mail className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-charcoal-700 mb-1">Phone Number (WhatsApp Active)</label>
            <div className="relative">
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 803 123 4567"
                className="w-full pl-9 pr-3.5 py-2.5 bg-cream-100 border border-gray-200 rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-agro-500 font-mono"
              />
              <Phone className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-charcoal-700 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-9 pr-3.5 py-2.5 bg-cream-100 border border-gray-200 rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-agro-500"
              />
              <Lock className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-agro-600 hover:bg-agro-700 text-white font-bold text-sm py-3.5 rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 mt-2"
          >
            <span>{isLoading ? 'Creating Account...' : `Register as ${role.replace(/_/g, ' ')}`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-charcoal-500 border-t border-gray-100 pt-4">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-agro-700 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
