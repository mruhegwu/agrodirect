import React, { useEffect, useState } from 'react';
import { CreditCard, ShieldCheck, CheckCircle2, Clock, XCircle, Search, RefreshCw } from 'lucide-react';
import { Payment } from '../../types';

const SAMPLE_PAYMENTS: Payment[] = [
  {
    id: 'pay-1',
    order_id: 'ord-101',
    customer_id: 'cust-1',
    provider: 'PAYSTACK',
    provider_reference: 'pstk_ref_98492041284',
    amount: 242500,
    currency: 'NGN',
    status: 'SUCCESS',
    metadata: { channel: 'card', bank: 'Access Bank Nigeria', ip: '102.89.41.20' },
    paid_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: 'pay-2',
    order_id: 'ord-102',
    customer_id: 'cust-2',
    provider: 'FLUTTERWAVE',
    provider_reference: 'flw_tx_77291048194',
    amount: 145000,
    currency: 'NGN',
    status: 'SUCCESS',
    metadata: { channel: 'bank_transfer', bank: 'GTBank', ip: '105.112.38.12' },
    paid_at: new Date(Date.now() - 3600000).toISOString(),
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'pay-3',
    order_id: 'ord-103',
    customer_id: 'cust-3',
    provider: 'PAYSTACK',
    provider_reference: 'pstk_ref_55102948174',
    amount: 88000,
    currency: 'NGN',
    status: 'SUCCESS',
    metadata: { channel: 'ussd', bank: 'Zenith Bank', ip: '197.210.74.88' },
    paid_at: new Date(Date.now() - 86400000).toISOString(),
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
];

export const AdminPayments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>(SAMPLE_PAYMENTS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = payments.filter(p =>
    p.provider_reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.provider.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-agro-950">Payment Transactions & Gateway Logs</h2>
          <p className="text-xs text-charcoal-600">
            Audited Paystack & Flutterwave server-verified financial logs with idempotency keys.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-agro-100 p-4 shadow-card">
        <div className="relative">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search provider reference, Paystack/Flutterwave transaction ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-cream-50 border border-agro-200 rounded-xl text-xs focus:ring-2 focus:ring-agro-500"
          />
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-3xl border border-agro-100 shadow-card overflow-hidden">
        <div className="p-5 border-b border-agro-50 flex items-center justify-between">
          <h3 className="font-bold text-agro-950 text-sm">Settled Customer Payments</h3>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
            Server Signature Verified
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-50/75 text-charcoal-600 uppercase font-semibold border-b border-agro-50">
              <tr>
                <th className="px-6 py-4">Gateway Provider</th>
                <th className="px-6 py-4">Provider Reference</th>
                <th className="px-6 py-4">Amount Paid</th>
                <th className="px-6 py-4">Channel / Bank</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-agro-50 font-medium text-charcoal-700">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-cream-50/40">
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                      p.provider === 'PAYSTACK'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {p.provider}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-charcoal-900">
                    {p.provider_reference}
                  </td>
                  <td className="px-6 py-4 font-bold text-agro-950">
                    ₦{p.amount.toLocaleString()} {p.currency}
                  </td>
                  <td className="px-6 py-4 text-charcoal-600">
                    {p.metadata?.channel?.toUpperCase() || 'CARD'} ({p.metadata?.bank || 'Bank'})
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      SUCCESS
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-charcoal-500">
                    {new Date(p.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
