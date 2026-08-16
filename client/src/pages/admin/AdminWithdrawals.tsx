import React, { useEffect, useState } from 'react';
import { ArrowUpRight, CheckCircle2, XCircle, Clock, RefreshCw, Building2 } from 'lucide-react';
import { api } from '../../services/api';
import { Withdrawal } from '../../types';

export const AdminWithdrawals: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');

  const loadWithdrawals = async () => {
    try {
      setLoading(true);
      const data = await api.wallets.listAdminWithdrawals();
      setWithdrawals(data || []);
    } catch (err) {
      console.error('Failed to load admin withdrawals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWithdrawals();
  }, []);

  const handleProcess = async (id: string, status: 'PAID' | 'REJECTED') => {
    try {
      setProcessingId(id);
      await api.wallets.processWithdrawal(id, status, `Processed by Admin on ${new Date().toLocaleDateString()}`);
      setFeedback(`Disbursement marked as ${status}. Bank transfer audit logged.`);
      await loadWithdrawals();
    } catch (err: any) {
      alert(err.message || 'Failed to process withdrawal');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-agro-950">Disbursement & Payout Approvals</h2>
          <p className="text-xs text-charcoal-600">
            Authorize NUBAN bank payouts for verified farmers and inter-state logistics carriers.
          </p>
        </div>

        <button
          onClick={loadWithdrawals}
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

      {/* Table */}
      <div className="bg-white rounded-3xl border border-agro-100 shadow-card overflow-hidden">
        <div className="p-5 border-b border-agro-50">
          <h3 className="font-bold text-agro-950 text-sm">Withdrawal Requests Queue</h3>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-charcoal-500">Loading payout queue...</div>
        ) : withdrawals.length === 0 ? (
          <div className="p-12 text-center text-xs text-charcoal-500">No withdrawal requests found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50/75 text-charcoal-600 uppercase font-semibold border-b border-agro-50">
                <tr>
                  <th className="px-6 py-4">Beneficiary</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Destination Bank</th>
                  <th className="px-6 py-4">Account Number</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Approval Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-agro-50 font-medium text-charcoal-700">
                {withdrawals.map(w => (
                  <tr key={w.id} className="hover:bg-cream-50/40">
                    <td className="px-6 py-4">
                      <span className="font-bold text-agro-950 block">{w.user_name || 'Farmer Principal'}</span>
                      <span className="text-[10px] text-charcoal-400">{w.user_email}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-agro-900 text-sm">
                      ₦{w.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-semibold text-charcoal-900">{w.bank_name}</td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold block">{w.account_number}</span>
                      <span className="text-[10px] text-charcoal-500">{w.account_name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        w.status === 'PAID'
                          ? 'bg-emerald-50 text-emerald-700'
                          : w.status === 'REJECTED'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-charcoal-500">
                      {new Date(w.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {w.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            disabled={processingId === w.id}
                            onClick={() => handleProcess(w.id, 'REJECTED')}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl transition-colors"
                          >
                            Reject
                          </button>
                          <button
                            disabled={processingId === w.id}
                            onClick={() => handleProcess(w.id, 'PAID')}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                          >
                            {processingId === w.id ? 'Processing...' : 'Approve & Pay'}
                          </button>
                        </div>
                      ) : (
                        <span className="text-charcoal-400 font-semibold">{w.status}</span>
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
