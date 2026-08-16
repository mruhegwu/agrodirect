import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Snowflake, Upload, Save, ArrowLeft, Layers } from 'lucide-react';
import { api } from '../../services/api';
import { Category, ProductUnit } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const FarmerProductForm: React.FC = () => {
  const { farm } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(5000);
  const [unit, setUnit] = useState<ProductUnit>('Kg');
  const [minimumQuantity, setMinimumQuantity] = useState<number>(1);
  const [inventory, setInventory] = useState<number>(50);
  const [packagingType, setPackagingType] = useState('Insulated thermal carton with dry ice pack');
  const [packagingFee, setPackagingFee] = useState<number>(500);
  const [isPerishable, setIsPerishable] = useState<boolean>(true);
  const [coldChainRequired, setColdChainRequired] = useState<boolean>(true);
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=800&q=80');

  // Dynamic Agricultural Specifications
  const [breed, setBreed] = useState('Cobb 500 Heavy Broiler');
  const [processing, setProcessing] = useState('Live / Dressed on Demand');
  const [ageWeeks, setAgeWeeks] = useState('8 Weeks');
  const [variety, setVariety] = useState('Commercial Grade A');

  useEffect(() => {
    async function loadCats() {
      try {
        const cats = await api.categories.list();
        setCategories(cats);
        if (cats.length > 0) setCategoryId(cats[0].id);
      } catch (err) {
        console.error(err);
      }
    }
    loadCats();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farm) {
      alert('You must have a registered farm profile to list products');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.products.create({
        farm_id: farm.id,
        category_id: categoryId,
        name,
        description,
        price,
        unit,
        minimum_quantity: minimumQuantity,
        inventory,
        packaging_type: packagingType,
        packaging_fee: packagingFee,
        is_perishable: isPerishable,
        cold_chain_required: coldChainRequired,
        images: [imageUrl],
        attributes: {
          breed,
          processing,
          age: ageWeeks,
          variety,
          origin_farm: farm.farm_name,
          origin_state: farm.state
        }
      });
      navigate('/farmer/products');
    } catch (err: any) {
      alert(err.message || 'Failed to list product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/farmer/products')}
          className="p-2 rounded-xl bg-white border border-gray-200 text-charcoal-700 hover:bg-cream-100"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-agro-950 font-display">List New Farm Harvest</h1>
          <p className="text-xs text-charcoal-400">Add produce specifications, pricing, and cold-chain haulage requirements</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-agro-100 p-8 shadow-card space-y-6 text-xs">
        {/* Core Product Information */}
        <div className="space-y-4">
          <h3 className="font-bold text-agro-950 text-sm border-b border-gray-100 pb-2">
            1. Core Produce Details
          </h3>

          <div>
            <label className="block font-bold text-charcoal-700 mb-1">Produce Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jumbo Broiler Chickens (2.8kg - 3.2kg)"
              className="w-full bg-cream-100 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-agro-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-charcoal-700 mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-cream-100 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-charcoal-900 font-semibold"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-charcoal-700 mb-1">Selling Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as ProductUnit)}
                className="w-full bg-cream-100 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-charcoal-900 font-semibold"
              >
                {['Bird', 'Kg', 'Piece', 'Crate', 'Bag', 'Bunch', 'Tonne', 'Tray', 'Carton'].map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-charcoal-700 mb-1">Produce Description</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of feed, rearing methods, harvest freshness..."
              className="w-full bg-cream-100 border border-gray-200 rounded-xl p-3 text-xs text-charcoal-900"
            />
          </div>

          <div>
            <label className="block font-bold text-charcoal-700 mb-1">Produce Image URL</label>
            <input
              type="url"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full bg-cream-100 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-charcoal-900"
            />
          </div>
        </div>

        {/* Pricing, Packaging & Stock */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="font-bold text-agro-950 text-sm border-b border-gray-100 pb-2">
            2. Commercial Pricing & Inventory
          </h3>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-charcoal-700 mb-1">Price per {unit} (₦)</label>
              <input
                type="number"
                required
                min="100"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-cream-100 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-charcoal-900 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-charcoal-700 mb-1">Initial Stock Available</label>
              <input
                type="number"
                required
                min="1"
                value={inventory}
                onChange={(e) => setInventory(Number(e.target.value))}
                className="w-full bg-cream-100 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-charcoal-900"
              />
            </div>

            <div>
              <label className="block font-bold text-charcoal-700 mb-1">Minimum Order Qty</label>
              <input
                type="number"
                required
                min="1"
                value={minimumQuantity}
                onChange={(e) => setMinimumQuantity(Number(e.target.value))}
                className="w-full bg-cream-100 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-charcoal-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-charcoal-700 mb-1">Packaging Description</label>
              <input
                type="text"
                value={packagingType}
                onChange={(e) => setPackagingType(e.target.value)}
                className="w-full bg-cream-100 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-charcoal-900"
              />
            </div>

            <div>
              <label className="block font-bold text-charcoal-700 mb-1">Packaging Fee per Unit (₦)</label>
              <input
                type="number"
                value={packagingFee}
                onChange={(e) => setPackagingFee(Number(e.target.value))}
                className="w-full bg-cream-100 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-charcoal-900"
              />
            </div>
          </div>
        </div>

        {/* Cold-Chain & Perishability Toggles */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="font-bold text-agro-950 text-sm border-b border-gray-100 pb-2">
            3. Cold-Chain & Transit Safeguards
          </h3>

          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-xs text-charcoal-700 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={coldChainRequired}
                onChange={(e) => setColdChainRequired(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <Snowflake className="w-4 h-4 text-blue-600" />
              <span>Requires Refrigerated Cold-Chain Transit (Insulated vehicles, Dry Ice)</span>
            </label>

            <label className="flex items-center space-x-2 text-xs text-charcoal-700 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={isPerishable}
                onChange={(e) => setIsPerishable(e.target.checked)}
                className="rounded text-agro-600 focus:ring-agro-500"
              />
              <span>Perishable Fresh Produce (48h expressway priority)</span>
            </label>
          </div>
        </div>

        {/* Structured Agricultural Specifications */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="font-bold text-agro-950 text-sm border-b border-gray-100 pb-2 flex items-center">
            <Layers className="w-4 h-4 mr-1 text-agro-600" />
            <span>4. Agricultural Attributes (Breed, Processing, Variety)</span>
          </h3>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-charcoal-700 mb-1">Breed / Strain</label>
              <input
                type="text"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full bg-cream-100 border border-gray-200 rounded-xl px-3 py-2 text-xs text-charcoal-900"
              />
            </div>

            <div>
              <label className="block font-bold text-charcoal-700 mb-1">Processing Type</label>
              <input
                type="text"
                value={processing}
                onChange={(e) => setProcessing(e.target.value)}
                className="w-full bg-cream-100 border border-gray-200 rounded-xl px-3 py-2 text-xs text-charcoal-900"
              />
            </div>

            <div>
              <label className="block font-bold text-charcoal-700 mb-1">Age / Maturity</label>
              <input
                type="text"
                value={ageWeeks}
                onChange={(e) => setAgeWeeks(e.target.value)}
                className="w-full bg-cream-100 border border-gray-200 rounded-xl px-3 py-2 text-xs text-charcoal-900"
              />
            </div>

            <div>
              <label className="block font-bold text-charcoal-700 mb-1">Grade / Quality Variety</label>
              <input
                type="text"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                className="w-full bg-cream-100 border border-gray-200 rounded-xl px-3 py-2 text-xs text-charcoal-900"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-agro-600 hover:bg-agro-700 text-white font-bold text-sm py-4 rounded-full shadow-lg transition-all flex items-center justify-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? 'Publishing Harvest Listing...' : 'Publish Farm Harvest Listing'}</span>
        </button>
      </form>
    </div>
  );
};
