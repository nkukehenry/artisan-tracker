import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';
import { DeviceController, deviceValidation } from '../controllers/device.controller';

const router = Router();
const deviceController = new DeviceController();

// All device routes require authentication
router.use(authenticateToken);

// Device management routes
router.get('/', asyncHandler(deviceController.getDevices));
router.post('/register', deviceValidation.registerDevice, asyncHandler(deviceController.registerDevice));
router.get('/:id', deviceValidation.getDeviceById, asyncHandler(deviceController.getDeviceById));
router.put('/:id', deviceValidation.updateDevice, asyncHandler(deviceController.updateDevice));
router.delete('/:id', deviceValidation.deleteDevice, asyncHandler(deviceController.deleteDevice));

// Device command routes
router.post('/:id/commands', deviceValidation.sendCommand, asyncHandler(deviceController.sendCommand));
router.get('/:id/commands', deviceValidation.getDeviceCommands, asyncHandler(deviceController.getDeviceCommands));

// Device status routes
router.get('/:id/status', deviceValidation.getDeviceStatus, asyncHandler(deviceController.getDeviceStatus));
router.put('/:id/status', deviceValidation.updateDeviceStatus, asyncHandler(deviceController.updateDeviceStatus));

export default router;
