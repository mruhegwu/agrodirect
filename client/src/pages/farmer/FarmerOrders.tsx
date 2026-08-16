import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, CheckCircle2, Clock, Truck, MapPin } from 'lucide-react';
import { api } from '../../services/api';
import { Order } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';

export const FarmerOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await api.orders.getFarmerOrders(statusFilter);
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const handleStateTransition = async (orderId: string, nextStatus: string) => {
    try {
      await api.orders.updateStatus(orderId, nextStatus);
      await loadOrders();
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-agro-950">Farmer Fulfillment Orders</h2>
          <p className="text-xs text-charcoal-400">Process incoming customer orders and prepare shipments for logistics pickup</p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-charcoal-800 focus:outline-none"
        >
          <option value="">All Orders</option>
          <option value="PAID">Paid / Awaiting Confirmation</option>
          <option value="FARMER_CONFIRMED">Confirmed</option>
          <option value="PREPARING">Preparing Harvest</option>
          <option value="READY_FOR_PICKUP">Ready for Haulage Pickup</option>
          <option value="IN_TRANSIT">In Transit</option>
          <option value="DELIVERED">Delivered</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs text-charcoal-400">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-xs text-charcoal-400 border border-gray-100">
          No orders found matching this status filter.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div key={ord.id} className="bg-white rounded-2xl border border-agro-100 p-6 shadow-card space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-3">
                  <span className="font-mono font-bold text-sm text-agro-900">{ord.order_number}</span>
                  <StatusBadge status={ord.status} />
                </div>
                <div className="text-xs text-charcoal-400">
                  {new Date(ord.created_at).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="font-bold text-charcoal-900">
                    Buyer: {ord.customer_name} ({ord.customer_phone})
                  </div>
                  <div className="text-charcoal-500">
                    Destination: {ord.delivery_address?.street_address}, {ord.delivery_address?.state} State
                  </div>
                  <div className="text-[11px] text-agro-700 font-semibold">
                    Items: {ord.items?.map(i => `${i.quantity}x ${i.product_name}`).join(', ')}
                  </div>
                </div>

                <div className="flex flex-col sm:items-end space-y-2">
                  <div className="text-right">
                    <span className="text-[10px] text-charcoal-400 block">Farmer Produce Net</span>
                    <span className="text-base font-extrabold text-agro-900">
                      ₦{(ord.subtotal + ord.packaging_fee).toLocaleString()}
                    </span>
                  </div>

                  {/* Dynamic State Machine Transition Buttons */}
                  <div className="flex items-center space-x-2">
                    {ord.status === 'PAID' && (
                      <button
                        onClick={() => handleStateTransition(ord.id, 'FARMER_CONFIRMED')}
                        className="bg-agro-600 hover:bg-agro-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm"
                      >
                        ✓ Confirm Order
                      </button>
                    )}

                    {ord.status === 'FARMER_CONFIRMED' && (
                      <button
                        onClick={() => handleStateTransition(ord.id, 'PREPARING')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm"
                      >
                        🌾 Mark Preparing / Harvesting
                      </button>
                    )}

                    {ord.status === 'PREPARING' && (
                      <button
                        onClick={() => handleStateTransition(ord.id, 'READY_FOR_PICKUP')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm flex items-center space-x-1"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Ready for Logistics Pickup</span>
                      </button>
                    )}

                    <Link
                      to={`/account/orders/${ord.id}`}
                      className="p-2 bg-cream-100 hover:bg-cream-200 rounded-xl font-bold text-agro-800"
                    >
                      Inspect
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
