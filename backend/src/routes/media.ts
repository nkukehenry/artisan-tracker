import { Router } from 'express';
import { param, query } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken, requireDeviceAccess } from '../middleware/auth';

const router = Router();

// All media routes require authentication
router.use(authenticateToken);

// Placeholder media routes - will be implemented later
router.get('/:deviceId/photos', [
  param('deviceId').isUUID(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
], requireDeviceAccess, asyncHandler(async (req, res) => {
  res.json({ message: 'Get photos endpoint - to be implemented' });
}));

router.get('/:deviceId/videos', [
  param('deviceId').isUUID(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
], requireDeviceAccess, asyncHandler(async (req, res) => {
  res.json({ message: 'Get videos endpoint - to be implemented' });
}));

router.get('/:deviceId/audio', [
  param('deviceId').isUUID(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
], requireDeviceAccess, asyncHandler(async (req, res) => {
  res.json({ message: 'Get audio files endpoint - to be implemented' });
}));

router.get('/:deviceId/call-logs', [
  param('deviceId').isUUID(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
], requireDeviceAccess, asyncHandler(async (req, res) => {
  res.json({ message: 'Get call logs endpoint - to be implemented' });
}));

router.get('/:deviceId/contacts', [
  param('deviceId').isUUID(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
], requireDeviceAccess, asyncHandler(async (req, res) => {
  res.json({ message: 'Get contacts endpoint - to be implemented' });
}));

router.get('/:deviceId/messages', [
  param('deviceId').isUUID(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
], requireDeviceAccess, asyncHandler(async (req, res) => {
  res.json({ message: 'Get messages endpoint - to be implemented' });
}));

router.get('/:deviceId/locations', [
  param('deviceId').isUUID(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
], requireDeviceAccess, asyncHandler(async (req, res) => {
  res.json({ message: 'Get locations endpoint - to be implemented' });
}));

export default router;
