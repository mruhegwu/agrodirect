import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Package, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { Category, Product } from '../../types';
import { ProductCard } from '../../components/product/ProductCard';
import { ProductFilters } from '../../components/product/ProductFilters';

export const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);

  // Filters state
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const state = searchParams.get('state') || '';
  const minPrice = searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined;
  const maxPrice = searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined;
  const isPerishable = searchParams.get('is_perishable') === 'true' ? true : undefined;
  const coldChainRequired = searchParams.get('cold_chain_required') === 'true' ? true : undefined;
  const sort = searchParams.get('sort') || 'newest';

  useEffect(() => {
    async function fetchCategories() {
      try {
        const cats = await api.categories.list();
        setCategories(cats);
      } catch (err) {
        console.error(err);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      try {
        const prods = await api.products.list({
          search,
          category,
          state,
          min_price: minPrice,
          max_price: maxPrice,
          is_perishable: isPerishable,
          cold_chain_required: coldChainRequired,
          sort
        });
        setProducts(prods);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, [searchParams]);

  const updateParam = (key: string, value: any) => {
    const params = new URLSearchParams(searchParams);
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-agro-950 font-display">
            Direct Farm Marketplace
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
            Browse guaranteed fresh produce and livestock direct from verified commercial Nigerian farmers.
          </p>
        </div>

        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="lg:hidden flex items-center justify-center space-x-2 bg-agro-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>{showMobileFilters ? 'Hide Filters' : 'Filter Products'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop / Mobile Sidebar Filters */}
        <div className={`lg:block ${showMobileFilters ? 'block' : 'hidden'} lg:col-span-1`}>
          <div className="sticky top-24">
            <ProductFilters
              categories={categories}
              selectedCategory={category}
              onSelectCategory={(cat) => updateParam('category', cat)}
              selectedState={state}
              onSelectState={(st) => updateParam('state', st)}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onPriceChange={(min, max) => {
                updateParam('min_price', min);
                updateParam('max_price', max);
              }}
              isPerishable={isPerishable}
              onTogglePerishable={(val) => updateParam('is_perishable', val)}
              coldChainRequired={coldChainRequired}
              onToggleColdChain={(val) => updateParam('cold_chain_required', val)}
              sortBy={sort}
              onSortChange={(s) => updateParam('sort', s)}
              onReset={handleResetFilters}
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex justify-between items-center text-xs font-semibold text-charcoal-500">
            <span>
              Showing <strong className="text-agro-900">{products.length}</strong> available farm listings
            </span>
            {state && (
              <span className="bg-agro-50 text-agro-700 px-2.5 py-1 rounded-full border border-agro-100 font-bold">
                Origin: {state} State
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 h-80 animate-pulse space-y-4">
                  <div className="h-44 bg-gray-200 rounded-xl" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl border border-agro-100 p-12 text-center space-y-4 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-cream-200 text-agro-600 flex items-center justify-center mx-auto">
                <Package className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-agro-950">No Farm Produce Found</h3>
              <p className="text-xs text-charcoal-500 leading-relaxed">
                We couldn't find any products matching your current filters. Try changing your search keywords or resetting filter criteria.
              </p>
              <button
                onClick={handleResetFilters}
                className="bg-agro-600 hover:bg-agro-700 text-white text-xs font-bold px-6 py-2.5 rounded-full transition-all"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
