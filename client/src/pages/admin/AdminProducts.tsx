import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, Filter, ExternalLink, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { Product } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await api.products.list();
      setProducts(data || []);
    } catch (err) {
      console.error('Failed to load admin products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.farm_name && p.farm_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (p.category_name && p.category_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-agro-950">Produce Catalog & Moderation</h2>
          <p className="text-xs text-charcoal-600">
            Global catalog oversight, price monitoring, cold-chain tags, and stock inventory.
          </p>
        </div>

        <button
          onClick={loadProducts}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-agro-200 text-charcoal-700 hover:bg-cream-50 text-xs font-semibold rounded-xl shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-agro-100 p-4 shadow-card">
        <div className="relative">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search produce name, origin farm, category..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-cream-50 border border-agro-200 rounded-xl text-xs focus:ring-2 focus:ring-agro-500"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-agro-100 shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-charcoal-500">Loading produce catalog...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-charcoal-500">No produce items found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50/75 text-charcoal-600 uppercase font-semibold border-b border-agro-50">
                <tr>
                  <th className="px-6 py-4">Produce</th>
                  <th className="px-6 py-4">Origin Farm</th>
                  <th className="px-6 py-4">Price / Unit</th>
                  <th className="px-6 py-4">Inventory</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-agro-50 font-medium text-charcoal-700">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-cream-50/40">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <img
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=100'}
                        alt={p.name}
                        className="w-10 h-10 rounded-xl object-cover border border-agro-100"
                      />
                      <div>
                        <span className="font-bold text-agro-950 block">{p.name}</span>
                        <span className="text-[10px] text-charcoal-500">{p.category_name || 'Agro Commodity'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-charcoal-900 block">{p.farm_name || 'Verified Farm'}</span>
                      <span className="text-[10px] text-agro-800">{p.farm_state || 'Abia'} State</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-agro-900">
                      ₦{p.price.toLocaleString()} / {p.unit}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold">{p.inventory} {p.unit}s</span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/products/${p.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-cream-100 hover:bg-cream-200 text-agro-900 rounded-xl font-semibold text-xs transition-colors"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
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
