import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  totalReviews?: number;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  totalReviews,
  showCount = true,
  size = 'md'
}) => {
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base font-semibold' : 'text-sm font-medium';

  return (
    <div className="inline-flex items-center space-x-1">
      <div className="flex text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${iconSize} ${
              star <= Math.round(rating)
                ? 'fill-amber-400 text-amber-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
      {showCount && (
        <span className={`text-charcoal-700 ml-1 ${textSize}`}>
          {rating.toFixed(1)}
          {totalReviews !== undefined && (
            <span className="text-charcoal-400 font-normal text-xs ml-1">({totalReviews})</span>
          )}
        </span>
      )}
    </div>
  );
};
