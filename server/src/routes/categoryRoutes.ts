import { Router } from 'express';
import { queryHelpers } from '../db';
import { Category } from '../types';

const router = Router();

// List all active categories
router.get('/', (req, res, next) => {
  try {
    const categories = queryHelpers.getAll<any>(
      `SELECT c.*,
        (SELECT COUNT(*) FROM products p JOIN farms f ON p.farm_id = f.id WHERE p.category_id = c.id AND p.status = 'ACTIVE' AND f.status = 'VERIFIED') as product_count
       FROM categories c
       WHERE c.is_active = 1
       ORDER BY c.sort_order ASC, c.name ASC`
    );

    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
});

// Get category by slug
router.get('/:slug', (req, res, next) => {
  try {
    const category = queryHelpers.getOne<Category>(
      'SELECT * FROM categories WHERE slug = ? AND is_active = 1',
      [req.params.slug]
    );
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
});

export default router;
