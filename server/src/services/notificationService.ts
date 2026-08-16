import { queryHelpers, generateUUID } from '../db';
import { Notification } from '../types';

export class NotificationService {
  static listNotifications(userId: string): Notification[] {
    return queryHelpers.getAll<Notification>(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30',
      [userId]
    ).map(n => ({ ...n, is_read: Boolean(n.is_read) }));
  }

  static getUnreadCount(userId: string): number {
    const row = queryHelpers.getOne<any>(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
      [userId]
    );
    return row?.count || 0;
  }

  static markAsRead(notificationId: string, userId: string) {
    queryHelpers.execute('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [notificationId, userId]);
  }

  static markAllAsRead(userId: string) {
    queryHelpers.execute('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId]);
  }

  static send(userId: string, title: string, message: string, type: 'ORDER' | 'DELIVERY' | 'PAYMENT' | 'VERIFICATION' | 'DISPUTE' | 'SYSTEM', link?: string) {
    const id = generateUUID();
    const now = new Date().toISOString();
    queryHelpers.execute(
      `INSERT INTO notifications (id, user_id, title, message, type, link, is_read, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
      [id, userId, title, message, type, link || null, now]
    );
  }
}
