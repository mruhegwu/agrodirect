import { Router, Response } from 'express';
import { LogisticsService } from '../services/logisticsService';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// Public / Customer: Calculate shipping rate
router.post('/calculate-rate', (req, res, next) => {
  try {
    const { origin_state, destination_state, total_weight_kg, requires_cold_chain } = req.body;
    if (!origin_state || !destination_state) {
      return res.status(400).json({ success: false, message: 'Origin and destination states are required' });
    }

    const rate = LogisticsService.calculateShippingRate({
      origin_state,
      destination_state,
      total_weight_kg: Number(total_weight_kg || 1),
      requires_cold_chain: Boolean(requires_cold_chain)
    });

    res.json({ success: true, data: rate });
  } catch (err) {
    next(err);
  }
});

// List All Configured Routes
router.get('/routes', (req, res, next) => {
  try {
    const routes = LogisticsService.listRoutes();
    res.json({ success: true, data: routes });
  } catch (err) {
    next(err);
  }
});

// Admin: Upsert Route
router.post('/routes', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), (req, res, next) => {
  try {
    const route = LogisticsService.upsertRoute(req.body);
    res.json({ success: true, data: route });
  } catch (err) {
    next(err);
  }
});

// Public: Track shipment by tracking number
router.get('/track/:trackingNumber', (req, res, next) => {
  try {
    const shipment = LogisticsService.getShipmentByTrackingNumber(String(req.params.trackingNumber));
    if (!shipment) return res.status(404).json({ success: false, message: 'Shipment not found' });
    res.json({ success: true, data: shipment });
  } catch (err) {
    next(err);
  }
});

// Logistics Provider / Staff: List Available Jobs
router.get('/jobs', authenticate, requireRole('LOGISTICS_PROVIDER', 'LOGISTICS_STAFF', 'ADMIN', 'SUPER_ADMIN'), (req: AuthRequest, res: Response, next) => {
  try {
    const { status } = req.query;
    const jobs = LogisticsService.listLogisticsJobs(undefined, status as any);
    res.json({ success: true, data: jobs });
  } catch (err) {
    next(err);
  }
});

// Update Delivery Status (State Machine + Timeline Event)
router.post('/shipments/:id/events', authenticate, requireRole('LOGISTICS_PROVIDER', 'LOGISTICS_STAFF', 'ADMIN', 'SUPER_ADMIN'), (req: AuthRequest, res: Response, next) => {
  try {
    const { status, note, location, gps_lat, gps_lng, proof_image } = req.body;
    if (!status || !note) {
      return res.status(400).json({ success: false, message: 'Status and note are required' });
    }

    const updated = LogisticsService.updateDeliveryStatus({
      shipment_id: String(req.params.id),
      new_status: status,
      note,
      location,
      gps_lat,
      gps_lng,
      proof_image,
      updated_by_user_id: req.user!.id
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// Vehicles
router.get('/vehicles', authenticate, requireRole('LOGISTICS_PROVIDER', 'LOGISTICS_STAFF', 'ADMIN', 'SUPER_ADMIN'), (req, res, next) => {
  try {
    const vehicles = LogisticsService.listVehicles();
    res.json({ success: true, data: vehicles });
  } catch (err) {
    next(err);
  }
});

router.post('/vehicles', authenticate, requireRole('LOGISTICS_PROVIDER', 'ADMIN', 'SUPER_ADMIN'), (req, res, next) => {
  try {
    const vehicle = LogisticsService.addVehicle(req.body);
    res.status(201).json({ success: true, data: vehicle });
  } catch (err) {
    next(err);
  }
});

export default router;
