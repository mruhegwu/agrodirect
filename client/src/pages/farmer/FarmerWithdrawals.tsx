import React, { useEffect, useState } from 'react';
import { Building2, ArrowUpRight, CheckCircle2, Clock, AlertCircle, Plus, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import { Wallet as WalletType, Withdrawal } from '../../types';

const NIGERIAN_BANKS = [
  'Access Bank',
  'Guaranty Trust Bank (GTBank)',
  'Zenith Bank',
  'United Bank for Africa (UBA)',
  'First Bank of Nigeria',
  'Fidelity Bank',
  'Stanbic IBTC Bank',
  'Sterling Bank',
  'Union Bank',
  'Wema Bank',
  'Ecobank Nigeria',
  'Kuda Microfinance Bank',
  'Moniepoint MFB',
  'OPay Digital Services'
];

export const FarmerWithdrawals: React.FC = () => {
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  const [form, setForm] = useState({
    amount: 25000,
    bank_name: 'Guaranty Trust Bank (GTBank)',
    account_number: '0123456789',
    account_name: 'Obegu Integrated Agro Ltd'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.wallets.getMyWallet();
      setWallet(res.wallet);
      setWithdrawals(res.withdrawals || []);
    } catch (err) {
      console.error('Failed to load farmer withdrawals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet || form.amount > wallet.available_balance) {
      alert('Withdrawal amount exceeds available wallet balance.');
      return;
    }
    if (form.amount < 5000) {
      alert('Minimum withdrawal amount is ₦5,000.');
      return;
    }

    try {
      setSubmitting(true);
      await api.wallets.requestWithdrawal(form);
      setFeedback('Withdrawal request submitted successfully! Funds will be credited after audit review.');
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to submit withdrawal request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-agro-950">Bank Account Payouts</h2>
          <p className="text-xs text-charcoal-600">
            Disburse settled harvest earnings directly to your verified commercial Nigerian bank account.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          disabled={!wallet || wallet.available_balance < 5000}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-agro-600 hover:bg-agro-700 disabled:bg-charcoal-200 text-white font-bold text-xs rounded-xl transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Withdrawal Request</span>
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

      {/* Available Balance Banner */}
      <div className="bg-gradient-to-br from-agro-900 to-agro-950 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs text-agro-200 font-medium uppercase tracking-wider block mb-1">
            Available for Disbursement
          </span>
          <span className="text-3xl font-extrabold font-display">
            ₦{(wallet?.available_balance || 0).toLocaleString()}
          </span>
          <p className="text-xs text-agro-300 mt-2 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Protected by AgroDirect 24-hr settlement verification.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-xs space-y-1 sm:text-right">
          <span className="text-agro-200 block">Total Withdrawn to Date</span>
          <span className="text-lg font-bold text-white block">
            ₦{(wallet?.total_withdrawals || 0).toLocaleString()}
          </span>
          <span className="text-[10px] text-agro-300">Min. payout threshold: ₦5,000</span>
        </div>
      </div>

      {/* Withdrawals List Table */}
      <div className="bg-white rounded-3xl border border-agro-100 shadow-card overflow-hidden">
        <div className="p-5 border-b border-agro-50">
          <h3 className="font-bold text-agro-950 text-sm">Disbursement History</h3>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-charcoal-500">Loading disbursement history...</div>
        ) : withdrawals.length === 0 ? (
          <div className="p-12 text-center text-xs text-charcoal-500">No withdrawal requests yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50/75 text-charcoal-600 uppercase font-semibold border-b border-agro-50">
                <tr>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Bank Destination</th>
                  <th className="px-6 py-4">Account Details</th>
                  <th className="px-6 py-4">Requested Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-agro-50 text-charcoal-700 font-medium">
                {withdrawals.map(w => (
                  <tr key={w.id} className="hover:bg-cream-50/40">
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
                    <td className="px-6 py-4 font-bold text-agro-900">
                      ₦{w.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">{w.bank_name}</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-charcoal-900 block">{w.account_number}</span>
                      <span className="text-[10px] text-charcoal-500">{w.account_name}</span>
                    </td>
                    <td className="px-6 py-4 text-charcoal-500">
                      {new Date(w.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-agro-100">
            <h3 className="text-xl font-bold font-display text-agro-950 mb-1">
              Request Bank Payout
            </h3>
            <p className="text-xs text-charcoal-600 mb-6">
              Enter disbursement amount and verify your Nigerian commercial bank account details.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">Withdrawal Amount (₦)</label>
                <input
                  type="number"
                  min="5000"
                  max={wallet?.available_balance || 5000000}
                  value={form.amount}
                  onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 bg-cream-50 border border-agro-200 rounded-xl font-bold text-sm focus:ring-2 focus:ring-agro-500"
                  required
                />
                <span className="text-[10px] text-charcoal-500 mt-1 block">
                  Available balance: ₦{(wallet?.available_balance || 0).toLocaleString()}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">Bank Name</label>
                <select
                  value={form.bank_name}
                  onChange={e => setForm({ ...form, bank_name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-cream-50 border border-agro-200 rounded-xl text-xs focus:ring-2 focus:ring-agro-500"
                  required
                >
                  {NIGERIAN_BANKS.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">Account Number (10 Digits)</label>
                <input
                  type="text"
                  maxLength={10}
                  placeholder="0123456789"
                  value={form.account_number}
                  onChange={e => setForm({ ...form, account_number: e.target.value })}
                  className="w-full px-4 py-2.5 bg-cream-50 border border-agro-200 rounded-xl font-mono text-sm focus:ring-2 focus:ring-agro-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">Account Holder Name</label>
                <input
                  type="text"
                  placeholder="As registered with your bank"
                  value={form.account_name}
                  onChange={e => setForm({ ...form, account_name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-cream-50 border border-agro-200 rounded-xl text-sm focus:ring-2 focus:ring-agro-500"
                  required
                />
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
                  className="px-6 py-2.5 bg-agro-600 hover:bg-agro-700 disabled:bg-charcoal-200 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  {submitting ? 'Submitting...' : 'Confirm & Request Payout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
