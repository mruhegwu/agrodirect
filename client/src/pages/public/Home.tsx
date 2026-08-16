import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  ShieldCheck,
  Snowflake,
  Truck,
  Package,
  Award,
  Sparkles,
  ChevronRight,
  Clock,
  Store,
  CheckCircle2
} from 'lucide-react';
import { api } from '../../services/api';
import { Category, Farm, Product } from '../../types';
import { ProductCard } from '../../components/product/ProductCard';
import { FarmCard } from '../../components/farm/FarmCard';

export const Home: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [featuredFarms, setFeaturedFarms] = useState<Farm[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [originState, setOriginState] = useState('Abia');
  const [destinationState, setDestinationState] = useState('Lagos');
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, prods, farms] = await Promise.all([
          api.categories.list(),
          api.products.list({ limit: 8 }),
          api.farmers.list()
        ]);
        setCategories(cats);
        setFeaturedProducts(prods);
        setFeaturedFarms(farms.slice(0, 3));
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}&state=${originState}`);
    } else {
      navigate(`/shop?state=${originState}`);
    }
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-agro-900 via-agro-800 to-agro-900 text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Background Graphic Patterns */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#5FA88A_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-agro-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-harvest-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 bg-agro-700/80 border border-agro-600/60 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-300">Active Inter-State Agricultural Pipeline</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight font-display">
                Farm Gate Fresh Produce Direct From <span className="text-emerald-400">Abia</span> to <span className="text-harvest-400">Lagos</span>.
              </h1>

              <p className="text-agro-100 text-base sm:text-lg max-w-xl font-normal leading-relaxed">
                Connect directly with verified commercial poultry, livestock and tuber farmers. Guaranteed 48-hour cold-chain delivery with protected escrow payment release.
              </p>

              {/* Quick Search & Corridor Route Picker */}
              <form onSubmit={handleHeroSearch} className="bg-white/95 backdrop-blur-md p-3 rounded-2xl sm:rounded-full shadow-2xl border border-white/20 max-w-2xl text-charcoal-800">
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <div className="relative flex-1 w-full pl-3">
                    <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="e.g. Broiler Chicken, Fresh Eggs, Catfish, White Yam..."
                      className="w-full pl-7 pr-3 py-2 text-sm bg-transparent focus:outline-none text-charcoal-900 placeholder-charcoal-400 font-medium"
                    />
                  </div>

                  <div className="flex items-center space-x-1.5 w-full sm:w-auto px-3 py-1 bg-cream-200/80 rounded-full text-xs font-semibold text-agro-900 border border-agro-100">
                    <span>{originState}</span>
                    <span className="text-harvest-500 font-bold">→</span>
                    <span>{destinationState}</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-agro-600 hover:bg-agro-700 text-white px-6 py-3 rounded-full text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-1.5"
                  >
                    <span>Search Farm Produce</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Quick Suggestion Pills */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-agro-200 pt-2">
                <span className="font-semibold text-white">Popular Harvests:</span>
                {['Jumbo Broilers', 'Fresh Eggs', 'Point & Kill Catfish', 'White Yam', 'Giant Plantain', 'Abakaliki Rice'].map((tag) => (
                  <Link
                    key={tag}
                    to={`/shop?search=${encodeURIComponent(tag)}`}
                    className="bg-agro-800/80 hover:bg-agro-700/90 text-agro-100 px-3 py-1 rounded-full border border-agro-700 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right Visual Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl text-white space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                    ⚡ Live Inter-State Express
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                    Cold-Chain Verified
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/10 rounded-2xl border border-white/10">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/30 flex items-center justify-center text-emerald-300 font-bold">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-agro-200">Abia Depots</div>
                        <div className="text-sm font-bold">Obegu & Isiala Ngwa</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-agro-200">Transit Duration</div>
                      <div className="text-sm font-bold text-harvest-300">48h Express</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/10 rounded-2xl border border-white/10">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/30 flex items-center justify-center text-blue-300 font-bold">
                        <Snowflake className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-agro-200">Refrigeration</div>
                        <div className="text-sm font-bold">Constant 2°C - 4°C</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-agro-200">Lagos Dropoff</div>
                      <div className="text-sm font-bold text-emerald-300">Doorstep Delivery</div>
                    </div>
                  </div>
                </div>

                {/* Stat badges */}
                <div className="grid grid-cols-3 gap-2 pt-2 text-center border-t border-white/10 text-xs">
                  <div>
                    <div className="text-lg font-extrabold text-white">100%</div>
                    <div className="text-[10px] text-agro-200">Verified Farms</div>
                  </div>
                  <div>
                    <div className="text-lg font-extrabold text-emerald-400">₦0</div>
                    <div className="text-[10px] text-agro-200">Hidden Fees</div>
                  </div>
                  <div>
                    <div className="text-lg font-extrabold text-harvest-400">Escrow</div>
                    <div className="text-[10px] text-agro-200">Buyer Protection</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-agro-600">Agricultural Categories</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-agro-950">Explore Fresh Farm Produce</h2>
          </div>
          <Link
            to="/categories"
            className="text-xs font-bold text-agro-700 hover:text-agro-900 flex items-center space-x-1"
          >
            <span>View All Categories</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              className="group bg-white rounded-2xl p-4 border border-agro-100 shadow-card hover:shadow-card-hover transition-all text-center flex flex-col items-center justify-between"
            >
              <div className="w-16 h-16 rounded-2xl bg-cream-100 overflow-hidden mb-3 group-hover:scale-105 transition-transform">
                <img
                  src={cat.image_url || 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=300&q=80'}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-xs font-bold text-charcoal-900 group-hover:text-agro-600 transition-colors">
                  {cat.name}
                </h3>
                <span className="text-[10px] text-charcoal-400 block mt-0.5">
                  {cat.product_count || 0} Products
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Harvests (Live Products) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-8">
          <div>
            <div className="inline-flex items-center space-x-1 text-xs font-bold uppercase tracking-wider text-harvest-600 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fresh Farm Harvests</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-agro-950">
              Direct From Abia Commercial Farms
            </h2>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center text-xs font-bold bg-agro-50 hover:bg-agro-100 text-agro-800 px-4 py-2 rounded-xl transition-colors"
          >
            <span>Browse Full Marketplace</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* Cold-Chain Value Proposition Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-agro-900 via-agro-800 to-agro-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-4">
              <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Refrigerated Logistics Guarantee
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-display">
                Never Receive Spoiled or Melted Farm Produce.
              </h2>
              <p className="text-agro-200 text-sm max-w-2xl leading-relaxed">
                We engineered dedicated cold-chain vehicles operating daily between Aba, Enugu, and Lagos. Broiler chickens and point-and-kill catfish are packaged with dry ice insulation and monitored along the entire expressway corridor.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  to="/how-it-works"
                  className="bg-harvest-400 hover:bg-harvest-500 text-white text-xs font-bold px-6 py-3 rounded-full transition-all shadow-md"
                >
                  Learn About Our Cold Chain
                </Link>
                <Link
                  to="/become-a-logistics-partner"
                  className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-6 py-3 rounded-full border border-white/20 transition-all"
                >
                  Register as Logistics Fleet Partner
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10 text-center">
                <div className="text-2xl font-black text-white">48h</div>
                <div className="text-agro-200 text-[11px] mt-1">Inter-State Transit Time</div>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10 text-center">
                <div className="text-2xl font-black text-blue-300">4°C</div>
                <div className="text-agro-200 text-[11px] mt-1">Max Cold Storage Temp</div>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10 text-center">
                <div className="text-2xl font-black text-emerald-300">100%</div>
                <div className="text-agro-200 text-[11px] mt-1">Money Back on Spoilage</div>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10 text-center">
                <div className="text-2xl font-black text-amber-300">Live</div>
                <div className="text-agro-200 text-[11px] mt-1">GPS Route Tracking</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Verified Farms */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-agro-600">Partner Storefronts</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-agro-950">Featured Verified Farmers</h2>
          </div>
          <Link
            to="/farms"
            className="text-xs font-bold text-agro-700 hover:text-agro-900 flex items-center space-x-1"
          >
            <span>All Partner Farms</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredFarms.map((farm) => (
            <FarmCard key={farm.id} farm={farm} />
          ))}
        </div>
      </section>

      {/* B2B Procurement Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-cream-200 border border-agro-200 rounded-3xl p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-card">
          <div className="space-y-4 max-w-xl">
            <span className="bg-harvest-100 text-harvest-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-harvest-200">
              For Businesses & Institutions
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-agro-950 font-display">
              B2B Bulk Procurement for Restaurants, Supermarkets & Processors
            </h2>
            <p className="text-charcoal-600 text-sm leading-relaxed">
              Procure wholesale tonnes of live broilers, catfish cutlets, crates of eggs, and tubers on credit terms, structured invoicing, and scheduled weekly deliveries.
            </p>
            <div className="flex items-center space-x-4 pt-2">
              <Link
                to="/bulk-orders"
                className="bg-agro-700 hover:bg-agro-800 text-white text-xs font-bold px-6 py-3 rounded-full transition-all shadow-sm"
              >
                Submit Bulk RFQ Request
              </Link>
              <Link
                to="/how-it-works"
                className="text-xs font-bold text-agro-800 hover:text-agro-950 underline underline-offset-4"
              >
                Wholesale SLA Terms
              </Link>
            </div>
          </div>

          <div className="w-full lg:w-96 bg-white p-6 rounded-2xl border border-agro-100 shadow-md space-y-3 text-xs">
            <h4 className="font-bold text-agro-900 text-sm border-b border-gray-100 pb-2">
              Standard B2B Capabilities
            </h4>
            <div className="space-y-2 text-charcoal-700">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Custom tonnage RFQ quotation</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Farmer direct contract pricing</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Dedicated refrigerated 5-tonne truck charter</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Electronic PDF purchase orders & invoices</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Become a Farmer Onboarding CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-agro-50 border border-agro-200 rounded-3xl p-10 sm:p-14 space-y-4 max-w-3xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-agro-600 text-white mx-auto flex items-center justify-center">
            <Store className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-agro-950 font-display">
            Are You a Commercial Farmer in Nigeria?
          </h2>
          <p className="text-charcoal-600 text-sm max-w-xl mx-auto">
            Sell directly to thousands of ready buyers in Lagos and beyond. Cut out parasitic middlemen and receive prompt escrow payouts directly to your bank account.
          </p>
          <div className="pt-2">
            <Link
              to="/become-a-farmer"
              className="inline-block bg-agro-600 hover:bg-agro-700 text-white font-bold text-sm px-8 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all"
            >
              Start 5-Step Farm Verification
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
