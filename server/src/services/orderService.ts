import { queryHelpers, generateUUID, safeJsonParse, safeJsonStringify } from '../db';
import { CartItem, Order, OrderItem, OrderStatus, Product } from '../types';
import { LogisticsService } from './logisticsService';
import { config } from '../config';

export class OrderService {
  // --- Cart Subsystem ---
  static getCart(userId: string) {
    const items = queryHelpers.getAll<any>(
      `SELECT ci.*, p.name as product_name, p.slug as product_slug, p.price, p.unit, p.images,
              p.inventory, p.packaging_fee, p.is_perishable, p.cold_chain_required,
              p.farm_id, f.farm_name, f.state as farm_state, f.lga as farm_lga, f.status as farm_status
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       JOIN farms f ON p.farm_id = f.id
       WHERE ci.user_id = ?
       ORDER BY ci.created_at DESC`,
      [userId]
    );

    return items.map(item => ({
      ...item,
      images: safeJsonParse(item.images, []),
      is_perishable: Boolean(item.is_perishable),
      cold_chain_required: Boolean(item.cold_chain_required)
    }));
  }

  static addToCart(userId: string, productId: string, quantity: number) {
    const product = queryHelpers.getOne<Product>('SELECT * FROM products WHERE id = ?', [productId]);
    if (!product) throw new Error('Product not found');
    if (product.status !== 'ACTIVE') throw new Error('This product is currently unavailable');
    if (quantity > product.inventory) {
      throw new Error(`Only ${product.inventory} units available in stock`);
    }

    const existing = queryHelpers.getOne<CartItem>(
      'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    const now = new Date().toISOString();
    if (existing) {
      const newQty = existing.quantity + quantity;
      if (newQty > product.inventory) {
        throw new Error(`Cannot add more than ${product.inventory} units to cart`);
      }
      queryHelpers.execute(
        'UPDATE cart_items SET quantity = ?, updated_at = ? WHERE id = ?',
        [newQty, now, existing.id]
      );
    } else {
      queryHelpers.execute(
        'INSERT INTO cart_items (id, user_id, product_id, quantity, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        [generateUUID(), userId, productId, quantity, now, now]
      );
    }

    return this.getCart(userId);
  }

  static updateCartItem(userId: string, itemId: string, quantity: number) {
    if (quantity <= 0) {
      return this.removeCartItem(userId, itemId);
    }

    const item = queryHelpers.getOne<any>(
      `SELECT ci.*, p.inventory FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.id = ? AND ci.user_id = ?`,
      [itemId, userId]
    );
    if (!item) throw new Error('Cart item not found');
    if (quantity > item.inventory) throw new Error(`Only ${item.inventory} units available`);

    const now = new Date().toISOString();
    queryHelpers.execute('UPDATE cart_items SET quantity = ?, updated_at = ? WHERE id = ?', [quantity, now, itemId]);
    return this.getCart(userId);
  }

  static removeCartItem(userId: string, itemId: string) {
    queryHelpers.execute('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [itemId, userId]);
    return this.getCart(userId);
  }

  static clearCart(userId: string) {
    queryHelpers.execute('DELETE FROM cart_items WHERE user_id = ?', [userId]);
  }

  // --- Order Calculation & Splitting Engine ---
  static calculateCheckoutSummary(cartItems: any[], deliveryState: string) {
    // Group by farm
    const farmGroups: Record<string, {
      farm_id: string;
      farm_name: string;
      farm_state: string;
      items: any[];
      subtotal: number;
      packaging_fee: number;
      logistics_fee: number;
      platform_fee: number;
      total: number;
      estimated_transit_days: number;
    }> = {};

    for (const item of cartItems) {
      if (!farmGroups[item.farm_id]) {
        farmGroups[item.farm_id] = {
          farm_id: item.farm_id,
          farm_name: item.farm_name,
          farm_state: item.farm_state,
          items: [],
          subtotal: 0,
          packaging_fee: 0,
          logistics_fee: 0,
          platform_fee: 0,
          total: 0,
          estimated_transit_days: 1
        };
      }

      farmGroups[item.farm_id].items.push(item);
      farmGroups[item.farm_id].subtotal += item.price * item.quantity;
      farmGroups[item.farm_id].packaging_fee += (item.packaging_fee || 0) * item.quantity;
    }

    let overallTotal = 0;
    const ordersSummary = Object.values(farmGroups).map(group => {
      // Approximate weight: 1.5kg per item if not specified
      const estimatedWeight = group.items.reduce((sum, it) => sum + (it.quantity * 1.5), 0);
      const requiresColdChain = group.items.some(it => it.cold_chain_required);

      const rate = LogisticsService.calculateShippingRate({
        origin_state: group.farm_state,
        destination_state: deliveryState,
        total_weight_kg: estimatedWeight,
        requires_cold_chain: requiresColdChain
      });

      const subtotalWithPkg = group.subtotal + group.packaging_fee;
      const platform_fee = Math.round(subtotalWithPkg * config.platformDefaults.platformFeePercentage);
      const total = subtotalWithPkg + rate.total_logistics_fee + platform_fee;

      group.logistics_fee = rate.total_logistics_fee;
      group.platform_fee = platform_fee;
      group.total = total;
      group.estimated_transit_days = rate.estimated_transit_days;

      overallTotal += total;
      return group;
    });

    return {
      ordersSummary,
      overallTotal,
      farmerCount: ordersSummary.length
    };
  }

  // --- Create Orders (Supports Multi-Farmer Cart Splitting) ---
  static createOrdersFromCart(userId: string, data: {
    delivery_address: {
      full_name: string;
      phone: string;
      street_address: string;
      state: string;
      lga: string;
      delivery_instructions?: string;
    };
    delivery_instructions?: string;
  }): { orders: Order[]; totalAmount: number } {
    const cartItems = this.getCart(userId);
    if (!cartItems.length) {
      throw new Error('Your shopping cart is empty');
    }

    return queryHelpers.transaction(() => {
      const summary = this.calculateCheckoutSummary(cartItems, data.delivery_address.state);
      const createdOrders: Order[] = [];
      const now = new Date().toISOString();

      for (const group of summary.ordersSummary) {
        const orderId = generateUUID();
        const randomNum = Math.floor(100000 + Math.random() * 900000);
        const orderNumber = `AGD-${new Date().getFullYear()}-${randomNum}`;
        const farm = queryHelpers.getOne<any>('SELECT farmer_id FROM farms WHERE id = ?', [group.farm_id]);
        if (!farm) throw new Error('Farm not found for order item');

        // Insert Order Record
        queryHelpers.execute(
          `INSERT INTO orders (
            id, order_number, customer_id, farm_id, farmer_id, subtotal, packaging_fee,
            logistics_fee, platform_fee, discount, total_amount, status, delivery_address,
            delivery_instructions, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 'PENDING_PAYMENT', ?, ?, ?, ?)`,
          [
            orderId,
            orderNumber,
            userId,
            group.farm_id,
            farm.farmer_id,
            group.subtotal,
            group.packaging_fee,
            group.logistics_fee,
            group.platform_fee,
            group.total,
            safeJsonStringify(data.delivery_address),
            data.delivery_instructions || null,
            now,
            now
          ]
        );

        // Insert Order Items and Reserve Inventory
        for (const item of group.items) {
          const orderItemId = generateUUID();
          const itemTotal = item.price * item.quantity;

          // Double check inventory
          const currentProd = queryHelpers.getOne<Product>('SELECT inventory, attributes FROM products WHERE id = ?', [item.product_id]);
          if (!currentProd || currentProd.inventory < item.quantity) {
            throw new Error(`Insufficient inventory for product: ${item.product_name}`);
          }

          // Atomically reserve inventory
          queryHelpers.execute('UPDATE products SET inventory = inventory - ? WHERE id = ?', [item.quantity, item.product_id]);
          queryHelpers.execute(
            `INSERT INTO inventory_movements (id, product_id, change_amount, reason, reference_id, created_at)
             VALUES (?, ?, ?, 'ORDER_RESERVED', ?, ?)`,
            [generateUUID(), item.product_id, -item.quantity, orderId, now]
          );

          queryHelpers.execute(
            `INSERT INTO order_items (id, order_id, product_id, product_name, unit, price, quantity, total_price, product_attributes, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              orderItemId,
              orderId,
              item.product_id,
              item.product_name,
              item.unit,
              item.price,
              item.quantity,
              itemTotal,
              safeJsonStringify(currentProd.attributes || {}),
              now
            ]
          );
        }

        // Create Shipment Skeleton
        const shipmentId = generateUUID();
        const trackingNum = `TRK-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
        queryHelpers.execute(
          `INSERT INTO shipments (
            id, order_id, tracking_number, origin_state, destination_state, status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, 'PENDING_ASSIGNMENT', ?, ?)`,
          [shipmentId, orderId, trackingNum, group.farm_state, data.delivery_address.state, now, now]
        );

        // Create Settlement Skeleton
        const settlementId = generateUUID();
        const farmerNetAmount = group.subtotal + group.packaging_fee; // Farmer gets product subtotal + packaging
        queryHelpers.execute(
          `INSERT INTO settlements (
            id, order_id, farm_id, farmer_id, product_amount, packaging_amount,
            logistics_amount, platform_fee_amount, farmer_net_amount, status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)`,
          [
            settlementId,
            orderId,
            group.farm_id,
            farm.farmer_id,
            group.subtotal,
            group.packaging_fee,
            group.logistics_fee,
            group.platform_fee,
            farmerNetAmount,
            now,
            now
          ]
        );

        const created = this.getOrderById(orderId)!;
        createdOrders.push(created);
      }

      // Clear customer's cart
      this.clearCart(userId);

      return {
        orders: createdOrders,
        totalAmount: summary.overallTotal
      };
    });
  }

  static getOrderById(orderId: string): Order | undefined {
    const raw = queryHelpers.getOne<any>(
      `SELECT o.*, f.farm_name, f.state as farm_state,
              u.full_name as customer_name, u.email as customer_email, u.phone as customer_phone,
              fu.full_name as farmer_name
       FROM orders o
       JOIN farms f ON o.farm_id = f.id
       JOIN users u ON o.customer_id = u.id
       JOIN users fu ON o.farmer_id = fu.id
       WHERE o.id = ?`,
      [orderId]
    );

    if (!raw) return undefined;

    const items = queryHelpers.getAll<OrderItem>(
      'SELECT * FROM order_items WHERE order_id = ?',
      [orderId]
    ).map(i => ({ ...i, product_attributes: safeJsonParse(i.product_attributes, {}) }));

    const shipment = LogisticsService.getShipmentByOrderId(orderId);
    const settlement = queryHelpers.getOne<any>('SELECT * FROM settlements WHERE order_id = ?', [orderId]);
    const payment = queryHelpers.getOne<any>('SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC LIMIT 1', [orderId]);

    return {
      ...raw,
      delivery_address: safeJsonParse(raw.delivery_address, {}),
      items,
      shipment,
      settlement,
      payment: payment ? { ...payment, metadata: safeJsonParse(payment.metadata, {}) } : undefined
    };
  }

  static listOrders(filters: { customer_id?: string; farmer_id?: string; farm_id?: string; status?: OrderStatus }) {
    let sql = `
      SELECT o.*, f.farm_name, f.state as farm_state,
             u.full_name as customer_name, u.email as customer_email, u.phone as customer_phone,
             fu.full_name as farmer_name,
             (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count
      FROM orders o
      JOIN farms f ON o.farm_id = f.id
      JOIN users u ON o.customer_id = u.id
      JOIN users fu ON o.farmer_id = fu.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters.customer_id) {
      sql += ' AND o.customer_id = ?';
      params.push(filters.customer_id);
    }

    if (filters.farmer_id) {
      sql += ' AND o.farmer_id = ?';
      params.push(filters.farmer_id);
    }

    if (filters.farm_id) {
      sql += ' AND o.farm_id = ?';
      params.push(filters.farm_id);
    }

    if (filters.status) {
      sql += ' AND o.status = ?';
      params.push(filters.status);
    }

    sql += ' ORDER BY o.created_at DESC';

    const rows = queryHelpers.getAll<any>(sql, params);
    return rows.map(r => ({
      ...r,
      delivery_address: safeJsonParse(r.delivery_address, {})
    }));
  }

  // --- Strict Order State Machine Transitions ---
  static updateOrderStatus(orderId: string, newStatus: OrderStatus, actorUserId?: string) {
    const order = queryHelpers.getOne<Order>('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (!order) throw new Error('Order not found');

    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      PENDING_PAYMENT: ['PAID', 'CANCELLED'],
      PAID: ['FARMER_CONFIRMED', 'CANCELLED'],
      FARMER_CONFIRMED: ['PREPARING', 'CANCELLED'],
      PREPARING: ['READY_FOR_PICKUP', 'CANCELLED'],
      READY_FOR_PICKUP: ['LOGISTICS_ASSIGNED', 'PICKED_UP', 'CANCELLED'],
      LOGISTICS_ASSIGNED: ['PICKED_UP', 'CANCELLED'],
      PICKED_UP: ['IN_TRANSIT'],
      IN_TRANSIT: ['OUT_FOR_DELIVERY'],
      OUT_FOR_DELIVERY: ['DELIVERED'],
      DELIVERED: ['COMPLETED', 'DISPUTED'],
      COMPLETED: ['DISPUTED'],
      CANCELLED: [],
      DISPUTED: ['REFUNDED', 'COMPLETED'],
      REFUNDED: []
    };

    const allowed = validTransitions[order.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new Error(`Cannot transition order from '${order.status}' to '${newStatus}'`);
    }

    return queryHelpers.transaction(() => {
      const now = new Date().toISOString();
      queryHelpers.execute('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?', [newStatus, now, orderId]);

      // If CANCELLED, return reserved inventory
      if (newStatus === 'CANCELLED') {
        const items = queryHelpers.getAll<OrderItem>('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
        for (const it of items) {
          queryHelpers.execute('UPDATE products SET inventory = inventory + ? WHERE id = ?', [it.quantity, it.product_id]);
          queryHelpers.execute(
            `INSERT INTO inventory_movements (id, product_id, change_amount, reason, reference_id, created_at)
             VALUES (?, ?, ?, 'ORDER_CANCELLED', ?, ?)`,
            [generateUUID(), it.product_id, it.quantity, orderId, now]
          );
        }
      }

      // If COMPLETED, increment farm completed_orders count
      if (newStatus === 'COMPLETED') {
        queryHelpers.execute('UPDATE farms SET completed_orders = completed_orders + 1 WHERE id = ?', [order.farm_id]);
      }

      return this.getOrderById(orderId);
    });
  }
}
