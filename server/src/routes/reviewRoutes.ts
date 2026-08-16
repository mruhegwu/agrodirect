import { Router, Response } from 'express';
import { ReviewService } from '../services/reviewService';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Customer: Submit Review (Verified Purchase only)
router.post('/', authenticate, (req: AuthRequest, res: Response, next) => {
  try {
    const { order_id, product_id, rating, farmer_rating, logistics_rating, comment, photos } = req.body;
    if (!order_id || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Order ID, rating (1-5), and comment are required' });
    }

    const review = ReviewService.createReview(req.user!.id, {
      order_id,
      product_id,
      rating: Number(rating),
      farmer_rating: farmer_rating ? Number(farmer_rating) : undefined,
      logistics_rating: logistics_rating ? Number(logistics_rating) : undefined,
      comment,
      photos
    });

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
});

// Public: Get Farm Reviews
router.get('/farm/:farmId', (req, res, next) => {
  try {
    const reviews = ReviewService.listFarmReviews(req.params.farmId);
    res.json({ success: true, data: reviews });
  } catch (err) {
    next(err);
  }
});

// Public: Get Product Reviews
router.get('/product/:productId', (req, res, next) => {
  try {
    const reviews = ReviewService.listProductReviews(req.params.productId);
    res.json({ success: true, data: reviews });
  } catch (err) {
    next(err);
  }
});

export default router;
