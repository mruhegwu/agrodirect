import { queryHelpers, generateUUID, safeJsonParse } from '../db';
import { DeliveryStatus, LogisticsProvider, LogisticsRoute, Shipment, Vehicle } from '../types';

export class LogisticsService {
  static getRoute(originState: string, destinationState: string): LogisticsRoute | undefined {
    // Normal case: exact route
    let route = queryHelpers.getOne<LogisticsRoute>(
      'SELECT * FROM logistics_routes WHERE origin_state = ? AND destination_state = ? AND is_active = 1',
      [originState, destinationState]
    );

    // If reverse route exists and is symmetrical
    if (!route) {
      route = queryHelpers.getOne<LogisticsRoute>(
        'SELECT * FROM logistics_routes WHERE origin_state = ? AND destination_state = ? AND is_active = 1',
        [destinationState, originState]
      );
    }

    // Default nationwide inter-state route fallback if not specifically configured
    if (!route) {
      const isInterstate = originState.toLowerCase() !== destinationState.toLowerCase();
      route = {
        id: 'fallback-route',
        origin_state: originState,
        destination_state: destinationState,
        base_price: isInterstate ? 8000 : 2500,
        per_kg_rate: isInterstate ? 350 : 150,
        cold_chain_surcharge: 5000,
        estimated_transit_days: isInterstate ? 2 : 1,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }

    return route;
  }

  static calculateShippingRate(params: {
    origin_state: string;
    destination_state: string;
    total_weight_kg: number;
    requires_cold_chain: boolean;
  }): {
    base_price: number;
    weight_fee: number;
    cold_chain_fee: number;
    total_logistics_fee: number;
    estimated_transit_days: number;
  } {
    const route = this.getRoute(params.origin_state, params.destination_state);
    if (!route) {
      throw new Error(`Logistics route from ${params.origin_state} to ${params.destination_state} is currently unavailable.`);
    }

    const weight_fee = Math.max(0, params.total_weight_kg) * route.per_kg_rate;
    const cold_chain_fee = params.requires_cold_chain ? route.cold_chain_surcharge : 0;
    const total_logistics_fee = route.base_price + weight_fee + cold_chain_fee;

    return {
      base_price: route.base_price,
      weight_fee,
      cold_chain_fee,
      total_logistics_fee,
      estimated_transit_days: route.estimated_transit_days
    };
  }

  static listRoutes() {
    return queryHelpers.getAll<LogisticsRoute>('SELECT * FROM logistics_routes ORDER BY origin_state, destination_state');
  }

  static upsertRoute(data: Omit<LogisticsRoute, 'id' | 'created_at' | 'updated_at'>) {
    const now = new Date().toISOString();
    const existing = queryHelpers.getOne<LogisticsRoute>(
      'SELECT id FROM logistics_routes WHERE origin_state = ? AND destination_state = ?',
      [data.origin_state, data.destination_state]
    );

    if (existing) {
      queryHelpers.execute(
        `UPDATE logistics_routes SET
          base_price = ?, per_kg_rate = ?, cold_chain_surcharge = ?, estimated_transit_days = ?,
          is_active = ?, updated_at = ?
         WHERE id = ?`,
        [data.base_price, data.per_kg_rate, data.cold_chain_surcharge, data.estimated_transit_days, data.is_active ? 1 : 0, now, existing.id]
      );
      return queryHelpers.getOne<LogisticsRoute>('SELECT * FROM logistics_routes WHERE id = ?', [existing.id]);
    } else {
      const id = generateUUID();
      queryHelpers.execute(
        `INSERT INTO logistics_routes (id, origin_state, destination_state, base_price, per_kg_rate, cold_chain_surcharge, estimated_transit_days, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, data.origin_state, data.destination_state, data.base_price, data.per_kg_rate, data.cold_chain_surcharge, data.estimated_transit_days, data.is_active ? 1 : 0, now, now]
      );
      return queryHelpers.getOne<LogisticsRoute>('SELECT * FROM logistics_routes WHERE id = ?', [id]);
    }
  }

  static getShipmentByOrderId(orderId: string): Shipment | undefined {
    const shipment = queryHelpers.getOne<any>(
      `SELECT s.*, lp.company_name as provider_name, lp.phone as provider_phone, v.plate_number as vehicle_plate
       FROM shipments s
       LEFT JOIN logistics_providers lp ON s.provider_id = lp.id
       LEFT JOIN vehicles v ON s.vehicle_id = v.id
       WHERE s.order_id = ?`,
      [orderId]
    );

    if (!shipment) return undefined;

    const events = queryHelpers.getAll<any>(
      'SELECT * FROM delivery_events WHERE shipment_id = ? ORDER BY created_at ASC',
      [shipment.id]
    );

    return {
      ...shipment,
      events
    };
  }

  static getShipmentByTrackingNumber(trackingNumber: string): Shipment | undefined {
    const shipment = queryHelpers.getOne<any>(
      `SELECT s.*, lp.company_name as provider_name, lp.phone as provider_phone, v.plate_number as vehicle_plate
       FROM shipments s
       LEFT JOIN logistics_providers lp ON s.provider_id = lp.id
       LEFT JOIN vehicles v ON s.vehicle_id = v.id
       WHERE s.tracking_number = ?`,
      [trackingNumber]
    );

    if (!shipment) return undefined;

    const events = queryHelpers.getAll<any>(
      'SELECT * FROM delivery_events WHERE shipment_id = ? ORDER BY created_at ASC',
      [shipment.id]
    );

    return {
      ...shipment,
      events
    };
  }

  // Delivery State Machine Transition
  static updateDeliveryStatus(params: {
    shipment_id: string;
    new_status: DeliveryStatus;
    note: string;
    location?: string;
    gps_lat?: number;
    gps_lng?: number;
    proof_image?: string;
    updated_by_user_id?: string;
  }) {
    const shipment = queryHelpers.getOne<Shipment>('SELECT * FROM shipments WHERE id = ?', [params.shipment_id]);
    if (!shipment) throw new Error('Shipment not found');

    const validTransitions: Record<DeliveryStatus, DeliveryStatus[]> = {
      PENDING_ASSIGNMENT: ['ASSIGNED', 'CANCELLED'],
      ASSIGNED: ['ACCEPTED', 'PENDING_ASSIGNMENT', 'CANCELLED'],
      ACCEPTED: ['PICKUP_SCHEDULED', 'CANCELLED'],
      PICKUP_SCHEDULED: ['PICKED_UP', 'CANCELLED'],
      PICKED_UP: ['IN_TRANSIT', 'FAILED'],
      IN_TRANSIT: ['OUT_FOR_DELIVERY', 'FAILED'],
      OUT_FOR_DELIVERY: ['DELIVERED', 'FAILED'],
      DELIVERED: [],
      FAILED: ['OUT_FOR_DELIVERY', 'CANCELLED'],
      CANCELLED: []
    };

    const allowed = validTransitions[shipment.status] || [];
    if (!allowed.includes(params.new_status)) {
      throw new Error(`Invalid delivery state transition from ${shipment.status} to ${params.new_status}`);
    }

    return queryHelpers.transaction(() => {
      const now = new Date().toISOString();

      queryHelpers.execute(
        `UPDATE shipments SET
          status = ?,
          proof_of_delivery_note = COALESCE(?, proof_of_delivery_note),
          proof_of_delivery_image = COALESCE(?, proof_of_delivery_image),
          actual_delivery = CASE WHEN ? = 'DELIVERED' THEN ? ELSE actual_delivery END,
          updated_at = ?
         WHERE id = ?`,
        [
          params.new_status,
          params.note || null,
          params.proof_image || null,
          params.new_status,
          now,
          now,
          params.shipment_id
        ]
      );

      // Record immutable delivery event
      const eventId = generateUUID();
      queryHelpers.execute(
        `INSERT INTO delivery_events (id, shipment_id, status, note, location, gps_lat, gps_lng, proof_image, created_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          eventId,
          params.shipment_id,
          params.new_status,
          params.note,
          params.location || null,
          params.gps_lat || null,
          params.gps_lng || null,
          params.proof_image || null,
          params.updated_by_user_id || 'SYSTEM',
          now
        ]
      );

      // Sync Order Status
      let orderStatus: any = null;
      if (params.new_status === 'PICKED_UP') orderStatus = 'PICKED_UP';
      else if (params.new_status === 'IN_TRANSIT') orderStatus = 'IN_TRANSIT';
      else if (params.new_status === 'OUT_FOR_DELIVERY') orderStatus = 'OUT_FOR_DELIVERY';
      else if (params.new_status === 'DELIVERED') orderStatus = 'DELIVERED';

      if (orderStatus) {
        queryHelpers.execute('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?', [orderStatus, now, shipment.order_id]);

        // If delivered, mark settlement as ELIGIBLE
        if (orderStatus === 'DELIVERED') {
          queryHelpers.execute(
            `UPDATE settlements SET status = 'ELIGIBLE', eligible_at = ?, updated_at = ?
             WHERE order_id = ? AND status = 'PENDING'`,
            [now, now, shipment.order_id]
          );
        }
      }

      return this.getShipmentByOrderId(shipment.order_id);
    });
  }

