import { queryHelpers, generateUUID } from '../db';
import { Wallet, WalletTransaction, Withdrawal } from '../types';
import { config } from '../config';

export class WalletService {
  static getWallet(userId: string): Wallet {
    let wallet = queryHelpers.getOne<Wallet>('SELECT * FROM wallets WHERE user_id = ?', [userId]);
    if (!wallet) {
      const id = generateUUID();
      const now = new Date().toISOString();
      queryHelpers.execute(
        `INSERT INTO wallets (id, user_id, role, available_balance, pending_balance, total_earnings, total_withdrawals, created_at, updated_at)
         VALUES (?, ?, 'FARMER', 0, 0, 0, 0, ?, ?)`,
        [id, userId, now, now]
      );
      wallet = queryHelpers.getOne<Wallet>('SELECT * FROM wallets WHERE id = ?', [id])!;
    }
    return wallet;
  }

  static getWalletTransactions(walletId: string): WalletTransaction[] {
    return queryHelpers.getAll<WalletTransaction>(
      'SELECT * FROM wallet_transactions WHERE wallet_id = ? ORDER BY created_at DESC',
      [walletId]
    );
  }

  static getWithdrawals(userId: string): Withdrawal[] {
    return queryHelpers.getAll<Withdrawal>(
      'SELECT * FROM withdrawals WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
  }

  // Immutable Wallet Credit Helper
  static creditWallet(params: {
    userId: string;
    amount: number;
    type: 'SETTLEMENT' | 'CREDIT';
    reference_type: 'ORDER' | 'ADJUSTMENT';
    reference_id: string;
    description: string;
  }) {
    return queryHelpers.transaction(() => {
      const wallet = this.getWallet(params.userId);
      const newAvailable = wallet.available_balance + params.amount;
      const newEarnings = wallet.total_earnings + params.amount;
      const now = new Date().toISOString();

      queryHelpers.execute(
        `UPDATE wallets SET
          available_balance = ?,
          total_earnings = ?,
          updated_at = ?
         WHERE id = ?`,
        [newAvailable, newEarnings, now, wallet.id]
      );

      const txId = generateUUID();
      queryHelpers.execute(
        `INSERT INTO wallet_transactions (
          id, wallet_id, amount, type, reference_type, reference_id, description, balance_after, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [txId, wallet.id, params.amount, params.type, params.reference_type, params.reference_id, params.description, newAvailable, now]
      );

      return this.getWallet(params.userId);
    });
  }

  // Request Withdrawal
  static requestWithdrawal(userId: string, data: {
    amount: number;
    bank_name: string;
    account_number: string;
    account_name: string;
  }) {
    if (data.amount < config.platformDefaults.minimumWithdrawalAmount) {
      throw new Error(`Minimum withdrawal amount is ₦${config.platformDefaults.minimumWithdrawalAmount.toLocaleString()}`);
    }

    return queryHelpers.transaction(() => {
      const wallet = this.getWallet(userId);
      if (wallet.available_balance < data.amount) {
        throw new Error(`Insufficient available balance. Current balance: ₦${wallet.available_balance.toLocaleString()}`);
      }

      const now = new Date().toISOString();
      const newAvailable = wallet.available_balance - data.amount;
      const newTotalWithdrawals = wallet.total_withdrawals + data.amount;

      queryHelpers.execute(
        `UPDATE wallets SET
          available_balance = ?,
          total_withdrawals = ?,
          updated_at = ?
         WHERE id = ?`,
        [newAvailable, newTotalWithdrawals, now, wallet.id]
      );

      const withdrawalId = generateUUID();
      queryHelpers.execute(
        `INSERT INTO withdrawals (
          id, wallet_id, user_id, amount, bank_name, account_number, account_name, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)`,
        [withdrawalId, wallet.id, userId, data.amount, data.bank_name, data.account_number, data.account_name, now, now]
      );

      // Record immutable ledger entry
      const txId = generateUUID();
      queryHelpers.execute(
        `INSERT INTO wallet_transactions (
          id, wallet_id, amount, type, reference_type, reference_id, description, balance_after, created_at
        ) VALUES (?, ?, ?, 'WITHDRAWAL', 'WITHDRAWAL', ?, ?, ?, ?)`,
        [
          txId,
          wallet.id,
          -data.amount,
          withdrawalId,
          `Withdrawal request of ₦${data.amount.toLocaleString()} to ${data.bank_name} (${data.account_number})`,
          newAvailable,
          now
        ]
      );

      return queryHelpers.getOne<Withdrawal>('SELECT * FROM withdrawals WHERE id = ?', [withdrawalId]);
    });
  }

  // Admin Process Withdrawal
  static processWithdrawal(withdrawalId: string, status: 'PAID' | 'REJECTED', adminUserId: string, note?: string) {
    const withdrawal = queryHelpers.getOne<Withdrawal>('SELECT * FROM withdrawals WHERE id = ?', [withdrawalId]);
    if (!withdrawal) throw new Error('Withdrawal not found');
    if (withdrawal.status !== 'PENDING' && withdrawal.status !== 'PROCESSING') {
      throw new Error(`Withdrawal is already in ${withdrawal.status} state`);
    }

    return queryHelpers.transaction(() => {
      const now = new Date().toISOString();
      const wallet = queryHelpers.getOne<Wallet>('SELECT * FROM wallets WHERE id = ?', [withdrawal.wallet_id])!;

      if (status === 'PAID') {
        queryHelpers.execute(
          `UPDATE withdrawals SET status = 'PAID', audit_note = ?, processed_by = ?, processed_at = ?, updated_at = ? WHERE id = ?`,
          [note || 'Bank payout completed', adminUserId, now, now, withdrawalId]
        );
      } else if (status === 'REJECTED') {
        // Refund back to wallet
        const newAvailable = wallet.available_balance + withdrawal.amount;
        const newTotalWithdrawals = wallet.total_withdrawals - withdrawal.amount;

        queryHelpers.execute(
          `UPDATE wallets SET available_balance = ?, total_withdrawals = ?, updated_at = ? WHERE id = ?`,
          [newAvailable, newTotalWithdrawals, now, wallet.id]
        );

        queryHelpers.execute(
          `UPDATE withdrawals SET status = 'REJECTED', rejection_reason = ?, processed_by = ?, processed_at = ?, updated_at = ? WHERE id = ?`,
          [note || 'Rejected by administrator', adminUserId, now, now, withdrawalId]
        );

        const txId = generateUUID();
        queryHelpers.execute(
          `INSERT INTO wallet_transactions (
            id, wallet_id, amount, type, reference_type, reference_id, description, balance_after, created_at
          ) VALUES (?, ?, ?, 'REFUND', 'WITHDRAWAL', ?, ?, ?, ?)`,
          [
            txId,
            wallet.id,
            withdrawal.amount,
            withdrawalId,
            `Refund for rejected withdrawal: ${note || 'Administrative rejection'}`,
            newAvailable,
            now
          ]
        );
      }

      return queryHelpers.getOne<Withdrawal>('SELECT * FROM withdrawals WHERE id = ?', [withdrawalId]);
    });
  }
}
