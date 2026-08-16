import React from 'react';
import { CheckCircle2, Clock, Truck, Package, MapPin, AlertCircle } from 'lucide-react';
import { DeliveryEvent, DeliveryStatus } from '../../types';

interface DeliveryTimelineProps {
  status: DeliveryStatus;
  events?: DeliveryEvent[];
  originState: string;
  destinationState: string;
  trackingNumber: string;
}

export const DeliveryTimeline: React.FC<DeliveryTimelineProps> = ({
  status,
  events = [],
  originState,
  destinationState,
  trackingNumber
}) => {
  const steps: { key: DeliveryStatus; title: string; desc: string }[] = [
    { key: 'PENDING_ASSIGNMENT', title: 'Order Confirmed', desc: 'Order placed & farmer notified' },
    { key: 'ACCEPTED', title: 'Logistics Assigned', desc: `Driver assigned for pickup in ${originState}` },
    { key: 'PICKED_UP', title: 'Picked Up at Farm', desc: 'Loaded into temperature-controlled vehicle' },
    { key: 'IN_TRANSIT', title: 'In Transit', desc: `${originState} → ${destinationState} express corridor` },
    { key: 'OUT_FOR_DELIVERY', title: 'Out for Delivery', desc: `Arrived in ${destinationState} local hub` },
    { key: 'DELIVERED', title: 'Delivered', desc: 'Delivered to customer doorstep' }
  ];

  const getStepIndex = (st: DeliveryStatus) => {
    const map: Record<string, number> = {
      PENDING_ASSIGNMENT: 0,
      ASSIGNED: 1,
      ACCEPTED: 1,
      PICKUP_SCHEDULED: 1,
      PICKED_UP: 2,
      IN_TRANSIT: 3,
      OUT_FOR_DELIVERY: 4,
      DELIVERED: 5,
      FAILED: -1,
      CANCELLED: -1
    };
    return map[st] !== undefined ? map[st] : 0;
  };

  const currentIndex = getStepIndex(status);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-4 mb-6">
        <div>
          <span className="text-xs font-semibold text-agro-600 uppercase tracking-wider">Live Route Tracking</span>
          <h3 className="text-lg font-bold text-gray-900">
            {originState} <span className="text-harvest-500">→</span> {destinationState}
          </h3>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-400">Tracking Code</span>
          <p className="text-sm font-mono font-bold text-agro-800 bg-agro-50 px-2.5 py-1 rounded-md border border-agro-100">
            {trackingNumber}
          </p>
        </div>
      </div>

      {/* Visual Stepper */}
      <div className="relative mb-8">
        <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0" />
        <div
          className="hidden sm:block absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-500"
          style={{ width: `${Math.min(100, (currentIndex / (steps.length - 1)) * 100)}%` }}
        />

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 relative z-10">
          {steps.map((step, idx) => {
            const isDone = currentIndex >= idx;
            const isCurrent = currentIndex === idx;

            return (
              <div key={step.key} className="flex flex-col items-center text-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    isDone
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                      : 'bg-gray-100 text-gray-400 border border-gray-300'
                  } ${isCurrent ? 'ring-4 ring-emerald-100 scale-110' : ''}`}
                >
                  {isDone ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                </div>
                <span className={`text-xs mt-2 font-semibold ${isDone ? 'text-gray-900' : 'text-gray-400'}`}>
                  {step.title}
                </span>
                <span className="text-[11px] text-gray-400 hidden sm:block mt-0.5 leading-tight">
                  {step.desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Events Log */}
      {events && events.length > 0 && (
        <div className="border-t border-gray-100 pt-5">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            Activity Log & Checkpoints
          </h4>
          <div className="space-y-3">
            {events.slice().reverse().map((ev) => (
              <div key={ev.id} className="flex items-start space-x-3 text-xs bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="p-1 bg-white rounded shadow-xs text-agro-600 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-800">{ev.status.replace(/_/g, ' ')}</span>
                    <span className="text-gray-400 font-mono text-[11px]">
                      {new Date(ev.created_at).toLocaleString('en-NG', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-0.5">{ev.note}</p>
                  {ev.location && (
                    <span className="inline-block mt-1 text-[11px] text-agro-700 bg-agro-50 px-1.5 py-0.5 rounded font-medium">
                      📍 {ev.location}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