  static listVehicles(providerId?: string) {
    if (providerId) {
      return queryHelpers.getAll<Vehicle>('SELECT * FROM vehicles WHERE provider_id = ? ORDER BY created_at DESC', [providerId]);
    }
    return queryHelpers.getAll<Vehicle>('SELECT * FROM vehicles ORDER BY created_at DESC');
  }

  static addVehicle(data: Omit<Vehicle, 'id' | 'created_at'>) {
    const id = generateUUID();
    const now = new Date().toISOString();
    queryHelpers.execute(
      `INSERT INTO vehicles (id, provider_id, vehicle_type, plate_number, max_weight_kg, has_refrigeration, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.provider_id, data.vehicle_type, data.plate_number.toUpperCase(), data.max_weight_kg, data.has_refrigeration ? 1 : 0, data.status || 'AVAILABLE', now]
    );
    return queryHelpers.getOne<Vehicle>('SELECT * FROM vehicles WHERE id = ?', [id]);
  }

  static listLogisticsJobs(providerUserId?: string, status?: DeliveryStatus) {
    let sql = `
      SELECT s.*, o.order_number, o.total_amount, o.delivery_address, o.packaging_fee, o.logistics_fee,
             f.farm_name, f.state as origin_farm_state, f.address as farm_address,
             u.full_name as customer_name, u.phone as customer_phone
      FROM shipments s
      JOIN orders o ON s.order_id = o.id
      JOIN farms f ON o.farm_id = f.id
      JOIN users u ON o.customer_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      sql += ' AND s.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY s.created_at DESC';

    const rows = queryHelpers.getAll<any>(sql, params);
    return rows.map(r => ({
      ...r,
      delivery_address: safeJsonParse(r.delivery_address, {})
    }));
  }
}
