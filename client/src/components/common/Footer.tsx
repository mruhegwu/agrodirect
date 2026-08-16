import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Phone, Mail, MapPin, ShieldCheck, Truck, Snowflake } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-agro-900 text-cream-100 pt-16 pb-12 border-t border-agro-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Proposition Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-agro-800/80 mb-12">
          <div className="flex items-start space-x-4">
            <div className="p-3 rounded-2xl bg-agro-800 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">100% Verified Commercial Farms</h4>
              <p className="text-xs text-agro-200 mt-1">
                Every farm undergoes strict CAC, veterinary, physical site inspection, and biometric verification.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="p-3 rounded-2xl bg-agro-800 text-blue-400">
              <Snowflake className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">Cold-Chain Inter-State Logistics</h4>
              <p className="text-xs text-agro-200 mt-1">
                Refrigerated & insulated transit vehicles ensure perishable broilers, catfish, and veggies arrive fresh.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="p-3 rounded-2xl bg-agro-800 text-amber-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">Guaranteed Escrow Protection</h4>
              <p className="text-xs text-agro-200 mt-1">
                Farmer settlement is held safely until the customer inspects and confirms delivery in Lagos.
              </p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12 text-xs">
          <div className="col-span-2">
            <Link to="/" className="flex items-center space-x-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="text-2xl font-extrabold font-display tracking-tight text-white">
                Agro<span className="text-harvest-400">Direct</span>
              </span>
            </Link>
            <p className="text-agro-200 text-xs leading-relaxed max-w-sm mb-4">
              Nigeria's premiere multi-vendor agricultural marketplace connecting verified commercial farmers directly with consumers, hotels, restaurants and supermarkets.
            </p>
            <div className="space-y-2 text-agro-300">
              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-harvest-400" />
                <span>+234 800 AGRO DIRECT (+234 800 2476 347)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-harvest-400" />
                <span>orders@agrodirect.ng</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-harvest-400" />
                <span>Abia Hub: Aba-PH Expressway | Lagos Hub: Ikeja Industrial</span>
              </div>
            </div>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase tracking-wider mb-4">Marketplace</h5>
            <ul className="space-y-2.5 text-agro-200">
              <li><Link to="/shop" className="hover:text-white transition-colors">Shop All Produce</Link></li>
              <li><Link to="/categories/poultry-birds" className="hover:text-white transition-colors">Poultry & Chickens</Link></li>
              <li><Link to="/categories/livestock-fish" className="hover:text-white transition-colors">Catfish & Livestock</Link></li>
              <li><Link to="/categories/tubers-roots" className="hover:text-white transition-colors">White Yam & Tubers</Link></li>
              <li><Link to="/farms" className="hover:text-white transition-colors">Verified Farms Directory</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase tracking-wider mb-4">B2B & Partners</h5>
            <ul className="space-y-2.5 text-agro-200">
              <li><Link to="/bulk-orders" className="hover:text-white transition-colors">B2B Bulk Procurement</Link></li>
              <li><Link to="/become-a-farmer" className="hover:text-white transition-colors">Sell on AgroDirect</Link></li>
              <li><Link to="/become-a-logistics-partner" className="hover:text-white transition-colors">Logistics Haulage Partner</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">Inter-State Cold Chain</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase tracking-wider mb-4">Support & Trust</h5>
            <ul className="space-y-2.5 text-agro-200">
              <li><Link to="/account/orders" className="hover:text-white transition-colors">Track Active Shipment</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">Escrow Protection Policy</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">Dispute & Refund Guarantee</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-agro-800 text-[11px] text-agro-400 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} AgroDirect Technologies Ltd. Registered with CAC Nigeria. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <span>Inter-State Corridor: Abia ⇄ Lagos ⇄ FCT</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">100% Server Verified Payments (Paystack / Flutterwave)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
