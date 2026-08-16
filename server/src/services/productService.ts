import { queryHelpers, generateUUID, safeJsonParse, safeJsonStringify } from '../db';
import { Product, ProductStatus, ProductUnit } from '../types';

export interface ProductFilterOptions {
  category?: string;
  farm_id?: string;
  state?: string;
  lga?: string;
  min_price?: number;
  max_price?: number;
  is_perishable?: boolean;
  cold_chain_required?: boolean;
  search?: string;
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
  status?: ProductStatus;
  limit?: number;
  offset?: number;
}

export class ProductService {
  static createProduct(farmerId: string, data: {
    category_id: string;
    name: string;
    description: string;
    price: number;
    unit: ProductUnit;
    minimum_quantity?: number;
    maximum_quantity?: number;
    inventory: number;
    availability_date?: string;
    harvest_date?: string;
    packaging_type?: string;
    packaging_fee?: number;
    is_perishable?: boolean;
    cold_chain_required?: boolean;
    images: string[];
    attributes: Record<string, any>;
    status?: ProductStatus;
  }) {
    // 1. Business Rule: Farmer and Farm must be verified
    const farm = queryHelpers.getOne<any>('SELECT * FROM farms WHERE farmer_id = ?', [farmerId]);
    if (!farm) {
      throw new Error('You must complete farm registration before adding products');
    }

    if (farm.status !== 'VERIFIED') {
      throw new Error('Your farm verification is pending approval. Only verified farms can publish products.');
    }

    const id = generateUUID();
    const now = new Date().toISOString();
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + id.slice(0, 6);
    const status: ProductStatus = data.status || 'ACTIVE';

    return queryHelpers.transaction(() => {
      queryHelpers.execute(
        `INSERT INTO products (
          id, farm_id, farmer_id, category_id, name, slug, description, price, currency, unit,
          minimum_quantity, maximum_quantity, inventory, availability_date, harvest_date,
          packaging_type, packaging_fee, is_perishable, cold_chain_required, status, images, attributes,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'NGN', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          farm.id,
          farmerId,
          data.category_id,
          data.name,
          slug,
          data.description,
          data.price,
          data.unit,
          data.minimum_quantity || 1,
          data.maximum_quantity || null,
          data.inventory,
          data.availability_date || null,
          data.harvest_date || null,
          data.packaging_type || 'Standard Agricultural Packaging',
          data.packaging_fee || 0,
          data.is_perishable ? 1 : 0,
          data.cold_chain_required ? 1 : 0,
          status,
          safeJsonStringify(data.images || []),
          safeJsonStringify(data.attributes || {}),
          now,
          now
        ]
      );

      // Record initial inventory movement
      if (data.inventory > 0) {
        queryHelpers.execute(
          `INSERT INTO inventory_movements (id, product_id, change_amount, reason, reference_id, created_at)
           VALUES (?, ?, ?, 'RESTOCK', 'INITIAL_CREATION', ?)`,
          [generateUUID(), id, data.inventory, now]
        );
      }

      return this.getProductById(id);
    });
  }

  static updateProduct(productId: string, farmerId: string, data: Partial<Product>) {
    const existing = queryHelpers.getOne<Product>('SELECT * FROM products WHERE id = ?', [productId]);
    if (!existing) throw new Error('Product not found');
    if (existing.farmer_id !== farmerId) throw new Error('Unauthorized to modify this product');

    const now = new Date().toISOString();

    return queryHelpers.transaction(() => {
      queryHelpers.execute(
        `UPDATE products SET
          category_id = COALESCE(?, category_id),
          name = COALESCE(?, name),
          description = COALESCE(?, description),
          price = COALESCE(?, price),
          unit = COALESCE(?, unit),
          minimum_quantity = COALESCE(?, minimum_quantity),
          maximum_quantity = COALESCE(?, maximum_quantity),
          availability_date = COALESCE(?, availability_date),
          harvest_date = COALESCE(?, harvest_date),
          packaging_type = COALESCE(?, packaging_type),
          packaging_fee = COALESCE(?, packaging_fee),
          is_perishable = COALESCE(?, is_perishable),
          cold_chain_required = COALESCE(?, cold_chain_required),
          status = COALESCE(?, status),
          images = COALESCE(?, images),
          attributes = COALESCE(?, attributes),
          updated_at = ?
         WHERE id = ?`,
        [
          data.category_id || null,
          data.name || null,
          data.description || null,
          data.price !== undefined ? data.price : null,
          data.unit || null,
          data.minimum_quantity !== undefined ? data.minimum_quantity : null,
          data.maximum_quantity !== undefined ? data.maximum_quantity : null,
          data.availability_date || null,
          data.harvest_date || null,
          data.packaging_type || null,
          data.packaging_fee !== undefined ? data.packaging_fee : null,
          data.is_perishable !== undefined ? (data.is_perishable ? 1 : 0) : null,
          data.cold_chain_required !== undefined ? (data.cold_chain_required ? 1 : 0) : null,
          data.status || null,
          data.images ? safeJsonStringify(data.images) : null,
          data.attributes ? safeJsonStringify(data.attributes) : null,
          now,
          productId
        ]
      );

      // Handle explicit inventory adjustment
      if (data.inventory !== undefined && data.inventory !== existing.inventory) {
        const diff = data.inventory - existing.inventory;
        queryHelpers.execute('UPDATE products SET inventory = ? WHERE id = ?', [data.inventory, productId]);
        queryHelpers.execute(
          `INSERT INTO inventory_movements (id, product_id, change_amount, reason, reference_id, created_at)
           VALUES (?, ?, ?, 'MANUAL_ADJUSTMENT', 'FARMER_UPDATE', ?)`,
          [generateUUID(), productId, diff, now]
        );
      }

      return this.getProductById(productId);
    });
  }

  static getProductById(id: string): Product | undefined {
    const raw = queryHelpers.getOne<any>(
      `SELECT p.*, f.farm_name, f.slug as farm_slug, f.state as farm_state, f.lga as farm_lga, f.rating,
              c.name as category_name, u.full_name as farmer_name
       FROM products p
       JOIN farms f ON p.farm_id = f.id
       JOIN categories c ON p.category_id = c.id
       JOIN users u ON p.farmer_id = u.id
       WHERE p.id = ?`,
      [id]
    );

    if (!raw) return undefined;
    return this.formatProduct(raw);
  }

  static getProductBySlug(slug: string): Product | undefined {
    const raw = queryHelpers.getOne<any>(
      `SELECT p.*, f.farm_name, f.slug as farm_slug, f.state as farm_state, f.lga as farm_lga, f.rating,
              c.name as category_name, u.full_name as farmer_name
       FROM products p
       JOIN farms f ON p.farm_id = f.id
       JOIN categories c ON p.category_id = c.id
       JOIN users u ON p.farmer_id = u.id
       WHERE p.slug = ?`,
      [slug]
    );

    if (!raw) return undefined;
    return this.formatProduct(raw);
  }

  static listProducts(options: ProductFilterOptions = {}) {
    let sql = `
      SELECT p.*, f.farm_name, f.slug as farm_slug, f.state as farm_state, f.lga as farm_lga, f.rating,
             c.name as category_name, u.full_name as farmer_name
      FROM products p
      JOIN farms f ON p.farm_id = f.id
      JOIN categories c ON p.category_id = c.id
      JOIN users u ON p.farmer_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (options.status) {
      sql += ' AND p.status = ?';
      params.push(options.status);
    } else {
      sql += " AND p.status = 'ACTIVE' AND f.status = 'VERIFIED'";
    }

    if (options.farm_id) {
      sql += ' AND p.farm_id = ?';
      params.push(options.farm_id);
    }

    if (options.category) {
      sql += ' AND (c.slug = ? OR c.id = ?)';
      params.push(options.category, options.category);
    }

    if (options.state) {
      sql += ' AND f.state = ?';
      params.push(options.state);
    }

    if (options.lga) {
      sql += ' AND f.lga = ?';
      params.push(options.lga);
    }

    if (options.min_price !== undefined) {
      sql += ' AND p.price >= ?';
      params.push(options.min_price);
    }

    if (options.max_price !== undefined) {
      sql += ' AND p.price <= ?';
      params.push(options.max_price);
    }

    if (options.is_perishable !== undefined) {
      sql += ' AND p.is_perishable = ?';
      params.push(options.is_perishable ? 1 : 0);
    }

    if (options.cold_chain_required !== undefined) {
      sql += ' AND p.cold_chain_required = ?';
      params.push(options.cold_chain_required ? 1 : 0);
    }

    if (options.search) {
      sql += ' AND (p.name LIKE ? OR p.description LIKE ? OR f.farm_name LIKE ?)';
      params.push(`%${options.search}%`, `%${options.search}%`, `%${options.search}%`);
    }

    // Sorting
    switch (options.sort) {
      case 'price_asc':
        sql += ' ORDER BY p.price ASC';
        break;
      case 'price_desc':
        sql += ' ORDER BY p.price DESC';
        break;
      case 'rating':
        sql += ' ORDER BY f.rating DESC, p.created_at DESC';
        break;
      case 'newest':
        sql += ' ORDER BY p.created_at DESC';
        break;
      default:
        sql += ' ORDER BY p.created_at DESC';
        break;
    }

    const limit = options.limit || 50;
    const offset = options.offset || 0;
    sql += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const rows = queryHelpers.getAll<any>(sql, params);
    return rows.map(r => this.formatProduct(r));
  }

  static getInventoryHistory(productId: string) {
    return queryHelpers.getAll<any>(
      'SELECT * FROM inventory_movements WHERE product_id = ? ORDER BY created_at DESC',
      [productId]
    );
  }

  private static formatProduct(raw: any): Product {
    return {
      ...raw,
      is_perishable: Boolean(raw.is_perishable),
      cold_chain_required: Boolean(raw.cold_chain_required),
      images: safeJsonParse(raw.images, []),
      attributes: safeJsonParse(raw.attributes, {})
    };
  }
}
