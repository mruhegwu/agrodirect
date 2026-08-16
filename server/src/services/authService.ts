import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { queryHelpers, generateUUID } from '../db';
import { config } from '../config';
import { User, UserRole } from '../types';

export class AuthService {
  static async register(data: {
    email: string;
    password: string;
    full_name: string;
    phone: string;
    role?: UserRole;
  }): Promise<{ user: Omit<User, 'password_hash'>; token: string }> {
    const existing = queryHelpers.getOne<User>('SELECT id FROM users WHERE email = ?', [data.email.toLowerCase()]);
    if (existing) {
      throw new Error('An account with this email address already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(data.password, salt);
    const id = generateUUID();
    const now = new Date().toISOString();
    const role: UserRole = data.role || 'CUSTOMER';

    queryHelpers.execute(
      `INSERT INTO users (id, email, password_hash, full_name, phone, role, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      [id, data.email.toLowerCase(), password_hash, data.full_name, data.phone, role, now, now]
    );

    // If farmer, auto-create wallet and skeleton farm
    if (role === 'FARMER') {
      const walletId = generateUUID();
      queryHelpers.execute(
        `INSERT INTO wallets (id, user_id, role, available_balance, pending_balance, total_earnings, total_withdrawals, created_at, updated_at)
         VALUES (?, ?, 'FARMER', 0, 0, 0, 0, ?, ?)`,
        [walletId, id, now, now]
      );
    } else if (role === 'LOGISTICS_PROVIDER') {
      const walletId = generateUUID();
      queryHelpers.execute(
        `INSERT INTO wallets (id, user_id, role, available_balance, pending_balance, total_earnings, total_withdrawals, created_at, updated_at)
         VALUES (?, ?, 'LOGISTICS', 0, 0, 0, 0, ?, ?)`,
        [walletId, id, now, now]
      );

      const providerId = generateUUID();
      queryHelpers.execute(
        `INSERT INTO logistics_providers (id, user_id, company_name, phone, email, status, created_at)
         VALUES (?, ?, ?, ?, ?, 'VERIFIED', ?)`,
        [providerId, id, data.full_name + ' Logistics', data.phone, data.email.toLowerCase(), now]
      );
    }

    const user = queryHelpers.getOne<User>('SELECT id, email, full_name, phone, role, avatar_url, is_active, created_at, updated_at FROM users WHERE id = ?', [id])!;
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, config.jwtSecret, { expiresIn: '7d' });

    return { user, token };
  }

  static async login(data: {
    email: string;
    password: string;
  }): Promise<{ user: Omit<User, 'password_hash'> & { farm?: any }; token: string }> {
    const user = queryHelpers.getOne<User>('SELECT * FROM users WHERE email = ?', [data.email.toLowerCase()]);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (!user.is_active) {
      throw new Error('Your account has been suspended. Please contact support.');
    }

    const isMatch = await bcrypt.compare(data.password, user.password_hash || '');
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, config.jwtSecret, { expiresIn: '7d' });
    
    let farm: any = null;
    if (['FARMER', 'FARMER_STAFF'].includes(user.role)) {
      farm = queryHelpers.getOne('SELECT * FROM farms WHERE farmer_id = ?', [user.id]);
    }

    const { password_hash, ...safeUser } = user;
    return { user: { ...safeUser, farm }, token };
  }

  static getCurrentUser(userId: string) {
    const user = queryHelpers.getOne<User>('SELECT id, email, full_name, phone, role, avatar_url, is_active, created_at, updated_at FROM users WHERE id = ?', [userId]);
    if (!user) throw new Error('User not found');

    let farm: any = null;
    let verification: any = null;
    let wallet: any = null;

    if (['FARMER', 'FARMER_STAFF'].includes(user.role)) {
      farm = queryHelpers.getOne('SELECT * FROM farms WHERE farmer_id = ?', [user.id]);
      if (farm) {
        verification = queryHelpers.getOne('SELECT * FROM farmer_verifications WHERE farm_id = ?', [farm.id]);
      }
      wallet = queryHelpers.getOne('SELECT * FROM wallets WHERE user_id = ?', [user.id]);
    } else if (['LOGISTICS_PROVIDER', 'LOGISTICS_STAFF'].includes(user.role)) {
      wallet = queryHelpers.getOne('SELECT * FROM wallets WHERE user_id = ?', [user.id]);
    }

    return { user, farm, verification, wallet };
  }

  static updateProfile(userId: string, data: { full_name?: string; phone?: string; avatar_url?: string }) {
    const now = new Date().toISOString();
    queryHelpers.execute(
      `UPDATE users SET
        full_name = COALESCE(?, full_name),
        phone = COALESCE(?, phone),
        avatar_url = COALESCE(?, avatar_url),
        updated_at = ?
       WHERE id = ?`,
      [data.full_name || null, data.phone || null, data.avatar_url || null, now, userId]
    );

    return this.getCurrentUser(userId);
  }
}
