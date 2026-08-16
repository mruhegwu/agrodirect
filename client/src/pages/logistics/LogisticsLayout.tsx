import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Truck,
  MapPin,
  Compass,
  Wallet,
  Building2,
  ShieldCheck,
  Package
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LogisticsLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const links = [
    { to: '/logistics', label: 'Operations Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/logistics/jobs', label: 'Dispatch & Shipments', icon: <Truck className="w-4 h-4" /> },
    { to: '/logistics/routes', label: 'Interstate Routes & Rates', icon: <Compass className="w-4 h-4" /> },
    { to: '/logistics/vehicles', label: 'Fleet & Cold-Chain Vehicles', icon: <Package className="w-4 h-4" /> },
    { to: '/logistics/earnings', label: 'Payouts & Freight Ledger', icon: <Wallet className="w-4 h-4" /> },
    { to: '/logistics/profile', label: 'Provider Profile & Hubs', icon: <Building2 className="w-4 h-4" /> }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Logistics Header */}
      <div className="bg-white rounded-3xl border border-agro-100 p-6 shadow-card mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-lg">
            <Truck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-agro-950">AgroDirect Logistics Partner</h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                <ShieldCheck className="w-3 h-3 text-blue-600" />
                Authorized Carrier
              </span>
            </div>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Operating Corridor: Abia State (Origin Hub) ⇄ Lagos State (Destination Hub) & Nationwide
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/logistics/jobs"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
          >
            Active Shipments
          </Link>
        </div>
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
                    ? 'bg-blue-600 text-white shadow-sm font-bold'
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
