import React from 'react';
import { Truck, Package, Shield, Tag } from 'lucide-react';

interface PriceBreakdownProps {
  subtotal: number;
  packagingFee?: number;
  logisticsFee?: number;
  platformFee?: number;
  discount?: number;
  total: number;
  className?: string;
}

export const PriceBreakdown: React.FC<PriceBreakdownProps> = ({
  subtotal,
  packagingFee = 0,
  logisticsFee = 0,
  platformFee = 0,
  discount = 0,
  total,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-xl border border-agro-100 p-5 shadow-subtle ${className}`}>
      <h3 className="text-base font-semibold text-agro-900 border-b border-gray-100 pb-3 mb-3">
        Transparent Price Breakdown
      </h3>

      <div className="space-y-2.5 text-sm">
        <div className="flex justify-between items-center text-charcoal-600">
          <span className="flex items-center">
            <Package className="w-4 h-4 mr-2 text-agro-500" />
            Produce Subtotal
          </span>
          <span className="font-medium text-charcoal-900">₦{subtotal.toLocaleString()}</span>
        </div>

        {packagingFee > 0 && (
          <div className="flex justify-between items-center text-charcoal-600">
            <span className="flex items-center text-xs">
              <span className="w-4 mr-2 text-center text-agro-600 font-bold">•</span>
              Protective / Thermal Packaging
            </span>
            <span className="font-medium text-charcoal-900">₦{packagingFee.toLocaleString()}</span>
          </div>
        )}

        {logisticsFee > 0 && (
          <div className="flex justify-between items-center text-charcoal-600">
            <span className="flex items-center">
              <Truck className="w-4 h-4 mr-2 text-harvest-500" />
              Inter-State Logistics & Haulage
            </span>
            <span className="font-medium text-charcoal-900">₦{logisticsFee.toLocaleString()}</span>
          </div>
        )}

        {platformFee > 0 && (
          <div className="flex justify-between items-center text-charcoal-600">
            <span className="flex items-center text-xs">
              <Shield className="w-3.5 h-3.5 mr-2 text-emerald-600" />
              AgroDirect Escrow & Platform Fee (5%)
            </span>
            <span className="font-medium text-charcoal-900">₦{platformFee.toLocaleString()}</span>
          </div>
        )}

        {discount > 0 && (
          <div className="flex justify-between items-center text-emerald-600 font-medium">
            <span className="flex items-center">
              <Tag className="w-4 h-4 mr-2" />
              Discount
            </span>
            <span>-₦{discount.toLocaleString()}</span>
          </div>
        )}

        <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between items-center">
          <div>
            <span className="text-base font-bold text-agro-950">Total Amount</span>
            <p className="text-xs text-charcoal-400">All fees & delivery included</p>
          </div>
          <span className="text-xl font-bold text-agro-700">₦{total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};
