import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ShoppingCart, Truck, CheckCircle2, ShieldCheck, Snowflake, ArrowRight } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: <Sprout className="w-8 h-8 text-emerald-600" />,
      step: '01',
      title: 'Farmer Harvesting & Verification',
      desc: 'Verified commercial farms in Abia and other Nigerian states harvest fresh organic broilers, catfish, eggs, and tubers upon order confirmation.'
    },
    {
      icon: <ShoppingCart className="w-8 h-8 text-agro-600" />,
      step: '02',
      title: 'Transparent Checkout & Escrow',
      desc: 'Customer places order with calculated logistics rate and packaging fee. Payment is securely held in AgroDirect escrow.'
    },
    {
      icon: <Truck className="w-8 h-8 text-harvest-500" />,
      step: '03',
      title: 'Refrigerated Inter-State Haulage',
      desc: 'SwiftAgro refrigerated vehicles pick up produce directly from farm gate and transit safely through the Abia-Lagos expressway corridor.'
    },
    {
      icon: <CheckCircle2 className="w-8 h-8 text-emerald-600" />,
      step: '04',
      title: 'Customer Confirmation & Settlement',
      desc: 'Customer inspects fresh produce on delivery in Lagos, confirms receipt, and the settlement is instantly credited to the farmer’s wallet.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="bg-agro-100 text-agro-800 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
          Marketplace Architecture & Flow
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-agro-950 font-display">
          How AgroDirect Delivers Freshness Across Nigeria
        </h1>
        <p className="text-charcoal-600 text-sm leading-relaxed">
          From verified farm gates in Abia State to consumer dining tables and restaurant kitchens in Lagos State in 48 hours.
        </p>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((s, idx) => (
          <div key={idx} className="bg-white rounded-3xl border border-agro-100 p-8 shadow-card hover:shadow-card-hover transition-all relative flex flex-col justify-between">
            <span className="text-4xl font-black text-agro-100 absolute top-4 right-6 font-display">
              {s.step}
            </span>
            <div className="space-y-4 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-cream-100 flex items-center justify-center">
                {s.icon}
              </div>
              <h3 className="text-lg font-bold text-agro-900 leading-snug">{s.title}</h3>
              <p className="text-xs text-charcoal-500 leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Corridor Visual Diagram */}
      <div className="bg-gradient-to-br from-agro-900 to-agro-800 rounded-3xl p-8 sm:p-12 text-white shadow-2xl space-y-8">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Escrow Financial Ledger</span>
          <h2 className="text-2xl sm:text-3xl font-bold font-display mt-1">
            Example Financial Order Breakdown
          </h2>
          <p className="text-xs text-agro-200 mt-2">
            No hidden deductions. Total transparency for customers, farmers, and haulage partners.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-md">
            <span className="text-agro-200 block">1. Farmer Produce</span>
            <div className="text-xl font-bold text-white mt-1">₦190,000</div>
            <p className="text-[11px] text-agro-300 mt-1">Direct to Farmer's Account</p>
          </div>

          <div className="bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-md">
            <span className="text-agro-200 block">2. Packaging Fee</span>
            <div className="text-xl font-bold text-white mt-1">₦10,000</div>
            <p className="text-[11px] text-agro-300 mt-1">Dry Ice & Thermal Packs</p>
          </div>

          <div className="bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-md">
            <span className="text-agro-200 block">3. Inter-State Logistics</span>
            <div className="text-xl font-bold text-white mt-1">₦35,000</div>
            <p className="text-[11px] text-agro-300 mt-1">Abia → Lagos Cold Transport</p>
          </div>

          <div className="bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-md">
            <span className="text-agro-200 block">4. Platform Escrow (5%)</span>
            <div className="text-xl font-bold text-emerald-400 mt-1">₦7,500</div>
            <p className="text-[11px] text-agro-300 mt-1">Protection & Quality Guarantee</p>
          </div>
        </div>

        <div className="bg-emerald-950/60 p-4 rounded-2xl border border-emerald-500/30 flex items-center justify-between text-xs">
          <span className="font-semibold text-emerald-200">Customer Total Paid at Checkout</span>
          <span className="text-lg font-bold text-white">₦242,500</span>
        </div>
      </div>
    </div>
  );
};
