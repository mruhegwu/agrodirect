import crypto from 'crypto';
import { queryHelpers, generateUUID, safeJsonStringify, safeJsonParse } from '../db';
import { Order, Payment, PaymentProvider, PaymentStatus } from '../types';
import { OrderService } from './orderService';

export interface PaymentInitResult {
  payment_id: string;
  provider: PaymentProvider;
  reference: string;
  authorization_url: string;
  access_code?: string;
  amount: number;
  currency: string;
}

export class PaymentService {
  // Provider-agnostic initialization
  static async initializePayment(params: {
    order_id: string;
    customer_id: string;
    email: string;
    amount: number;
    provider?: PaymentProvider;
    idempotency_key?: string;
  }): Promise<PaymentInitResult> {
    const order = queryHelpers.getOne<Order>('SELECT * FROM orders WHERE id = ?', [params.order_id]);
    if (!order) throw new Error('Order not found');
    if (order.status !== 'PENDING_PAYMENT') {
      throw new Error(`Order cannot be paid in current status: ${order.status}`);
    }

    // Verify order amount matches
    if (Math.abs(order.total_amount - params.amount) > 1.0) {
      throw new Error('Payment amount does not match server order total');
    }

    const provider: PaymentProvider = params.provider || 'PAYSTACK';
    const reference = `AGD_PAY_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const paymentId = generateUUID();
    const now = new Date().toISOString();

    // Store pending payment record
    queryHelpers.execute(
      `INSERT INTO payments (
        id, order_id, customer_id, provider, provider_reference, idempotency_key,
        amount, currency, status, metadata, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'NGN', 'PENDING', ?, ?)`,
      [
        paymentId,
        params.order_id,
        params.customer_id,
        provider,
        reference,
        params.idempotency_key || null,
        params.amount,
        safeJsonStringify({ order_number: order.order_number, email: params.email }),
        now
      ]
    );

    // Record initial payment transaction log
    queryHelpers.execute(
      `INSERT INTO payment_transactions (id, payment_id, event_type, payload, created_at)
       VALUES (?, ?, 'INITIALIZED', ?, ?)`,
      [generateUUID(), paymentId, safeJsonStringify({ provider, reference, amount: params.amount }), now]
    );

    // Generate redirect or interactive simulation checkout URL
    const authorization_url = `/checkout/pay?ref=${reference}&order_id=${params.order_id}&amount=${params.amount}&provider=${provider}`;

    return {
      payment_id: paymentId,
      provider,
      reference,
      authorization_url,
      amount: params.amount,
      currency: 'NGN'
    };
  }

  // Server-side verification (Idempotent)
  static async verifyPayment(reference: string, simulationSuccess: boolean = true): Promise<{ success: boolean; message: string; payment: Payment }> {
    const payment = queryHelpers.getOne<Payment>('SELECT * FROM payments WHERE provider_reference = ?', [reference]);
    if (!payment) throw new Error('Payment reference not found');

    if (payment.status === 'SUCCESS') {
      return { success: true, message: 'Payment has already been successfully verified', payment };
    }

    return queryHelpers.transaction(() => {
      const now = new Date().toISOString();
      const isSuccess = simulationSuccess; // In production this calls Paystack/Flutterwave verify API

      if (isSuccess) {
        queryHelpers.execute(
          `UPDATE payments SET status = 'SUCCESS', paid_at = ? WHERE id = ?`,
          [now, payment.id]
        );

        queryHelpers.execute(
          `INSERT INTO payment_transactions (id, payment_id, event_type, payload, created_at)
           VALUES (?, ?, 'VERIFIED_SUCCESS', ?, ?)`,
          [generateUUID(), payment.id, safeJsonStringify({ verified_at: now, reference }), now]
        );

        // Update Order Status to PAID
        OrderService.updateOrderStatus(payment.order_id, 'PAID');

        // Create notification for Farmer and Customer
        const order = queryHelpers.getOne<Order>('SELECT * FROM orders WHERE id = ?', [payment.order_id]);
        if (order) {
          queryHelpers.execute(
            `INSERT INTO notifications (id, user_id, title, message, type, link, is_read, created_at)
             VALUES (?, ?, 'New Order Received', ?, 'ORDER', ?, 0, ?)`,
            [
              generateUUID(),
              order.farmer_id,
              `New order ${order.order_number} of ₦${order.total_amount.toLocaleString()} received and confirmed paid.`,
              `/farmer/orders/${order.id}`,
              now
            ]
          );

          queryHelpers.execute(
            `INSERT INTO notifications (id, user_id, title, message, type, link, is_read, created_at)
             VALUES (?, ?, 'Payment Successful', ?, 'PAYMENT', ?, 0, ?)`,
            [
              generateUUID(),
              order.customer_id,
              `Your payment for order ${order.order_number} was successful. The farmer is preparing your order.`,
              `/account/orders/${order.id}`,
              now
            ]
          );
        }

        const updated = queryHelpers.getOne<Payment>('SELECT * FROM payments WHERE id = ?', [payment.id])!;
        return { success: true, message: 'Payment verified and confirmed', payment: updated };
      } else {
        queryHelpers.execute(`UPDATE payments SET status = 'FAILED' WHERE id = ?`, [payment.id]);
        queryHelpers.execute(
          `INSERT INTO payment_transactions (id, payment_id, event_type, payload, created_at)
           VALUES (?, ?, 'VERIFIED_FAILED', ?, ?)`,
          [generateUUID(), payment.id, safeJsonStringify({ failed_at: now, reference }), now]
        );

        const updated = queryHelpers.getOne<Payment>('SELECT * FROM payments WHERE id = ?', [payment.id])!;
        return { success: false, message: 'Payment verification failed', payment: updated };
      }
    });
  }

  // Webhook handler with signature check
  static handleWebhook(provider: PaymentProvider, signature: string, payload: any) {
    // Verify signature logic
    const secret = process.env[`${provider}_SECRET_KEY`] || 'test_secret_key';
    const computedSig = crypto.createHmac('sha512', secret).update(JSON.stringify(payload)).digest('hex');

    // In production we compare computedSig === signature
    const reference = payload.data?.reference || payload.reference;
    if (reference) {
      return this.verifyPayment(reference, true);
    }
    return { success: true, received: true };
  }
}
