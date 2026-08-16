import { Router, Response } from 'express';
import { AdminService } from '../services/adminService';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// Protect all admin endpoints
router.use(authenticate, requireRole('ADMIN', 'SUPER_ADMIN'));

// Executive Metrics & Analytics
router.get('/metrics', (req, res, next) => {
  try {
    const data = AdminService.getDashboardMetrics();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// Farmer Verification Workbench
router.get('/verifications', (req, res, next) => {
  try {
    const { status } = req.query;
    const applications = AdminService.listVerificationApplications(status as any);
    res.json({ success: true, data: applications });
  } catch (err) {
    next(err);
  }
});

router.post('/verifications/:id/review', (req: AuthRequest, res: Response, next) => {
  try {
    const { action, reason } = req.body;
    if (!action || !['APPROVE', 'REJECT', 'SUSPEND', 'REACTIVATE'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Valid review action required' });
    }

    const reviewed = AdminService.reviewFarmerVerification({
      verification_id: String(req.params.id),
      action,
      reason,
      admin_id: req.user!.id,
      admin_email: req.user!.email
    });

    res.json({ success: true, data: reviewed });
  } catch (err) {
    next(err);
  }
});

// User Management
router.get('/users', (req, res, next) => {
  try {
    const { role, search } = req.query;
    const users = AdminService.listUsers(role as string, search as string);
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
});

router.patch('/users/:id/status', (req: AuthRequest, res: Response, next) => {
  try {
    const { is_active } = req.body;
    const updated = AdminService.toggleUserStatus(String(req.params.id), Boolean(is_active), req.user!.id, req.user!.email);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// Platform Settings
router.get('/settings', (req, res, next) => {
  try {
    const settings = AdminService.getSettings();
    res.json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
});

router.post('/settings', (req: AuthRequest, res: Response, next) => {
  try {
    const { key, value } = req.body;
    if (!key || value === undefined) {
      return res.status(400).json({ success: false, message: 'Setting key and value are required' });
    }

    const updated = AdminService.updateSetting(key, String(value), req.user!.id, req.user!.email);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// Audit Logs
router.get('/audit-logs', (req, res, next) => {
  try {
    const logs = AdminService.listAuditLogs(Number(req.query.limit || 50));
    res.json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
});

export default router;
