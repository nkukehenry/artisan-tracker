import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { container } from '../config/container';
import { logger } from '../config/logger';
import { createError } from '../utils/error';
import { IDeviceService } from '../interfaces/device.interface';
import { CommandType } from '../interfaces/command.interface';

export class DeviceController {
  private deviceService: IDeviceService;

  constructor() {
    this.deviceService = container.getService<IDeviceService>('deviceService');
  }

  /**
   * Register a new device
   */
  public registerDevice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createError('Validation failed', 400, errors.array());
      }

      const user = (req as any).user;
      const { deviceId, name, model, osVersion, appVersion } = req.body;

      const device = await this.deviceService.registerDevice({
        deviceId,
        name,
        model,
        osVersion,
        appVersion,
        tenantId: user.tenantId,
        userId: user.id,
      });

      logger.info('Device registered successfully', { deviceId, userId: user.id });

      res.status(201).json({
        success: true,
        message: 'Device registered successfully',
        data: { device },
      });
    } catch (error) {
      logger.error('Device registration failed', { error, body: req.body });
      next(error);
    }
  };

  /**
   * Get all devices for current user
   */
  public getDevices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

      const options = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        search: search as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
      };

      const devices = await this.deviceService.getDevicesByUser(user.id, options);

      res.status(200).json({
        success: true,
        message: 'Devices retrieved successfully',
        data: devices,
      });
    } catch (error) {
      logger.error('Get devices failed', { error, userId: (req as any).user?.id });
      next(error);
    }
  };

  /**
   * Get device by ID
   */
  public getDeviceById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createError('Validation failed', 400, errors.array());
      }

      const { id } = req.params;
      const user = (req as any).user;

      const device = await this.deviceService.getDeviceById(id);

      if (!device) {
        throw createError('Device not found', 404);
      }

      // Check if user has access to this device
      if (device.userId !== user.id && user.role !== 'SUPER_ADMIN') {
        throw createError('Access denied', 403);
      }

      res.status(200).json({
        success: true,
        message: 'Device retrieved successfully',
        data: { device },
      });
    } catch (error) {
      logger.error('Get device by ID failed', { error, deviceId: req.params.id });
      next(error);
    }
  };

  /**
   * Update device information
   */
  public updateDevice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createError('Validation failed', 400, errors.array());
      }

      const { id } = req.params;
      const user = (req as any).user;
      const updateData = req.body;

      // Check if device exists and user has access
      const existingDevice = await this.deviceService.getDeviceById(id);
      if (!existingDevice) {
        throw createError('Device not found', 404);
      }

      if (existingDevice.userId !== user.id && user.role !== 'SUPER_ADMIN') {
        throw createError('Access denied', 403);
      }

      const device = await this.deviceService.updateDevice(id, updateData);

      logger.info('Device updated successfully', { deviceId: id, userId: user.id });

      res.status(200).json({
        success: true,
        message: 'Device updated successfully',
        data: { device },
      });
    } catch (error) {
      logger.error('Update device failed', { error, deviceId: req.params.id });
      next(error);
    }
  };

  /**
   * Delete device
   */
  public deleteDevice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createError('Validation failed', 400, errors.array());
      }

      const { id } = req.params;
      const user = (req as any).user;

      // Check if device exists and user has access
      const existingDevice = await this.deviceService.getDeviceById(id);
      if (!existingDevice) {
        throw createError('Device not found', 404);
      }

      if (existingDevice.userId !== user.id && user.role !== 'SUPER_ADMIN') {
        throw createError('Access denied', 403);
      }

      await this.deviceService.deleteDevice(id);

      logger.info('Device deleted successfully', { deviceId: id, userId: user.id });

      res.status(200).json({
        success: true,
        message: 'Device deleted successfully',
      });
    } catch (error) {
      logger.error('Delete device failed', { error, deviceId: req.params.id });
      next(error);
    }
  };

  /**
   * Send command to device
   */
  public sendCommand = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createError('Validation failed', 400, errors.array());
      }

      const { id } = req.params;
      const user = (req as any).user;
      const { command, payload } = req.body;

      // Check if device exists and user has access
      const device = await this.deviceService.getDeviceById(id);
      if (!device) {
        throw createError('Device not found', 404);
      }

      if (device.userId !== user.id && user.role !== 'SUPER_ADMIN') {
        throw createError('Access denied', 403);
      }

      const commandResult = await this.deviceService.sendCommand({
        deviceId: device.deviceId,
        command: command as CommandType,
        payload,
      });

      logger.info('Command sent to device', { deviceId: id, command, userId: user.id });

      res.status(200).json({
        success: true,
        message: 'Command sent successfully',
        data: { command: commandResult },
      });
    } catch (error) {
      logger.error('Send command failed', { error, deviceId: req.params.id, command: req.body.command });
      next(error);
    }
  };

  /**
   * Get device commands history
   */
  public getDeviceCommands = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const { page = 1, limit = 10, status, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

      // Check if device exists and user has access
      const device = await this.deviceService.getDeviceById(id);
      if (!device) {
        throw createError('Device not found', 404);
      }

      if (device.userId !== user.id && user.role !== 'SUPER_ADMIN') {
        throw createError('Access denied', 403);
      }

      const options = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        status: status as string,
        search: search as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
      };

      const commands = await this.deviceService.getDeviceCommands(device.deviceId, options);

      res.status(200).json({
        success: true,
        message: 'Device commands retrieved successfully',
        data: commands,
      });
    } catch (error) {
      logger.error('Get device commands failed', { error, deviceId: req.params.id });
      next(error);
    }
  };

  /**
   * Update device status (called by device)
   */
  public updateDeviceStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createError('Validation failed', 400, errors.array());
      }

      const { id } = req.params;
      const { isOnline, batteryLevel, location } = req.body;

      // Find device by deviceId (not database ID)
      const device = await this.deviceService.getDeviceByDeviceId(id);
      if (!device) {
        throw createError('Device not found', 404);
      }

      const updatedDevice = await this.deviceService.updateDeviceStatus(id, {
        isOnline,
        batteryLevel,
        location,
      });

      logger.info('Device status updated', { deviceId: id, isOnline, batteryLevel });

      res.status(200).json({
        success: true,
        message: 'Device status updated successfully',
        data: { device: updatedDevice },
      });
    } catch (error) {
      logger.error('Update device status failed', { error, deviceId: req.params.id });
      next(error);
    }
  };

  /**
   * Get device status
   */
  public getDeviceStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      // Check if device exists and user has access
      const device = await this.deviceService.getDeviceById(id);
      if (!device) {
        throw createError('Device not found', 404);
      }

      if (device.userId !== user.id && user.role !== 'SUPER_ADMIN') {
        throw createError('Access denied', 403);
      }

      const status = await this.deviceService.getDeviceStatus(device.deviceId);

      res.status(200).json({
        success: true,
        message: 'Device status retrieved successfully',
        data: { status },
      });
    } catch (error) {
      logger.error('Get device status failed', { error, deviceId: req.params.id });
      next(error);
    }
  };
}

