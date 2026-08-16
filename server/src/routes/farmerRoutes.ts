import { Router, Response } from 'express';
import { FarmerService } from '../services/farmerService';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// Public: List verified farms
router.get('/', (req, res, next) => {
  try {
    const { state, search } = req.query;
    const farms = FarmerService.listFarms({
      state: state as string,
      search: search as string
    });
    res.json({ success: true, data: farms });
  } catch (err) {
    next(err);
  }
});

// Public: Get Farm storefront by slug
router.get('/store/:slug', (req, res, next) => {
  try {
    const farm = FarmerService.getFarmBySlug(String(req.params.slug));
    if (!farm) return res.status(404).json({ success: false, message: 'Farm not found' });
    res.json({ success: true, data: farm });
  } catch (err) {
    next(err);
  }
});

// Farmer: Dashboard metrics & recent activity
router.get('/dashboard', authenticate, requireRole('FARMER', 'FARMER_STAFF'), (req: AuthRequest, res: Response, next) => {
  try {
    const dashboard = FarmerService.getFarmerDashboard(req.user!.id);
    res.json({ success: true, data: dashboard });
  } catch (err) {
    next(err);
  }
});

// Farmer: Submit 5-step onboarding & verification
router.post('/onboarding', authenticate, requireRole('FARMER'), (req: AuthRequest, res: Response, next) => {
  try {
    const result = FarmerService.submitOnboarding(req.user!.id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
