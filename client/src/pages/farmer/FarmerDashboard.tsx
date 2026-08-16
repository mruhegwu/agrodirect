import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Package, ShoppingBag, Wallet, Star, ArrowUpRight, Clock, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';

export const FarmerDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const res = await api.farmers.getDashboard();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleQuickConfirm = async (orderId: string) => {
    try {
      await api.orders.updateStatus(orderId, 'FARMER_CONFIRMED');
      await loadDashboard();
    } catch (err: any) {
      alert(err.message || 'Failed to update order');
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 text-center text-xs text-charcoal-400">
        <div className="w-8 h-8 border-4 border-agro-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Loading farmer metrics...
      </div>
    );
  }

  const m = data?.metrics || {};

  return (
    <div className="space-y-8">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-5 rounded-2xl border border-agro-100 shadow-card space-y-1">
          <div className="flex items-center justify-between text-charcoal-500">
            <span>Total Lifetime Sales</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-agro-950 font-display">
            ₦{(m.total_sales || 0).toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">
            ₦{(m.this_month_sales || 0).toLocaleString()} this month
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-agro-100 shadow-card space-y-1">
          <div className="flex items-center justify-between text-charcoal-500">
            <span>Pending Orders</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-950 font-display">
            {m.pending_orders || 0}
          </div>
          <span className="text-[11px] text-charcoal-400">Requires harvesting/prep</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-agro-100 shadow-card space-y-1">
          <div className="flex items-center justify-between text-charcoal-500">
            <span>Active Listings Value</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-blue-950 font-display">
            ₦{(m.inventory_value || 0).toLocaleString()}
          </div>
          <span className="text-[11px] text-charcoal-400">{m.active_products || 0} active products</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-agro-100 shadow-card space-y-1">
          <div className="flex items-center justify-between text-charcoal-500">
            <span>Escrow Settlement</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-purple-950 font-display">
            ₦{(m.pending_settlement || 0).toLocaleString()}
          </div>
          <span className="text-[11px] text-purple-600 font-semibold">Released on delivery</span>
        </div>
      </div>

      {/* Recent Orders Action Center */}
      <div className="bg-white rounded-3xl border border-agro-100 p-6 shadow-card space-y-4">
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-agro-950">Recent Orders Requiring Fulfillment</h2>
            <p className="text-xs text-charcoal-400">Confirm and prepare produce for cold-chain haulage pickup</p>
          </div>
          <Link to="/farmer/orders" className="text-xs font-bold text-agro-700 hover:text-agro-900">
            View All Orders →
          </Link>
        </div>

        {data?.recentOrders?.length === 0 ? (
          <p className="text-xs text-charcoal-400 py-6 text-center">No orders currently pending fulfillment.</p>
        ) : (
          <div className="divide-y divide-gray-100 text-xs">
            {data?.recentOrders?.map((ord: any) => (
              <div key={ord.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-agro-900">{ord.order_number}</span>
                    <StatusBadge status={ord.status} size="sm" />
                  </div>
                  <div className="text-charcoal-500 text-[11px]">
                    Buyer: {ord.customer_name} • Destination: {ord.delivery_address?.state} State
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="font-bold text-agro-900 text-sm">
                    ₦{ord.total_amount.toLocaleString()}
                  </span>

                  {ord.status === 'PAID' && (
                    <button
                      onClick={() => handleQuickConfirm(ord.id)}
                      className="bg-agro-600 hover:bg-agro-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs"
                    >
                      Confirm Order
                    </button>
                  )}

                  <Link
                    to={`/account/orders/${ord.id}`}
                    className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-charcoal-700 font-medium"
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
