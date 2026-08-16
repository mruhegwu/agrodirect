import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertCircle,
  Sparkles,
  MapPin
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { PriceBreakdown } from '../../components/common/PriceBreakdown';

export const CheckoutPage: React.FC = () => {
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const preselectedState = searchParams.get('state') || 'Lagos';

  // Delivery Address State
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '+234');
  const [streetAddress, setStreetAddress] = useState('Plot 14, Admiralty Way, Lekki Phase 1');
  const [deliveryState, setDeliveryState] = useState(preselectedState);
  const [lga, setLga] = useState('Eti-Osa');
  const [deliveryInstructions, setDeliveryInstructions] = useState('Please call 10 mins before arrival.');

  // Payment Options
  const [paymentProvider, setPaymentProvider] = useState<'PAYSTACK' | 'FLUTTERWAVE'>('PAYSTACK');
  const [summary, setSummary] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Payment Modal Simulation
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activePaymentRef, setActivePaymentRef] = useState('');
  const [activeOrderId, setActiveOrderId] = useState('');
  const [activeAmount, setActiveAmount] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    async function loadSummary() {
      if (items.length === 0) return;
      try {
        const res = await api.cart.previewSummary(deliveryState);
        setSummary(res);
      } catch (err) {
        console.error(err);
      }
    }
    loadSummary();
  }, [items, deliveryState]);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.length) {
      alert('Your cart is empty');
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Submit Order to Server
      const orderRes = await api.orders.checkout({
        delivery_address: {
          full_name: fullName,
          phone,
          street_address: streetAddress,
          state: deliveryState,
          lga,
          delivery_instructions: deliveryInstructions
        },
        delivery_instructions: deliveryInstructions
      });

      const firstOrder = orderRes.orders[0];
      setActiveOrderId(firstOrder.id);
      setActiveAmount(orderRes.totalAmount);

      // 2. Initialize Payment Gateway on Server
      const payRes = await api.payments.initialize({
        order_id: firstOrder.id,
        amount: orderRes.totalAmount,
        provider: paymentProvider
      });

      setActivePaymentRef(payRes.reference);
      setIsPaymentModalOpen(true);
    } catch (err: any) {
      alert(err.message || 'Checkout failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmPayment = async (success: boolean = true) => {
    setIsVerifying(true);
    try {
      const verifyRes = await api.payments.verify(activePaymentRef, success);
      if (verifyRes.success) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        setIsPaymentModalOpen(false);
        navigate(`/account/orders/${activeOrderId}?payment=success`);
      } else {
        alert('Payment verification returned failure. Please try again.');
      }
    } catch (err: any) {
      alert(err.message || 'Payment verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-agro-950 font-display">Checkout & Order Placement</h1>
        <p className="text-xs text-charcoal-500 mt-1">
          Review delivery details, inspect transparent freight fees, and complete escrow payment.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Form */}
        <form onSubmit={handleCreateOrder} className="lg:col-span-7 space-y-6">
          {/* Address Card */}
          <div className="bg-white rounded-3xl border border-agro-100 p-6 sm:p-8 shadow-card space-y-4 text-xs">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-3 font-bold text-agro-950 text-sm">
              <MapPin className="w-4 h-4 text-agro-600" />
              <span>1. Delivery Destination Address</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-charcoal-700 mb-1">Recipient Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-cream-100 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-charcoal-900"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal-700 mb-1">Recipient Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-cream-100 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-charcoal-900 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-charcoal-700 mb-1">Street / House Address</label>
              <input
                type="text"
                required
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                placeholder="House Number, Street Name, Estate or Area"
                className="w-full bg-cream-100 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-charcoal-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-charcoal-700 mb-1">State</label>
                <select
                  value={deliveryState}
                  onChange={(e) => setDeliveryState(e.target.value)}
                  className="w-full bg-cream-100 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-charcoal-900 font-semibold"
                >
                  {['Lagos', 'Rivers', 'Enugu', 'Anambra', 'FCT', 'Abia'].map((st) => (
                    <option key={st} value={st}>
                      {st} State
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-charcoal-700 mb-1">LGA (Local Govt Area)</label>
                <input
                  type="text"
                  required
                  value={lga}
                  onChange={(e) => setLga(e.target.value)}
                  placeholder="e.g. Eti-Osa, Ikeja, Surulere"
                  className="w-full bg-cream-100 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-charcoal-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-charcoal-700 mb-1">Special Delivery Instructions (Optional)</label>
              <textarea
                rows={2}
                value={deliveryInstructions}
                onChange={(e) => setDeliveryInstructions(e.target.value)}
                placeholder="Gate code, landmark, temperature instructions on arrival..."
                className="w-full bg-cream-100 border border-gray-200 rounded-xl p-3 text-xs text-charcoal-900"
              />
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="bg-white rounded-3xl border border-agro-100 p-6 sm:p-8 shadow-card space-y-4 text-xs">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-3 font-bold text-agro-950 text-sm">
              <CreditCard className="w-4 h-4 text-agro-600" />
              <span>2. Secure Nigerian Payment Gateway</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label
                onClick={() => setPaymentProvider('PAYSTACK')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  paymentProvider === 'PAYSTACK'
                    ? 'border-agro-600 bg-agro-50/50 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-agro-950">Paystack</span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentProvider === 'PAYSTACK' ? 'border-agro-600 bg-agro-600 text-white' : 'border-gray-300'}`}>
                    {paymentProvider === 'PAYSTACK' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <p className="text-[11px] text-charcoal-500 mt-2">
                  Cards, Bank Transfer, USSD, Apple Pay
                </p>
              </label>

              <label
                onClick={() => setPaymentProvider('FLUTTERWAVE')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  paymentProvider === 'FLUTTERWAVE'
                    ? 'border-agro-600 bg-agro-50/50 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-harvest-600">Flutterwave</span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentProvider === 'FLUTTERWAVE' ? 'border-agro-600 bg-agro-600 text-white' : 'border-gray-300'}`}>
                    {paymentProvider === 'FLUTTERWAVE' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <p className="text-[11px] text-charcoal-500 mt-2">
                  Cards, Direct Debit, Barter, QR
                </p>
              </label>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center space-x-2 text-emerald-800 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                <strong>AgroDirect Escrow Guarantee:</strong> Payment is securely held until you inspect and confirm produce quality on arrival.
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-agro-600 hover:bg-agro-700 text-white font-bold text-sm py-4 rounded-full shadow-lg shadow-agro-600/20 hover:shadow-xl transition-all flex items-center justify-center space-x-2"
          >
            <Lock className="w-4 h-4" />
            <span>{isProcessing ? 'Processing Order...' : `Pay & Complete Order (₦${summary?.overallTotal.toLocaleString() || '0'})`}</span>
          </button>
        </form>

        {/* Right Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-agro-100 p-6 shadow-card space-y-4">
            <h3 className="font-bold text-agro-950 text-sm border-b border-gray-100 pb-3">
              Order Items ({items.length})
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {items.map((it) => (
                <div key={it.id} className="flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-5 text-center font-bold text-agro-700">{it.quantity}x</span>
                    <div>
                      <span className="font-bold text-charcoal-900 block">{it.product_name}</span>
                      <span className="text-[10px] text-charcoal-400">{it.farm_name} ({it.farm_state})</span>
                    </div>
                  </div>
                  <span className="font-extrabold text-charcoal-900">₦{(it.price * it.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {summary && (
            <PriceBreakdown
              subtotal={summary.ordersSummary.reduce((s: number, o: any) => s + o.subtotal, 0)}
              packagingFee={summary.ordersSummary.reduce((s: number, o: any) => s + o.packaging_fee, 0)}
              logisticsFee={summary.ordersSummary.reduce((s: number, o: any) => s + o.logistics_fee, 0)}
              platformFee={summary.ordersSummary.reduce((s: number, o: any) => s + o.platform_fee, 0)}
              total={summary.overallTotal}
            />
          )}
        </div>
      </div>

      {/* Payment Simulation & Gate Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-gray-100 space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-agro-100 text-agro-700 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-agro-700">
                {paymentProvider} Secure Gateway
              </span>
              <h3 className="text-xl font-bold text-agro-950">Complete Escrow Payment</h3>
              <p className="text-xs text-charcoal-500">
                Amount to pay: <strong className="text-agro-900 font-extrabold text-base">₦{activeAmount.toLocaleString()}</strong>
              </p>
            </div>

            <div className="bg-cream-100 p-4 rounded-2xl border border-gray-200 space-y-2 text-xs">
              <div className="flex justify-between text-charcoal-600">
                <span>Payment Reference:</span>
                <span className="font-mono font-bold text-agro-800">{activePaymentRef}</span>
              </div>
              <div className="flex justify-between text-charcoal-600">
                <span>Customer Email:</span>
                <span className="font-bold text-agro-800">{user?.email}</span>
              </div>
              <div className="flex justify-between text-charcoal-600">
                <span>Security Engine:</span>
                <span className="text-emerald-700 font-semibold">256-Bit SSL Encrypted</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleConfirmPayment(true)}
                disabled={isVerifying}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3.5 rounded-full shadow-md transition-all flex items-center justify-center space-x-2"
              >
                {isVerifying ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Authorize Successful Payment (Demo / Live)</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleConfirmPayment(false)}
                disabled={isVerifying}
                className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs py-2.5 rounded-full border border-rose-200 transition-colors"
              >
                Simulate Payment Failure
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
