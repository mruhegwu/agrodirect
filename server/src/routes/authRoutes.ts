import { Router, Response } from 'express';
import { AuthService } from '../services/authService';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Register
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, full_name, phone, role } = req.body;
    if (!email || !password || !full_name || !phone) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const result = await AuthService.register({ email, password, full_name, phone, role });
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    const result = await AuthService.login({ email, password });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// Get Current User Profile
router.get('/me', authenticate, (req: AuthRequest, res: Response, next) => {
  try {
    const profile = AuthService.getCurrentUser(req.user!.id);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
});

// Update Profile
router.put('/profile', authenticate, (req: AuthRequest, res: Response, next) => {
  try {
    const updated = AuthService.updateProfile(req.user!.id, req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
