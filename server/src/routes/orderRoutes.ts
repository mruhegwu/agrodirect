import { Router, Response } from 'express';
import { OrderService } from '../services/orderService';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// Customer: Create order(s) from cart
router.post('/checkout', authenticate, (req: AuthRequest, res: Response, next) => {
  try {
    const { delivery_address, delivery_instructions } = req.body;
    if (!delivery_address || !delivery_address.state || !delivery_address.street_address) {
      return res.status(400).json({ success: false, message: 'Valid delivery address is required' });
    }

    const result = OrderService.createOrdersFromCart(req.user!.id, {
      delivery_address,
      delivery_instructions
    });

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// Customer: List My Orders
router.get('/my-orders', authenticate, (req: AuthRequest, res: Response, next) => {
  try {
    const { status } = req.query;
    const orders = OrderService.listOrders({
      customer_id: req.user!.id,
      status: status as any
    });
    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
});

// Farmer: List Incoming Farm Orders
router.get('/farmer-orders', authenticate, requireRole('FARMER', 'FARMER_STAFF'), (req: AuthRequest, res: Response, next) => {
  try {
    const { status } = req.query;
    const orders = OrderService.listOrders({
      farmer_id: req.user!.id,
      status: status as any
    });
    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
});

// Admin: List All Orders
router.get('/admin-orders', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), (req: AuthRequest, res: Response, next) => {
  try {
    const { status } = req.query;
    const orders = OrderService.listOrders({
      status: status as any
    });
    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
});

// Get Single Order Detail
router.get('/:id', authenticate, (req: AuthRequest, res: Response, next) => {
  try {
    const order = OrderService.getOrderById(String(req.params.id));
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Authorization check
    if (
      req.user!.role === 'CUSTOMER' && order.customer_id !== req.user!.id
    ) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (
      ['FARMER', 'FARMER_STAFF'].includes(req.user!.role) && order.farmer_id !== req.user!.id
    ) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
});

// State Machine Status Update
router.patch('/:id/status', authenticate, (req: AuthRequest, res: Response, next) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, message: 'New status is required' });

    const order = OrderService.getOrderById(String(req.params.id));
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Farmer permissions check
    if (['FARMER', 'FARMER_STAFF'].includes(req.user!.role)) {
      if (order.farmer_id !== req.user!.id) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }
      if (!['FARMER_CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP'].includes(status)) {
        return res.status(403).json({ success: false, message: 'Farmer cannot transition order to this state' });
      }
    }

    // Customer permissions check (e.g. delivery confirmation)
    if (req.user!.role === 'CUSTOMER') {
      if (order.customer_id !== req.user!.id) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }
      if (!['COMPLETED', 'CANCELLED'].includes(status)) {
        return res.status(403).json({ success: false, message: 'Customer cannot transition order to this state' });
      }
    }

    const updated = OrderService.updateOrderStatus(String(req.params.id), status, req.user!.id);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
