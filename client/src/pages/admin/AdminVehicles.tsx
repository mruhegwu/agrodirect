import React, { useEffect, useState } from 'react';
import { Truck, Snowflake, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { Vehicle } from '../../types';

export const AdminVehicles: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const data = await api.logistics.listVehicles();
      setVehicles(data || []);
    } catch (err) {
      console.error('Failed to load vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-agro-950">Fleet & Vehicle Registry</h2>
          <p className="text-xs text-charcoal-600">
            Audit compliance of refrigerated haulage trucks, delivery vans, and payload limits.
          </p>
        </div>

        <button
          onClick={loadVehicles}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-agro-200 text-charcoal-700 hover:bg-cream-50 text-xs font-semibold rounded-xl shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-agro-100 shadow-card overflow-hidden">
        <div className="p-5 border-b border-agro-50">
          <h3 className="font-bold text-agro-950 text-sm">Carrier Fleet Database</h3>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-charcoal-500">Loading vehicles...</div>
        ) : vehicles.length === 0 ? (
          <div className="p-12 text-center text-xs text-charcoal-500">No fleet vehicles recorded.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50/75 text-charcoal-600 uppercase font-semibold border-b border-agro-50">
                <tr>
                  <th className="px-6 py-4">Vehicle Type</th>
                  <th className="px-6 py-4">Plate Number</th>
                  <th className="px-6 py-4">Max Weight Payload</th>
                  <th className="px-6 py-4">Cold-Chain Unit</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-agro-50 font-medium text-charcoal-700">
                {vehicles.map(v => (
                  <tr key={v.id} className="hover:bg-cream-50/40">
                    <td className="px-6 py-4 font-bold text-agro-950 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-blue-600" />
                      <span>{v.vehicle_type.replace('_', ' ')}</span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold">{v.plate_number}</td>
                    <td className="px-6 py-4">{v.max_weight_kg.toLocaleString()} KG</td>
                    <td className="px-6 py-4">
                      {v.has_refrigeration ? (
                        <span className="inline-flex items-center gap-1 text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                          <Snowflake className="w-3 h-3 text-blue-600" />
                          Insulated
                        </span>
                      ) : (
                        <span className="text-charcoal-400">Ambient</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        v.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {v.status}
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
