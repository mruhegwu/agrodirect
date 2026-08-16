import React from 'react';
import { BarChart3, TrendingUp, MapPin, Package, Download, DollarSign } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const CORRIDOR_DATA = [
  { corridor: 'Abia ➔ Lagos', gmv: 9800000, volume: '280 Orders' },
  { corridor: 'Abia ➔ Abuja (FCT)', gmv: 2400000, volume: '65 Orders' },
  { corridor: 'Abia ➔ Port Harcourt', gmv: 1600000, volume: '75 Orders' },
  { corridor: 'Enugu ➔ Lagos', gmv: 1000000, volume: '62 Orders' }
];

const PIE_DATA = [
  { name: 'Poultry & Birds', value: 45, color: '#2D6A4F' },
  { name: 'Fresh Catfish', value: 25, color: '#1B4332' },
  { name: 'Yam & Tubers', value: 15, color: '#E76F51' },
  { name: 'Palm Oil & Grains', value: 15, color: '#52B788' }
];

export const AdminReports: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-agro-950">Inter-State Trade Flow & GMV Analytics</h2>
          <p className="text-xs text-charcoal-600">
            Regional agricultural distribution corridors, supply chain velocity, and commodity turnover.
          </p>
        </div>

        <button
          onClick={() => alert('Exporting CSV financial report...')}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-agro-600 hover:bg-agro-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Financial CSV</span>
        </button>
      </div>

      {/* Corridor Table */}
      <div className="bg-white rounded-3xl border border-agro-100 shadow-card p-6">
        <h3 className="font-bold text-agro-950 text-sm mb-4">Top Inter-State Agricultural Corridors</h3>
        <div className="space-y-3">
          {CORRIDOR_DATA.map((c, idx) => (
            <div key={idx} className="p-4 bg-cream-50 rounded-2xl border border-agro-50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-agro-100 text-agro-800 rounded-xl font-bold">
                  #{idx + 1}
                </div>
                <div>
                  <span className="font-bold text-agro-950 block text-sm">{c.corridor}</span>
                  <span className="text-[11px] text-charcoal-500">{c.volume} dispatched</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-charcoal-500 block">Trade Turnover</span>
                <span className="text-base font-extrabold text-agro-900">₦{c.gmv.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pie Chart / Commodity Share */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white rounded-3xl border border-agro-100 p-6 shadow-card">
          <h3 className="font-bold text-agro-950 text-sm mb-1">Commodity Market Share (%)</h3>
          <p className="text-xs text-charcoal-500 mb-4">Volume distribution by crop category</p>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={PIE_DATA} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {PIE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-6 bg-white rounded-3xl border border-agro-100 p-6 shadow-card flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-agro-950 text-sm mb-1">Marketplace Economic Summary</h3>
            <p className="text-xs text-charcoal-500 mb-6">Key performance indicators across Nigeria</p>

            <div className="space-y-4 text-xs">
              <div className="flex justify-between border-b border-agro-50 pb-2">
                <span className="text-charcoal-600">Average Order Basket Value:</span>
                <span className="font-bold text-agro-950">₦30,705</span>
              </div>
              <div className="flex justify-between border-b border-agro-50 pb-2">
                <span className="text-charcoal-600">Average Logistics Transit Time:</span>
                <span className="font-bold text-agro-950">28 Hours</span>
              </div>
              <div className="flex justify-between border-b border-agro-50 pb-2">
                <span className="text-charcoal-600">Dispute Claim Rate:</span>
                <span className="font-bold text-emerald-700">0.2% (&lt; 1 in 500)</span>
              </div>
              <div className="flex justify-between border-b border-agro-50 pb-2">
                <span className="text-charcoal-600">Producer Retention Rate:</span>
                <span className="font-bold text-agro-950">96.4%</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-[11px] text-emerald-800 font-medium">
            💡 <strong>Expansion Recommendation:</strong> High demand detected in Port Harcourt corridor for Abia poultry and catfish.
          </div>
        </div>
      </div>
    </div>
  );
};
