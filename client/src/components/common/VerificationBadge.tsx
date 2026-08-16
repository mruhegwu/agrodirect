import React from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { FarmStatus } from '../../types';

interface VerificationBadgeProps {
  status?: FarmStatus;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  status = 'VERIFIED',
  showText = true,
  size = 'md'
}) => {
  if (status === 'VERIFIED') {
    return (
      <span className={`inline-flex items-center text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full font-medium shadow-sm ${
        size === 'sm' ? 'px-1.5 py-0.5 text-xs' : size === 'lg' ? 'px-3 py-1.5 text-sm font-semibold' : 'px-2 py-1 text-xs'
      }`} title="Verified AgroDirect Commercial Farm">
        <ShieldCheck className={`${size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} text-emerald-600 mr-1 flex-shrink-0`} />
        {showText && <span>Verified Farm</span>}
      </span>
    );
  }

  if (status === 'UNDER_REVIEW') {
    return (
      <span className="inline-flex items-center text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 text-xs font-medium">
        <ShieldAlert className="w-3.5 h-3.5 text-amber-600 mr-1 flex-shrink-0" />
        {showText && <span>Under Review</span>}
      </span>
    );
  }

  return null;
};
