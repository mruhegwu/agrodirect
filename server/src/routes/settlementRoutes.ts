import { Router, Response } from 'express';
import { SettlementService } from '../services/settlementService';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// Admin: List Settlements
router.get('/', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), (req, res, next) => {
  try {
    const { status } = req.query;
    const settlements = SettlementService.listSettlements(status as any);
    res.json({ success: true, data: settlements });
  } catch (err) {
    next(err);
  }
});

// Admin: Release Escrow Settlement
router.post('/:id/release', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), (req: AuthRequest, res: Response, next) => {
  try {
    const released = SettlementService.releaseSettlement(String(req.params.id), req.user!.id);
    res.json({ success: true, data: released });
  } catch (err) {
    next(err);
  }
});

export default router;
