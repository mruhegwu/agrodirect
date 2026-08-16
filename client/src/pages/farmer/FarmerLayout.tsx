import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingBag,
  Wallet,
  ShieldCheck,
  Store,
  Settings,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { VerificationBadge } from '../../components/common/VerificationBadge';

export const FarmerLayout: React.FC = () => {
  const { user, farm } = useAuth();
  const location = useLocation();
  const links = [
    { to: '/farmer', label: 'Dashboard Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/farmer/products', label: 'Harvest Listings', icon: <Package className="w-4 h-4" /> },
    { to: '/farmer/products/new', label: 'List New Harvest', icon: <PlusCircle className="w-4 h-4" /> },
    { to: '/farmer/inventory', label: 'Inventory Stock', icon: <Store className="w-4 h-4" /> },
    { to: '/farmer/orders', label: 'Orders & Dispatch', icon: <ShoppingBag className="w-4 h-4" /> },
    { to: '/farmer/earnings', label: 'Earnings & Ledger', icon: <Wallet className="w-4 h-4" /> },
    { to: '/farmer/withdrawals', label: 'Bank Withdrawals', icon: <Wallet className="w-4 h-4" /> },
    { to: '/farmer/profile', label: 'Farm Public Profile', icon: <Store className="w-4 h-4" /> },
    { to: '/farmer/verification', label: 'Farm Verification KYC', icon: <ShieldCheck className="w-4 h-4" /> },
    { to: '/farmer/settings', label: 'Farm Settings', icon: <Settings className="w-4 h-4" /> }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Unverified Farmer Warning Banner */}
      {farm?.status !== 'VERIFIED' && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4 text-xs text-amber-800">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <strong>Farm Verification Status: {farm?.status || 'PENDING'}</strong> — Complete your 5-step verification wizard to activate live public sales.
            </div>
          </div>
          <Link
            to="/farmer/verification"
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl flex-shrink-0 transition-colors"
          >
            Complete KYC
          </Link>
        </div>
      )}

      {/* Farm Header */}
      <div className="bg-white rounded-3xl border border-agro-100 p-6 shadow-card mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
            <Store className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-agro-950">{farm?.farm_name || 'My Farm'}</h1>
              <VerificationBadge status={farm?.status} />
            </div>
            <p className="text-xs text-charcoal-500 mt-0.5">
              {farm ? `${farm.address}, ${farm.lga}, ${farm.state} State` : 'Commercial Farmer'}
            </p>
          </div>
        </div>

        {farm && (
          <Link
            to={`/farms/${farm.slug}`}
            className="text-xs font-bold text-agro-700 hover:text-agro-900 bg-agro-50 px-4 py-2 rounded-xl self-start sm:self-auto"
          >
            View Public Storefront →
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Nav */}
        <div className="lg:col-span-3 space-y-1">
          <div className="bg-white rounded-2xl border border-agro-100 p-3 shadow-card space-y-1 text-xs font-semibold">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all ${
                  isActive(l.to)
                    ? 'bg-agro-600 text-white shadow-sm font-bold'
                    : 'text-charcoal-700 hover:bg-cream-100 hover:text-agro-800'
                }`}
              >
                {l.icon}
                <span>{l.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Content Outlet */}
        <div className="lg:col-span-9">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
