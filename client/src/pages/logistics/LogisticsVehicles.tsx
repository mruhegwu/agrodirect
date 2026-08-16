import React, { useEffect, useState } from 'react';
import { Truck, Plus, Snowflake, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import { Vehicle } from '../../types';

export const LogisticsVehicles: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  const [form, setForm] = useState({
    vehicle_type: 'REFRIGERATED_TRUCK',
    plate_number: 'ABJ-894-XA',
    max_weight_kg: 5000,
    has_refrigeration: true,
    status: 'AVAILABLE'
  });

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const data = await api.logistics.listVehicles();
      setVehicles(data || []);
    } catch (err) {
      console.error('Failed to load logistics vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.logistics.addVehicle(form);
      setFeedback(`Vehicle ${form.plate_number} registered to fleet successfully.`);
      setIsModalOpen(false);
      await loadVehicles();
    } catch (err: any) {
      alert(err.message || 'Failed to add vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-agro-950">Fleet & Cold-Chain Vehicles</h2>
          <p className="text-xs text-charcoal-600">
            Manage refrigerated cargo haulers, temperature-controlled delivery vans, and payload limits.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Vehicle</span>
        </button>
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

      {/* Fleet Table */}
      <div className="bg-white rounded-3xl border border-agro-100 shadow-card overflow-hidden">
        <div className="p-5 border-b border-agro-50">
          <h3 className="font-bold text-agro-950 text-sm">Active Fleet Roster</h3>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-charcoal-500">Loading fleet registry...</div>
        ) : vehicles.length === 0 ? (
          <div className="p-12 text-center text-xs text-charcoal-500">No vehicles registered yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50/75 text-charcoal-600 uppercase font-semibold border-b border-agro-50">
                <tr>
                  <th className="px-6 py-4">Vehicle Type</th>
                  <th className="px-6 py-4">Plate Number</th>
                  <th className="px-6 py-4">Payload Capacity</th>
                  <th className="px-6 py-4">Refrigeration</th>
                  <th className="px-6 py-4">Operational Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-agro-50 font-medium text-charcoal-700">
                {vehicles.map(v => (
                  <tr key={v.id} className="hover:bg-cream-50/40">
                    <td className="px-6 py-4 flex items-center gap-2.5 font-bold text-agro-950">
                      <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
                        <Truck className="w-4 h-4" />
                      </div>
                      <span>{v.vehicle_type.replace('_', ' ')}</span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-charcoal-900">
                      {v.plate_number}
                    </td>
                    <td className="px-6 py-4 font-semibold">{v.max_weight_kg.toLocaleString()} KG</td>
                    <td className="px-6 py-4">
                      {v.has_refrigeration ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
                          <Snowflake className="w-3 h-3 text-blue-600" />
                          Cold-Chain Certified
                        </span>
                      ) : (
                        <span className="text-charcoal-400">Ambient Dry Cargo</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        v.status === 'AVAILABLE'
                          ? 'bg-emerald-50 text-emerald-700'
                          : v.status === 'IN_TRANSIT'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-amber-50 text-amber-700'
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

      {/* Register Vehicle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-agro-100">
            <h3 className="text-lg font-bold font-display text-agro-950 mb-1">
              Add Vehicle to Fleet
            </h3>
            <p className="text-xs text-charcoal-600 mb-6">
              Register commercial vehicle for inter-state agricultural transport.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">Vehicle Classification</label>
                <select
                  value={form.vehicle_type}
                  onChange={e => setForm({ ...form, vehicle_type: e.target.value })}
                  className="w-full px-4 py-2.5 bg-cream-50 border border-agro-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                >
                  <option value="REFRIGERATED_TRUCK">Refrigerated Heavy Truck (5 - 15 Tonne)</option>
                  <option value="TRUCK">Standard Heavy Cargo Truck (10 Tonne)</option>
                  <option value="VAN">Cold-Chain Delivery Van (2 - 3 Tonne)</option>
                  <option value="MOTORCYCLE">Rapid City Dispatch Motorcycle</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">Plate Number (FRSC)</label>
                <input
                  type="text"
                  placeholder="e.g. LAG-482-XY"
                  value={form.plate_number}
                  onChange={e => setForm({ ...form, plate_number: e.target.value })}
                  className="w-full px-4 py-2.5 bg-cream-50 border border-agro-200 rounded-xl font-mono font-bold text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">Max Payload Capacity (KG)</label>
                <input
                  type="number"
                  min="50"
                  value={form.max_weight_kg}
                  onChange={e => setForm({ ...form, max_weight_kg: parseInt(e.target.value) || 100 })}
                  className="w-full px-4 py-2.5 bg-cream-50 border border-agro-200 rounded-xl text-sm"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="has_refrigeration"
                  checked={form.has_refrigeration}
                  onChange={e => setForm({ ...form, has_refrigeration: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <label htmlFor="has_refrigeration" className="text-xs text-charcoal-700 font-medium">
                  Equipped with Temperature-Controlled Cold Storage
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-charcoal-600 hover:bg-cream-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-charcoal-200 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  {submitting ? 'Registering...' : 'Register Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
