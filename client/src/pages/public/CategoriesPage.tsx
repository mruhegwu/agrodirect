import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { Category } from '../../types';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.categories.list();
        setCategories(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-agro-950 font-display">
          Produce Categories
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
          Explore all fresh farm categories sourced across Nigerian states.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/shop?category=${cat.slug}`}
            className="group bg-white rounded-3xl border border-agro-100 overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between"
          >
            <div className="h-44 overflow-hidden bg-cream-200 relative">
              <img
                src={cat.image_url || 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=600&q=80'}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-agro-600/90 text-white px-2 py-0.5 rounded backdrop-blur-xs">
                  {cat.product_count || 0} Listings
                </span>
                <h3 className="text-xl font-bold text-white mt-1">{cat.name}</h3>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <p className="text-xs text-charcoal-500 leading-relaxed mb-4">
                {cat.description}
              </p>
              <div className="flex items-center justify-between text-xs font-bold text-agro-700 group-hover:text-agro-900 border-t border-gray-100 pt-3">
                <span>Browse {cat.name}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
