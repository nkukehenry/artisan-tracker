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
        console.log(errors.array());
        throw createError('Validation failed', 400, errors.array());
      }

      const user = (req as any).user;
      const { 
        deviceId, name, model, osVersion, appVersion,
        brand, manufacturer, deviceName, product, board, hardware,
        sdkVersion, androidVersion, release, codename, incremental, securityPatch,
        totalMemoryGB, freeMemoryGB, totalStorageGB, freeStorageGB, usedMemoryPercentage,
        orientation, isRooted, isEmulator, screenDensity, screenResolution,
        networkOperator, simOperator, simCountryISO,
        appVersionCode, appInstallTime, collectedAt
      } = req.body;

      const device = await this.deviceService.registerDevice({
        deviceId,
        name,
        model,
        osVersion,
        appVersion,
        brand,
        manufacturer,
        deviceName,
        product,
        board,
        hardware,
        sdkVersion,
        androidVersion,
        release,
        codename,
        incremental,
        securityPatch,
        totalMemoryGB,
        freeMemoryGB,
        totalStorageGB,
        freeStorageGB,
        usedMemoryPercentage,
        orientation,
        isRooted,
        isEmulator,
        screenDensity,
        screenResolution,
        networkOperator,
        simOperator,
        simCountryISO,
        appVersionCode,
        appInstallTime,
        collectedAt,
        tenantId: user.tenantId,
        userId: user.id,
      });

      logger.info('Device registered successfully', { deviceId, userId: user.id });
      console.log('Device registered successfully', { device});

      res.status(201).json({
        success: true,
        message: 'Device registered successfully',
        data: { device: JSON.parse(
          JSON.stringify(device, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
          )
        ) },
      });
    } catch (error) {
      console.log('Error in registerDevice', error);
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
        data: JSON.parse(
          JSON.stringify(devices, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
          )
        ),
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
        data: { 
          device: JSON.parse(
            JSON.stringify(device, (key, value) =>
              typeof value === 'bigint' ? value.toString() : value
            )
          )
        },
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
        data: { 
          device: JSON.parse(
            JSON.stringify(device, (key, value) =>
              typeof value === 'bigint' ? value.toString() : value
            )
          )
        },
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
        data: { 
          device: JSON.parse(
            JSON.stringify(updatedDevice, (key, value) =>
              typeof value === 'bigint' ? value.toString() : value
            )
          )
        },
      });
    } catch (error) {
      logger.error('Update device status failed', { error, deviceId: req.params.id });
      next(error);
    }
  };

  /**
   * Call home endpoint for periodic device updates
   */
  public callHome = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createError('Validation failed', 400, errors.array());
      }

      const { 
        deviceId, batteryLevel, location,
        // Device hardware information
        brand, manufacturer, model, device, product, board, hardware,
        // Android system information
        sdkVersion, androidVersion, release, codename, incremental, securityPatch,
        // Memory and storage
        totalMemoryGB, freeMemoryGB, totalStorageGB, freeStorageGB, usedMemoryPercentage,
        // Device state
        orientation, isRooted, isEmulator, screenDensity, screenResolution,
        // Network information
        networkOperator, simOperator, simCountryISO,
        // App information
        appVersion, appVersionCode, appInstallTime,
        // Data collection
        collectedAt
      } = req.body;

      // Find device by deviceId
      const dbDevice = await this.deviceService.getDeviceByDeviceId(deviceId);
      if (!dbDevice) {
        throw createError('Device not found', 404);
      }

      // Update device with call home data
      const updatedDevice = await this.deviceService.updateDevice(dbDevice.id, {
        batteryLevel,
        location,
        // Device hardware information
        brand,
        manufacturer,
        model,
        deviceName: device, // Map 'device' field to 'deviceName'
        product,
        board,
        hardware,
        // Android system information
        sdkVersion,
        androidVersion,
        release,
        codename,
        incremental,
        securityPatch,
        // Memory and storage
        totalMemoryGB,
        freeMemoryGB,
        totalStorageGB,
        freeStorageGB,
        usedMemoryPercentage,
        // Device state
        orientation,
        isRooted,
        isEmulator,
        screenDensity,
        screenResolution,
        // Network information
        networkOperator,
        simOperator,
        simCountryISO,
        // App information
        appVersion,
        appVersionCode,
        appInstallTime,
        // Data collection
        collectedAt,
        isOnline: true,
        lastSeenAt: new Date(),
      });

      logger.info('Device called home successfully', { 
        deviceId, 
        batteryLevel, 
        hasLocation: !!location,
        memoryUsage: usedMemoryPercentage 
      });

      res.status(200).json({
        success: true,
        message: 'Call home successful',
        data: { 
          device: {
            id: updatedDevice.id,
            deviceId: updatedDevice.deviceId,
            isOnline: updatedDevice.isOnline,
            lastSeenAt: updatedDevice.lastSeenAt,
          }
        },
      });
    } catch (error) {
      logger.error('Call home failed', { error, deviceId: req.body.deviceId });
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
    
    // Device Hardware Information
    body('brand')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Brand must be less than 50 characters'),
    body('manufacturer')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Manufacturer must be less than 100 characters'),
    body('deviceName')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Device name must be less than 100 characters'),
    body('product')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Product must be less than 100 characters'),
    body('board')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Board must be less than 100 characters'),
    body('hardware')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Hardware must be less than 100 characters'),
    
    // Android System Information
    body('sdkVersion')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('SDK version must be a valid integer'),
    body('androidVersion')
      .optional()
      .trim()
      .isLength({ max: 20 })
      .withMessage('Android version must be less than 20 characters'),
    body('release')
      .optional()
      .trim()
      .isLength({ max: 20 })
      .withMessage('Release must be less than 20 characters'),
    body('codename')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Codename must be less than 50 characters'),
    body('incremental')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Incremental must be less than 50 characters'),
    body('securityPatch')
      .optional()
      .trim()
      .isLength({ max: 20 })
      .withMessage('Security patch must be less than 20 characters'),
    
    // Memory and Storage
    body('totalMemoryGB')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Total memory must be a positive number'),
    body('freeMemoryGB')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Free memory must be a positive number'),
    body('totalStorageGB')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Total storage must be a positive number'),
    body('freeStorageGB')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Free storage must be a positive number'),
    body('usedMemoryPercentage')
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage('Used memory percentage must be between 0 and 100'),
    
    // Device State
    body('orientation')
      .optional()
      .trim()
      .isIn(['portrait', 'landscape'])
      .withMessage('Orientation must be portrait or landscape'),
    body('isRooted')
      .optional()
      .isBoolean()
      .withMessage('isRooted must be a boolean'),
    body('isEmulator')
      .optional()
      .isBoolean()
      .withMessage('isEmulator must be a boolean'),
    body('screenDensity')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Screen density must be a positive number'),
    body('screenResolution')
      .optional()
      .trim()
      .matches(/^\d+x\d+$/)
      .withMessage('Screen resolution must be in format WIDTHxHEIGHT'),
    
    // Network Information
    body('networkOperator')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Network operator must be less than 100 characters'),
    body('simOperator')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('SIM operator must be less than 100 characters'),
    body('simCountryISO')
      .optional()
      .trim()
      .isLength({ min: 2, max: 3 })
      .withMessage('SIM country ISO must be 2-3 characters'),
    
    // App Information
    body('appVersionCode')
      .optional()
      .isInt({ min: 1 })
      .withMessage('App version code must be a positive integer'),
    body('appInstallTime')
      .optional()
      .isInt({ min: 0 })
      .withMessage('App install time must be a positive integer'),
    
    // Data Collection
    body('collectedAt')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Collected at must be a positive integer'),
  ],

  callHome: [
    body('deviceId')
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('Device ID must be between 3 and 50 characters'),
    body('batteryLevel')
      .isInt({ min: 0, max: 100 })
      .withMessage('Battery level must be between 0 and 100'),
    body('location')
      .isObject()
      .withMessage('Location must be an object'),
    body('location.latitude')
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitude must be between -90 and 90'),
    body('location.longitude')
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitude must be between -180 and 180'),
    body('location.accuracy')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Accuracy must be a positive number'),
    body('location.address')
      .optional()
      .trim()
      .isLength({ max: 255 })
      .withMessage('Address must be less than 255 characters'),
    
    // Optional network information
    body('networkOperator')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Network operator must be less than 100 characters'),
    body('simOperator')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('SIM operator must be less than 100 characters'),
    body('simCountryISO')
      .optional()
      .trim()
      .isLength({ min: 2, max: 3 })
      .withMessage('SIM country ISO must be 2-3 characters'),
    
    // Optional memory and storage
    body('totalMemoryGB')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Total memory must be a positive number'),
    body('freeMemoryGB')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Free memory must be a positive number'),
    body('totalStorageGB')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Total storage must be a positive number'),
    body('freeStorageGB')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Free storage must be a positive number'),
    body('usedMemoryPercentage')
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage('Used memory percentage must be between 0 and 100'),
    
    // Optional device state
    body('orientation')
      .optional()
      .trim()
      .isIn(['portrait', 'landscape'])
      .withMessage('Orientation must be portrait or landscape'),
    body('isRooted')
      .optional()
      .isBoolean()
      .withMessage('isRooted must be a boolean'),
    
    // Additional device attributes
    body('brand')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Brand must be less than 50 characters'),
    body('manufacturer')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Manufacturer must be less than 100 characters'),
    body('model')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Model must be less than 100 characters'),
    body('device')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Device must be less than 100 characters'),
    body('deviceName')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Device name must be less than 100 characters'),
    body('product')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Product must be less than 100 characters'),
    body('board')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Board must be less than 100 characters'),
    body('hardware')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Hardware must be less than 100 characters'),
    
    // Android System Information
    body('sdkVersion')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('SDK version must be a valid integer'),
    body('androidVersion')
      .optional()
      .trim()
      .isLength({ max: 20 })
      .withMessage('Android version must be less than 20 characters'),
    body('release')
      .optional()
      .trim()
      .isLength({ max: 20 })
      .withMessage('Release must be less than 20 characters'),
    body('codename')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Codename must be less than 50 characters'),
    body('incremental')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Incremental must be less than 50 characters'),
    body('securityPatch')
      .optional()
      .trim()
      .isLength({ max: 20 })
      .withMessage('Security patch must be less than 20 characters'),
    
    // Additional device state
    body('isEmulator')
      .optional()
      .isBoolean()
      .withMessage('isEmulator must be a boolean'),
    body('screenDensity')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Screen density must be a positive number'),
    body('screenResolution')
      .optional()
      .trim()
      .matches(/^\d+x\d+$/)
      .withMessage('Screen resolution must be in format WIDTHxHEIGHT'),
    
    // App Information
    body('appVersionCode')
      .optional()
      .isInt({ min: 1 })
      .withMessage('App version code must be a positive integer'),
    body('appInstallTime')
      .optional()
      .isInt({ min: 0 })
      .withMessage('App install time must be a positive integer'),
    
    // Data Collection
    body('collectedAt')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Collected at must be a positive integer'),
  ],

  getDeviceById: [
    param('id')
      .custom((value) => {
        // Accept Prisma ID format (starts with letters, contains alphanumeric)
        const isPrismaId = /^[a-z0-9]{20,25}$/i.test(value);
        // Also accept standard UUID format
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
        
        if (!isPrismaId && !isUUID) {
          throw new Error('Device ID must be a valid database ID format');
        }
        return true;
      }),
  ],

  updateDevice: [
    param('id')
      .custom((value) => {
        // Accept Prisma ID format (starts with letters, contains alphanumeric)
        const isPrismaId = /^[a-z0-9]{20,25}$/i.test(value);
        // Also accept standard UUID format
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
        
        if (!isPrismaId && !isUUID) {
          throw new Error('Device ID must be a valid database ID format');
        }
        return true;
      }),
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
      .custom((value) => {
        // Accept Prisma ID format (starts with letters, contains alphanumeric)
        const isPrismaId = /^[a-z0-9]{20,25}$/i.test(value);
        // Also accept standard UUID format
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
        
        if (!isPrismaId && !isUUID) {
          throw new Error('Device ID must be a valid database ID format');
        }
        return true;
      }),
  ],

  sendCommand: [
    param('id')
      .custom((value) => {
        // Accept Prisma ID format (starts with letters, contains alphanumeric)
        const isPrismaId = /^[a-z0-9]{20,25}$/i.test(value);
        // Also accept standard UUID format
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
        
        if (!isPrismaId && !isUUID) {
          throw new Error('Device ID must be a valid database ID format');
        }
        return true;
      }),
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
      .custom((value) => {
        // Accept Prisma ID format (starts with letters, contains alphanumeric)
        const isPrismaId = /^[a-z0-9]{20,25}$/i.test(value);
        // Also accept standard UUID format
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
        
        if (!isPrismaId && !isUUID) {
          throw new Error('Device ID must be a valid database ID format');
        }
        return true;
      }),
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
      .custom((value) => {
        // Accept Prisma ID format (starts with letters, contains alphanumeric)
        const isPrismaId = /^[a-z0-9]{20,25}$/i.test(value);
        // Also accept standard UUID format
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
        
        if (!isPrismaId && !isUUID) {
          throw new Error('Device ID must be a valid database ID format');
        }
        return true;
      }),
  ],
};

