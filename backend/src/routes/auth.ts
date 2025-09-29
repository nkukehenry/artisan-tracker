import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';
import { AuthController, authValidation } from '../controllers/auth.controller';

const router = Router();
const authController = new AuthController();

// Authentication routes
router.post('/register', authValidation.register, asyncHandler(authController.register));
router.post('/login', authValidation.login, asyncHandler(authController.login));
router.post('/refresh', authValidation.refreshToken, asyncHandler(authController.refreshToken));
router.post('/logout', authenticateToken, authValidation.logout, asyncHandler(authController.logout));
router.get('/me', authenticateToken, asyncHandler(authController.getProfile));

export default router;
