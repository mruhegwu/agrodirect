import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Package, Snowflake, Edit3, Trash2, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { Product } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const FarmerProducts: React.FC = () => {
  const { farm } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadProducts = async () => {
    if (!farm) return;
    setIsLoading(true);
    try {
      const data = await api.products.list({ farm_id: farm.id });
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [farm]);

  const toggleStatus = async (product: Product) => {
    const nextStatus = product.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';
    try {
      await api.products.update(product.id, { status: nextStatus });
      await loadProducts();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-agro-950">Farm Harvest Listings ({products.length})</h2>
          <p className="text-xs text-charcoal-400">Manage your active commercial products and available inventory</p>
        </div>
        <Link
          to="/farmer/products/new"
          className="bg-agro-600 hover:bg-agro-700 text-white font-bold text-xs px-4 py-2.5 rounded-full shadow-sm flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>List New Harvest</span>
        </Link>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs text-charcoal-400">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center space-y-4 border border-agro-100">
          <div className="w-12 h-12 bg-cream-200 rounded-2xl flex items-center justify-center mx-auto text-agro-600">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-agro-950">No Harvest Listings Yet</h3>
          <p className="text-xs text-charcoal-500 max-w-sm mx-auto">
            List your broiler chickens, fresh eggs, catfish or yams for immediate discovery by Lagos buyers.
          </p>
          <Link
            to="/farmer/products/new"
            className="inline-block bg-agro-600 text-white text-xs font-bold px-6 py-2.5 rounded-full"
          >
            Create Your First Listing
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-agro-100 divide-y divide-gray-100 shadow-card overflow-hidden">
          {products.map((p) => (
            <div key={p.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-cream-100 overflow-hidden border border-gray-100 flex-shrink-0">
                  <img
                    src={p.images && p.images.length > 0 ? p.images[0] : 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=300&q=80'}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-agro-950">{p.name}</span>
                    {p.cold_chain_required && (
                      <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                        ❄️ Cold Chain
                      </span>
                    )}
                  </div>
                  <div className="text-charcoal-500 text-[11px] mt-0.5">
                    ₦{p.price.toLocaleString()} / {p.unit} • Stock: <strong className="text-agro-800">{p.inventory}</strong> remaining
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => toggleStatus(p)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                    p.status === 'ACTIVE'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-gray-100 text-gray-600 border border-gray-300'
                  }`}
                >
                  {p.status}
                </button>

                <Link
                  to={`/products/${p.slug}`}
                  className="p-2 bg-cream-100 hover:bg-cream-200 text-agro-800 rounded-lg font-bold"
                  title="View Public Listing"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
