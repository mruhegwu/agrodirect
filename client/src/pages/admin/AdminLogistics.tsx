import React, { useEffect, useState } from 'react';
import { Truck, MapPin, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';

export const AdminLogistics: React.FC = () => {
  const [carriers, setCarriers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-agro-950">Logistics Carrier Partners</h2>
          <p className="text-xs text-charcoal-600">
            Authorized inter-state haulage carriers, vehicle fleets, and SLA compliance metrics.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-agro-100 shadow-card p-6">
        <div className="flex items-center gap-4 p-4 bg-blue-50/60 rounded-2xl border border-blue-100 mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-agro-950 text-sm">Primary Freight Corridor Carrier: AgroHaul Logistics</h3>
            <p className="text-xs text-charcoal-600">
              Serving: Abia State (Aba & Umuahia Hubs) ⇄ Lagos State (Ikeja & Lekki Hubs) & Nationwide
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-cream-50 rounded-2xl border border-agro-50">
            <span className="text-charcoal-500 block mb-1">Cold-Chain Temperature SLA</span>
            <span className="text-lg font-bold text-emerald-700">99.8% Compliance</span>
          </div>
          <div className="p-4 bg-cream-50 rounded-2xl border border-agro-50">
            <span className="text-charcoal-500 block mb-1">Average Interstate Transit</span>
            <span className="text-lg font-bold text-agro-950">1.2 Business Days</span>
          </div>
          <div className="p-4 bg-cream-50 rounded-2xl border border-agro-50">
            <span className="text-charcoal-500 block mb-1">Total Tonnage Dispatched</span>
            <span className="text-lg font-bold text-agro-950">142.5 Tonnes</span>
          </div>
        </div>
      </div>
    </div>
  );
};
