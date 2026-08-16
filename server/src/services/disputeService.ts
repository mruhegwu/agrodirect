import { queryHelpers, generateUUID, safeJsonParse, safeJsonStringify } from '../db';
import { Dispute, DisputeMessage, DisputeResolution, Order } from '../types';
import { SettlementService } from './settlementService';
import { OrderService } from './orderService';

export class DisputeService {
  static createDispute(customerId: string, data: {
    order_id: string;
    reason: string;
    description: string;
    evidence_urls: string[];
  }) {
    const order = queryHelpers.getOne<Order>('SELECT * FROM orders WHERE id = ?', [data.order_id]);
    if (!order) throw new Error('Order not found');
    if (order.customer_id !== customerId) throw new Error('Unauthorized to dispute this order');

    const existing = queryHelpers.getOne<Dispute>('SELECT id FROM disputes WHERE order_id = ?', [data.order_id]);
    if (existing) throw new Error('A dispute has already been filed for this order');

    return queryHelpers.transaction(() => {
      const disputeId = generateUUID();
      const now = new Date().toISOString();

      queryHelpers.execute(
        `INSERT INTO disputes (
          id, order_id, customer_id, farm_id, reason, description, evidence_urls, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'OPEN', ?, ?)`,
        [
          disputeId,
          data.order_id,
          customerId,
          order.farm_id,
          data.reason,
          data.description,
          safeJsonStringify(data.evidence_urls || []),
          now,
          now
        ]
      );

      // Transition order to DISPUTED
      OrderService.updateOrderStatus(data.order_id, 'DISPUTED');

      // Hold settlement
      SettlementService.holdSettlement(data.order_id, `Dispute opened by customer: ${data.reason}`);

      // Add initial message
      queryHelpers.execute(
        `INSERT INTO dispute_messages (id, dispute_id, sender_id, sender_role, message, created_at)
         VALUES (?, ?, ?, 'CUSTOMER', ?, ?)`,
        [generateUUID(), disputeId, customerId, data.description, now]
      );

      // Create Admin & Farmer Notification
      queryHelpers.execute(
        `INSERT INTO notifications (id, user_id, title, message, type, link, is_read, created_at)
         VALUES (?, ?, 'Dispute Opened on Order', ?, 'DISPUTE', ?, 0, ?)`,
        [
          generateUUID(),
          order.farmer_id,
          `A dispute has been opened for order #${order.order_number}. Settlement is held pending resolution.`,
          `/farmer/orders/${order.id}`,
          now
        ]
      );

      return this.getDisputeById(disputeId);
    });
  }

  static getDisputeById(disputeId: string): Dispute | undefined {
    const dispute = queryHelpers.getOne<any>(
      `SELECT d.*, o.order_number, u.full_name as customer_name, f.farm_name
       FROM disputes d
       JOIN orders o ON d.order_id = o.id
       JOIN users u ON d.customer_id = u.id
       JOIN farms f ON d.farm_id = f.id
       WHERE d.id = ?`,
      [disputeId]
    );

    if (!dispute) return undefined;

    const messages = queryHelpers.getAll<any>(
      `SELECT dm.*, u.full_name as sender_name
       FROM dispute_messages dm
       JOIN users u ON dm.sender_id = u.id
       WHERE dm.dispute_id = ?
       ORDER BY dm.created_at ASC`,
      [disputeId]
    );

    return {
      ...dispute,
      evidence_urls: safeJsonParse(dispute.evidence_urls, []),
      messages
    };
  }

  static getDisputeByOrderId(orderId: string): Dispute | undefined {
    const d = queryHelpers.getOne<any>('SELECT id FROM disputes WHERE order_id = ?', [orderId]);
    return d ? this.getDisputeById(d.id) : undefined;
  }

  static listDisputes(filters: { customer_id?: string; farm_id?: string; status?: string } = {}) {
    let sql = `
      SELECT d.*, o.order_number, o.total_amount, u.full_name as customer_name, f.farm_name
      FROM disputes d
      JOIN orders o ON d.order_id = o.id
      JOIN users u ON d.customer_id = u.id
      JOIN farms f ON d.farm_id = f.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters.customer_id) {
      sql += ' AND d.customer_id = ?';
      params.push(filters.customer_id);
    }

    if (filters.farm_id) {
      sql += ' AND d.farm_id = ?';
      params.push(filters.farm_id);
    }

    if (filters.status) {
      sql += ' AND d.status = ?';
      params.push(filters.status);
    }

    sql += ' ORDER BY d.created_at DESC';

    const rows = queryHelpers.getAll<any>(sql, params);
    return rows.map(r => ({
      ...r,
      evidence_urls: safeJsonParse(r.evidence_urls, [])
    }));
  }

  static addMessage(disputeId: string, senderId: string, senderRole: string, message: string, attachmentUrl?: string) {
    const dispute = queryHelpers.getOne<Dispute>('SELECT * FROM disputes WHERE id = ?', [disputeId]);
    if (!dispute) throw new Error('Dispute not found');

    const id = generateUUID();
    const now = new Date().toISOString();

    queryHelpers.execute(
      `INSERT INTO dispute_messages (id, dispute_id, sender_id, sender_role, message, attachment_url, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, disputeId, senderId, senderRole, message, attachmentUrl || null, now]
    );

    return this.getDisputeById(disputeId);
  }

  // Admin Resolve Dispute
  static resolveDispute(disputeId: string, adminUserId: string, data: {
    resolution_type: DisputeResolution;
    refund_amount?: number;
    resolution_notes: string;
  }) {
    const dispute = queryHelpers.getOne<Dispute>('SELECT * FROM disputes WHERE id = ?', [disputeId]);
    if (!dispute) throw new Error('Dispute not found');

    return queryHelpers.transaction(() => {
      const now = new Date().toISOString();

      queryHelpers.execute(
        `UPDATE disputes SET
          status = 'RESOLVED',
          resolution_type = ?,
          refund_amount = ?,
          resolution_notes = ?,
          resolved_by = ?,
          resolved_at = ?,
          updated_at = ?
         WHERE id = ?`,
        [
          data.resolution_type,
          data.refund_amount || 0,
          data.resolution_notes,
          adminUserId,
          now,
          now,
          disputeId
        ]
      );

      // Adjust order & settlement based on resolution
      if (['FULL_REFUND', 'PARTIAL_REFUND'].includes(data.resolution_type)) {
        OrderService.updateOrderStatus(dispute.order_id, 'REFUNDED');
      } else {
        OrderService.updateOrderStatus(dispute.order_id, 'COMPLETED');
        // Release held settlement if resolved in farmer's favor
        queryHelpers.execute(
          `UPDATE settlements SET status = 'ELIGIBLE', held_reason = NULL, eligible_at = ?, updated_at = ?
           WHERE order_id = ? AND status = 'HELD'`,
          [now, now, dispute.order_id]
        );
      }

      return this.getDisputeById(disputeId);
    });
  }
}
