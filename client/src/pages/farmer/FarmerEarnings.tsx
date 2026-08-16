import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, ArrowDownRight, ArrowUpRight, Clock, ShieldCheck, AlertTriangle, CheckCircle2, DollarSign } from 'lucide-react';
import { api } from '../../services/api';
import { Wallet as WalletType, WalletTransaction, Settlement } from '../../types';

export const FarmerEarnings: React.FC = () => {
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'settlements' | 'transactions'>('settlements');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [walletRes, settlRes] = await Promise.all([
          api.wallets.getMyWallet(),
          api.settlements.list()
        ]);
        setWallet(walletRes.wallet);
        setTransactions(walletRes.transactions || []);
        setSettlements(settlRes || []);
      } catch (err) {
        console.error('Failed to load farmer earnings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-agro-950">Earnings & Settlement Ledger</h2>
          <p className="text-xs text-charcoal-600">
            Automated escrow settlements, cleared payouts, and immutable financial history.
          </p>
        </div>

        <Link
          to="/farmer/withdrawals"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-agro-600 hover:bg-agro-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm"
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Request Bank Payout</span>
        </Link>
      </div>

      {/* Wallet Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-agro-100 p-5 shadow-card">
          <span className="text-xs font-medium text-charcoal-500">Available Balance</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-bold text-agro-950">
              ₦{(wallet?.available_balance || 0).toLocaleString()}
            </span>
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold block mt-1">
            Eligible for instant withdrawal
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-agro-100 p-5 shadow-card">
          <span className="text-xs font-medium text-charcoal-500">Pending in Escrow</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-bold text-amber-600">
              ₦{(wallet?.pending_balance || 0).toLocaleString()}
            </span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-amber-700 font-semibold block mt-1">
            Awaiting order delivery confirmation
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-agro-100 p-5 shadow-card">
          <span className="text-xs font-medium text-charcoal-500">Total Lifetime Earnings</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-bold text-agro-900">
              ₦{(wallet?.total_earnings || 0).toLocaleString()}
            </span>
            <div className="p-2.5 bg-agro-50 text-agro-700 rounded-xl">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-charcoal-500 block mt-1">Net after platform fees</span>
        </div>

        <div className="bg-white rounded-2xl border border-agro-100 p-5 shadow-card">
          <span className="text-xs font-medium text-charcoal-500">Total Withdrawn to Bank</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-bold text-charcoal-800">
              ₦{(wallet?.total_withdrawals || 0).toLocaleString()}
            </span>
            <div className="p-2.5 bg-cream-100 text-charcoal-700 rounded-xl">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-charcoal-500 block mt-1">Disbursed to Nigerian bank</span>
        </div>
      </div>

      {/* Tabs for Settlements vs Ledger */}
      <div className="bg-white rounded-3xl border border-agro-100 shadow-card overflow-hidden">
        <div className="flex border-b border-agro-100 px-6 pt-4 gap-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('settlements')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'settlements'
                ? 'border-agro-600 text-agro-900'
                : 'border-transparent text-charcoal-500 hover:text-charcoal-700'
            }`}
          >
            Order Settlement Escrow ({settlements.length})
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'transactions'
                ? 'border-agro-600 text-agro-900'
                : 'border-transparent text-charcoal-500 hover:text-charcoal-700'
            }`}
          >
            Wallet Ledger History ({transactions.length})
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-charcoal-500">Loading records...</div>
        ) : activeTab === 'settlements' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50/75 text-charcoal-600 uppercase font-semibold border-b border-agro-50">
                <tr>
                  <th className="px-6 py-4">Order Ref</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Produce Gross</th>
                  <th className="px-6 py-4">Packaging</th>
                  <th className="px-6 py-4">Platform Fee</th>
                  <th className="px-6 py-4">Farmer Net</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-agro-50 text-charcoal-700 font-medium">
                {settlements.map(s => (
                  <tr key={s.id} className="hover:bg-cream-50/40">
                    <td className="px-6 py-4 font-bold text-agro-950">
                      {s.order_number || s.order_id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
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
                    <td className="px-6 py-4">₦{s.product_amount.toLocaleString()}</td>
                    <td className="px-6 py-4">₦{s.packaging_amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-charcoal-400">-₦{s.platform_fee_amount.toLocaleString()}</td>
                    <td className="px-6 py-4 font-bold text-emerald-700">
                      ₦{s.farmer_net_amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-charcoal-500">
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {settlements.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-charcoal-400">
                      No order settlement records yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50/75 text-charcoal-600 uppercase font-semibold border-b border-agro-50">
                <tr>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Balance After</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-agro-50 text-charcoal-700 font-medium">
                {transactions.map(t => (
                  <tr key={t.id} className="hover:bg-cream-50/40">
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        ['CREDIT', 'SETTLEMENT'].includes(t.type)
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">{t.description}</td>
                    <td className={`px-6 py-4 font-bold ${
                      ['CREDIT', 'SETTLEMENT'].includes(t.type)
                        ? 'text-emerald-700'
                        : 'text-red-700'
                    }`}>
                      {['CREDIT', 'SETTLEMENT'].includes(t.type) ? '+' : '-'}₦{t.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-semibold text-charcoal-900">
                      ₦{t.balance_after.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-charcoal-500">
                      {new Date(t.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-charcoal-400">
                      No wallet transactions recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
