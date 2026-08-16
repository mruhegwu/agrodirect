import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Store,
  Users,
  ShieldCheck,
  AlertOctagon,
  Clock,
  ArrowUpRight,
  Package,
  Truck,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';
import { api } from '../../services/api';

const GMV_CHART_DATA = [
  { month: 'Jan', gmv: 1200000, revenue: 60000 },
  { month: 'Feb', gmv: 2100000, revenue: 105000 },
  { month: 'Mar', gmv: 3400000, revenue: 170000 },
  { month: 'Apr', gmv: 4800000, revenue: 240000 },
  { month: 'May', gmv: 6200000, revenue: 310000 },
  { month: 'Jun', gmv: 8500000, revenue: 425000 },
  { month: 'Jul', gmv: 11200000, revenue: 560000 },
  { month: 'Aug', gmv: 14800000, revenue: 740000 }
];

const CATEGORY_DATA = [
  { name: 'Poultry & Birds', sales: 6400000 },
  { name: 'Fresh Catfish', sales: 3200000 },
  { name: 'Yam & Tubers', sales: 2500000 },
  { name: 'Palm Oil', sales: 1800000 },
  { name: 'Vegetables & Rice', sales: 900000 }
];

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        setLoading(true);
        const data = await api.admin.getMetrics();
        setMetrics(data);
      } catch (err) {
        console.error('Failed to load admin metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-agro-950">Marketplace Executive Metrics</h2>
        <p className="text-xs text-charcoal-600">
          Real-time trade volume, commission earnings, verified farm network, and logistics operations.
        </p>
      </div>

      {/* Metrics Row 1: Core Financials */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-agro-100 p-5 shadow-card">
          <span className="text-xs font-medium text-charcoal-500">Gross Merchandise Value (GMV)</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-bold text-agro-950">₦14,800,000</span>
            <div className="p-2.5 bg-agro-50 text-agro-700 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold block mt-1">+24.5% vs last month</span>
        </div>

        <div className="bg-white rounded-2xl border border-agro-100 p-5 shadow-card">
          <span className="text-xs font-medium text-charcoal-500">Platform Revenue (5% Fee)</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-bold text-emerald-700">₦740,000</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-charcoal-500 block mt-1">Configurable commission rate</span>
        </div>

        <div className="bg-white rounded-2xl border border-agro-100 p-5 shadow-card">
          <span className="text-xs font-medium text-charcoal-500">Total Orders Fulfilled</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-bold text-agro-950">482 Orders</span>
            <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-blue-700 font-semibold block mt-1">Abia ➔ Lagos Primary Flow</span>
        </div>

        <div className="bg-white rounded-2xl border border-agro-100 p-5 shadow-card">
          <span className="text-xs font-medium text-charcoal-500">Verified Farms Onboarded</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-bold text-agro-950">18 Farms</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold block mt-1">100% KYC Authenticated</span>
        </div>
      </div>

      {/* Action Banners for Admin Queue */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/admin/farmers/verification"
          className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between hover:bg-amber-100/70 transition-colors shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-200 text-amber-900 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-950 block">Pending KYC Approvals</span>
              <span className="text-[11px] text-amber-800">2 Farm verification requests</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-amber-800" />
        </Link>

        <Link
          to="/admin/disputes"
          className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between hover:bg-red-100/70 transition-colors shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-200 text-red-900 rounded-xl">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-red-950 block">Dispute Escalations</span>
              <span className="text-[11px] text-red-800">1 Customer claim under review</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-red-800" />
        </Link>

        <Link
          to="/admin/withdrawals"
          className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between hover:bg-emerald-100/70 transition-colors shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-200 text-emerald-900 rounded-xl">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-950 block">Payout Approvals</span>
              <span className="text-[11px] text-emerald-800">3 Bank payouts awaiting sign-off</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-emerald-800" />
        </Link>
      </div>

      {/* Interactive Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white rounded-3xl border border-agro-100 p-6 shadow-card">
          <h3 className="font-bold text-agro-950 text-sm mb-1">Monthly GMV & Platform Commission Growth</h3>
          <p className="text-xs text-charcoal-500 mb-6">Agricultural trade volume in Naira (NGN)</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={GMV_CHART_DATA}>
                <defs>
                  <linearGradient id="gmvGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#888" fontSize={11} />
                <YAxis stroke="#888" fontSize={11} tickFormatter={v => `₦${(v / 1000000).toFixed(1)}M`} />
                <Tooltip
                  formatter={(val: any) => [`₦${val.toLocaleString()}`, 'Gross GMV']}
                />
                <Area type="monotone" dataKey="gmv" stroke="#2D6A4F" strokeWidth={2.5} fill="url(#gmvGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white rounded-3xl border border-agro-100 p-6 shadow-card">
          <h3 className="font-bold text-agro-950 text-sm mb-1">Sales by Agricultural Category</h3>
          <p className="text-xs text-charcoal-500 mb-6">Primary commodities traded</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CATEGORY_DATA} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#888" fontSize={10} width={90} />
                <Tooltip formatter={(val: any) => [`₦${val.toLocaleString()}`, 'Sales']} />
                <Bar dataKey="sales" fill="#1B4332" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
