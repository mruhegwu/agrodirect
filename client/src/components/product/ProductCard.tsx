import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Snowflake, MapPin, Check, Plus, AlertTriangle } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { VerificationBadge } from '../common/VerificationBadge';
import { RatingStars } from '../common/RatingStars';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.inventory <= 0) return;

    setIsAdding(true);
    try {
      await addToCart(product.id, product.minimum_quantity || 1);
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2000);
    } catch (err: any) {
      alert(err.message || 'Please log in to add items to cart');
    } finally {
      setIsAdding(false);
    }
  };

  const mainImage = product.images && product.images.length > 0
    ? product.images[0]
    : 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="group bg-white rounded-2xl border border-agro-100 overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col h-full relative">
      {/* Product Image & Badges */}
      <Link to={`/products/${product.slug}`} className="block relative aspect-4/3 overflow-hidden bg-cream-100">
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Feature Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.cold_chain_required && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600/90 text-white backdrop-blur-xs shadow-xs">
              <Snowflake className="w-3 h-3 mr-1" />
              Cold Chain
            </span>
          )}
          {product.is_perishable && !product.cold_chain_required && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-600/90 text-white backdrop-blur-xs shadow-xs">
              Fresh Perishable
            </span>
          )}
        </div>

        {/* Stock status overlay if low/out */}
        {product.inventory <= 0 ? (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        ) : product.inventory < 10 ? (
          <div className="absolute bottom-2 left-2 bg-amber-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs flex items-center">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Only {product.inventory} left
          </div>
        ) : null}
      </Link>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Farm Source & Location */}
          <div className="flex items-center justify-between text-xs text-charcoal-500 mb-1.5">
            <Link
              to={`/farms/${product.farm_slug}`}
              className="hover:text-agro-700 font-semibold truncate max-w-[160px]"
            >
              {product.farm_name}
            </Link>
            <div className="flex items-center text-[11px] text-agro-700 font-medium bg-agro-50 px-1.5 py-0.5 rounded">
              <MapPin className="w-3 h-3 mr-0.5 flex-shrink-0" />
              <span>{product.farm_state}</span>
            </div>
          </div>

          {/* Product Name */}
          <Link to={`/products/${product.slug}`} className="block">
            <h3 className="text-sm font-bold text-charcoal-900 group-hover:text-agro-600 transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="mt-1.5">
            <RatingStars rating={product.rating || 4.9} size="sm" />
          </div>
        </div>

        {/* Price & Action */}
        <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-xs text-charcoal-400 font-normal">Per {product.unit}</div>
            <div className="text-base font-extrabold text-agro-900">
              ₦{product.price.toLocaleString()}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.inventory <= 0 || isAdding}
            className={`p-2.5 rounded-xl font-semibold flex items-center justify-center transition-all ${
              addedSuccess
                ? 'bg-emerald-600 text-white'
                : product.inventory <= 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-agro-600 hover:bg-agro-700 text-white shadow-sm hover:shadow-md'
            }`}
            title="Add to Cart"
          >
            {addedSuccess ? (
              <Check className="w-4 h-4" />
            ) : isAdding ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
