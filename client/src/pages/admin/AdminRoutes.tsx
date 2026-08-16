import React, { useEffect, useState } from 'react';
import { Compass, MapPin, Plus, CheckCircle2, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { LogisticsRoute } from '../../types';

export const AdminRoutes: React.FC = () => {
  const [routes, setRoutes] = useState<LogisticsRoute[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      const data = await api.logistics.listRoutes();
      setRoutes(data || []);
    } catch (err) {
      console.error('Failed to load routes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-agro-950">Interstate Freight Pricing Matrix</h2>
          <p className="text-xs text-charcoal-600">
            Configure state corridors, weight tariffs, cold-chain multipliers, and transit guarantees.
          </p>
        </div>

        <button
          onClick={loadRoutes}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-agro-200 text-charcoal-700 hover:bg-cream-50 text-xs font-semibold rounded-xl shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-agro-100 shadow-card overflow-hidden">
        <div className="p-5 border-b border-agro-50">
          <h3 className="font-bold text-agro-950 text-sm">Active Freight Tariff Matrix</h3>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-charcoal-500">Loading routes...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50/75 text-charcoal-600 uppercase font-semibold border-b border-agro-50">
                <tr>
                  <th className="px-6 py-4">Origin Hub</th>
                  <th className="px-6 py-4">Destination Hub</th>
                  <th className="px-6 py-4">Base Freight Fee</th>
                  <th className="px-6 py-4">Per KG Tariff</th>
                  <th className="px-6 py-4">Cold-Chain Surcharge</th>
                  <th className="px-6 py-4">Transit Days</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-agro-50 font-medium text-charcoal-700">
                {routes.map(r => (
                  <tr key={r.id} className="hover:bg-cream-50/40">
                    <td className="px-6 py-4 font-bold text-agro-950">{r.origin_state} State</td>
                    <td className="px-6 py-4 font-bold text-agro-950">{r.destination_state} State</td>
                    <td className="px-6 py-4">₦{r.base_price.toLocaleString()}</td>
                    <td className="px-6 py-4">₦{r.per_kg_rate.toLocaleString()}/kg</td>
                    <td className="px-6 py-4 text-blue-700 font-semibold">+₦{r.cold_chain_surcharge.toLocaleString()}</td>
                    <td className="px-6 py-4">{r.estimated_transit_days} Day(s)</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        r.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-charcoal-100 text-charcoal-500'
                      }`}>
                        {r.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
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
