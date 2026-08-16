import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Search, Filter, RefreshCw, ChevronRight, MapPin } from 'lucide-react';
import { api } from '../../services/api';
import { Order, OrderStatus } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await api.orders.getAdminOrders(statusFilter === 'ALL' ? undefined : statusFilter);
      setOrders(data || []);
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const filtered = orders.filter(o =>
    o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (o.customer_name && o.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (o.farm_name && o.farm_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-agro-950">Master Orders Command Center</h2>
          <p className="text-xs text-charcoal-600">
            Real-time multi-vendor state machine monitoring: Paid ➔ Preparing ➔ In Transit ➔ Delivered.
          </p>
        </div>

        <button
          onClick={loadOrders}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-agro-200 text-charcoal-700 hover:bg-cream-50 text-xs font-semibold rounded-xl shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl border border-agro-100 p-4 shadow-card flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order number (#AGRO-...), customer, or farm..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-cream-50 border border-agro-200 rounded-xl text-xs focus:ring-2 focus:ring-agro-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-charcoal-400 flex-shrink-0" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-cream-50 border border-agro-200 rounded-xl text-xs focus:ring-2 focus:ring-agro-500 w-full sm:w-auto"
          >
            <option value="ALL">All Order States</option>
            <option value="PAID">Paid (Pending Farm Confirm)</option>
            <option value="FARMER_CONFIRMED">Farmer Confirmed</option>
            <option value="PREPARING">Preparing Harvest</option>
            <option value="READY_FOR_PICKUP">Ready for Pickup</option>
            <option value="IN_TRANSIT">In Transit on Highway</option>
            <option value="DELIVERED">Delivered</option>
            <option value="COMPLETED">Completed</option>
            <option value="DISPUTED">Disputed</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-agro-100 shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-charcoal-500">Loading master orders...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-charcoal-500">No orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50/75 text-charcoal-600 uppercase font-semibold border-b border-agro-50">
                <tr>
                  <th className="px-6 py-4">Order Ref</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Producer Farm</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Route</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-agro-50 font-medium text-charcoal-700">
                {filtered.map(o => (
                  <tr key={o.id} className="hover:bg-cream-50/40">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-agro-950 block">#{o.order_number}</span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-charcoal-900 block">{o.customer_name || 'Customer'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-agro-900">{o.farm_name || 'Verified Farm'}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-agro-950">
                      ₦{o.total_amount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-[11px] text-charcoal-600">
                      Abia ➔ {o.delivery_address?.state || 'Lagos'}
                    </td>
                    <td className="px-6 py-4 text-charcoal-500">
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/account/orders/${o.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-agro-100 hover:bg-agro-200 text-agro-900 rounded-xl font-semibold text-xs transition-colors"
                      >
                        <span>View</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
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
