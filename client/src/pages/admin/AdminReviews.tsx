import React, { useEffect, useState } from 'react';
import { Star, MessageSquare, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';
import { Review } from '../../types';

const SAMPLE_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    order_id: 'ord-101',
    customer_id: 'cust-1',
    farm_id: 'farm-1',
    rating: 5,
    farmer_rating: 5,
    logistics_rating: 5,
    comment: 'The live broilers arrived in Lagos from Abia perfectly healthy in ventilated crates! Fantastic service.',
    created_at: new Date().toISOString(),
    customer_name: 'Emeka Okonkwo',
    farm_name: 'Obegu Integrated Farms',
    product_name: 'Live Broiler Chickens (2.2kg)'
  },
  {
    id: 'rev-2',
    order_id: 'ord-102',
    customer_id: 'cust-2',
    farm_id: 'farm-2',
    rating: 5,
    farmer_rating: 5,
    logistics_rating: 4,
    comment: 'Fresh jumbo eggs, zero breakage on the highway transit. Will order weekly for my bakery.',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    customer_name: 'Amina Bello',
    farm_name: 'Green Valley Poultry',
    product_name: 'Fresh Farm Eggs (Crate of 30)'
  }
];

export const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>(SAMPLE_REVIEWS);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-agro-950">Produce & Producer Reviews</h2>
        <p className="text-xs text-charcoal-600">
          Audited buyer feedback, star ratings, and courier transit ratings.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-agro-100 shadow-card overflow-hidden">
        <div className="p-5 border-b border-agro-50">
          <h3 className="font-bold text-agro-950 text-sm">Verified Customer Reviews ({reviews.length})</h3>
        </div>

        <div className="divide-y divide-agro-50">
          {reviews.map(r => (
            <div key={r.id} className="p-5 hover:bg-cream-50/40 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-agro-950">{r.customer_name}</span>
                  <span className="text-charcoal-400">•</span>
                  <span className="font-semibold text-agro-800">{r.farm_name}</span>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-charcoal-200'}`} />
                  ))}
                </div>
              </div>

              <p className="text-charcoal-700 italic bg-cream-50 p-3 rounded-xl border border-agro-50">
                "{r.comment}"
              </p>

              <div className="flex items-center justify-between text-[11px] text-charcoal-500">
                <span>Produce: <strong>{r.product_name}</strong></span>
                <span>{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
