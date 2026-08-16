import React, { useEffect, useState } from 'react';
import { ShoppingBag, FileText, Send, Building, CheckCircle2, Clock } from 'lucide-react';
import { api } from '../../services/api';
import { BulkOrderRequest, Category } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const BulkOrders: React.FC = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [requests, setRequests] = useState<BulkOrderRequest[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form state
  const [productName, setProductName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [requiredQuantity, setRequiredQuantity] = useState<number>(100);
  const [unit, setUnit] = useState('Kg');
  const [targetPrice, setTargetPrice] = useState<number>(0);
  const [deliveryState, setDeliveryState] = useState('Lagos');
  const [deliveryLga, setDeliveryLga] = useState('Ikeja');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [specifications, setSpecifications] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, reqs] = await Promise.all([
          api.categories.list(),
          api.bulkOrders.listRequests()
        ]);
        setCategories(cats);
        setRequests(reqs);
        if (cats.length > 0) setCategoryId(cats[0].id);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in or use the Demo Persona Switcher to submit a bulk RFQ');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.bulkOrders.createRequest({
        category_id: categoryId,
        product_name: productName,
        required_quantity: requiredQuantity,
        unit,
        target_price_per_unit: targetPrice > 0 ? targetPrice : undefined,
        delivery_state: deliveryState,
        delivery_lga: deliveryLga,
        delivery_date: deliveryDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        specifications: { notes: specifications }
      });

      setSuccessMessage('Your B2B RFQ has been broadcast to verified commercial farmers across Nigeria!');
      setProductName('');
      setSpecifications('');
      const updatedReqs = await api.bulkOrders.listRequests();
      setRequests(updatedReqs);
    } catch (err: any) {
      alert(err.message || 'Failed to submit RFQ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-agro-900 to-agro-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl space-y-4">
        <span className="bg-amber-400 text-agro-950 font-extrabold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider">
          B2B Agricultural Procurement
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display">
          Direct Commercial Farm Contract Orders
        </h1>
        <p className="text-agro-200 text-sm max-w-2xl leading-relaxed">
          Are you a restaurant, food factory, hotel or supermarket chain? Submit wholesale RFQs (Request for Quote) to receive competitive tenders and guaranteed cold-chain delivery.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* RFQ Form */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-agro-100 p-8 shadow-card space-y-6">
          <div>
            <h2 className="text-xl font-bold text-agro-950">Submit Request for Quote (RFQ)</h2>
            <p className="text-xs text-charcoal-400 mt-1">
              Verified farmers will bid with direct farm-gate pricing and delivery timelines.
            </p>
          </div>

          {successMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-charcoal-700 mb-1">Produce / Commodity Name</label>
              <input
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. 500 Dressed Broiler Chickens (2.5kg) or 50 Bags White Yam"
                className="w-full bg-cream-100 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-agro-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-charcoal-700 mb-1">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-cream-100 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-charcoal-800 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-charcoal-700 mb-1">Unit Type</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full bg-cream-100 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-charcoal-800 focus:outline-none"
                >
                  {['Kg', 'Bird', 'Crate', 'Bag', 'Bunch', 'Tonne', 'Piece', 'Basket'].map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-charcoal-700 mb-1">Required Quantity</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={requiredQuantity}
                  onChange={(e) => setRequiredQuantity(Number(e.target.value))}
                  className="w-full bg-cream-100 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-charcoal-800"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal-700 mb-1">Target Price per Unit (₦, Optional)</label>
                <input
                  type="number"
                  value={targetPrice || ''}
                  onChange={(e) => setTargetPrice(Number(e.target.value))}
                  placeholder="Target budget per unit"
                  className="w-full bg-cream-100 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-charcoal-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-charcoal-700 mb-1">Delivery State</label>
                <select
                  value={deliveryState}
                  onChange={(e) => setDeliveryState(e.target.value)}
                  className="w-full bg-cream-100 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-charcoal-800 focus:outline-none"
                >
                  {['Lagos', 'Abia', 'Rivers', 'Enugu', 'Anambra', 'FCT'].map((st) => (
                    <option key={st} value={st}>
                      {st} State
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-charcoal-700 mb-1">Target Delivery Date</label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full bg-cream-100 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-charcoal-800"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-charcoal-700 mb-1">Quality Specifications & Requirements</label>
              <textarea
                rows={3}
                value={specifications}
                onChange={(e) => setSpecifications(e.target.value)}
                placeholder="Mention cold-chain requirement, dressed vs live, packaging standards, recurring weekly requirement etc."
                className="w-full bg-cream-100 border border-gray-200 rounded-xl p-3 text-xs text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-agro-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-agro-600 hover:bg-agro-700 text-white font-bold text-sm py-3.5 rounded-full shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Broadcasting RFQ...' : 'Submit Request for Quote'}</span>
            </button>
          </form>
        </div>

        {/* Live Open B2B RFQs */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-agro-950">Active Institutional RFQs</h2>
            <span className="text-xs text-charcoal-400">{requests.length} Live Benders</span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {requests.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center text-xs text-charcoal-400">
                No active RFQs open at this moment.
              </div>
            ) : (
              requests.map((r) => (
                <div key={r.id} className="bg-white p-5 rounded-2xl border border-agro-100 shadow-xs space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-harvest-600 bg-harvest-50 px-2 py-0.5 rounded uppercase">
                        {r.category_name}
                      </span>
                      <h3 className="text-sm font-bold text-agro-950 mt-1">{r.product_name}</h3>
                      <div className="text-xs text-charcoal-500 flex items-center space-x-2 mt-0.5">
                        <span>Quantity: <strong className="text-agro-800">{r.required_quantity} {r.unit}s</strong></span>
                        <span>•</span>
                        <span>Delivery: <strong className="text-agro-800">{r.delivery_state}</strong></span>
                      </div>
                    </div>
                    <span className="bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {r.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs border-t border-gray-100 pt-3">
                    <span className="text-charcoal-400">
                      Offers received: <strong className="text-agro-700">{r.offer_count || 0}</strong>
                    </span>
                    <span className="text-charcoal-400">
                      Need by: {new Date(r.delivery_date).toLocaleDateString('en-NG')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
