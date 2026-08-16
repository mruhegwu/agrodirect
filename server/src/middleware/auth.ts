import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UserRole } from '../types';
import { queryHelpers } from '../db';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    full_name: string;
    farm_id?: string;
  };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication token missing or invalid' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as any;
    
    // Check if user still exists and is active in DB
    const user = queryHelpers.getOne<any>('SELECT id, email, role, full_name, is_active FROM users WHERE id = ?', [decoded.id]);
    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, message: 'User account not found or disabled' });
    }

    // Attach farm_id if farmer
    let farm_id: string | undefined;
    if (['FARMER', 'FARMER_STAFF'].includes(user.role)) {
      const farm = queryHelpers.getOne<any>('SELECT id FROM farms WHERE farmer_id = ?', [user.id]);
      if (farm) farm_id = farm.id;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      full_name: user.full_name,
      farm_id
    };

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Session expired or invalid token' });
  }
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as any;
    const user = queryHelpers.getOne<any>('SELECT id, email, role, full_name, is_active FROM users WHERE id = ?', [decoded.id]);
    if (user && user.is_active) {
      let farm_id: string | undefined;
      if (['FARMER', 'FARMER_STAFF'].includes(user.role)) {
        const farm = queryHelpers.getOne<any>('SELECT id FROM farms WHERE farmer_id = ?', [user.id]);
        if (farm) farm_id = farm.id;
      }
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role as UserRole,
        full_name: user.full_name,
        farm_id
      };
    }
  } catch {
    // Ignore invalid token in optionalAuth
  }
  next();
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // SUPER_ADMIN has access to everything
    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${allowedRoles.join(', ')}]`
      });
    }

    next();
  };
}
