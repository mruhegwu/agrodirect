import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, CheckCircle2, ShieldCheck, DollarSign, Truck, ArrowRight } from 'lucide-react';

export const BecomeFarmer: React.FC = () => {
  const benefits = [
    'Direct access to thousands of ready households, hotels and restaurants in Lagos',
    'Guaranteed payment escrow — no default or delayed customer debts',
    'Dedicated refrigerated cold-chain trucks pick up directly from your farm gate in Abia',
    'Zero middlemen cuts — you set your price per bird, crate, kg or bag',
    'Automated withdrawal payouts directly to your Nigerian commercial bank account'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      <div className="bg-gradient-to-r from-agro-900 to-agro-800 rounded-3xl p-8 sm:p-14 text-white shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-8 space-y-4">
          <span className="bg-emerald-400 text-agro-950 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
            Farmer Partner Onboarding
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-display leading-tight">
            Grow Your Agricultural Sales Beyond State Boundaries.
          </h1>
          <p className="text-agro-200 text-sm max-w-xl leading-relaxed">
            Sell your broiler chickens, catfish, eggs, white yam and farm produce directly to premium urban buyers in Lagos with zero transit headache.
          </p>
          <div className="pt-2">
            <Link
              to="/register?role=FARMER"
              className="inline-flex items-center space-x-2 bg-harvest-400 hover:bg-harvest-500 text-white font-bold text-sm px-8 py-3.5 rounded-full shadow-lg transition-all"
            >
              <span>Register Your Farm Today</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white/10 p-6 rounded-3xl backdrop-blur-md border border-white/20 text-xs space-y-3">
          <h3 className="font-bold text-white text-sm border-b border-white/10 pb-2">
            5-Step Onboarding Workflow
          </h3>
          <ol className="space-y-2 text-agro-200 list-decimal list-inside font-medium">
            <li>Account Registration & Phone</li>
            <li>Farm Location & GPS Mapping</li>
            <li>KYC Documents (ID / CAC / Photos)</li>
            <li>Nigerian Bank Account Details</li>
            <li>Admin Verification & Live Storefront</li>
          </ol>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-agro-950 font-display">
            Why Top Commercial Farmers in Abia Choose AgroDirect
          </h2>
          <div className="space-y-3">
            {benefits.map((b, i) => (
              <div key={i} className="flex items-start space-x-3 text-xs sm:text-sm text-charcoal-700 bg-white p-4 rounded-2xl border border-agro-100 shadow-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{b}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-cream-200 rounded-3xl p-8 border border-agro-200 space-y-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-agro-700 text-white flex items-center justify-center mx-auto">
            <Sprout className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-agro-950">Ready to List Your Harvest?</h3>
          <p className="text-xs text-charcoal-600 max-w-sm mx-auto">
            Our agricultural vetting team reviews new farm applications within 24 hours.
          </p>
          <Link
            to="/register?role=FARMER"
            className="inline-block bg-agro-600 hover:bg-agro-700 text-white font-bold text-xs px-8 py-3 rounded-full shadow-md transition-all"
          >
            Create Farmer Account
          </Link>
        </div>
      </div>
    </div>
  );
};
