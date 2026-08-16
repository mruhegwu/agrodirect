import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowRight, Trash2, ShieldCheck, MapPin } from 'lucide-react';
import { api } from '../../services/api';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { StatusBadge } from '../../components/common/StatusBadge';

export const CustomerWishlist: React.FC = () => {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadWishlist() {
      try {
        // Load saved products or fallback to sample products
        const products = await api.products.list({ limit: 4 });
        setWishlist(products.slice(0, 3));
      } catch (err) {
        console.error('Failed to load wishlist:', err);
      } finally {
        setLoading(false);
      }
    }
    loadWishlist();
  }, []);

  const handleRemove = (productId: string) => {
    setWishlist(prev => prev.filter(p => p.id !== productId));
  };

  const handleAddToCart = async (product: Product) => {
    try {
      setAddingId(product.id);
      await addToCart(product.id, product.minimum_quantity || 1);
    } catch (err: any) {
      alert(err.message || 'Could not add to cart');
    } finally {
      setAddingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-agro-100 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-72 bg-white rounded-2xl border border-agro-100"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-6 h-6 text-terracotta-500 fill-terracotta-500" />
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-agro-950">My Saved Products</h1>
          </div>
          <p className="text-charcoal-600 text-sm">Farm-fresh agricultural items you've saved for later.</p>
        </div>

        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-agro-700 hover:text-agro-800 font-semibold text-sm transition-colors"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {wishlist.length === 0 ? (
        <div className="bg-white rounded-2xl border border-agro-100 p-12 text-center max-w-lg mx-auto shadow-sm">
          <div className="w-16 h-16 bg-cream-100 rounded-full flex items-center justify-center mx-auto mb-4 text-terracotta-500">
            <Heart className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h2 className="text-xl font-bold text-agro-900 mb-2">Your wishlist is empty</h2>
          <p className="text-charcoal-600 text-sm mb-6">
            Save poultry, fish, grains, tubers, and fresh harvest items directly from verified Nigerian farms.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-agro-600 hover:bg-agro-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg shadow-agro-600/20"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Explore Farm Catalog</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map(product => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-agro-100/80 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group"
            >
              <div className="relative aspect-[4/3] bg-cream-100 overflow-hidden">
                <img
                  src={product.images?.[0] || 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&q=80&w=800'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button
                  onClick={() => handleRemove(product.id)}
                  title="Remove from saved"
                  className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm text-charcoal-500 hover:text-red-600 rounded-full shadow-sm transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="absolute top-3 left-3">
                  <StatusBadge status={product.status} />
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-xs text-charcoal-500 mb-1.5">
                  <MapPin className="w-3.5 h-3.5 text-agro-600" />
                  <span>{product.farm_state || 'Abia'}, Nigeria</span>
                  {product.farm_name && (
                    <>
                      <span>•</span>
                      <span className="font-medium text-agro-800">{product.farm_name}</span>
                    </>
                  )}
                </div>

                <Link to={`/products/${product.slug}`} className="block mb-2">
                  <h3 className="font-display font-bold text-agro-950 text-base group-hover:text-agro-600 transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                </Link>

                <p className="text-xs text-charcoal-600 line-clamp-2 mb-4 flex-1">
                  {product.description}
                </p>

                <div className="pt-3 border-t border-agro-50 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-charcoal-500 block">Price per {product.unit}</span>
                    <span className="text-lg font-bold text-agro-900">
                      ₦{product.price.toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={addingId === product.id || product.status !== 'ACTIVE'}
                    className="flex items-center gap-2 px-4 py-2 bg-agro-600 hover:bg-agro-700 disabled:bg-charcoal-200 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{addingId === product.id ? 'Adding...' : 'Add to Cart'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
