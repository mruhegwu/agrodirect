import { queryHelpers, generateUUID, safeJsonParse, safeJsonStringify } from '../db';
import { Order, Review } from '../types';

export class ReviewService {
  static createReview(customerId: string, data: {
    order_id: string;
    product_id?: string;
    rating: number;
    farmer_rating?: number;
    logistics_rating?: number;
    comment: string;
    photos?: string[];
  }) {
    const order = queryHelpers.getOne<Order>('SELECT * FROM orders WHERE id = ?', [data.order_id]);
    if (!order) throw new Error('Order not found');
    if (order.customer_id !== customerId) throw new Error('Unauthorized to review this order');

    // Rule: Order must be delivered or completed
    if (!['DELIVERED', 'COMPLETED'].includes(order.status)) {
      throw new Error('You can only review an order after it has been delivered');
    }

    const existing = queryHelpers.getOne<Review>(
      'SELECT id FROM reviews WHERE order_id = ? AND customer_id = ? AND (product_id = ? OR product_id IS NULL)',
      [data.order_id, customerId, data.product_id || null]
    );
    if (existing) {
      throw new Error('You have already submitted a review for this purchase');
    }

    return queryHelpers.transaction(() => {
      const reviewId = generateUUID();
      const now = new Date().toISOString();

      queryHelpers.execute(
        `INSERT INTO reviews (
          id, order_id, customer_id, farm_id, product_id, rating, farmer_rating, logistics_rating, comment, photos, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          reviewId,
          data.order_id,
          customerId,
          order.farm_id,
          data.product_id || null,
          data.rating,
          data.farmer_rating || data.rating,
          data.logistics_rating || data.rating,
          data.comment,
          safeJsonStringify(data.photos || []),
          now
        ]
      );

      // Recalculate Farm average rating
      const ratingStats = queryHelpers.getOne<any>(
        'SELECT AVG(farmer_rating) as avg_rating, COUNT(*) as count FROM reviews WHERE farm_id = ?',
        [order.farm_id]
      );

      if (ratingStats) {
        const rounded = Math.round((ratingStats.avg_rating || 5) * 10) / 10;
        queryHelpers.execute(
          'UPDATE farms SET rating = ?, total_reviews = ? WHERE id = ?',
          [rounded, ratingStats.count, order.farm_id]
        );
      }

      // Mark order COMPLETED if DELIVERED
      if (order.status === 'DELIVERED') {
        queryHelpers.execute("UPDATE orders SET status = 'COMPLETED' WHERE id = ?", [order.id]);
      }

      return queryHelpers.getOne<Review>('SELECT * FROM reviews WHERE id = ?', [reviewId]);
    });
  }

  static listFarmReviews(farmId: string) {
    const reviews = queryHelpers.getAll<any>(
      `SELECT r.*, u.full_name as customer_name, p.name as product_name
       FROM reviews r
       JOIN users u ON r.customer_id = u.id
       LEFT JOIN products p ON r.product_id = p.id
       WHERE r.farm_id = ?
       ORDER BY r.created_at DESC`,
      [farmId]
    );

    return reviews.map(r => ({
      ...r,
      photos: safeJsonParse(r.photos, [])
    }));
  }

  static listProductReviews(productId: string) {
    const reviews = queryHelpers.getAll<any>(
      `SELECT r.*, u.full_name as customer_name
       FROM reviews r
       JOIN users u ON r.customer_id = u.id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC`,
      [productId]
    );

    return reviews.map(r => ({
      ...r,
      photos: safeJsonParse(r.photos, [])
    }));
  }
}
