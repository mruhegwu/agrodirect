import { Router, Response } from 'express';
import { NotificationService } from '../services/notificationService';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, (req: AuthRequest, res: Response, next) => {
  try {
    const notifications = NotificationService.listNotifications(req.user!.id);
    const unreadCount = NotificationService.getUnreadCount(req.user!.id);
    res.json({ success: true, data: { notifications, unreadCount } });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/read', authenticate, (req: AuthRequest, res: Response, next) => {
  try {
    NotificationService.markAsRead(String(req.params.id), req.user!.id);
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    next(err);
  }
});

router.post('/read-all', authenticate, (req: AuthRequest, res: Response, next) => {
  try {
    NotificationService.markAllAsRead(req.user!.id);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
});

export default router;
