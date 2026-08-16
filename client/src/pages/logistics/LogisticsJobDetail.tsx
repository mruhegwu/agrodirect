import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Phone,
  Snowflake,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { api } from '../../services/api';
import { Shipment, DeliveryStatus } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DeliveryTimeline } from '../../components/common/DeliveryTimeline';

const STATUS_FLOW: DeliveryStatus[] = [
  'PENDING_ASSIGNMENT',
  'ASSIGNED',
  'ACCEPTED',
  'PICKUP_SCHEDULED',
  'PICKED_UP',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY',
  'DELIVERED'
];

export const LogisticsJobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const navigate = useNavigate();

  const [eventForm, setEventForm] = useState({
    status: 'IN_TRANSIT' as DeliveryStatus,
    location: 'Ore-Benin Expressway Checkpoint',
    note: 'Cold-chain refrigeration verified at 4°C. Transit on schedule.',
    proof_image: ''
  });

  const loadShipment = async () => {
    if (!id) return;
    try {
      setLoading(true);
      // Retrieve jobs and locate current
      const jobs = await api.logistics.listJobs();
      const match = jobs.find(j => j.id === id);
      if (match) {
        setShipment(match);
      } else {
        setError('Shipment not found.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load shipment details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShipment();
  }, [id]);

  const handlePostEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipment) return;
    try {
      setUpdating(true);
      await api.logistics.updateDeliveryStatus(shipment.id, eventForm);
      setIsEventModalOpen(false);
      await loadShipment();
    } catch (err: any) {
      alert(err.message || 'Failed to update delivery event');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 animate-pulse space-y-4">
        <div className="h-6 bg-agro-100 rounded w-1/4"></div>
        <div className="h-48 bg-white rounded-3xl border border-agro-100"></div>
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-red-100">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <h3 className="text-base font-bold text-charcoal-900">Shipment Waybill Not Found</h3>
        <p className="text-xs text-charcoal-500 mb-4">{error || 'Could not locate shipment data.'}</p>
        <Link to="/logistics/jobs" className="text-xs font-semibold text-blue-700 hover:underline">
          Back to Shipments List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/logistics/jobs')}
            className="p-2 bg-white hover:bg-cream-100 border border-agro-100 rounded-xl text-charcoal-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-display text-agro-950">
                Waybill #{shipment.tracking_number}
              </h2>
              <StatusBadge status={shipment.status} />
            </div>
            <span className="text-xs text-charcoal-500">
              Corridor: {shipment.origin_state} State ➔ {shipment.destination_state} State
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsEventModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log Checkpoint Event</span>
        </button>
      </div>

      {/* Corridor Quick Banner */}
      <div className="bg-white rounded-3xl border border-agro-100 p-6 shadow-card grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <span className="text-xs text-charcoal-500 font-medium block mb-1">Origin Point</span>
          <span className="text-sm font-bold text-agro-950 block">{shipment.origin_state} State, Nigeria</span>
          <span className="text-[11px] text-charcoal-500">Farm Gate Harvest Center</span>
        </div>

        <div>
          <span className="text-xs text-charcoal-500 font-medium block mb-1">Destination Point</span>
          <span className="text-sm font-bold text-agro-950 block">{shipment.destination_state} State, Nigeria</span>
          <span className="text-[11px] text-charcoal-500">Customer Delivery Address</span>
        </div>

        <div>
          <span className="text-xs text-charcoal-500 font-medium block mb-1">Assigned Vehicle</span>
          <span className="text-sm font-mono font-bold text-blue-700 block">
            {shipment.vehicle_plate || 'Refrigerated Cold-Chain Van'}
          </span>
          <span className="text-[11px] text-emerald-700 font-medium">Temperature Insulated</span>
        </div>
      </div>

      {/* Tracking Timeline */}
      <div className="bg-white rounded-3xl border border-agro-100 p-6 shadow-card">
        <h3 className="font-bold text-agro-950 text-sm mb-4">Interstate Waybill Events</h3>
        <DeliveryTimeline
          status={shipment.status}
          events={shipment.events}
          originState={shipment.origin_state}
          destinationState={shipment.destination_state}
          trackingNumber={shipment.tracking_number}
        />
      </div>

      {/* Log Event Modal */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-agro-100">
            <h3 className="text-lg font-bold font-display text-agro-950 mb-1">
              Log Waypoint & Delivery Status
            </h3>
            <p className="text-xs text-charcoal-600 mb-6">
              Update real-time cargo status on the Abia ➔ Lagos freight route.
            </p>

            <form onSubmit={handlePostEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">New Delivery Status</label>
                <select
                  value={eventForm.status}
                  onChange={e => setEventForm({ ...eventForm, status: e.target.value as DeliveryStatus })}
                  className="w-full px-4 py-2.5 bg-cream-50 border border-agro-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PICKED_UP">PICKED UP from Farm Gate</option>
                  <option value="IN_TRANSIT">IN TRANSIT on Highway</option>
                  <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY at Destination Hub</option>
                  <option value="DELIVERED">DELIVERED to Customer (Completed)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">Current Waypoint Location</label>
                <input
                  type="text"
                  placeholder="e.g. Benin Bypass, Ore Hub, Ikeja Distribution Center"
                  value={eventForm.location}
                  onChange={e => setEventForm({ ...eventForm, location: e.target.value })}
                  className="w-full px-4 py-2.5 bg-cream-50 border border-agro-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">Status Note & Temperature Log</label>
                <textarea
                  rows={3}
                  placeholder="Cargo condition notes, cold-chain temperature readings..."
                  value={eventForm.note}
                  onChange={e => setEventForm({ ...eventForm, note: e.target.value })}
                  className="w-full px-4 py-2.5 bg-cream-50 border border-agro-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-charcoal-600 hover:bg-cream-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-charcoal-200 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  {updating ? 'Saving Event...' : 'Post Checkpoint Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
