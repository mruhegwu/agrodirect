import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, MapPin, Star, ShieldCheck, Search, Filter, ExternalLink, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { Farm } from '../../types';
import { VerificationBadge } from '../../components/common/VerificationBadge';
import { StatusBadge } from '../../components/common/StatusBadge';

export const AdminFarmers: React.FC = () => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadFarms = async () => {
    try {
      setLoading(true);
      const data = await api.farmers.list();
      setFarms(data || []);
    } catch (err) {
      console.error('Failed to load admin farms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFarms();
  }, []);

  const filteredFarms = farms.filter(f =>
    f.farm_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.lga.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-agro-950">Verified Producers & Farms Directory</h2>
          <p className="text-xs text-charcoal-600">
            Overview of commercial agricultural suppliers operating across Nigerian origin states.
          </p>
        </div>

        <button
          onClick={loadFarms}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-agro-200 text-charcoal-700 hover:bg-cream-50 text-xs font-semibold rounded-xl shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="bg-white rounded-2xl border border-agro-100 p-4 shadow-card">
        <div className="relative">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search farm name, state (Abia, Enugu, Rivers), LGA..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-cream-50 border border-agro-200 rounded-xl text-xs focus:ring-2 focus:ring-agro-500"
          />
        </div>
      </div>

      {/* Farms Table */}
      <div className="bg-white rounded-3xl border border-agro-100 shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-charcoal-500">Loading farms registry...</div>
        ) : filteredFarms.length === 0 ? (
          <div className="p-12 text-center text-xs text-charcoal-500">No farms match your search query.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50/75 text-charcoal-600 uppercase font-semibold border-b border-agro-50">
                <tr>
                  <th className="px-6 py-4">Farm Details</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Scale / Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Rating & Orders</th>
                  <th className="px-6 py-4 text-right">Storefront</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-agro-50 font-medium text-charcoal-700">
                {filteredFarms.map(f => (
                  <tr key={f.id} className="hover:bg-cream-50/40">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                        <Store className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-bold text-agro-950 block">{f.farm_name}</span>
                        <span className="text-[10px] text-charcoal-500 font-mono">ID: {f.id.slice(0, 8)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-charcoal-900 block">{f.lga} LGA</span>
                      <span className="text-agro-800 text-[11px]">{f.state} State</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="block font-semibold">{f.farm_type || 'Mixed Farming'}</span>
                      <span className="text-[10px] text-charcoal-500">{f.farm_size || 'Commercial Scale'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={f.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-amber-600 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{f.rating?.toFixed(1) || '5.0'}</span>
                        <span className="text-charcoal-400 text-[10px]">({f.completed_orders || 12} orders)</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/farms/${f.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-cream-100 hover:bg-cream-200 text-agro-900 rounded-xl font-semibold text-xs transition-colors"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
