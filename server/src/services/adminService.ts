import { queryHelpers, generateUUID, safeJsonParse, safeJsonStringify } from '../db';
import { AuditLog, FarmStatus, PlatformSetting, User } from '../types';

export class AdminService {
  static getDashboardMetrics() {
    const totalGmv = queryHelpers.getOne<any>("SELECT SUM(total_amount) as val FROM orders WHERE status NOT IN ('CANCELLED', 'REFUNDED', 'PENDING_PAYMENT')")?.val || 0;
    const platformRevenue = queryHelpers.getOne<any>("SELECT SUM(platform_fee) as val FROM orders WHERE status NOT IN ('CANCELLED', 'REFUNDED', 'PENDING_PAYMENT')")?.val || 0;

    const ordersToday = queryHelpers.getOne<any>("SELECT COUNT(*) as count FROM orders WHERE date(created_at) = date('now')")?.count || 0;
    const ordersThisMonth = queryHelpers.getOne<any>("SELECT COUNT(*) as count FROM orders WHERE created_at >= datetime('now', 'start of month')")?.count || 0;

    const activeFarmers = queryHelpers.getOne<any>("SELECT COUNT(*) as count FROM farms WHERE status = 'VERIFIED'")?.count || 0;
    const pendingVerifications = queryHelpers.getOne<any>("SELECT COUNT(*) as count FROM farmer_verifications WHERE status = 'UNDER_REVIEW'")?.count || 0;

    const totalCustomers = queryHelpers.getOne<any>("SELECT COUNT(*) as count FROM users WHERE role = 'CUSTOMER'")?.count || 0;
    const activeProducts = queryHelpers.getOne<any>("SELECT COUNT(*) as count FROM products WHERE status = 'ACTIVE'")?.count || 0;

    const pendingWithdrawals = queryHelpers.getOne<any>("SELECT COUNT(*) as count, SUM(amount) as total FROM withdrawals WHERE status = 'PENDING'") || { count: 0, total: 0 };
    const openDisputes = queryHelpers.getOne<any>("SELECT COUNT(*) as count FROM disputes WHERE status IN ('OPEN', 'UNDER_REVIEW')")?.count || 0;
    const ordersInTransit = queryHelpers.getOne<any>("SELECT COUNT(*) as count FROM shipments WHERE status IN ('PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY')")?.count || 0;

    // Charts: Sales by Category
    const salesByCategory = queryHelpers.getAll<any>(
      `SELECT c.name, COALESCE(SUM(oi.total_price), 0) as total_sales
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id
       LEFT JOIN order_items oi ON oi.product_id = p.id
       GROUP BY c.id, c.name
       ORDER BY total_sales DESC LIMIT 6`
    );

    // Charts: Orders by State
    const ordersByState = queryHelpers.getAll<any>(
      `SELECT f.state, COUNT(o.id) as order_count, COALESCE(SUM(o.total_amount), 0) as total_gmv
       FROM farms f
       LEFT JOIN orders o ON o.farm_id = f.id
       GROUP BY f.state
       ORDER BY order_count DESC`
    );

    // Top Farmers
    const topFarmers = queryHelpers.getAll<any>(
      `SELECT f.id, f.farm_name, f.state, f.rating, f.completed_orders,
              u.full_name as farmer_name,
              COALESCE(SUM(o.subtotal), 0) as total_revenue
       FROM farms f
       JOIN users u ON f.farmer_id = u.id
       LEFT JOIN orders o ON o.farm_id = f.id AND o.status = 'COMPLETED'
       GROUP BY f.id, f.farm_name, f.state, f.rating, f.completed_orders, u.full_name
       ORDER BY total_revenue DESC LIMIT 5`
    );

    return {
      metrics: {
        totalGmv,
        platformRevenue,
        ordersToday,
        ordersThisMonth,
        activeFarmers,
        pendingVerifications,
        totalCustomers,
        activeProducts,
        pendingWithdrawalCount: pendingWithdrawals.count || 0,
        pendingWithdrawalAmount: pendingWithdrawals.total || 0,
        openDisputes,
        ordersInTransit
      },
      salesByCategory,
      ordersByState,
      topFarmers
    };
  }

