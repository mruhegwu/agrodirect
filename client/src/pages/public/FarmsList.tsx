import React, { useEffect, useState } from 'react';
import { Sprout, MapPin, Search } from 'lucide-react';
import { api } from '../../services/api';
import { Farm } from '../../types';
import { FarmCard } from '../../components/farm/FarmCard';

export const FarmsList: React.FC = () => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchFarms = async () => {
    setIsLoading(true);
    try {
      const data = await api.farmers.list({
        search,
        state: selectedState
      });
      setFarms(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, [selectedState]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFarms();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-agro-950 font-display">
          Verified Partner Farms
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
          Explore all certified agricultural commercial producers on the AgroDirect marketplace.
        </p>
      </div>

      {/* Search & State Filter */}
      <div className="bg-white p-4 rounded-2xl border border-agro-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search farm by name, produce, or location..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-cream-100 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-agro-500"
          />
        </form>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <MapPin className="w-4 h-4 text-agro-600 flex-shrink-0" />
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="text-xs font-semibold bg-cream-100 border border-gray-200 rounded-xl px-3 py-2 text-charcoal-800 focus:outline-none"
          >
            <option value="">All States</option>
            <option value="Abia">Abia State</option>
            <option value="Enugu">Enugu State</option>
            <option value="Anambra">Anambra State</option>
            <option value="Rivers">Rivers State</option>
            <option value="Lagos">Lagos State</option>
          </select>
        </div>
      </div>

      {/* Farms Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 h-64 animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : farms.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 text-charcoal-400 text-sm">
          No verified farms found matching your query.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {farms.map((farm) => (
            <FarmCard key={farm.id} farm={farm} />
          ))}
        </div>
      )}
    </div>
  );
};
