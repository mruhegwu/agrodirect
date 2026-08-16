import React, { useEffect, useState } from 'react';
import { Compass, MapPin, Calculator, Snowflake, Clock, CheckCircle2, Plus } from 'lucide-react';
import { api } from '../../services/api';
import { LogisticsRoute } from '../../types';

export const LogisticsRoutes: React.FC = () => {
  const [routes, setRoutes] = useState<LogisticsRoute[]>([]);
  const [loading, setLoading] = useState(true);

  // Rate calculator test
  const [calcOrigin, setCalcOrigin] = useState('Abia');
  const [calcDest, setCalcDest] = useState('Lagos');
  const [calcWeight, setCalcWeight] = useState(25);
  const [calcCold, setCalcCold] = useState(true);
  const [calcResult, setCalcResult] = useState<any>(null);
  const [calculating, setCalculating] = useState(false);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      const data = await api.logistics.listRoutes();
      setRoutes(data || []);
    } catch (err) {
      console.error('Failed to load logistics routes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  const handleCalculate = async () => {
    try {
      setCalculating(true);
      const res = await api.logistics.calculateRate({
        origin_state: calcOrigin,
        destination_state: calcDest,
        total_weight_kg: calcWeight,
        requires_cold_chain: calcCold
      });
      setCalcResult(res);
    } catch (err: any) {
      alert(err.message || 'Could not calculate logistics rate');
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-agro-950">Interstate Logistics Routes & Rates</h2>
        <p className="text-xs text-charcoal-600">
          Configured state-to-state freight corridors, per-kilogram weight multipliers, and cold-chain surcharges.
        </p>
      </div>

      {/* Interactive Logistics Rate Estimator */}
      <div className="bg-gradient-to-br from-blue-900 to-agro-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <Calculator className="w-5 h-5 text-blue-400" />
          <h3 className="text-base font-bold font-display">Interstate Rate Calculator Simulator</h3>
        </div>
        <p className="text-xs text-blue-200 mb-6">
          Test real-time automated freight tariff calculations matching the exact pricing engine used during customer checkout.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-[11px] text-blue-200 font-semibold mb-1">Origin State</label>
            <select
              value={calcOrigin}
              onChange={e => setCalcOrigin(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="Abia" className="text-charcoal-900">Abia State</option>
              <option value="Enugu" className="text-charcoal-900">Enugu State</option>
              <option value="Rivers" className="text-charcoal-900">Rivers State</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-blue-200 font-semibold mb-1">Destination State</label>
            <select
              value={calcDest}
              onChange={e => setCalcDest(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="Lagos" className="text-charcoal-900">Lagos State</option>
              <option value="Abuja" className="text-charcoal-900">Abuja (FCT)</option>
              <option value="Rivers" className="text-charcoal-900">Rivers State</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-blue-200 font-semibold mb-1">Cargo Weight (KG)</label>
            <input
              type="number"
              min="1"
              value={calcWeight}
              onChange={e => setCalcWeight(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-400 font-bold"
            />
          </div>

          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-2 text-xs text-blue-100 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={calcCold}
                onChange={e => setCalcCold(e.target.checked)}
                className="rounded text-blue-500 focus:ring-blue-400 h-4 w-4"
              />
              <span>Cold-Chain Required</span>
            </label>
            <button
              onClick={handleCalculate}
              disabled={calculating}
              className="w-full py-2 bg-blue-500 hover:bg-blue-600 font-bold text-xs rounded-xl transition-colors shadow-sm"
            >
              {calculating ? 'Calculating...' : 'Calculate Tariff'}
            </button>
          </div>
        </div>

        {calcResult && (
          <div className="p-4 bg-white/10 rounded-2xl border border-white/15 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div>
              <span className="text-blue-200 block text-[11px]">Total Calculated Logistics Cost:</span>
              <span className="text-2xl font-bold font-display text-white">
                ₦{calcResult.total_logistics_cost?.toLocaleString()}
              </span>
            </div>
            <div className="text-blue-200 text-[11px] space-y-0.5">
              <div>Base Rate: <strong>₦{calcResult.base_price?.toLocaleString()}</strong></div>
              <div>Weight Charge ({calcWeight}kg): <strong>₦{calcResult.weight_charge?.toLocaleString()}</strong></div>
              <div>Cold-Chain Surcharge: <strong>₦{calcResult.cold_chain_surcharge?.toLocaleString()}</strong></div>
            </div>
            <div className="text-right">
              <span className="text-blue-200 text-[11px] block">Transit Estimate:</span>
              <span className="font-bold text-white text-xs">{calcResult.estimated_transit_days} Business Day(s)</span>
            </div>
          </div>
        )}
      </div>

      {/* Routes Master Table */}
      <div className="bg-white rounded-3xl border border-agro-100 shadow-card overflow-hidden">
        <div className="p-5 border-b border-agro-50 flex items-center justify-between">
          <h3 className="font-bold text-agro-950 text-sm">State Corridor Routing Table</h3>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-charcoal-500">Loading corridors...</div>
        ) : routes.length === 0 ? (
          <div className="p-12 text-center text-xs text-charcoal-500">No routes registered.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50/75 text-charcoal-600 uppercase font-semibold border-b border-agro-50">
                <tr>
                  <th className="px-6 py-4">Origin Hub</th>
                  <th className="px-6 py-4">Destination Hub</th>
                  <th className="px-6 py-4">Base Freight</th>
                  <th className="px-6 py-4">Rate / KG</th>
                  <th className="px-6 py-4">Cold-Chain Extra</th>
                  <th className="px-6 py-4">Transit Time</th>
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
                    <td className="px-6 py-4 text-blue-700 font-semibold">
                      +₦{r.cold_chain_surcharge.toLocaleString()}
                    </td>
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
