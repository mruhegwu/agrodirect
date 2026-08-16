import React, { useState } from 'react';
import { User as UserIcon, Phone, Mail, Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const CustomerProfile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.auth.updateProfile({
        full_name: fullName,
        phone
      });
      await refreshUser();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-agro-950 font-display">Profile & Settings</h1>
        <p className="text-xs text-charcoal-500 mt-1">Manage your account information and contact numbers.</p>
      </div>

      <div className="bg-white rounded-3xl border border-agro-100 p-8 shadow-card space-y-6">
        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Profile updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-charcoal-700 mb-1">Email Address (Read-only)</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-charcoal-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block font-bold text-charcoal-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-cream-100 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-agro-500"
            />
          </div>

          <div>
            <label className="block font-bold text-charcoal-700 mb-1">Phone Number</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-cream-100 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-charcoal-900 font-mono focus:outline-none focus:ring-2 focus:ring-agro-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-agro-600 hover:bg-agro-700 text-white font-bold text-xs px-6 py-3 rounded-full shadow-md transition-all flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
