import { Router, Response } from 'express';
import { OrderService } from '../services/orderService';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get Cart Items
router.get('/', authenticate, (req: AuthRequest, res: Response, next) => {
  try {
    const items = OrderService.getCart(req.user!.id);
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
});

// Add Item to Cart
router.post('/items', authenticate, (req: AuthRequest, res: Response, next) => {
  try {
    const { product_id, quantity } = req.body;
    if (!product_id || !quantity) {
      return res.status(400).json({ success: false, message: 'Product ID and quantity are required' });
    }
    const cart = OrderService.addToCart(req.user!.id, product_id, Number(quantity));
    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
});

// Update Item Quantity
router.put('/items/:id', authenticate, (req: AuthRequest, res: Response, next) => {
  try {
    const { quantity } = req.body;
    const cart = OrderService.updateCartItem(req.user!.id, String(req.params.id), Number(quantity));
    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
});

// Remove Item from Cart
router.delete('/items/:id', authenticate, (req: AuthRequest, res: Response, next) => {
  try {
    const cart = OrderService.removeCartItem(req.user!.id, String(req.params.id));
    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
});

// Clear Cart
router.delete('/', authenticate, (req: AuthRequest, res: Response, next) => {
  try {
    OrderService.clearCart(req.user!.id);
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    next(err);
  }
});

// Checkout Summary Preview (before order submission)
router.post('/preview-summary', authenticate, (req: AuthRequest, res: Response, next) => {
  try {
    const { delivery_state } = req.body;
    if (!delivery_state) {
      return res.status(400).json({ success: false, message: 'Delivery state is required for logistics calculation' });
    }
    const cartItems = OrderService.getCart(req.user!.id);
    const summary = OrderService.calculateCheckoutSummary(cartItems, delivery_state);
    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
});

export default router;
