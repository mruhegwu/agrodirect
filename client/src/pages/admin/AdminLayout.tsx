import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Store,
  ShieldCheck,
  Package,
  Layers,
  ShoppingBag,
  CreditCard,
  Wallet,
  ArrowUpRight,
  Truck,
  Compass,
  AlertOctagon,
  Star,
  BarChart3,
  Settings,
  History,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const navSections = [
    {
      title: 'Core Administration',
      items: [
        { to: '/admin', label: 'Executive Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { to: '/admin/reports', label: 'Trade & GMV Analytics', icon: <BarChart3 className="w-4 h-4" /> },
        { to: '/admin/audit-logs', label: 'Audit Logs & Security', icon: <History className="w-4 h-4" /> }
      ]
    },
    {
      title: 'Farmer & Marketplace',
      items: [
        { to: '/admin/farmers/verification', label: 'KYC Verifications Queue', icon: <ShieldCheck className="w-4 h-4 text-emerald-600" /> },
        { to: '/admin/farmers', label: 'Verified Farms Directory', icon: <Store className="w-4 h-4" /> },
        { to: '/admin/products', label: 'Produce Catalog Moderation', icon: <Package className="w-4 h-4" /> },
        { to: '/admin/categories', label: 'Categories & Commissions', icon: <Layers className="w-4 h-4" /> },
        { to: '/admin/reviews', label: 'Product & Farm Reviews', icon: <Star className="w-4 h-4" /> }
      ]
    },
    {
      title: 'Orders & Disputes',
      items: [
        { to: '/admin/orders', label: 'Master Orders Dispatch', icon: <ShoppingBag className="w-4 h-4" /> },
        { to: '/admin/disputes', label: 'Disputes Resolution Center', icon: <AlertOctagon className="w-4 h-4 text-terracotta-500" /> },
        { to: '/admin/customers', label: 'Customers Registry', icon: <Users className="w-4 h-4" /> },
        { to: '/admin/users', label: 'User Roles & Access Control', icon: <Users className="w-4 h-4" /> }
      ]
    },
    {
      title: 'Finance & Logistics',
      items: [
        { to: '/admin/payments', label: 'Paystack / Flutterwave Logs', icon: <CreditCard className="w-4 h-4" /> },
        { to: '/admin/settlements', label: 'Escrow Settlements', icon: <Wallet className="w-4 h-4" /> },
        { to: '/admin/withdrawals', label: 'Disbursement Approvals', icon: <ArrowUpRight className="w-4 h-4" /> },
        { to: '/admin/logistics', label: 'Logistics Carriers', icon: <Truck className="w-4 h-4" /> },
        { to: '/admin/routes', label: 'State Freight Rates', icon: <Compass className="w-4 h-4" /> },
        { to: '/admin/vehicles', label: 'Fleet Vehicle Database', icon: <Truck className="w-4 h-4" /> },
        { to: '/admin/settings', label: 'Platform Financial Rules', icon: <Settings className="w-4 h-4" /> }
      ]
    }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner */}
      <div className="bg-agro-950 text-white rounded-3xl p-6 shadow-xl mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-agro-800">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-agro-800 text-agro-300 flex items-center justify-center font-bold text-lg border border-agro-700">
            <ShieldAlert className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold font-display text-white">AgroDirect Command Center</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-agro-300 mt-0.5">
              Production Multi-Vendor Marketplace Operations & Nationwide Agricultural Logistics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            to="/admin/farmers/verification"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
          >
            Review KYC Queue
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Nav */}
        <div className="lg:col-span-3 space-y-4">
          {navSections.map((sec, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-agro-100 p-3 shadow-card space-y-1">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400 px-3 py-1.5">
                {sec.title}
              </h4>
              {sec.items.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive(item.to)
                      ? 'bg-agro-900 text-white shadow-sm font-bold'
                      : 'text-charcoal-700 hover:bg-cream-100 hover:text-agro-900'
                  }`}
                >
                  {item.icon}
                  <span className="truncate">{item.label}</span>
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* Content Outlet */}
        <div className="lg:col-span-9">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
