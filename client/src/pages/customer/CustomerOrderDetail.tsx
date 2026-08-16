import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Clock,
  ShieldAlert,
  Star,
  MessageSquare,
  AlertTriangle,
  ChevronLeft
} from 'lucide-react';
import { api } from '../../services/api';
import { Order, Review, Dispute } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DeliveryTimeline } from '../../components/common/DeliveryTimeline';
import { PriceBreakdown } from '../../components/common/PriceBreakdown';

export const CustomerOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [farmerRating, setFarmerRating] = useState(5);
  const [logisticsRating, setLogisticsRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Dispute Modal State
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('DAMAGED_GOODS');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);
  const [disputeSuccess, setDisputeSuccess] = useState(false);

  const loadOrder = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await api.orders.getById(id);
      setOrder(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  // Action: Confirm Delivery
  const handleConfirmDelivery = async () => {
    if (!order) return;
    const ok = window.confirm('Are you sure you have received and inspected this fresh agricultural produce in good condition? This will release the escrow settlement to the farmer.');
    if (!ok) return;

    try {
      await api.orders.updateStatus(order.id, 'COMPLETED');
      await loadOrder();
      setIsReviewModalOpen(true);
    } catch (err: any) {
      alert(err.message || 'Failed to confirm delivery');
    }
  };

  // Action: Submit Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setIsSubmittingReview(true);
    try {
      await api.reviews.create({
        order_id: order.id,
        rating,
        farmer_rating: farmerRating,
        logistics_rating: logisticsRating,
        comment: reviewComment
      });
      setReviewSuccess(true);
      setTimeout(() => {
        setIsReviewModalOpen(false);
        setReviewSuccess(false);
      }, 2000);
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Action: File Dispute
  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setIsSubmittingDispute(true);
    try {
      await api.disputes.create({
        order_id: order.id,
        reason: disputeReason,
        description: disputeDesc,
        evidence_urls: []
      });
      setDisputeSuccess(true);
      await loadOrder();
      setTimeout(() => {
        setIsDisputeModalOpen(false);
        setDisputeSuccess(false);
      }, 2000);
    } catch (err: any) {
      alert(err.message || 'Failed to submit dispute');
    } finally {
      setIsSubmittingDispute(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-agro-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs font-semibold text-agro-900">Loading order tracking...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-agro-950">Order Not Found</h2>
        <Link to="/account/orders" className="text-xs font-bold text-agro-700 underline">
          Back to My Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div className="space-y-1">
          <Link to="/account/orders" className="text-xs font-bold text-agro-700 hover:text-agro-900 flex items-center mb-2">
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span>Back to All Orders</span>
          </Link>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-agro-950 font-display">
              Order {order.order_number}
            </h1>
            <StatusBadge status={order.status} size="lg" />
          </div>
          <p className="text-xs text-charcoal-400">
            Placed on {new Date(order.created_at).toLocaleString('en-NG', { dateStyle: 'long', timeStyle: 'short' })}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {['DELIVERED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(order.status) && (
            <button
              onClick={handleConfirmDelivery}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-md transition-all flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Delivery Received</span>
            </button>
          )}

          {order.status === 'COMPLETED' && (
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="bg-agro-600 hover:bg-agro-700 text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-md transition-all flex items-center space-x-1.5"
            >
              <Star className="w-4 h-4" />
              <span>Write Farmer Review</span>
            </button>
          )}

          {!['CANCELLED', 'REFUNDED', 'DISPUTED'].includes(order.status) && (
            <button
              onClick={() => setIsDisputeModalOpen(true)}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold px-4 py-2.5 rounded-full transition-colors flex items-center space-x-1.5"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Report Issue / Open Dispute</span>
            </button>
          )}
        </div>
      </div>

      {/* Disputed Alert Banner */}
      {order.status === 'DISPUTED' && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 flex items-center space-x-3 text-xs text-rose-800 font-semibold">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <div>
            <strong>Dispute Under Review:</strong> A dispute is active on this order. Farmer settlement funds have been automatically held in escrow pending Admin inspection and resolution.
          </div>
        </div>
      )}

      {/* Live Route Stepper */}
      {order.shipment && (
        <DeliveryTimeline
          status={order.shipment.status}
          events={order.shipment.events}
          originState={order.shipment.origin_state}
          destinationState={order.shipment.destination_state}
          trackingNumber={order.shipment.tracking_number}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Items List */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-agro-100 p-6 shadow-card space-y-4">
            <h3 className="font-bold text-agro-950 text-sm border-b border-gray-100 pb-3">
              Ordered Agricultural Produce ({order.items?.length || 0})
            </h3>

            <div className="divide-y divide-gray-100">
              {order.items?.map((item) => (
                <div key={item.id} className="py-4 flex items-start justify-between gap-4 text-xs">
                  <div>
                    <span className="font-bold text-charcoal-900 text-sm block">{item.product_name}</span>
                    <span className="text-charcoal-500 mt-0.5 block">
                      {item.quantity} {item.unit}(s) @ ₦{item.price.toLocaleString()} each
                    </span>

                    {/* Agricultural Specs */}
                    {item.product_attributes && Object.keys(item.product_attributes).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {Object.entries(item.product_attributes).map(([k, v]) => (
                          <span key={k} className="bg-cream-100 text-agro-900 border border-agro-100 text-[10px] px-2 py-0.5 rounded font-medium">
                            {k}: {String(v)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <span className="font-extrabold text-agro-900 text-sm">
                    ₦{item.total_price.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Farm Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-white rounded-2xl border border-agro-100 p-5 shadow-xs space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-agro-700 block">
                Origin Farm
              </span>
              <p className="font-bold text-agro-950 text-sm">{order.farm_name}</p>
              <p className="text-charcoal-500">Producer: {order.farmer_name}</p>
              <p className="text-charcoal-500">Origin: {order.farm_state} State</p>
            </div>

            <div className="bg-white rounded-2xl border border-agro-100 p-5 shadow-xs space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-harvest-600 block">
                Destination Address
              </span>
              <p className="font-bold text-agro-950 text-sm">{order.delivery_address?.full_name}</p>
              <p className="text-charcoal-500">{order.delivery_address?.street_address}</p>
              <p className="text-charcoal-500">{order.delivery_address?.lga}, {order.delivery_address?.state} State</p>
              <p className="text-charcoal-500 font-mono">Phone: {order.delivery_address?.phone}</p>
            </div>
          </div>
        </div>

        {/* Right: Transparent Price Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          <PriceBreakdown
            subtotal={order.subtotal}
            packagingFee={order.packaging_fee}
            logisticsFee={order.logistics_fee}
            platformFee={order.platform_fee}
            discount={order.discount}
            total={order.total_amount}
          />
        </div>
      </div>

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-gray-100 space-y-4">
            <h3 className="text-lg font-bold text-agro-950">Review Your Farm Produce</h3>
            <p className="text-xs text-charcoal-500">
              Your verified review helps commercial farmers maintain high quality standards.
            </p>

            {reviewSuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Thank you! Your verified review has been published.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">Overall Rating (1 to 5 Stars)</label>
                  <div className="flex space-x-2 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                        className={`text-2xl ${s <= rating ? 'text-amber-400' : 'text-gray-300'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">Feedback & Produce Quality</label>
                  <textarea
                    rows={3}
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Describe produce freshness, bird weight, packaging condition..."
                    className="w-full bg-cream-100 border border-gray-200 rounded-xl p-3 text-xs text-charcoal-900"
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="flex-1 bg-agro-600 hover:bg-agro-700 text-white font-bold py-2.5 rounded-full"
                  >
                    {isSubmittingReview ? 'Submitting...' : 'Submit Verified Review'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="px-4 py-2.5 bg-gray-100 text-charcoal-700 font-bold rounded-full"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {isDisputeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center space-x-2 text-rose-700">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-lg font-bold">Open Order Dispute</h3>
            </div>
            <p className="text-xs text-charcoal-500">
              Filing a dispute immediately freezes farmer escrow funds until Admin inspects evidence.
            </p>

            {disputeSuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Dispute logged successfully. An AgroDirect resolution officer has been assigned.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmitDispute} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">Dispute Reason</label>
                  <select
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    className="w-full bg-cream-100 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    <option value="DAMAGED_GOODS">Damaged / Spoiled Produce</option>
                    <option value="WRONG_ITEM">Wrong Item / Weight Discrepancy</option>
                    <option value="LATE_DELIVERY">Severe Logistics Delay (&gt;48h)</option>
                    <option value="MISSING_ITEMS">Missing Products</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">Detailed Description of Issue</label>
                  <textarea
                    rows={4}
                    required
                    value={disputeDesc}
                    onChange={(e) => setDisputeDesc(e.target.value)}
                    placeholder="Provide details about the issue on delivery..."
                    className="w-full bg-cream-100 border border-gray-200 rounded-xl p-3 text-xs text-charcoal-900"
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingDispute}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-full"
                  >
                    {isSubmittingDispute ? 'Filing Dispute...' : 'Submit Dispute & Hold Funds'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDisputeModalOpen(false)}
                    className="px-4 py-2.5 bg-gray-100 text-charcoal-700 font-bold rounded-full"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
