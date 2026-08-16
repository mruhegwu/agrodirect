import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Truck, MapPin, Search, Filter, ChevronRight, RefreshCw, Snowflake } from 'lucide-react';
import { api } from '../../services/api';
import { Shipment, DeliveryStatus } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';

export const LogisticsJobs: React.FC = () => {
  const [jobs, setJobs] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await api.logistics.listJobs(filterStatus === 'ALL' ? undefined : filterStatus);
      setJobs(data || []);
    } catch (err) {
      console.error('Failed to load logistics jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [filterStatus]);

  const filteredJobs = jobs.filter(j =>
    j.tracking_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.origin_state.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.destination_state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-agro-950">Shipment & Freight Dispatch Jobs</h2>
          <p className="text-xs text-charcoal-600">
            View all assigned inter-state cargo shipments, manage waybills, and log delivery checkpoints.
          </p>
        </div>

        <button
          onClick={loadJobs}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-agro-200 hover:bg-cream-50 text-charcoal-700 text-xs font-semibold rounded-xl shadow-xs self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-agro-100 p-4 shadow-card flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search waybill tracking #, route, state..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-cream-50 border border-agro-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-charcoal-400 flex-shrink-0" />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-cream-50 border border-agro-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING_ASSIGNMENT">Pending Assignment</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="PICKED_UP">Picked Up from Farm</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
            <option value="DELIVERED">Delivered</option>
          </select>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-3xl border border-agro-100 shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-charcoal-500">Loading freight jobs...</div>
        ) : filteredJobs.length === 0 ? (
          <div className="p-12 text-center text-xs text-charcoal-500">No shipments found matching filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50/75 text-charcoal-600 uppercase font-semibold border-b border-agro-50">
                <tr>
                  <th className="px-6 py-4">Waybill Number</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Origin ➔ Destination</th>
                  <th className="px-6 py-4">Assigned Vehicle</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-agro-50 font-medium text-charcoal-700">
                {filteredJobs.map(job => (
                  <tr key={job.id} className="hover:bg-cream-50/40 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-agro-950 block">
                        #{job.tracking_number}
                      </span>
                      <span className="text-[10px] text-charcoal-400">Order ID: {job.order_id.slice(0, 8)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="font-semibold text-charcoal-900">{job.origin_state}</span>
                        <span className="text-charcoal-400">➔</span>
                        <span className="font-bold text-agro-900">{job.destination_state}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-charcoal-800 font-semibold">
                        {job.vehicle_plate || 'Unassigned'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-charcoal-500">
                      {new Date(job.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/logistics/jobs/${job.id}`}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors"
                      >
                        <span>Manage</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
