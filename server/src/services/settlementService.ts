import { queryHelpers, generateUUID } from '../db';
import { Settlement, SettlementStatus } from '../types';
import { WalletService } from './walletService';

export class SettlementService {
  static getSettlementByOrderId(orderId: string): Settlement | undefined {
    return queryHelpers.getOne<Settlement>('SELECT * FROM settlements WHERE order_id = ?', [orderId]);
  }

  static listSettlements(status?: SettlementStatus) {
    let sql = `
      SELECT s.*, o.order_number, f.farm_name, u.full_name as farmer_name
      FROM settlements s
      JOIN orders o ON s.order_id = o.id
      JOIN farms f ON s.farm_id = f.id
      JOIN users u ON s.farmer_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      sql += ' AND s.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY s.created_at DESC';
    return queryHelpers.getAll<any>(sql, params);
  }

  // Release settlement to farmer's available wallet balance
  static releaseSettlement(settlementId: string, actorUserId: string) {
    const settlement = queryHelpers.getOne<Settlement>('SELECT * FROM settlements WHERE id = ?', [settlementId]);
    if (!settlement) throw new Error('Settlement not found');

    if (settlement.status !== 'ELIGIBLE') {
      throw new Error(`Settlement cannot be released in status '${settlement.status}'. It must be ELIGIBLE.`);
    }

    return queryHelpers.transaction(() => {
      const now = new Date().toISOString();

      // Credit Farmer Wallet
      WalletService.creditWallet({
        userId: settlement.farmer_id,
        amount: settlement.farmer_net_amount,
        type: 'SETTLEMENT',
        reference_type: 'ORDER',
        reference_id: settlement.order_id,
        description: `Order settlement payment for #${settlement.order_id.slice(0, 8)} (Subtotal + Packaging)`
      });

      // Update settlement status
      queryHelpers.execute(
        `UPDATE settlements SET status = 'PAID', paid_at = ?, updated_at = ? WHERE id = ?`,
        [now, now, settlementId]
      );

      // Create Notification
      queryHelpers.execute(
        `INSERT INTO notifications (id, user_id, title, message, type, link, is_read, created_at)
         VALUES (?, ?, 'Settlement Payout Released', ?, 'PAYMENT', '/farmer/earnings', 0, ?)`,
        [
          generateUUID(),
          settlement.farmer_id,
          `₦${settlement.farmer_net_amount.toLocaleString()} from your completed order has been credited to your available balance.`,
          now
        ]
      );

      return queryHelpers.getOne<Settlement>('SELECT * FROM settlements WHERE id = ?', [settlementId]);
    });
  }

  // Hold settlement (triggered by customer dispute)
  static holdSettlement(orderId: string, reason: string) {
    const now = new Date().toISOString();
    queryHelpers.execute(
      `UPDATE settlements SET status = 'HELD', held_reason = ?, updated_at = ? WHERE order_id = ?`,
      [reason, now, orderId]
    );
  }
}
