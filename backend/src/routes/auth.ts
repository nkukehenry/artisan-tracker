import { Router } from 'express';
import { body } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Placeholder auth routes - will be implemented later
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
], asyncHandler(async (req, res) => {
  res.json({ message: 'Login endpoint - to be implemented' });
}));

router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().isLength({ min: 1 }),
  body('lastName').trim().isLength({ min: 1 }),
], asyncHandler(async (req, res) => {
  res.json({ message: 'Register endpoint - to be implemented' });
}));

router.post('/logout', authenticateToken, asyncHandler(async (req, res) => {
  res.json({ message: 'Logout endpoint - to be implemented' });
}));

router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  res.json({ message: 'Profile endpoint - to be implemented' });
}));

export default router;
