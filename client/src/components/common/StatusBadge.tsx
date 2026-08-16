import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'order' | 'verification' | 'delivery' | 'settlement' | 'dispute';
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getColors = () => {
    switch (status) {
      // Success / Complete states
      case 'DELIVERED':
      case 'COMPLETED':
      case 'VERIFIED':
      case 'PAID':
      case 'RESOLVED':
      case 'ACTIVE':
      case 'ACCEPTED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';

      // Active / In-progress states
      case 'IN_TRANSIT':
      case 'OUT_FOR_DELIVERY':
      case 'PREPARING':
      case 'FARMER_CONFIRMED':
      case 'READY_FOR_PICKUP':
      case 'PICKED_UP':
      case 'PROCESSING':
      case 'ELIGIBLE':
      case 'UNDER_REVIEW':
      case 'RESPONDED':
        return 'bg-blue-100 text-blue-800 border-blue-300';

      // Pending / Warning states
      case 'PENDING':
      case 'PENDING_PAYMENT':
      case 'PENDING_ASSIGNMENT':
      case 'ASSIGNED':
      case 'PICKUP_SCHEDULED':
      case 'EVIDENCE_REQUESTED':
      case 'OPEN':
      case 'DRAFT':
        return 'bg-amber-100 text-amber-800 border-amber-300';

      // Danger / Alert / Dispute states
      case 'DISPUTED':
      case 'HELD':
      case 'CANCELLED':
      case 'REFUNDED':
      case 'REJECTED':
      case 'FAILED':
      case 'SUSPENDED':
      case 'OUT_OF_STOCK':
        return 'bg-rose-100 text-rose-800 border-rose-300';

      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs font-semibold px-2.5 py-1',
    lg: 'text-sm font-semibold px-3 py-1.5'
  };

  const formatText = (str: string) => {
    return str.replace(/_/g, ' ');
  };

  return (
    <span className={`inline-flex items-center rounded-full border uppercase tracking-wider font-medium ${getColors()} ${sizeClasses[size]}`}>
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-75 animate-pulse" />
      {formatText(status)}
    </span>
  );
};
