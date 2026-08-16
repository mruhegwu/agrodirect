import React, { useState } from 'react';
import { Building2, Phone, Mail, MapPin, ShieldCheck, CheckCircle2, Save } from 'lucide-react';

export const LogisticsProfile: React.FC = () => {
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  const [profile, setProfile] = useState({
    company_name: 'AgroHaul Interstate Logistics Ltd',
    rc_number: 'RC-1849204',
    contact_phone: '+234 803 555 7788',
    contact_email: 'dispatch@agrohaul.ng',
    headquarters: 'Aba Hub: 42 Factory Road, Aba, Abia State',
    lagos_hub: 'Lagos Hub: 18 Commercial Avenue, Yaba / Ikeja Cargo Park, Lagos State',
    coverage_states: ['Abia', 'Lagos', 'Anambra', 'Enugu', 'Rivers', 'Imo', 'Abuja (FCT)'],
    refrigeration_certified: true
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setFeedback('Logistics carrier credentials and hub information updated.');
    }, 400);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Building2 className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold font-display text-agro-950">Logistics Carrier Profile & Hubs</h2>
        </div>
        <p className="text-xs text-charcoal-600">
          Manage corporate haulage licensing, dispatch contact points, and inter-state warehouse hubs.
        </p>
      </div>

      {feedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback('')} className="text-emerald-700 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-agro-100 p-6 sm:p-8 shadow-card space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">Registered Haulage Company Name</label>
            <input
              type="text"
              value={profile.company_name}
              onChange={e => setProfile({ ...profile, company_name: e.target.value })}
              className="w-full px-4 py-2.5 bg-cream-50 border border-agro-200 rounded-xl text-sm font-bold text-agro-950 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">CAC Registration (RC Number)</label>
            <input
              type="text"
              value={profile.rc_number}
              onChange={e => setProfile({ ...profile, rc_number: e.target.value })}
              className="w-full px-4 py-2.5 bg-cream-50 border border-agro-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">Dispatch Hotline Phone</label>
            <input
              type="tel"
              value={profile.contact_phone}
              onChange={e => setProfile({ ...profile, contact_phone: e.target.value })}
              className="w-full px-4 py-2.5 bg-cream-50 border border-agro-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">Dispatch Email</label>
            <input
              type="email"
              value={profile.contact_email}
              onChange={e => setProfile({ ...profile, contact_email: e.target.value })}
              className="w-full px-4 py-2.5 bg-cream-50 border border-agro-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">Abia State Origin Freight Hub</label>
          <input
            type="text"
            value={profile.headquarters}
            onChange={e => setProfile({ ...profile, headquarters: e.target.value })}
            className="w-full px-4 py-2.5 bg-cream-50 border border-agro-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">Lagos State Destination Freight Hub</label>
          <input
            type="text"
            value={profile.lagos_hub}
            onChange={e => setProfile({ ...profile, lagos_hub: e.target.value })}
            className="w-full px-4 py-2.5 bg-cream-50 border border-agro-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="pt-4 border-t border-agro-50 flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-charcoal-200 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Carrier Information'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
