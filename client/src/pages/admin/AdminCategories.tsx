import React, { useEffect, useState } from 'react';
import { Layers, Plus, CheckCircle2, Edit2, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { Category } from '../../types';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await api.categories.list();
      setCategories(data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-agro-950">Agricultural Produce Categories</h2>
          <p className="text-xs text-charcoal-600">
            Configure commodity categories, sorting order, and marketplace tax/commission tiers.
          </p>
        </div>

        <button
          onClick={loadCategories}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-agro-200 text-charcoal-700 hover:bg-cream-50 text-xs font-semibold rounded-xl shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-3xl border border-agro-100 shadow-card overflow-hidden">
        <div className="p-5 border-b border-agro-50">
          <h3 className="font-bold text-agro-950 text-sm">Active Categories ({categories.length})</h3>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-charcoal-500">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-xs text-charcoal-500">No categories found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50/75 text-charcoal-600 uppercase font-semibold border-b border-agro-50">
                <tr>
                  <th className="px-6 py-4">Category Name</th>
                  <th className="px-6 py-4">URL Slug</th>
                  <th className="px-6 py-4">Listed Products</th>
                  <th className="px-6 py-4">Platform Fee</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-agro-50 font-medium text-charcoal-700">
                {categories.map(c => (
                  <tr key={c.id} className="hover:bg-cream-50/40">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-agro-50 text-agro-700 flex items-center justify-center font-bold">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-agro-950 block">{c.name}</span>
                        <span className="text-[10px] text-charcoal-500 line-clamp-1">{c.description || 'Agricultural Commodity'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-charcoal-600">/categories/{c.slug}</td>
                    <td className="px-6 py-4 font-semibold">{c.product_count || 4} items</td>
                    <td className="px-6 py-4 font-bold text-emerald-700">5.0% Standard</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        c.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-charcoal-100 text-charcoal-500'
                      }`}>
                        {c.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
