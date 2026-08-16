import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Truck, Package, Clock, CheckCircle2, MapPin, Snowflake, ChevronRight, ArrowUpRight, Compass } from 'lucide-react';
import { api } from '../../services/api';
import { Shipment } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';

export const LogisticsDashboard: React.FC = () => {
  const [jobs, setJobs] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await api.logistics.listJobs();
        setJobs(data || []);
      } catch (err) {
        console.error('Failed to load logistics dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const inTransitCount = jobs.filter(j => ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'PICKED_UP'].includes(j.status)).length;
  const pendingPickup = jobs.filter(j => ['PENDING_ASSIGNMENT', 'ASSIGNED', 'ACCEPTED', 'PICKUP_SCHEDULED'].includes(j.status)).length;
  const deliveredCount = jobs.filter(j => j.status === 'DELIVERED').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-agro-950">Logistics & Dispatch Command</h2>
        <p className="text-xs text-charcoal-600">
          Monitor interstate agricultural freight, cold-chain shipments, and last-mile delivery.
        </p>
      </div>

      {/* Metrics Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-agro-100 p-5 shadow-card">
          <span className="text-xs font-medium text-charcoal-500">In Transit on Highway</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-bold text-blue-600">{inTransitCount}</span>
            <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-blue-700 font-semibold block mt-1">
            Abia ⇄ Lagos Transit Corridor
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-agro-100 p-5 shadow-card">
          <span className="text-xs font-medium text-charcoal-500">Pending Farm Pickup</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-bold text-amber-600">{pendingPickup}</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-amber-700 font-semibold block mt-1">
            Harvest packaged at farm gate
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-agro-100 p-5 shadow-card">
          <span className="text-xs font-medium text-charcoal-500">Delivered This Month</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-bold text-emerald-700">{deliveredCount}</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold block mt-1">
            100% On-time delivery SLA
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-agro-100 p-5 shadow-card">
          <span className="text-xs font-medium text-charcoal-500">Freight Earnings</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-bold text-agro-950">₦185,000</span>
            <div className="p-2.5 bg-agro-50 text-agro-700 rounded-xl">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-charcoal-500 block mt-1">
            Available in Logistics Wallet
          </span>
        </div>
      </div>

      {/* Active Shipments Queue */}
      <div className="bg-white rounded-3xl border border-agro-100 shadow-card overflow-hidden">
        <div className="p-5 border-b border-agro-50 flex items-center justify-between">
          <h3 className="font-bold text-agro-950 text-sm">Active Freight & Waybill Manifest</h3>
          <Link
            to="/logistics/jobs"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All Jobs</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-charcoal-500">Loading freight jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center text-xs text-charcoal-500">No active shipments in queue.</div>
        ) : (
          <div className="divide-y divide-agro-50">
            {jobs.map(job => (
              <div key={job.id} className="p-5 hover:bg-cream-50/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-agro-950">
                      Waybill #{job.tracking_number}
                    </span>
                    <StatusBadge status={job.status} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-charcoal-600">
                    <MapPin className="w-3.5 h-3.5 text-agro-600" />
                    <span>{job.origin_state} State (Farm Gate)</span>
                    <span className="text-charcoal-300">➔</span>
                    <span className="font-semibold text-agro-900">{job.destination_state} State (Delivery Hub)</span>
                  </div>
                  {job.vehicle_plate && (
                    <span className="text-[11px] text-charcoal-500 block">
                      Assigned Vehicle: <strong className="text-charcoal-800">{job.vehicle_plate}</strong>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <Link
                    to={`/logistics/jobs/${job.id}`}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>Manage Dispatch</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