  // Farmer Verification Actions
  static listVerificationApplications(status?: FarmStatus) {
    let sql = `
      SELECT fv.*, f.farm_name, f.state, f.lga, f.address, f.farm_size, f.farm_type, f.main_products, f.description,
             u.full_name as farmer_name, u.email as farmer_email, u.phone as farmer_phone
      FROM farmer_verifications fv
      JOIN farms f ON fv.farm_id = f.id
      JOIN users u ON fv.farmer_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      sql += ' AND fv.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY fv.created_at DESC';

    const rows = queryHelpers.getAll<any>(sql, params);
    return rows.map(r => ({
      ...r,
      farm_documents: safeJsonParse(r.farm_documents, []),
      farm_photos: safeJsonParse(r.farm_photos, [])
    }));
  }

  static reviewFarmerVerification(params: {
    verification_id: string;
    action: 'APPROVE' | 'REJECT' | 'SUSPEND' | 'REACTIVATE';
    reason?: string;
    admin_id: string;
    admin_email: string;
  }) {
    const verif = queryHelpers.getOne<any>('SELECT * FROM farmer_verifications WHERE id = ?', [params.verification_id]);
    if (!verif) throw new Error('Verification application not found');

    return queryHelpers.transaction(() => {
      const now = new Date().toISOString();
      let newStatus: FarmStatus = 'UNDER_REVIEW';

      if (params.action === 'APPROVE') newStatus = 'VERIFIED';
      else if (params.action === 'REJECT') newStatus = 'REJECTED';
      else if (params.action === 'SUSPEND') newStatus = 'SUSPENDED';
      else if (params.action === 'REACTIVATE') newStatus = 'VERIFIED';

      queryHelpers.execute(
        `UPDATE farmer_verifications SET
          status = ?, rejection_reason = ?, reviewed_by = ?, reviewed_at = ?, updated_at = ?
         WHERE id = ?`,
        [newStatus, params.reason || null, params.admin_id, now, now, params.verification_id]
      );

      queryHelpers.execute('UPDATE farms SET status = ?, updated_at = ? WHERE id = ?', [newStatus, now, verif.farm_id]);

      // Record Audit Log
      this.recordAuditLog({
        user_id: params.admin_id,
        user_email: params.admin_email,
        action: `FARMER_VERIFICATION_${params.action}`,
        entity_type: 'FARMER_VERIFICATION',
        entity_id: params.verification_id,
        old_values: { status: verif.status },
        new_values: { status: newStatus, reason: params.reason }
      });

      // Notify Farmer
      queryHelpers.execute(
        `INSERT INTO notifications (id, user_id, title, message, type, link, is_read, created_at)
         VALUES (?, ?, ?, ?, 'VERIFICATION', '/farmer/verification', 0, ?)`,
        [
          generateUUID(),
          verif.farmer_id,
          newStatus === 'VERIFIED' ? 'Farm Verification Approved!' : `Farm Verification Status: ${newStatus}`,
          newStatus === 'VERIFIED'
            ? 'Congratulations! Your farm is now verified. You can now publish agricultural products to the marketplace.'
            : `Your verification status has been updated to ${newStatus}. ${params.reason ? 'Reason: ' + params.reason : ''}`,
          now
        ]
      );

      return queryHelpers.getOne('SELECT * FROM farmer_verifications WHERE id = ?', [params.verification_id]);
    });
  }

  // User Management
  static listUsers(role?: string, search?: string) {
    let sql = 'SELECT id, email, full_name, phone, role, avatar_url, is_active, created_at, updated_at FROM users WHERE 1=1';
    const params: any[] = [];

    if (role) {
      sql += ' AND role = ?';
      params.push(role);
    }

    if (search) {
      sql += ' AND (email LIKE ? OR full_name LIKE ? OR phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY created_at DESC';
    return queryHelpers.getAll<User>(sql, params);
  }

  static toggleUserStatus(userId: string, isActive: boolean, adminId: string, adminEmail: string) {
    const now = new Date().toISOString();
    queryHelpers.execute('UPDATE users SET is_active = ?, updated_at = ? WHERE id = ?', [isActive ? 1 : 0, now, userId]);

    this.recordAuditLog({
      user_id: adminId,
      user_email: adminEmail,
      action: isActive ? 'USER_ACTIVATED' : 'USER_SUSPENDED',
      entity_type: 'USER',
      entity_id: userId,
      new_values: { is_active: isActive }
    });

    return queryHelpers.getOne<User>('SELECT id, email, full_name, phone, role, is_active FROM users WHERE id = ?', [userId]);
  }

  // Platform Settings
  static getSettings() {
    return queryHelpers.getAll<PlatformSetting>('SELECT * FROM platform_settings');
  }

  static updateSetting(key: string, value: string, adminId: string, adminEmail: string) {
    const now = new Date().toISOString();
    queryHelpers.execute(
      `INSERT INTO platform_settings (id, key, value, description, updated_by, updated_at)
       VALUES (?, ?, ?, 'Platform configuration', ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_by = excluded.updated_by, updated_at = excluded.updated_at`,
      [generateUUID(), key, value, adminId, now]
    );

    this.recordAuditLog({
      user_id: adminId,
      user_email: adminEmail,
      action: 'PLATFORM_SETTING_UPDATED',
      entity_type: 'SETTING',
      entity_id: key,
      new_values: { key, value }
    });

    return queryHelpers.getOne<PlatformSetting>('SELECT * FROM platform_settings WHERE key = ?', [key]);
  }

  // Audit Logs
  static recordAuditLog(data: {
    user_id?: string;
    user_email?: string;
    action: string;
    entity_type: string;
    entity_id: string;
    old_values?: Record<string, any>;
    new_values?: Record<string, any>;
    ip_address?: string;
  }) {
    const id = generateUUID();
    const now = new Date().toISOString();
    queryHelpers.execute(
      `INSERT INTO audit_logs (id, user_id, user_email, action, entity_type, entity_id, old_values, new_values, ip_address, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.user_id || null,
        data.user_email || null,
        data.action,
        data.entity_type,
        data.entity_id,
        safeJsonStringify(data.old_values || {}),
        safeJsonStringify(data.new_values || {}),
        data.ip_address || null,
        now
      ]
    );
  }

  static listAuditLogs(limit: number = 50) {
    const logs = queryHelpers.getAll<any>('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?', [limit]);
    return logs.map(l => ({
      ...l,
      old_values: safeJsonParse(l.old_values, {}),
      new_values: safeJsonParse(l.new_values, {})
    }));
  }
}
