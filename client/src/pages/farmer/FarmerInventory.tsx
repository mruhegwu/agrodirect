import React, { useEffect, useState } from 'react';
import { Package, Plus, Minus, RefreshCw, AlertTriangle, CheckCircle2, TrendingUp, History } from 'lucide-react';
import { api } from '../../services/api';
import { Product } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';

export const FarmerInventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState('New harvest harvested from farm');
  const [updating, setUpdating] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const loadInventory = async () => {
    try {
      setLoading(true);
      const data = await api.products.list();
      setProducts(data);
    } catch (err) {
      console.error('Failed to load farmer inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleStockUpdate = async (type: 'ADD' | 'SUBTRACT') => {
    if (!selectedProduct) return;
    try {
      setUpdating(true);
      const delta = type === 'ADD' ? adjustAmount : -adjustAmount;
      const newInventory = Math.max(0, selectedProduct.inventory + delta);

      await api.products.update(selectedProduct.id, {
        inventory: newInventory,
        status: newInventory > 0 ? 'ACTIVE' : 'OUT_OF_STOCK'
      });

      setFeedbackMsg(`Successfully updated inventory for ${selectedProduct.name} to ${newInventory} ${selectedProduct.unit}s.`);
      setSelectedProduct(null);
      await loadInventory();
    } catch (err: any) {
      alert(err.message || 'Failed to update stock');
    } finally {
      setUpdating(false);
    }
  };

  const totalUnits = products.reduce((acc, p) => acc + (p.inventory || 0), 0);
  const lowStockCount = products.filter(p => (p.inventory || 0) <= (p.minimum_quantity || 5)).length;
  const inventoryValue = products.reduce((acc, p) => acc + ((p.inventory || 0) * p.price), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-agro-950">Farm Inventory & Stock Control</h2>
        <p className="text-xs text-charcoal-600">
          Track harvest yields, reserve stocks for pending orders, and log replenishment.
        </p>
      </div>

      {feedbackMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{feedbackMsg}</span>
          </div>
          <button onClick={() => setFeedbackMsg('')} className="text-emerald-700 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Metrics Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-agro-100 p-5 shadow-card">
          <span className="text-xs text-charcoal-500 font-medium">Total Listed Produce Units</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-bold text-agro-950">{totalUnits.toLocaleString()}</span>
            <div className="p-2.5 bg-agro-50 text-agro-700 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-agro-100 p-5 shadow-card">
          <span className="text-xs text-charcoal-500 font-medium">Estimated Inventory Value</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-bold text-agro-950">₦{inventoryValue.toLocaleString()}</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-agro-100 p-5 shadow-card">
          <span className="text-xs text-charcoal-500 font-medium">Low Stock Alerts</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-bold text-amber-600">{lowStockCount} items</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-3xl border border-agro-100 shadow-card overflow-hidden">
        <div className="p-5 border-b border-agro-50 flex items-center justify-between">
          <h3 className="font-bold text-agro-950 text-sm">Harvest Stock Records</h3>
          <button
            onClick={loadInventory}
            className="flex items-center gap-1 text-xs text-agro-700 hover:text-agro-800 font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-charcoal-500 text-xs">Loading inventory stock...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-charcoal-500 text-xs">No farm produce listed yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50/75 text-charcoal-600 uppercase font-semibold border-b border-agro-50">
                <tr>
                  <th className="px-6 py-4">Produce</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Unit Price</th>
                  <th className="px-6 py-4">In Stock</th>
                  <th className="px-6 py-4">Min. Order</th>
                  <th className="px-6 py-4">Cold-Chain</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-agro-50 font-medium text-charcoal-700">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-cream-50/40 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <img
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=100'}
                        alt={p.name}
                        className="w-10 h-10 rounded-xl object-cover border border-agro-100"
                      />
                      <div>
                        <span className="font-bold text-agro-950 block">{p.name}</span>
                        <span className="text-[10px] text-charcoal-500">{p.unit}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-6 py-4 font-bold text-agro-900">
                      ₦{p.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-xs ${
                        p.inventory <= (p.minimum_quantity || 5)
                          ? 'bg-red-50 text-red-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {p.inventory} {p.unit}s
                      </span>
                    </td>
                    <td className="px-6 py-4">{p.minimum_quantity || 1}</td>
                    <td className="px-6 py-4">
                      {p.cold_chain_required ? (
                        <span className="text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                          Required
                        </span>
                      ) : (
                        <span className="text-charcoal-400">Standard</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedProduct(p)}
                        className="px-3 py-1.5 bg-agro-600 hover:bg-agro-700 text-white rounded-xl font-semibold text-xs transition-colors"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Adjust Stock Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-agro-100">
            <h3 className="text-lg font-bold font-display text-agro-950 mb-1">
              Adjust Produce Stock
            </h3>
            <p className="text-xs text-charcoal-600 mb-4">
              Updating quantity for <strong className="text-agro-900">{selectedProduct.name}</strong> (Current: {selectedProduct.inventory} {selectedProduct.unit}s)
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">Quantity to Adjust</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setAdjustAmount(Math.max(1, adjustAmount - 5))}
                    className="p-2.5 bg-cream-100 hover:bg-cream-200 rounded-xl text-charcoal-700 font-bold"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={adjustAmount}
                    onChange={e => setAdjustAmount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 text-center py-2 bg-cream-50 border border-agro-200 rounded-xl font-bold text-base focus:ring-2 focus:ring-agro-500"
                  />
                  <button
                    type="button"
                    onClick={() => setAdjustAmount(adjustAmount + 5)}
                    className="p-2.5 bg-cream-100 hover:bg-cream-200 rounded-xl text-charcoal-700 font-bold"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">Adjustment Reason / Notes</label>
                <select
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 bg-cream-50 border border-agro-200 rounded-xl text-xs"
                >
                  <option value="New harvest harvested from farm">New harvest harvested from farm</option>
                  <option value="Restock from cold room / storage">Restock from cold room / storage</option>
                  <option value="Damaged / spoiled produce removed">Damaged / spoiled produce removed</option>
                  <option value="Direct bulk sale at local farm gate">Direct bulk sale at local farm gate</option>
                </select>
              </div>

              <div className="pt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleStockUpdate('SUBTRACT')}
                  className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1"
                >
                  <Minus className="w-3.5 h-3.5" />
                  Remove {adjustAmount} Units
                </button>
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleStockUpdate('ADD')}
                  className="w-full py-2.5 bg-agro-600 hover:bg-agro-700 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add {adjustAmount} Units
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="w-full text-center text-xs text-charcoal-500 hover:underline pt-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
