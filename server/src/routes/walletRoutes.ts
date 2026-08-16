import { Router, Response } from 'express';
import { WalletService } from '../services/walletService';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { queryHelpers } from '../db';

const router = Router();

// Get My Wallet & Balance
router.get('/my-wallet', authenticate, (req: AuthRequest, res: Response, next) => {
  try {
    const wallet = WalletService.getWallet(req.user!.id);
    const transactions = WalletService.getWalletTransactions(wallet.id);
    const withdrawals = WalletService.getWithdrawals(req.user!.id);
    res.json({ success: true, data: { wallet, transactions, withdrawals } });
  } catch (err) {
    next(err);
  }
});

// Request Withdrawal
router.post('/withdraw', authenticate, (req: AuthRequest, res: Response, next) => {
  try {
    const { amount, bank_name, account_number, account_name } = req.body;
    if (!amount || !bank_name || !account_number || !account_name) {
      return res.status(400).json({ success: false, message: 'All bank withdrawal details are required' });
    }

    const withdrawal = WalletService.requestWithdrawal(req.user!.id, {
      amount: Number(amount),
      bank_name,
      account_number,
      account_name
    });

    res.status(201).json({ success: true, data: withdrawal });
  } catch (err) {
    next(err);
  }
});

// Admin: List All Withdrawals
router.get('/admin/withdrawals', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), (req, res, next) => {
  try {
    const withdrawals = queryHelpers.getAll<any>(
      `SELECT w.*, u.full_name as user_name, u.email as user_email, u.phone as user_phone
       FROM withdrawals w
       JOIN users u ON w.user_id = u.id
       ORDER BY w.created_at DESC`
    );
    res.json({ success: true, data: withdrawals });
  } catch (err) {
    next(err);
  }
});

// Admin: Process Withdrawal Payout or Rejection
router.patch('/admin/withdrawals/:id', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), (req: AuthRequest, res: Response, next) => {
  try {
    const { status, note } = req.body;
    if (!status || !['PAID', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be either 'PAID' or 'REJECTED'" });
    }

    const updated = WalletService.processWithdrawal(String(req.params.id), status, req.user!.id, note);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