// Validation rules for device endpoints
export const deviceValidation = {
  registerDevice: [
    body('deviceId')
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('Device ID must be between 3 and 50 characters'),
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Device name must be between 2 and 100 characters'),
    body('model')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Device model must be less than 100 characters'),
    body('osVersion')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('OS version must be less than 50 characters'),
    body('appVersion')
      .optional()
      .trim()
      .isLength({ max: 20 })
      .withMessage('App version must be less than 20 characters'),
  ],

  getDeviceById: [
    param('id')
      .isUUID()
      .withMessage('Device ID must be a valid UUID'),
  ],

  updateDevice: [
    param('id')
      .isUUID()
      .withMessage('Device ID must be a valid UUID'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Device name must be between 2 and 100 characters'),
    body('model')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Device model must be less than 100 characters'),
    body('osVersion')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('OS version must be less than 50 characters'),
    body('appVersion')
      .optional()
      .trim()
      .isLength({ max: 20 })
      .withMessage('App version must be less than 20 characters'),
  ],

  deleteDevice: [
    param('id')
      .isUUID()
      .withMessage('Device ID must be a valid UUID'),
  ],

  sendCommand: [
    param('id')
      .isUUID()
      .withMessage('Device ID must be a valid UUID'),
    body('command')
      .isIn(['RECORD_AUDIO', 'RECORD_VIDEO', 'SCREEN_RECORDING', 'TAKE_PHOTO', 'GET_LOCATION', 'GET_CONTACTS', 'GET_CALL_LOGS', 'GET_MESSAGES', 'ENABLE_APP', 'DISABLE_APP', 'RESTART_DEVICE', 'WIPE_DATA'])
      .withMessage('Invalid command type'),
    body('payload')
      .optional()
      .isObject()
      .withMessage('Payload must be an object'),
  ],

  getDeviceCommands: [
    param('id')
      .isUUID()
      .withMessage('Device ID must be a valid UUID'),
    query('status')
      .optional()
      .isIn(['PENDING', 'SENT', 'EXECUTED', 'FAILED', 'CANCELLED'])
      .withMessage('Invalid status filter'),
  ],

  updateDeviceStatus: [
    param('id')
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('Device ID must be between 3 and 50 characters'),
    body('isOnline')
      .isBoolean()
      .withMessage('isOnline must be a boolean'),
    body('batteryLevel')
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage('Battery level must be between 0 and 100'),
    body('location')
      .optional()
      .isObject()
      .withMessage('Location must be an object'),
  ],

  getDeviceStatus: [
    param('id')
      .isUUID()
      .withMessage('Device ID must be a valid UUID'),
  ],
};
