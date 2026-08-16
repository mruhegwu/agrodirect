import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowRight, Truck, Snowflake, Package, MapPin, Store } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { PriceBreakdown } from '../../components/common/PriceBreakdown';

export const CartPage: React.FC = () => {
  const { items, itemCount, updateQuantity, removeFromCart, clearCart, isLoading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [deliveryState, setDeliveryState] = useState<string>('Lagos');
  const [summary, setSummary] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  useEffect(() => {
    async function loadSummary() {
      if (items.length === 0) {
        setSummary(null);
        return;
      }
      setIsCalculating(true);
      try {
        const res = await api.cart.previewSummary(deliveryState);
        setSummary(res);
      } catch (err) {
        console.error(err);
      } finally {
        setIsCalculating(false);
      }
    }
    loadSummary();
  }, [items, deliveryState]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-cream-200 text-agro-600 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-agro-950">Please Sign In</h2>
        <p className="text-xs text-charcoal-500">Sign in to view your shopping cart and calculate inter-state haulage.</p>
        <Link to="/login?redirect=/cart" className="inline-block bg-agro-600 text-white font-bold text-xs px-6 py-2.5 rounded-full">
          Sign In to Account
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-cream-200 text-agro-600 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-agro-950 font-display">Your Cart is Empty</h2>
        <p className="text-xs text-charcoal-500">Explore fresh harvests from verified farms in Abia and other states.</p>
        <Link to="/shop" className="inline-block bg-agro-600 hover:bg-agro-700 text-white font-bold text-xs px-8 py-3 rounded-full shadow-md transition-all">
          Browse Farm Produce
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex justify-between items-end border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-agro-950 font-display">Shopping Cart</h1>
          <p className="text-xs text-charcoal-500 mt-1">
            {itemCount} produce items in your inter-state order
          </p>
        </div>
        <button
          onClick={() => clearCart()}
          className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center space-x-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-7 space-y-4">
          {summary && summary.farmerCount > 1 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 space-y-1">
              <span className="font-bold block">💡 Multi-Farmer Split Notice:</span>
              <span>
                Your cart contains items from {summary.farmerCount} different farms. For maximum freshness and independent tracking, your order will automatically be split into separate shipments upon checkout.
              </span>
            </div>
          )}

          <div className="bg-white rounded-3xl border border-agro-100 divide-y divide-gray-100 shadow-card overflow-hidden">
            {items.map((item) => (
              <div key={item.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-2xl bg-cream-100 overflow-hidden border border-gray-100 flex-shrink-0">
                    <img
                      src={item.images && item.images.length > 0 ? item.images[0] : 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=300&q=80'}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 text-[11px] text-agro-700 font-bold mb-0.5">
                      <Store className="w-3.5 h-3.5" />
                      <span>{item.farm_name} ({item.farm_state})</span>
                    </div>
                    <Link to={`/products/${item.product_slug}`} className="text-sm font-bold text-agro-950 hover:text-agro-600 block">
                      {item.product_name}
                    </Link>
                    <div className="text-xs text-charcoal-500 mt-1">
                      ₦{item.price.toLocaleString()} / {item.unit}
                      {item.cold_chain_required && (
                        <span className="ml-2 text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                          ❄️ Cold Chain
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto sm:space-x-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  {/* Quantity Counter */}
                  <div className="flex items-center border border-gray-200 rounded-xl bg-cream-100 p-1 text-xs">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg text-charcoal-600 hover:bg-white font-bold flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="w-9 text-center font-bold text-agro-950">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg text-charcoal-600 hover:bg-white font-bold flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-extrabold text-agro-900">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-[11px] text-rose-500 hover:underline mt-0.5"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Checkout Summary & Destination Calculator */}
        <div className="lg:col-span-5 space-y-6">
          {/* Destination Selector */}
          <div className="bg-white rounded-2xl border border-agro-100 p-5 shadow-card space-y-3">
            <label className="block text-xs font-bold text-agro-950 uppercase tracking-wider flex items-center">
              <MapPin className="w-4 h-4 mr-1.5 text-harvest-500" />
              Delivery Destination State
            </label>
            <select
              value={deliveryState}
              onChange={(e) => setDeliveryState(e.target.value)}
              className="w-full text-xs font-bold bg-cream-100 border border-gray-200 rounded-xl px-3.5 py-2.5 text-agro-900 focus:outline-none focus:ring-2 focus:ring-agro-500"
            >
              {['Lagos', 'Rivers', 'Enugu', 'Anambra', 'FCT', 'Abia'].map((st) => (
                <option key={st} value={st}>
                  {st} State (Delivery Destination)
                </option>
              ))}
            </select>
          </div>

          {/* Price Breakdown */}
          {summary && (
            <PriceBreakdown
              subtotal={summary.ordersSummary.reduce((s: number, o: any) => s + o.subtotal, 0)}
              packagingFee={summary.ordersSummary.reduce((s: number, o: any) => s + o.packaging_fee, 0)}
              logisticsFee={summary.ordersSummary.reduce((s: number, o: any) => s + o.logistics_fee, 0)}
              platformFee={summary.ordersSummary.reduce((s: number, o: any) => s + o.platform_fee, 0)}
              total={summary.overallTotal}
            />
          )}

          <button
            onClick={() => navigate(`/checkout?state=${deliveryState}`)}
            className="w-full bg-agro-600 hover:bg-agro-700 text-white font-bold text-sm py-4 rounded-full shadow-lg shadow-agro-600/20 hover:shadow-xl transition-all flex items-center justify-center space-x-2"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
