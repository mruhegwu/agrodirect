import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Award, Phone, Mail, Package, ShieldCheck, ChevronRight } from 'lucide-react';
import { api } from '../../services/api';
import { Farm, Product, Review } from '../../types';
import { ProductCard } from '../../components/product/ProductCard';
import { VerificationBadge } from '../../components/common/VerificationBadge';
import { RatingStars } from '../../components/common/RatingStars';

export const FarmStorefront: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [farm, setFarm] = useState<Farm | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadFarm() {
      if (!slug) return;
      setIsLoading(true);
      try {
        const farmData = await api.farmers.getStoreBySlug(slug);
        setFarm(farmData);

        const [prodData, revData] = await Promise.all([
          api.products.list({ farm_id: farmData.id }),
          api.reviews.listByFarm(farmData.id)
        ]);
        setProducts(prodData);
        setReviews(revData);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadFarm();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-agro-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-agro-900">Loading farm storefront...</p>
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-agro-950">Farm Not Found</h2>
        <p className="text-sm text-charcoal-500">The farm storefront you are looking for does not exist or has been suspended.</p>
        <Link to="/farms" className="inline-block bg-agro-600 text-white font-bold px-6 py-2.5 rounded-full text-xs">
          View All Partner Farms
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Farm Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-agro-900 text-white shadow-2xl border border-agro-800">
        <div className="h-64 sm:h-80 w-full relative">
          <img
            src={farm.farm_photos && farm.farm_photos.length > 0 ? farm.farm_photos[0] : 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80'}
            alt={farm.farm_name}
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-agro-950 via-agro-900/60 to-transparent" />
        </div>

        <div className="p-8 sm:p-10 -mt-24 relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <VerificationBadge status={farm.status} size="lg" />
                <span className="text-xs text-emerald-300 font-semibold bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
                  Verified Producer
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
                {farm.farm_name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-agro-200">
                <span className="flex items-center font-medium">
                  <MapPin className="w-4 h-4 mr-1 text-harvest-400" />
                  {farm.address}, {farm.lga}, {farm.state} State
                </span>
                <span>•</span>
                <RatingStars rating={farm.rating || 5.0} totalReviews={farm.total_reviews} size="md" />
                <span>•</span>
                <span className="flex items-center text-emerald-300 font-semibold">
                  <Award className="w-4 h-4 mr-1 text-harvest-400" />
                  {farm.completed_orders} Completed Orders
                </span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-xs space-y-1 sm:text-right">
              <span className="text-agro-200 block text-[11px]">Primary Production</span>
              <span className="font-bold text-white text-sm block">{farm.main_products || 'Poultry & Produce'}</span>
              <span className="text-agro-300 block text-[11px]">{farm.farm_size}</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-agro-100 max-w-3xl leading-relaxed">
            {farm.description}
          </p>
        </div>
      </div>

      {/* Available Products from this farm */}
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-agro-950 font-display">
              Harvest Listings ({products.length})
            </h2>
            <p className="text-xs text-charcoal-400 mt-0.5">
              Direct produce available for express inter-state haulage
            </p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center text-xs text-charcoal-400 border border-gray-100">
            This farm currently has no active product listings.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </div>

      {/* Customer Reviews for this Farm */}
      <div className="bg-white rounded-3xl border border-agro-100 p-8 shadow-card space-y-6">
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-agro-950">Farm Customer Feedback</h2>
            <p className="text-xs text-charcoal-400">Ratings & comments from verified customers across Nigerian states</p>
          </div>
          <RatingStars rating={farm.rating || 5.0} totalReviews={farm.total_reviews} />
        </div>

        {reviews.length === 0 ? (
          <p className="text-xs text-charcoal-400 text-center py-6">
            No customer reviews yet for {farm.farm_name}.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-4 bg-cream-100/60 rounded-2xl border border-gray-100 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-full bg-agro-200 text-agro-800 flex items-center justify-center font-bold text-xs">
                      {rev.customer_name?.charAt(0) || 'C'}
                    </div>
                    <span className="font-bold text-xs text-gray-900">{rev.customer_name}</span>
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
