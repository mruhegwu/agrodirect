import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, CheckCircle2, Snowflake, ShieldCheck, ArrowRight } from 'lucide-react';

export const BecomeLogistics: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      <div className="bg-gradient-to-r from-agro-900 to-agro-800 rounded-3xl p-8 sm:p-14 text-white shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-8 space-y-4">
          <span className="bg-blue-400 text-agro-950 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
            Logistics Fleet Partner
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-display leading-tight">
            Power Inter-State Cold-Chain Haulage Across Nigeria.
          </h1>
          <p className="text-agro-200 text-sm max-w-xl leading-relaxed">
            Register your refrigerated trucks, haulage vans and dispatch fleet to fulfill agricultural pickup and delivery jobs between Abia, Enugu, Rivers and Lagos.
          </p>
          <div className="pt-2">
            <Link
              to="/register?role=LOGISTICS_PROVIDER"
              className="inline-flex items-center space-x-2 bg-harvest-400 hover:bg-harvest-500 text-white font-bold text-sm px-8 py-3.5 rounded-full shadow-lg transition-all"
            >
              <span>Register Fleet with AgroDirect</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white/10 p-6 rounded-3xl backdrop-blur-md border border-white/20 text-xs space-y-3">
          <div className="flex items-center space-x-3 text-blue-300">
            <Snowflake className="w-6 h-6" />
            <span className="font-bold text-white text-sm">Cold-Chain Premium Rates</span>
          </div>
          <p className="text-agro-200 leading-relaxed">
            Receive guaranteed haulage fees + cold-chain surcharges with prompt automated settlements into your wallet upon successful doorstep delivery.
          </p>
        </div>
      </div>
    </div>
  );
};
