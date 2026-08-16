import React from 'react';
import { Filter, RotateCcw, Snowflake, Flame } from 'lucide-react';
import { Category } from '../../types';

interface ProductFiltersProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (catSlug: string) => void;
  selectedState: string;
  onSelectState: (state: string) => void;
  minPrice?: number;
  maxPrice?: number;
  onPriceChange: (min?: number, max?: number) => void;
  isPerishable?: boolean;
  onTogglePerishable: (val?: boolean) => void;
  coldChainRequired?: boolean;
  onToggleColdChain: (val?: boolean) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onReset: () => void;
}

const NIGERIAN_STATES = ['All States', 'Abia', 'Lagos', 'Enugu', 'Anambra', 'Rivers', 'Imo', 'Ebonyi', 'FCT'];

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  selectedState,
  onSelectState,
  minPrice,
  maxPrice,
  onPriceChange,
  isPerishable,
  onTogglePerishable,
  coldChainRequired,
  onToggleColdChain,
  sortBy,
  onSortChange,
  onReset
}) => {
  return (
    <div className="bg-white rounded-2xl border border-agro-100 p-5 shadow-card space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center space-x-2 font-bold text-agro-900 text-sm">
          <Filter className="w-4 h-4 text-agro-600" />
          <span>Filter Produce</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-charcoal-400 hover:text-agro-600 flex items-center space-x-1 font-medium transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-2">
          Sort Order
        </label>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full text-xs font-semibold bg-cream-100 border border-gray-200 rounded-xl px-3 py-2 text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-agro-500"
        >
          <option value="newest">Newest Harvests First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Top Farmer Rating</option>
        </select>
      </div>

      {/* Categories */}
      <div>
        <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-2">
          Categories
        </label>
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          <button
            onClick={() => onSelectCategory('')}
            className={`w-full text-left text-xs px-3 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === ''
                ? 'bg-agro-50 text-agro-800 font-bold border border-agro-200'
                : 'text-charcoal-600 hover:bg-gray-50'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className={`w-full text-left text-xs px-3 py-2 rounded-lg font-medium flex items-center justify-between transition-colors ${
                selectedCategory === cat.slug
                  ? 'bg-agro-50 text-agro-800 font-bold border border-agro-200'
                  : 'text-charcoal-600 hover:bg-gray-50'
              }`}
            >
              <span>{cat.name}</span>
              {cat.product_count !== undefined && (
                <span className="text-[10px] text-charcoal-400 font-normal">({cat.product_count})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Origin State (Abia, Lagos, etc.) */}
      <div>
        <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-2">
          Farm Origin State
        </label>
        <select
          value={selectedState}
          onChange={(e) => onSelectState(e.target.value === 'All States' ? '' : e.target.value)}
          className="w-full text-xs font-medium bg-cream-100 border border-gray-200 rounded-xl px-3 py-2 text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-agro-500"
        >
          {NIGERIAN_STATES.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
      </div>

      {/* Cold Chain & Perishable Special Toggles */}
      <div>
        <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-2">
          Transit Requirements
        </label>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-xs text-charcoal-700 cursor-pointer">
            <input
              type="checkbox"
              checked={coldChainRequired === true}
              onChange={(e) => onToggleColdChain(e.target.checked ? true : undefined)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Snowflake className="w-3.5 h-3.5 text-blue-600" />
            <span>Cold-Chain Required Only</span>
          </label>

          <label className="flex items-center space-x-2 text-xs text-charcoal-700 cursor-pointer">
            <input
              type="checkbox"
              checked={isPerishable === true}
              onChange={(e) => onTogglePerishable(e.target.checked ? true : undefined)}
              className="rounded border-gray-300 text-agro-600 focus:ring-agro-500"
            />
            <span>Fresh Perishables Only</span>
          </label>
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-2">
          Price Range (₦)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min ₦"
            value={minPrice || ''}
            onChange={(e) => onPriceChange(e.target.value ? Number(e.target.value) : undefined, maxPrice)}
            className="text-xs bg-cream-100 border border-gray-200 rounded-lg px-2.5 py-1.5"
          />
          <input
            type="number"
            placeholder="Max ₦"
            value={maxPrice || ''}
            onChange={(e) => onPriceChange(minPrice, e.target.value ? Number(e.target.value) : undefined)}
            className="text-xs bg-cream-100 border border-gray-200 rounded-lg px-2.5 py-1.5"
          />
        </div>
      </div>
    </div>
  );
};
