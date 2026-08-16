import { queryHelpers, generateUUID, safeJsonParse, safeJsonStringify } from '../db';
import { Farm, FarmerVerification, FarmStatus } from '../types';

export class FarmerService {
  static getFarmByFarmerId(farmerId: string): Farm | undefined {
    const farm = queryHelpers.getOne<any>('SELECT * FROM farms WHERE farmer_id = ?', [farmerId]);
    if (!farm) return undefined;
    return {
      ...farm,
      farm_photos: safeJsonParse(farm.farm_photos, [])
    };
  }

  static getFarmBySlug(slug: string): Farm | undefined {
    const farm = queryHelpers.getOne<any>(
      `SELECT f.*, u.full_name as farmer_name, u.email as farmer_email, u.phone as farmer_phone
       FROM farms f
       JOIN users u ON f.farmer_id = u.id
       WHERE f.slug = ?`,
      [slug]
    );
    if (!farm) return undefined;
    return {
      ...farm,
      farm_photos: safeJsonParse(farm.farm_photos, [])
    };
  }

  static listFarms(filters: { state?: string; status?: FarmStatus; search?: string } = {}) {
    let sql = `
      SELECT f.*, u.full_name as farmer_name, u.phone as farmer_phone,
      (SELECT COUNT(*) FROM products p WHERE p.farm_id = f.id AND p.status = 'ACTIVE') as active_product_count
      FROM farms f
      JOIN users u ON f.farmer_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters.status) {
      sql += ' AND f.status = ?';
      params.push(filters.status);
    } else {
      sql += " AND f.status = 'VERIFIED'";
    }

    if (filters.state) {
      sql += ' AND f.state = ?';
      params.push(filters.state);
    }

    if (filters.search) {
      sql += ' AND (f.farm_name LIKE ? OR f.description LIKE ? OR f.main_products LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    }

    sql += ' ORDER BY f.rating DESC, f.completed_orders DESC';

    const rows = queryHelpers.getAll<any>(sql, params);
    return rows.map(r => ({
      ...r,
      farm_photos: safeJsonParse(r.farm_photos, [])
    }));
  }

  // 5-Step Onboarding and Verification Submission
  static submitOnboarding(farmerId: string, data: {
    // Step 2: Farm Information
    farm_name: string;
    state: string;
    lga: string;
    address: string;
    gps_lat?: number;
    gps_lng?: number;
    farm_size?: string;
    farm_type?: string;
    main_products?: string;
    description: string;
    farm_photos?: string[];
    logo_url?: string;
    
    // Step 3: KYC / Verification
    id_type: string;
    id_number: string;
    id_document_url: string;
    farm_documents: string[];
    cooperative_info?: string;

    // Step 4: Banking
    bank_name: string;
    bank_account_number: string;
    bank_account_name: string;
  }) {
    return queryHelpers.transaction(() => {
      const now = new Date().toISOString();
      const slug = data.farm_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + farmerId.slice(0, 4);

      let existingFarm = queryHelpers.getOne<Farm>('SELECT * FROM farms WHERE farmer_id = ?', [farmerId]);
      let farmId = existingFarm?.id;

      if (!existingFarm) {
        farmId = generateUUID();
        queryHelpers.execute(
          `INSERT INTO farms (id, farmer_id, farm_name, slug, state, lga, address, gps_lat, gps_lng, farm_size, farm_type, main_products, description, farm_photos, logo_url, rating, total_reviews, completed_orders, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 'UNDER_REVIEW', ?, ?)`,
          [
            farmId,
            farmerId,
            data.farm_name,
            slug,
            data.state,
            data.lga,
            data.address,
            data.gps_lat || 0,
            data.gps_lng || 0,
            data.farm_size || 'Medium Scale',
            data.farm_type || 'Mixed Farming',
            data.main_products || 'Poultry, Produce',
            data.description,
            safeJsonStringify(data.farm_photos || []),
            data.logo_url || null,
            now,
            now
          ]
        );
      } else {
        queryHelpers.execute(
          `UPDATE farms SET
            farm_name = ?, state = ?, lga = ?, address = ?, gps_lat = ?, gps_lng = ?,
            farm_size = ?, farm_type = ?, main_products = ?, description = ?,
            farm_photos = ?, logo_url = ?, status = 'UNDER_REVIEW', updated_at = ?
           WHERE id = ?`,
          [
            data.farm_name,
            data.state,
            data.lga,
            data.address,
            data.gps_lat || 0,
            data.gps_lng || 0,
            data.farm_size || 'Medium Scale',
            data.farm_type || 'Mixed Farming',
            data.main_products || 'Poultry, Produce',
            data.description,
            safeJsonStringify(data.farm_photos || []),
            data.logo_url || null,
            now,
            farmId
          ]
        );
      }

      // Upsert verification record
      let existingVerif = queryHelpers.getOne<FarmerVerification>('SELECT * FROM farmer_verifications WHERE farmer_id = ?', [farmerId]);
      if (!existingVerif) {
        const verifId = generateUUID();
        queryHelpers.execute(
          `INSERT INTO farmer_verifications (id, farm_id, farmer_id, id_type, id_number, id_document_url, farm_documents, farm_photos, cooperative_info, bank_name, bank_account_number, bank_account_name, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'UNDER_REVIEW', ?, ?)`,
          [
            verifId,
            farmId,
            farmerId,
            data.id_type,
            data.id_number,
            data.id_document_url,
            safeJsonStringify(data.farm_documents || []),
            safeJsonStringify(data.farm_photos || []),
            data.cooperative_info || null,
            data.bank_name,
            data.bank_account_number,
            data.bank_account_name,
            now,
            now
          ]
        );
      } else {
        queryHelpers.execute(
          `UPDATE farmer_verifications SET
            id_type = ?, id_number = ?, id_document_url = ?, farm_documents = ?, farm_photos = ?,
            cooperative_info = ?, bank_name = ?, bank_account_number = ?, bank_account_name = ?,
            status = 'UNDER_REVIEW', rejection_reason = NULL, updated_at = ?
           WHERE farmer_id = ?`,
          [
            data.id_type,
            data.id_number,
            data.id_document_url,
            safeJsonStringify(data.farm_documents || []),
            safeJsonStringify(data.farm_photos || []),
            data.cooperative_info || null,
            data.bank_name,
            data.bank_account_number,
            data.bank_account_name,
            now,
            farmerId
          ]
        );
      }

      return {
        success: true,
        message: 'Farm information and verification submitted successfully. Our team will review within 24 hours.'
      };
    });
  }

  static getFarmerDashboard(farmerId: string) {
    const farm = queryHelpers.getOne<any>('SELECT * FROM farms WHERE farmer_id = ?', [farmerId]);
    if (!farm) {
      return {
        hasFarm: false,
        status: 'PENDING'
      };
    }

    const verification = queryHelpers.getOne<any>('SELECT * FROM farmer_verifications WHERE farm_id = ?', [farm.id]);
    const wallet = queryHelpers.getOne<any>('SELECT * FROM wallets WHERE user_id = ?', [farmerId]);

    // Metrics
    const productStats = queryHelpers.getOne<any>(
      `SELECT
        COUNT(*) as total_products,
        SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) as active_products,
        SUM(inventory * price) as inventory_value
       FROM products WHERE farm_id = ?`,
      [farm.id]
    );

    const orderStats = queryHelpers.getOne<any>(
      `SELECT
        COUNT(*) as total_orders,
        SUM(CASE WHEN status IN ('PAID', 'FARMER_CONFIRMED', 'PREPARING') THEN 1 ELSE 0 END) as pending_orders,
        SUM(CASE WHEN status = 'COMPLETED' THEN subtotal ELSE 0 END) as total_sales,
        SUM(CASE WHEN status = 'COMPLETED' AND created_at >= datetime('now', 'start of month') THEN subtotal ELSE 0 END) as this_month_sales
       FROM orders WHERE farm_id = ?`,
      [farm.id]
    );

    const recentOrders = queryHelpers.getAll<any>(
      `SELECT o.*, u.full_name as customer_name, u.phone as customer_phone
       FROM orders o
       JOIN users u ON o.customer_id = u.id
       WHERE o.farm_id = ?
       ORDER BY o.created_at DESC LIMIT 5`,
      [farm.id]
    ).map(o => ({ ...o, delivery_address: safeJsonParse(o.delivery_address, {}) }));

    const topProducts = queryHelpers.getAll<any>(
      `SELECT p.*,
        (SELECT COALESCE(SUM(oi.quantity), 0) FROM order_items oi WHERE oi.product_id = p.id) as units_sold
       FROM products p
       WHERE p.farm_id = ?
       ORDER BY units_sold DESC LIMIT 4`,
      [farm.id]
    ).map(p => ({
      ...p,
      images: safeJsonParse(p.images, []),
      attributes: safeJsonParse(p.attributes, {})
    }));

    return {
      hasFarm: true,
      farm: {
        ...farm,
        farm_photos: safeJsonParse(farm.farm_photos, [])
      },
      verification: verification ? {
        ...verification,
        farm_documents: safeJsonParse(verification.farm_documents, []),
        farm_photos: safeJsonParse(verification.farm_photos, [])
      } : null,
      wallet: wallet || { available_balance: 0, pending_balance: 0, total_earnings: 0, total_withdrawals: 0 },
      metrics: {
        totalSales: orderStats?.total_sales || 0,
        thisMonthSales: orderStats?.this_month_sales || 0,
        pendingOrders: orderStats?.pending_orders || 0,
        totalOrders: orderStats?.total_orders || 0,
        availableProducts: productStats?.active_products || 0,
        inventoryValue: productStats?.inventory_value || 0,
        pendingSettlement: wallet?.pending_balance || 0,
        availableBalance: wallet?.available_balance || 0,
        rating: farm.rating || 5.0,
        totalReviews: farm.total_reviews || 0
      },
      recentOrders,
      topProducts
    };
  }
}
