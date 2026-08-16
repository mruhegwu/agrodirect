import { Router, Response } from 'express';
import { PaymentService } from '../services/paymentService';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Initialize Payment
router.post('/initialize', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { order_id, amount, provider, idempotency_key } = req.body;
    if (!order_id || !amount) {
      return res.status(400).json({ success: false, message: 'Order ID and amount are required' });
    }

    const result = await PaymentService.initializePayment({
      order_id,
      customer_id: req.user!.id,
      email: req.user!.email,
      amount: Number(amount),
      provider,
      idempotency_key
    });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// Verify Payment (Server-side & Sandbox simulation)
router.post('/verify', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { reference, simulate_success } = req.body;
    if (!reference) {
      return res.status(400).json({ success: false, message: 'Payment reference is required' });
    }

    const result = await PaymentService.verifyPayment(reference, simulate_success !== false);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Webhook endpoint (Public)
router.post('/webhook/:provider', (req, res, next) => {
  try {
    const provider = req.params.provider.toUpperCase() as any;
    const signature = (req.headers['x-paystack-signature'] || req.headers['verif-hash'] || '') as string;
    const result = PaymentService.handleWebhook(provider, signature, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
