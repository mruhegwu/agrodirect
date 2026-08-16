import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Phone,
  Printer,
  ShieldCheck
} from 'lucide-react';
import { api } from '../../services/api';
import { Order, OrderStatus } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DeliveryTimeline } from '../../components/common/DeliveryTimeline';

export const FarmerOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  const loadOrder = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await api.orders.getById(id);
      setOrder(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const handleUpdateStatus = async (nextStatus: OrderStatus) => {
    if (!order) return;
    try {
      setUpdating(true);
      await api.orders.updateStatus(order.id, nextStatus);
      await loadOrder();
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 animate-pulse space-y-4">
        <div className="h-6 bg-agro-100 rounded w-1/4"></div>
        <div className="h-48 bg-white rounded-3xl border border-agro-100"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-red-100">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <h3 className="text-base font-bold text-charcoal-900">Order Not Found</h3>
        <p className="text-xs text-charcoal-500 mb-4">{error || 'Could not load order details.'}</p>
        <Link to="/farmer/orders" className="text-xs font-semibold text-agro-700 hover:underline">
          Back to Farmer Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/farmer/orders')}
            className="p-2 bg-white hover:bg-cream-100 border border-agro-100 rounded-xl text-charcoal-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-display text-agro-950">
                Order #{order.order_number}
              </h2>
              <StatusBadge status={order.status} />
            </div>
            <span className="text-xs text-charcoal-500">
              Placed on {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-agro-200 text-charcoal-700 hover:bg-cream-50 rounded-xl text-xs font-semibold shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Packing Slip</span>
          </button>
        </div>
      </div>

      {/* Action Banner for Farmer Status Workflow */}
      <div className="bg-white rounded-3xl border border-agro-100 p-6 shadow-card">
        <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-3">
          Fulfillment Action
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          {order.status === 'PAID' && (
            <button
              disabled={updating}
              onClick={() => handleUpdateStatus('FARMER_CONFIRMED')}
              className="px-5 py-2.5 bg-agro-600 hover:bg-agro-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Order Availability</span>
            </button>
          )}

          {order.status === 'FARMER_CONFIRMED' && (
            <button
              disabled={updating}
              onClick={() => handleUpdateStatus('PREPARING')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <Package className="w-4 h-4" />
              <span>Start Harvesting / Packing</span>
            </button>
          )}

          {order.status === 'PREPARING' && (
            <button
              disabled={updating}
              onClick={() => handleUpdateStatus('READY_FOR_PICKUP')}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <Truck className="w-4 h-4" />
              <span>Mark Ready for Logistics Pickup</span>
            </button>
          )}

          {order.status === 'READY_FOR_PICKUP' && (
            <div className="text-xs text-amber-700 bg-amber-50 px-4 py-2 rounded-xl font-medium border border-amber-200">
              Harvest is packed and ready. Awaiting inter-state logistics provider dispatch.
            </div>
          )}

          {['LOGISTICS_ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED'].includes(order.status) && (
            <div className="text-xs text-emerald-800 bg-emerald-50 px-4 py-2 rounded-xl font-medium border border-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Order is with logistics partner for delivery to {order.delivery_address?.state || 'destination'}.</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Ordered Items & Logistics Waybill */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl border border-agro-100 p-6 shadow-card">
            <h3 className="font-bold text-agro-950 text-sm mb-4">Produce Items to Fulfill</h3>
            <div className="divide-y divide-agro-50">
              {order.items?.map(item => (
                <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cream-100 rounded-xl flex items-center justify-center text-agro-700 font-bold text-xs">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-agro-950 text-xs">{item.product_name}</h4>
                      <span className="text-[11px] text-charcoal-500">
                        {item.quantity} × ₦{item.price.toLocaleString()} per {item.unit}
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-agro-900 text-xs">
                    ₦{item.total_price.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Waybill Timeline */}
          {order.shipment && (
            <div className="bg-white rounded-3xl border border-agro-100 p-6 shadow-card">
              <h3 className="font-bold text-agro-950 text-sm mb-4">Logistics Tracking & Waybill</h3>
              <DeliveryTimeline
                status={order.shipment.status}
                events={order.shipment.events}
                originState={order.shipment.origin_state}
                destinationState={order.shipment.destination_state}
                trackingNumber={order.shipment.tracking_number}
              />
            </div>
          )}
        </div>

        {/* Right Column: Customer Info & Financial Settlement */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-agro-100 p-6 shadow-card">
            <h3 className="font-bold text-agro-950 text-sm mb-3">Buyer & Delivery Destination</h3>
            <div className="space-y-2 text-xs text-charcoal-700">
              <p className="font-semibold text-agro-950">{order.customer_name || 'Customer'}</p>
              {order.customer_phone && (
                <p className="flex items-center gap-1.5 text-charcoal-600">
                  <Phone className="w-3.5 h-3.5 text-charcoal-400" />
                  {order.customer_phone}
                </p>
              )}
              <div className="pt-2 border-t border-agro-50">
                <span className="text-[11px] text-charcoal-500 block mb-1">Destination Address:</span>
                <p className="font-medium">{order.delivery_address?.street_address}</p>
                <p className="text-agro-800 font-semibold mt-0.5">
                  {order.delivery_address?.lga} LGA, {order.delivery_address?.state} State
                </p>
              </div>

              {order.delivery_instructions && (
                <div className="mt-2 p-2.5 bg-cream-50 rounded-xl text-[11px] text-charcoal-600 italic">
                  Note: "{order.delivery_instructions}"
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-agro-100 p-6 shadow-card">
            <h3 className="font-bold text-agro-950 text-sm mb-3">Farmer Payout Breakdown</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-charcoal-600">
                <span>Produce Subtotal</span>
                <span className="font-semibold text-charcoal-900">₦{order.subtotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-charcoal-600">
                <span>Packaging Allowance</span>
                <span className="font-semibold text-charcoal-900">₦{order.packaging_fee?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-charcoal-500 text-[11px]">
                <span>Platform Commission (5%)</span>
                <span>-₦{order.platform_fee?.toLocaleString()}</span>
              </div>
              <div className="pt-3 border-t border-agro-50 flex justify-between font-bold text-sm text-agro-950">
                <span>Net Eligible Settlement</span>
                <span className="text-emerald-700">
                  ₦{((order.subtotal || 0) + (order.packaging_fee || 0) - (order.platform_fee || 0)).toLocaleString()}
                </span>
              </div>
              <p className="text-[10px] text-charcoal-500 mt-2">
                Settlements are credited directly to your AgroDirect wallet upon customer delivery confirmation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
