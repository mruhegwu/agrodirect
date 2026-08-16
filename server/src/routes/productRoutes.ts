import { Router, Response } from 'express';
import { ProductService } from '../services/productService';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// Public: List products with rich search and filters
router.get('/', (req, res, next) => {
  try {
    const {
      category,
      farm_id,
      state,
      lga,
      min_price,
      max_price,
      is_perishable,
      cold_chain_required,
      search,
      sort,
      limit,
      offset
    } = req.query;

    const products = ProductService.listProducts({
      category: category as string,
      farm_id: farm_id as string,
      state: state as string,
      lga: lga as string,
      min_price: min_price ? Number(min_price) : undefined,
      max_price: max_price ? Number(max_price) : undefined,
      is_perishable: is_perishable !== undefined ? is_perishable === 'true' : undefined,
      cold_chain_required: cold_chain_required !== undefined ? cold_chain_required === 'true' : undefined,
      search: search as string,
      sort: sort as any,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined
    });

    res.json({ success: true, data: products, count: products.length });
  } catch (err) {
    next(err);
  }
});

// Public: Get product by slug
router.get('/slug/:slug', (req, res, next) => {
  try {
    const product = ProductService.getProductBySlug(String(req.params.slug));
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

// Public: Get product by ID
router.get('/:id', (req, res, next) => {
  try {
    const product = ProductService.getProductById(String(req.params.id));
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

// Farmer: Create product
router.post('/', authenticate, requireRole('FARMER', 'FARMER_STAFF'), (req: AuthRequest, res: Response, next) => {
  try {
    const product = ProductService.createProduct(req.user!.id, req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

// Farmer: Update product
router.put('/:id', authenticate, requireRole('FARMER', 'FARMER_STAFF'), (req: AuthRequest, res: Response, next) => {
  try {
    const product = ProductService.updateProduct(String(req.params.id), req.user!.id, req.body);
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

// Farmer: Inventory movement history
router.get('/:id/inventory-history', authenticate, requireRole('FARMER', 'FARMER_STAFF', 'ADMIN', 'SUPER_ADMIN'), (req, res, next) => {
  try {
    const history = ProductService.getInventoryHistory(String(req.params.id));
    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
});

export default router;
