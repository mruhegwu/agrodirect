import React, { useEffect, useState } from 'react';
import { Users, Search, ShoppingBag, MapPin, Phone, Mail, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { User } from '../../types';

export const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await api.admin.listUsers('CUSTOMER');
      setCustomers(data || []);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filtered = customers.filter(c =>
    c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.phone && c.phone.includes(searchQuery))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-agro-950">Customer Accounts Registry</h2>
          <p className="text-xs text-charcoal-600">
            Registered wholesale buyers, retail consumers, and recurring farm subscribers.
          </p>
        </div>

        <button
          onClick={loadCustomers}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-agro-200 text-charcoal-700 hover:bg-cream-50 text-xs font-semibold rounded-xl shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-agro-100 p-4 shadow-card">
        <div className="relative">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customer by name, email address, phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-cream-50 border border-agro-200 rounded-xl text-xs focus:ring-2 focus:ring-agro-500"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-agro-100 shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-charcoal-500">Loading customers...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-charcoal-500">No customers registered yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50/75 text-charcoal-600 uppercase font-semibold border-b border-agro-50">
                <tr>
                  <th className="px-6 py-4">Customer Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Account Status</th>
                  <th className="px-6 py-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-agro-50 font-medium text-charcoal-700">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-cream-50/40">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-agro-100 text-agro-800 flex items-center justify-center font-bold text-xs">
                        {c.full_name?.charAt(0) || 'C'}
                      </div>
                      <span className="font-bold text-agro-950">{c.full_name}</span>
                    </td>
                    <td className="px-6 py-4 text-charcoal-600">{c.email}</td>
                    <td className="px-6 py-4">{c.phone || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        c.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {c.is_active ? 'ACTIVE' : 'SUSPENDED'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-charcoal-500">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
