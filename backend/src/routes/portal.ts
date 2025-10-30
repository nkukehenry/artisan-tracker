import { Router, Request, Response } from 'express';
import { query } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken, requireRole } from '../middleware/auth';
import portalController from '../controllers/portal.controller';

const router = Router();

// All portal routes require authentication
router.use(authenticateToken);

// Dashboard metrics
router.get('/dashboard', asyncHandler(portalController.getDashboard));

router.get('/analytics', [
  query('period').optional().isIn(['day', 'week', 'month', 'year']),
  query('deviceId').optional().isString(),
], asyncHandler(async (req: Request, res: Response) => {
  res.json({ message: 'Analytics endpoint - to be implemented' });
}));

router.get('/users', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
], requireRole(['SUPER_ADMIN', 'TENANT_ADMIN']), asyncHandler(async (req: Request, res: Response) => {
  res.json({ message: 'Users management endpoint - to be implemented' });
}));

router.get('/tenants', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
], requireRole(['SUPER_ADMIN']), asyncHandler(async (req: Request, res: Response) => {
  res.json({ message: 'Tenants management endpoint - to be implemented' });
}));

router.get('/subscriptions', asyncHandler(async (req: Request, res: Response) => {
  res.json({ message: 'Subscriptions endpoint - to be implemented' });
}));

router.get('/logs', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('level').optional().isIn(['ERROR', 'WARN', 'INFO', 'DEBUG']),
], requireRole(['SUPER_ADMIN', 'TENANT_ADMIN']), asyncHandler(async (req: Request, res: Response) => {
  res.json({ message: 'System logs endpoint - to be implemented' });
}));

export default router;
