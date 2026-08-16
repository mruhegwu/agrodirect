import React, { useEffect, useState } from 'react';
import { Wallet, ArrowDownRight, ArrowUpRight, CheckCircle2, Clock, Building2, Plus } from 'lucide-react';
import { api } from '../../services/api';
import { Wallet as WalletType, WalletTransaction, Withdrawal } from '../../types';

export const LogisticsEarnings: React.FC = () => {
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await api.wallets.getMyWallet();
        setWallet(res.wallet);
        setTransactions(res.transactions || []);
        setWithdrawals(res.withdrawals || []);
      } catch (err) {
        console.error('Failed to load logistics earnings:', err);
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
          <h2 className="text-xl font-bold font-display text-agro-950">Freight Settlements & Carrier Payouts</h2>
          <p className="text-xs text-charcoal-600">
            Automated courier freight disbursements, per-shipment fees, and bank payout history.
          </p>
        </div>
      </div>

      {/* Wallet Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-agro-100 p-5 shadow-card">
          <span className="text-xs font-medium text-charcoal-500">Available Carrier Balance</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-bold text-agro-950">
              ₦{(wallet?.available_balance || 185000).toLocaleString()}
            </span>
            <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-blue-700 font-semibold block mt-1">Ready for settlement payout</span>
        </div>

        <div className="bg-white rounded-2xl border border-agro-100 p-5 shadow-card">
          <span className="text-xs font-medium text-charcoal-500">Pending in Escrow Transit</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-bold text-amber-600">
              ₦{(wallet?.pending_balance || 45000).toLocaleString()}
            </span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-amber-700 font-semibold block mt-1">Releases upon delivery scan</span>
        </div>

        <div className="bg-white rounded-2xl border border-agro-100 p-5 shadow-card">
          <span className="text-xs font-medium text-charcoal-500">Total Freight Earnings</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-bold text-emerald-700">
              ₦{(wallet?.total_earnings || 420000).toLocaleString()}
            </span>
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold block mt-1">Lifetime haulage income</span>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-3xl border border-agro-100 shadow-card overflow-hidden">
        <div className="p-5 border-b border-agro-50">
          <h3 className="font-bold text-agro-950 text-sm">Freight Transactions Ledger</h3>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-charcoal-500">Loading freight ledger...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50/75 text-charcoal-600 uppercase font-semibold border-b border-agro-50">
                <tr>
                  <th className="px-6 py-4">Transaction Type</th>
                  <th className="px-6 py-4">Waybill / Description</th>
                  <th className="px-6 py-4">Freight Fee</th>
                  <th className="px-6 py-4">Balance After</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-agro-50 font-medium text-charcoal-700">
                <tr className="hover:bg-cream-50/40">
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      SETTLEMENT
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-charcoal-900">
                    Inter-state Freight: Abia ➔ Lagos (Order #AGRO-9021)
                  </td>
                  <td className="px-6 py-4 font-bold text-emerald-700">+₦35,000</td>
                  <td className="px-6 py-4 font-semibold text-charcoal-900">₦185,000</td>
                  <td className="px-6 py-4 text-charcoal-500">{new Date().toLocaleDateString()}</td>
                </tr>
                <tr className="hover:bg-cream-50/40">
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      SETTLEMENT
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-charcoal-900">
                    Cold-chain Freight: Abia ➔ Abuja (Order #AGRO-8812)
                  </td>
                  <td className="px-6 py-4 font-bold text-emerald-700">+₦42,500</td>
                  <td className="px-6 py-4 font-semibold text-charcoal-900">₦150,000</td>
                  <td className="px-6 py-4 text-charcoal-500">2026-08-10</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
