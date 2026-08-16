import React, { useEffect, useState } from 'react';
import { Wallet, CheckCircle2, AlertOctagon, Clock, RefreshCw, DollarSign } from 'lucide-react';
import { api } from '../../services/api';
import { Settlement } from '../../types';

export const AdminSettlements: React.FC = () => {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');

  const loadSettlements = async () => {
    try {
      setLoading(true);
      const data = await api.settlements.list();
      setSettlements(data || []);
    } catch (err) {
      console.error('Failed to load admin settlements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettlements();
  }, []);

  const handleRelease = async (id: string) => {
    try {
      setProcessingId(id);
      await api.settlements.release(id);
      setFeedback('Settlement successfully released from escrow to farmer wallet!');
      await loadSettlements();
    } catch (err: any) {
      alert(err.message || 'Failed to release settlement');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-agro-950">Escrow Settlements & Financial Ledger</h2>
          <p className="text-xs text-charcoal-600">
            Split payments: Farmer Net Harvest, Courier Freight Fee, Packaging Fee, and 5% Platform Commission.
          </p>
        </div>

        <button
          onClick={loadSettlements}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-agro-200 text-charcoal-700 hover:bg-cream-50 text-xs font-semibold rounded-xl shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
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

      {/* Settlements Table */}
      <div className="bg-white rounded-3xl border border-agro-100 shadow-card overflow-hidden">
        <div className="p-5 border-b border-agro-50">
          <h3 className="font-bold text-agro-950 text-sm">Escrow Records ({settlements.length})</h3>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-charcoal-500">Loading settlements...</div>
        ) : settlements.length === 0 ? (
          <div className="p-12 text-center text-xs text-charcoal-500">No settlement records available.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50/75 text-charcoal-600 uppercase font-semibold border-b border-agro-50">
                <tr>
                  <th className="px-6 py-4">Order / Farm</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Produce Gross</th>
                  <th className="px-6 py-4">Freight Fee</th>
                  <th className="px-6 py-4">Commission (5%)</th>
                  <th className="px-6 py-4">Farmer Net Payout</th>
                  <th className="px-6 py-4 text-right">Escrow Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-agro-50 font-medium text-charcoal-700">
                {settlements.map(s => (
                  <tr key={s.id} className="hover:bg-cream-50/40">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-agro-950 block">#{s.order_number || s.order_id.slice(0, 8)}</span>
                      <span className="text-[10px] text-charcoal-500">{s.farm_name || 'Verified Producer'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        s.status === 'PAID'
                          ? 'bg-emerald-50 text-emerald-700'
                          : s.status === 'ELIGIBLE'
                          ? 'bg-blue-50 text-blue-700'
                          : s.status === 'HELD'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-charcoal-900">₦{s.product_amount.toLocaleString()}</td>
                    <td className="px-6 py-4">₦{s.logistics_amount?.toLocaleString() || 35000}</td>
                    <td className="px-6 py-4 text-charcoal-500">₦{s.platform_fee_amount.toLocaleString()}</td>
                    <td className="px-6 py-4 font-bold text-emerald-700">
                      ₦{s.farmer_net_amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {s.status === 'ELIGIBLE' || s.status === 'PENDING' ? (
                        <button
                          disabled={processingId === s.id}
                          onClick={() => handleRelease(s.id)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-charcoal-200 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                        >
                          {processingId === s.id ? 'Releasing...' : 'Release Escrow'}
                        </button>
                      ) : s.status === 'HELD' ? (
                        <span className="text-red-700 text-xs font-bold bg-red-50 px-2.5 py-1 rounded-lg">
                          Held for Dispute
                        </span>
                      ) : (
                        <span className="text-emerald-700 text-xs font-semibold">Settled to Wallet</span>
                      )}
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
