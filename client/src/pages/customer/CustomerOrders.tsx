import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Clock, MapPin, Truck, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { Order } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';

export const CustomerOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadOrders() {
      setIsLoading(true);
      try {
        const data = await api.orders.getMyOrders(selectedStatus);
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadOrders();
  }, [selectedStatus]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-agro-950 font-display">My Farm Orders</h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Track live deliveries, confirm received produce, and submit farmer reviews.
          </p>
        </div>

        {/* Filter by Status */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-charcoal-800 focus:outline-none"
        >
          <option value="">All Order Statuses</option>
          <option value="PAID">Paid / In Queue</option>
          <option value="PREPARING">Preparing at Farm</option>
          <option value="IN_TRANSIT">In Transit</option>
          <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
          <option value="DELIVERED">Delivered</option>
          <option value="COMPLETED">Completed</option>
          <option value="DISPUTED">Disputed</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 h-36 animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-agro-100 p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-cream-200 text-agro-600 flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-agro-950">No Orders Found</h3>
          <p className="text-xs text-charcoal-500">You haven't placed any farm orders matching this status yet.</p>
          <Link
            to="/shop"
            className="inline-block bg-agro-600 hover:bg-agro-700 text-white font-bold text-xs px-6 py-2.5 rounded-full"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/account/orders/${order.id}`}
              className="block bg-white rounded-2xl border border-agro-100 p-6 shadow-card hover:shadow-card-hover transition-all space-y-4 group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-3">
                  <span className="font-mono font-bold text-sm text-agro-900">{order.order_number}</span>
                  <StatusBadge status={order.status} />
                </div>
                <div className="text-xs text-charcoal-400">
                  Placed on {new Date(order.created_at).toLocaleDateString('en-NG', { dateStyle: 'medium' })}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-xs font-bold text-agro-800">
                    <span>Farm: {order.farm_name}</span>
                    <span className="text-charcoal-400">•</span>
                    <span>Origin: {order.farm_state} State</span>
                  </div>
                  <div className="text-xs text-charcoal-500 flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-harvest-500" />
                    <span>Destination: {order.delivery_address?.street_address}, {order.delivery_address?.state}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className="text-[11px] text-charcoal-400 block">Total Paid</span>
                    <span className="text-base font-extrabold text-agro-900">
                      ₦{order.total_amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-agro-50 text-agro-700 group-hover:bg-agro-600 group-hover:text-white transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
