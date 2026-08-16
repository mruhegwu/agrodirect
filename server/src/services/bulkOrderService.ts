import { queryHelpers, generateUUID, safeJsonParse, safeJsonStringify } from '../db';
import { BulkOrderOffer, BulkOrderRequest } from '../types';

export class BulkOrderService {
  static createRequest(buyerId: string, data: {
    category_id: string;
    product_name: string;
    required_quantity: number;
    unit: string;
    target_price_per_unit?: number;
    delivery_state: string;
    delivery_lga: string;
    delivery_date: string;
    specifications: Record<string, any>;
  }) {
    const id = generateUUID();
    const now = new Date().toISOString();

    queryHelpers.execute(
      `INSERT INTO bulk_order_requests (
        id, buyer_id, category_id, product_name, required_quantity, unit,
        target_price_per_unit, delivery_state, delivery_lga, delivery_date,
        specifications, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'OPEN', ?)`,
      [
        id,
        buyerId,
        data.category_id,
        data.product_name,
        data.required_quantity,
        data.unit,
        data.target_price_per_unit || null,
        data.delivery_state,
        data.delivery_lga,
        data.delivery_date,
        safeJsonStringify(data.specifications || {}),
        now
      ]
    );

    return this.getRequestById(id);
  }

  static getRequestById(id: string): BulkOrderRequest | undefined {
    const raw = queryHelpers.getOne<any>(
      `SELECT r.*, u.full_name as buyer_name, c.name as category_name
       FROM bulk_order_requests r
       JOIN users u ON r.buyer_id = u.id
       JOIN categories c ON r.category_id = c.id
       WHERE r.id = ?`,
      [id]
    );

    if (!raw) return undefined;

    const offers = queryHelpers.getAll<any>(
      `SELECT o.*, u.full_name as farmer_name, f.farm_name
       FROM bulk_order_offers o
       JOIN users u ON o.farmer_id = u.id
       JOIN farms f ON f.farmer_id = u.id
       WHERE o.request_id = ?
       ORDER BY o.created_at DESC`,
      [id]
    );

    return {
      ...raw,
      specifications: safeJsonParse(raw.specifications, {}),
      offers
    };
  }

  static listRequests(filters: { buyer_id?: string; category_id?: string; status?: string } = {}) {
    let sql = `
      SELECT r.*, u.full_name as buyer_name, c.name as category_name,
             (SELECT COUNT(*) FROM bulk_order_offers o WHERE o.request_id = r.id) as offer_count
      FROM bulk_order_requests r
      JOIN users u ON r.buyer_id = u.id
      JOIN categories c ON r.category_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters.buyer_id) {
      sql += ' AND r.buyer_id = ?';
      params.push(filters.buyer_id);
    }

    if (filters.category_id) {
      sql += ' AND r.category_id = ?';
      params.push(filters.category_id);
    }

    if (filters.status) {
      sql += ' AND r.status = ?';
      params.push(filters.status);
    }

    sql += ' ORDER BY r.created_at DESC';

    const rows = queryHelpers.getAll<any>(sql, params);
    return rows.map(r => ({
      ...r,
      specifications: safeJsonParse(r.specifications, {})
    }));
  }

  static submitOffer(farmerId: string, data: {
    request_id: string;
    offered_price_per_unit: number;
    available_date: string;
    note?: string;
  }) {
    const req = queryHelpers.getOne<BulkOrderRequest>('SELECT * FROM bulk_order_requests WHERE id = ?', [data.request_id]);
    if (!req) throw new Error('Bulk order request not found');

    const total_amount = data.offered_price_per_unit * req.required_quantity;
    const id = generateUUID();
    const now = new Date().toISOString();

    queryHelpers.execute(
      `INSERT INTO bulk_order_offers (
        id, request_id, farmer_id, offered_price_per_unit, total_amount, available_date, note, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)`,
      [id, data.request_id, farmerId, data.offered_price_per_unit, total_amount, data.available_date, data.note || null, now]
    );

    // Update request status to RESPONDED
    queryHelpers.execute("UPDATE bulk_order_requests SET status = 'RESPONDED' WHERE id = ?", [data.request_id]);

    return queryHelpers.getOne<BulkOrderOffer>('SELECT * FROM bulk_order_offers WHERE id = ?', [id]);
  }
}
