import React, { useEffect, useState } from 'react';
import { Store, MapPin, CheckCircle2, Image as ImageIcon, Save, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { VerificationBadge } from '../../components/common/VerificationBadge';
import { Link } from 'react-router-dom';

const NIGERIAN_STATES = ['Abia', 'Lagos', 'Anambra', 'Enugu', 'Rivers', 'Imo', 'Ebonyi', 'Ogun', 'Oyo', 'Delta', 'Abuja (FCT)'];

export const FarmerProfile: React.FC = () => {
  const { farm, refreshUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  const [form, setForm] = useState({
    farm_name: '',
    state: 'Abia',
    lga: '',
    address: '',
    farm_size: '5 Hectares / 10,000 Bird Capacity',
    farm_type: 'Poultry & Crop Farming',
    main_products: 'Broiler Chicken, Eggs, Cassava, Maize',
    description: '',
    farm_photos: [
      'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&q=80&w=800'
    ]
  });

  useEffect(() => {
    if (farm) {
      setForm({
        farm_name: farm.farm_name || '',
        state: farm.state || 'Abia',
        lga: farm.lga || '',
        address: farm.address || '',
        farm_size: farm.farm_size || '5 Hectares / 10,000 Bird Capacity',
        farm_type: farm.farm_type || 'Poultry & Crop Farming',
        main_products: farm.main_products || 'Broiler Chicken, Eggs, Cassava, Maize',
        description: farm.description || '',
        farm_photos: farm.farm_photos?.length ? farm.farm_photos : [
          'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&q=80&w=800'
        ]
      });
    }
  }, [farm]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      // Update farm profile via auth or farm API
      await api.auth.updateProfile({ farm: form });
      setFeedback('Farm profile updated successfully!');
      await refreshUser();
    } catch (err: any) {
      alert(err.message || 'Failed to update farm profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold font-display text-agro-950">Farm Public Profile</h2>
            <VerificationBadge status={farm?.status} />
          </div>
          <p className="text-xs text-charcoal-600">
            This profile is visible to wholesale buyers, restaurants, and retail customers on your public storefront.
          </p>
        </div>

        {farm && (
          <Link
            to={`/farms/${farm.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-cream-100 hover:bg-cream-200 text-agro-900 text-xs font-bold rounded-xl transition-colors"
          >
            <span>Preview Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        )}
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
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">Registered Farm Name</label>
            <input
              type="text"
              value={form.farm_name}
              onChange={e => setForm({ ...form, farm_name: e.target.value })}
              className="w-full px-4 py-2.5 bg-cream-50 border border-agro-200 rounded-xl text-sm font-bold text-agro-950 focus:ring-2 focus:ring-agro-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">Farm Production Type</label>
            <input
              type="text"
              placeholder="e.g. Commercial Poultry, Aquaculture, Arable Crops"
              value={form.farm_type}
              onChange={e => setForm({ ...form, farm_type: e.target.value })}
              className="w-full px-4 py-2.5 bg-cream-50 border border-agro-200 rounded-xl text-sm focus:ring-2 focus:ring-agro-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">Operating State</label>
            <select
              value={form.state}
              onChange={e => setForm({ ...form, state: e.target.value })}
              className="w-full px-4 py-2.5 bg-cream-50 border border-agro-200 rounded-xl text-xs focus:ring-2 focus:ring-agro-500"
              required
            >
              {NIGERIAN_STATES.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">Local Govt. Area (LGA)</label>
            <input
              type="text"
              placeholder="e.g. Obingwa, Aba North, Umuahia South"
              value={form.lga}
              onChange={e => setForm({ ...form, lga: e.target.value })}
              className="w-full px-4 py-2.5 bg-cream-50 border border-agro-200 rounded-xl text-xs focus:ring-2 focus:ring-agro-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">Farm Scale / Capacity</label>
            <input
              type="text"
              placeholder="e.g. 5 Hectares / 20,000 birds"
              value={form.farm_size}
              onChange={e => setForm({ ...form, farm_size: e.target.value })}
              className="w-full px-4 py-2.5 bg-cream-50 border border-agro-200 rounded-xl text-xs focus:ring-2 focus:ring-agro-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">Physical Farm Location / Address</label>
          <input
            type="text"
            placeholder="Kilometer marker, community road, farm gate address"
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
            className="w-full px-4 py-2.5 bg-cream-50 border border-agro-200 rounded-xl text-sm focus:ring-2 focus:ring-agro-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">Primary Harvest Specialties</label>
          <input
            type="text"
            placeholder="e.g. Broiler Chicken, Layer Eggs, Fresh Catfish, Palm Oil, Yam Tubers"
            value={form.main_products}
            onChange={e => setForm({ ...form, main_products: e.target.value })}
            className="w-full px-4 py-2.5 bg-cream-50 border border-agro-200 rounded-xl text-sm focus:ring-2 focus:ring-agro-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">Farm Story & Quality Standards</label>
          <textarea
            rows={4}
            placeholder="Describe your agricultural background, feed standards, bio-security measures, and harvesting process..."
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-3 bg-cream-50 border border-agro-200 rounded-xl text-xs focus:ring-2 focus:ring-agro-500 leading-relaxed"
            required
          />
        </div>

        <div className="pt-4 border-t border-agro-50 flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-8 py-3 bg-agro-600 hover:bg-agro-700 disabled:bg-charcoal-200 text-white font-bold text-xs rounded-xl transition-all shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Farm Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
