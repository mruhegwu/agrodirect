import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Snowflake,
  ShieldCheck,
  MapPin,
  Calendar,
  Package,
  Truck,
  Check,
  ArrowRight,
  AlertTriangle,
  Layers,
  ChevronRight,
  Star
} from 'lucide-react';
import { api } from '../../services/api';
import { Product, Review, Farm } from '../../types';
import { useCart } from '../../context/CartContext';
import { VerificationBadge } from '../../components/common/VerificationBadge';
import { RatingStars } from '../../components/common/RatingStars';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [farm, setFarm] = useState<Farm | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [destinationState, setDestinationState] = useState<string>('Lagos');
  const [shippingRate, setShippingRate] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);

  useEffect(() => {
    async function loadProduct() {
      if (!slug) return;
      setIsLoading(true);
      try {
        const prod = await api.products.getBySlug(slug);
        setProduct(prod);
        setQuantity(prod.minimum_quantity || 1);
        if (prod.images && prod.images.length > 0) {
          setSelectedImage(prod.images[0]);
        }

        // Fetch farm and reviews
        const [farmData, revData] = await Promise.all([
          api.farmers.getStoreBySlug(prod.farm_slug),
          api.reviews.listByProduct(prod.id)
        ]);
        setFarm(farmData);
        setReviews(revData);

        // Fetch shipping rate
        const rate = await api.logistics.calculateRate({
          origin_state: prod.farm_state || 'Abia',
          destination_state: 'Lagos',
          total_weight_kg: 3,
          requires_cold_chain: prod.cold_chain_required
        });
        setShippingRate(rate);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  const handleDestinationChange = async (newState: string) => {
    setDestinationState(newState);
    if (!product) return;
    try {
      const rate = await api.logistics.calculateRate({
        origin_state: product.farm_state || 'Abia',
        destination_state: newState,
        total_weight_kg: quantity * 2,
        requires_cold_chain: product.cold_chain_required
      });
      setShippingRate(rate);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    setIsAdding(true);
    try {
      await addToCart(product.id, quantity);
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2500);
    } catch (err: any) {
      alert(err.message || 'Please sign in to add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-agro-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-agro-900">Loading farm produce details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-agro-950">Produce Not Found</h2>
        <p className="text-sm text-charcoal-500">The requested agricultural product is unavailable or unlisted.</p>
        <Link to="/shop" className="inline-block bg-agro-600 text-white font-bold px-6 py-2.5 rounded-full text-xs">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-xs font-semibold text-charcoal-400">
        <Link to="/" className="hover:text-agro-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/shop" className="hover:text-agro-600">Shop</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-charcoal-700 truncate max-w-xs">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-4/3 rounded-3xl overflow-hidden bg-cream-100 border border-agro-100 shadow-card relative">
            <img
              src={selectedImage || 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=800&q=80'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.cold_chain_required && (
              <span className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-md">
                <Snowflake className="w-3.5 h-3.5 mr-1" />
                Cold Chain Transit
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    selectedImage === img ? 'border-agro-600 ring-2 ring-agro-200' : 'border-gray-200 opacity-70'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Info Section */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-agro-700 mb-2">
              <Link to={`/farms/${product.farm_slug}`} className="hover:underline flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1 text-harvest-500" />
                <span>{product.farm_name} ({product.farm_state} State)</span>
              </Link>
              <span>•</span>
              <VerificationBadge status="VERIFIED" size="sm" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-agro-950 font-display leading-tight">
              {product.name}
            </h1>

            <div className="mt-2.5 flex items-center space-x-4">
              <RatingStars rating={product.rating || 4.9} totalReviews={reviews.length} />
              <span className="text-xs text-charcoal-400">•</span>
              <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                In Stock ({product.inventory} {product.unit}s)
              </span>
            </div>
          </div>

          {/* Price Header */}
          <div className="bg-cream-100/80 border border-agro-100 p-5 rounded-2xl flex items-baseline justify-between">
            <div>
              <span className="text-xs text-charcoal-400 font-medium block">Price per {product.unit}</span>
              <span className="text-3xl font-black text-agro-900">₦{product.price.toLocaleString()}</span>
            </div>
            {product.packaging_fee > 0 && (
              <div className="text-right text-xs text-charcoal-500">
                <span>Packaging fee: </span>
                <strong className="text-agro-800">₦{product.packaging_fee.toLocaleString()} / {product.unit}</strong>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
            {product.description}
          </p>

          {/* Agricultural Attributes Accordion */}
          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <div className="bg-white border border-agro-100 rounded-2xl p-4 shadow-xs space-y-2.5">
              <h3 className="text-xs font-bold text-agro-950 uppercase tracking-wider flex items-center">
                <Layers className="w-3.5 h-3.5 mr-1.5 text-agro-600" />
                Structured Agricultural Specifications
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {Object.entries(product.attributes).map(([key, val]) => (
                  <div key={key} className="bg-cream-100 p-2.5 rounded-lg border border-agro-50">
                    <span className="text-[10px] text-charcoal-400 font-semibold uppercase tracking-wider block">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span className="font-bold text-agro-900 mt-0.5 block">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & CTA */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-gray-200 rounded-xl bg-white p-1">
                <button
                  onClick={() => setQuantity(Math.max(product.minimum_quantity || 1, quantity - 1))}
                  className="w-8 h-8 rounded-lg text-charcoal-600 hover:bg-gray-100 font-bold flex items-center justify-center text-sm"
                >
                  -
                </button>
                <span className="w-12 text-center font-bold text-sm text-agro-950">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.inventory, quantity + 1))}
                  className="w-8 h-8 rounded-lg text-charcoal-600 hover:bg-gray-100 font-bold flex items-center justify-center text-sm"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.inventory <= 0 || isAdding}
                className={`flex-1 py-3.5 px-6 rounded-full font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-md ${
                  addedSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-agro-600 hover:bg-agro-700 text-white shadow-agro-600/20'
                }`}
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Added to Cart Successfully!</span>
                  </>
                ) : isAdding ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>Add {quantity} {product.unit}(s) to Cart • ₦{(product.price * quantity).toLocaleString()}</span>
                  </>
                )}
              </button>
            </div>

            {product.minimum_quantity > 1 && (
              <p className="text-[11px] text-charcoal-400">
                * Minimum order quantity is {product.minimum_quantity} {product.unit}s
              </p>
            )}
          </div>

          {/* Inter-State Shipping Estimator Widget */}
          <div className="bg-agro-50 border border-agro-200 rounded-2xl p-4 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-agro-900 flex items-center">
                <Truck className="w-4 h-4 mr-1.5 text-harvest-500" />
                Calculate Logistics to Your State
              </span>
              <select
                value={destinationState}
                onChange={(e) => handleDestinationChange(e.target.value)}
                className="bg-white border border-agro-200 rounded-lg px-2.5 py-1 font-semibold text-agro-900 focus:outline-none"
              >
                {['Lagos', 'Rivers', 'Enugu', 'Anambra', 'FCT', 'Abia'].map((st) => (
                  <option key={st} value={st}>
                    {st} State
                  </option>
                ))}
              </select>
            </div>

            {shippingRate && (
              <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-agro-100">
                <div>
                  <span className="text-charcoal-500 text-[11px]">Estimated Transit:</span>
                  <p className="font-bold text-agro-900">{shippingRate.estimated_transit_days} Days Express</p>
                </div>
                <div className="text-right">
                  <span className="text-charcoal-500 text-[11px]">Logistics Fee:</span>
                  <p className="font-bold text-harvest-500 text-sm">₦{shippingRate.total_logistics_fee.toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Farm Card Banner */}
      {farm && (
        <div className="bg-white rounded-3xl border border-agro-100 p-8 shadow-card flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 rounded-2xl bg-cream-200 overflow-hidden border border-agro-200 flex-shrink-0">
              <img src={farm.logo_url || farm.farm_photos[0]} alt={farm.farm_name} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-agro-950">{farm.farm_name}</h3>
                <VerificationBadge status={farm.status} />
              </div>
              <p className="text-xs text-charcoal-500 mt-1 max-w-lg">{farm.description}</p>
              <div className="flex items-center space-x-4 text-xs text-agro-800 font-semibold mt-2">
                <span>📍 {farm.lga}, {farm.state}</span>
                <span>⭐ {farm.rating.toFixed(1)} ({farm.total_reviews} reviews)</span>
                <span>📦 {farm.completed_orders} Completed Orders</span>
              </div>
            </div>
          </div>

          <Link
            to={`/farms/${farm.slug}`}
            className="w-full md:w-auto bg-agro-50 hover:bg-agro-100 text-agro-800 font-bold text-xs px-6 py-3 rounded-xl transition-colors text-center"
          >
            Visit Farmer Storefront
          </Link>
        </div>
      )}

      {/* Customer Reviews Section */}
      <div className="bg-white rounded-3xl border border-agro-100 p-8 shadow-card space-y-6">
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-agro-950">Verified Purchase Reviews</h2>
            <p className="text-xs text-charcoal-400">Only verified buyers who completed orders can review this product</p>
          </div>
          <div className="flex items-center space-x-2">
            <RatingStars rating={product.rating || 5.0} />
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-8 text-xs text-charcoal-400">
            No customer reviews yet for this harvest. Be the first to order and review!
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-4 bg-cream-100/60 rounded-2xl border border-gray-100 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-full bg-agro-200 text-agro-800 flex items-center justify-center font-bold text-xs">
                      {rev.customer_name?.charAt(0) || 'C'}
                    </div>
                    <span className="font-bold text-xs text-gray-900">{rev.customer_name}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">
                      Verified Buyer
                    </span>
                  </div>
                  <RatingStars rating={rev.rating} showCount={false} size="sm" />
                </div>
                <p className="text-xs text-charcoal-600 leading-relaxed">{rev.comment}</p>
                <div className="text-[10px] text-charcoal-400 font-mono">
                  {new Date(rev.created_at).toLocaleDateString('en-NG', { dateStyle: 'long' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
