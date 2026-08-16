import { Router, Response } from 'express';
import { BulkOrderService } from '../services/bulkOrderService';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// Create B2B Bulk Order RFQ
router.post('/requests', authenticate, (req: AuthRequest, res: Response, next) => {
  try {
    const { category_id, product_name, required_quantity, unit, target_price_per_unit, delivery_state, delivery_lga, delivery_date, specifications } = req.body;
    if (!category_id || !product_name || !required_quantity || !unit || !delivery_state || !delivery_date) {
      return res.status(400).json({ success: false, message: 'All required RFQ parameters must be supplied' });
    }

    const created = BulkOrderService.createRequest(req.user!.id, {
      category_id,
      product_name,
      required_quantity: Number(required_quantity),
      unit,
      target_price_per_unit: target_price_per_unit ? Number(target_price_per_unit) : undefined,
      delivery_state,
      delivery_lga: delivery_lga || '',
      delivery_date,
      specifications: specifications || {}
    });

    res.status(201).json({ success: true, data: created });
  } catch (err) {
    next(err);
  }
});

// List B2B RFQs
router.get('/requests', (req, res, next) => {
  try {
    const { category_id, status } = req.query;
    const requests = BulkOrderService.listRequests({
      category_id: category_id as string,
      status: status as string
    });
    res.json({ success: true, data: requests });
  } catch (err) {
    next(err);
  }
});

// Get Single RFQ
router.get('/requests/:id', (req, res, next) => {
  try {
    const request = BulkOrderService.getRequestById(String(req.params.id));
    if (!request) return res.status(404).json({ success: false, message: 'Bulk request not found' });
    res.json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
});

// Farmer: Submit Quote / Offer
router.post('/requests/:id/offers', authenticate, requireRole('FARMER', 'FARMER_STAFF'), (req: AuthRequest, res: Response, next) => {
  try {
    const { offered_price_per_unit, available_date, note } = req.body;
    if (!offered_price_per_unit || !available_date) {
      return res.status(400).json({ success: false, message: 'Offered price and availability date are required' });
    }

    const offer = BulkOrderService.submitOffer(req.user!.id, {
      request_id: String(req.params.id),
      offered_price_per_unit: Number(offered_price_per_unit),
      available_date,
      note
    });

    res.status(201).json({ success: true, data: offer });
  } catch (err) {
    next(err);
  }
});

export default router;
