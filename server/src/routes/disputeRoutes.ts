import { Router, Response } from 'express';
import { DisputeService } from '../services/disputeService';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// Customer: Open Dispute
router.post('/', authenticate, (req: AuthRequest, res: Response, next) => {
  try {
    const { order_id, reason, description, evidence_urls } = req.body;
    if (!order_id || !reason || !description) {
      return res.status(400).json({ success: false, message: 'Order ID, reason, and description are required' });
    }

    const dispute = DisputeService.createDispute(req.user!.id, {
      order_id,
      reason,
      description,
      evidence_urls: evidence_urls || []
    });

    res.status(201).json({ success: true, data: dispute });
  } catch (err) {
    next(err);
  }
});

// List Disputes (Customer, Farmer or Admin)
router.get('/', authenticate, (req: AuthRequest, res: Response, next) => {
  try {
    let filters: any = {};
    if (req.user!.role === 'CUSTOMER') {
      filters.customer_id = req.user!.id;
    } else if (['FARMER', 'FARMER_STAFF'].includes(req.user!.role)) {
      filters.farm_id = req.user!.farm_id;
    }

    const disputes = DisputeService.listDisputes(filters);
    res.json({ success: true, data: disputes });
  } catch (err) {
    next(err);
  }
});

// Get Dispute Detail with Messages
router.get('/:id', authenticate, (req: AuthRequest, res: Response, next) => {
  try {
    const dispute = DisputeService.getDisputeById(String(req.params.id));
    if (!dispute) return res.status(404).json({ success: false, message: 'Dispute not found' });
    res.json({ success: true, data: dispute });
  } catch (err) {
    next(err);
  }
});

// Add Message to Dispute
router.post('/:id/messages', authenticate, (req: AuthRequest, res: Response, next) => {
  try {
    const { message, attachment_url } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Message cannot be empty' });

    const dispute = DisputeService.addMessage(
      String(req.params.id),
      req.user!.id,
      req.user!.role,
      message,
      attachment_url
    );

    res.json({ success: true, data: dispute });
  } catch (err) {
    next(err);
  }
});

// Admin: Resolve Dispute
router.post('/:id/resolve', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), (req: AuthRequest, res: Response, next) => {
  try {
    const { resolution_type, refund_amount, resolution_notes } = req.body;
    if (!resolution_type || !resolution_notes) {
      return res.status(400).json({ success: false, message: 'Resolution type and notes are required' });
    }

    const resolved = DisputeService.resolveDispute(String(req.params.id), req.user!.id, {
      resolution_type,
      refund_amount: Number(refund_amount || 0),
      resolution_notes
    });

    res.json({ success: true, data: resolved });
  } catch (err) {
    next(err);
  }
});

export default router;
