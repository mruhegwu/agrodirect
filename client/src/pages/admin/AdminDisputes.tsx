import React, { useEffect, useState } from 'react';
import { AlertOctagon, CheckCircle2, MessageSquare, ShieldCheck, RefreshCw, XCircle } from 'lucide-react';
import { api } from '../../services/api';
import { Dispute } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';

export const AdminDisputes: React.FC = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [resolutionType, setResolutionType] = useState('FULL_REFUND');
  const [refundAmount, setRefundAmount] = useState(25000);
  const [resolutionNotes, setResolutionNotes] = useState('Full refund approved due to verified transit cold-chain damage.');
  const [resolving, setResolving] = useState(false);
  const [feedback, setFeedback] = useState('');

  const loadDisputes = async () => {
    try {
      setLoading(true);
      const data = await api.disputes.list();
      setDisputes(data || []);
    } catch (err) {
      console.error('Failed to load disputes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDisputes();
  }, []);

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispute) return;
    try {
      setResolving(true);
      await api.disputes.resolve(selectedDispute.id, {
        resolution_type: resolutionType,
        refund_amount: refundAmount,
        resolution_notes: resolutionNotes
      });
      setFeedback(`Dispute #${selectedDispute.id.slice(0, 8)} resolved with resolution: ${resolutionType}.`);
      setSelectedDispute(null);
      await loadDisputes();
    } catch (err: any) {
      alert(err.message || 'Failed to resolve dispute');
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AlertOctagon className="w-6 h-6 text-terracotta-500" />
            <h2 className="text-xl font-bold font-display text-agro-950">Dispute & Claims Resolution Center</h2>
          </div>
          <p className="text-xs text-charcoal-600">
            Adjudicate buyer claims, inspect photographic evidence, and execute automated refunds or escrow adjustments.
          </p>
        </div>

        <button
          onClick={loadDisputes}
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

      {/* Disputes Table */}
      <div className="bg-white rounded-3xl border border-agro-100 shadow-card overflow-hidden">
        <div className="p-5 border-b border-agro-50">
          <h3 className="font-bold text-agro-950 text-sm">Dispute Case Files ({disputes.length})</h3>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-charcoal-500">Loading dispute cases...</div>
        ) : disputes.length === 0 ? (
          <div className="p-12 text-center text-xs text-charcoal-500">No active disputes on platform.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50/75 text-charcoal-600 uppercase font-semibold border-b border-agro-50">
                <tr>
                  <th className="px-6 py-4">Case / Order Ref</th>
                  <th className="px-6 py-4">Dispute Reason</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Producer Farm</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Adjudication</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-agro-50 font-medium text-charcoal-700">
                {disputes.map(d => (
                  <tr key={d.id} className="hover:bg-cream-50/40">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-agro-950 block">Case #{d.id.slice(0, 8)}</span>
                      <span className="text-[10px] text-charcoal-500">Order: {d.order_number || d.order_id.slice(0, 8)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-red-700 block">{d.reason}</span>
                      <span className="text-[11px] text-charcoal-500 line-clamp-1">{d.description}</span>
                    </td>
                    <td className="px-6 py-4">{d.customer_name || 'Customer'}</td>
                    <td className="px-6 py-4 font-semibold text-agro-900">{d.farm_name || 'Producer'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        d.status === 'RESOLVED'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedDispute(d)}
                        className="px-3.5 py-1.5 bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                      >
                        Adjudicate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Adjudication Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-agro-100">
            <h3 className="text-lg font-bold font-display text-agro-950 mb-1">
              Adjudicate Dispute Case #{selectedDispute.id.slice(0, 8)}
            </h3>
            <p className="text-xs text-charcoal-600 mb-4">
              Review claim statement and execute final escrow binding decision.
            </p>

            <div className="bg-cream-50 p-4 rounded-2xl border border-agro-100 text-xs mb-4 space-y-1.5">
              <div>Reason: <strong className="text-red-700">{selectedDispute.reason}</strong></div>
              <div>Statement: <span className="italic text-charcoal-700">"{selectedDispute.description}"</span></div>
            </div>

            <form onSubmit={handleResolve} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">Resolution Ruling</label>
                <select
                  value={resolutionType}
                  onChange={e => setResolutionType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-cream-50 border border-agro-200 rounded-xl text-xs font-bold"
                >
                  <option value="FULL_REFUND">Full Refund to Customer (Debit Farmer Escrow)</option>
                  <option value="PARTIAL_REFUND">Partial Refund for Shortage</option>
                  <option value="FARMER_COMPENSATION">Dismiss Claim (Release 100% to Farmer)</option>
                  <option value="LOGISTICS_COMPENSATION">Carrier Insurance Claim</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">Refund Amount (₦)</label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={e => setRefundAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 bg-cream-50 border border-agro-200 rounded-xl font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">Ruling Notes & Findings</label>
                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={e => setResolutionNotes(e.target.value)}
                  className="w-full px-4 py-2.5 bg-cream-50 border border-agro-200 rounded-xl text-xs"
                  required
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedDispute(null)}
                  className="px-4 py-2 text-xs font-semibold text-charcoal-600 hover:bg-cream-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resolving}
                  className="px-6 py-2.5 bg-terracotta-500 hover:bg-terracotta-600 disabled:bg-charcoal-200 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  {resolving ? 'Executing...' : 'Execute Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
