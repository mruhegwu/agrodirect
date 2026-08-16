import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Package, Award, ArrowRight } from 'lucide-react';
import { Farm } from '../../types';
import { VerificationBadge } from '../common/VerificationBadge';
import { RatingStars } from '../common/RatingStars';

interface FarmCardProps {
  farm: Farm;
}

export const FarmCard: React.FC<FarmCardProps> = ({ farm }) => {
  const photo = farm.farm_photos && farm.farm_photos.length > 0
    ? farm.farm_photos[0]
    : 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="bg-white rounded-2xl border border-agro-100 overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group">
      <div>
        {/* Cover Photo */}
        <div className="relative h-36 bg-cream-200 overflow-hidden">
          <img
            src={photo}
            alt={farm.farm_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute top-3 right-3">
            <VerificationBadge status={farm.status} />
          </div>
        </div>

        {/* Farm Info */}
        <div className="p-5">
          <div className="flex items-center text-xs text-agro-700 font-semibold mb-1">
            <MapPin className="w-3.5 h-3.5 mr-1" />
            <span>{farm.lga}, {farm.state} State</span>
          </div>

          <h3 className="text-base font-bold text-agro-900 group-hover:text-agro-600 transition-colors">
            {farm.farm_name}
          </h3>

          <p className="text-xs text-charcoal-500 line-clamp-2 mt-1.5 leading-relaxed">
            {farm.description}
          </p>

          <div className="mt-3 flex items-center justify-between">
            <RatingStars rating={farm.rating || 5.0} totalReviews={farm.total_reviews} size="sm" />
            <span className="text-[11px] text-charcoal-400 font-medium flex items-center">
              <Award className="w-3 h-3 mr-1 text-harvest-400" />
              {farm.completed_orders || 0} orders completed
            </span>
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 pt-2 border-t border-gray-50 flex items-center justify-between">
        <span className="text-xs font-semibold text-charcoal-600">
          {farm.active_product_count || 0} produce available
        </span>
        <Link
          to={`/farms/${farm.slug}`}
          className="inline-flex items-center text-xs font-bold text-agro-700 hover:text-agro-900 bg-agro-50 hover:bg-agro-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          <span>Visit Storefront</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Link>
      </div>
    </div>
  );
};
