import { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { container } from '../config/container';
import { TelemetryRepository, CreateTelemetryData } from '../interfaces/telemetry.interface';
import { IDeviceService } from '../interfaces/device.interface';
import { asyncHandler } from '../middleware/asyncHandler';
import { BadRequestError, NotFoundError } from '../utils/error';
import { logger } from '../config/logger';

export class TelemetryController {
  private telemetryRepository: TelemetryRepository;
  private deviceService: IDeviceService;

  constructor() {
    this.telemetryRepository = container.getRepository<TelemetryRepository>('telemetryRepository');
    this.deviceService = container.getService<IDeviceService>('deviceService');
  }

  // Device call-home endpoint - submit telemetry data
  callHome = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Validation failed', errors.array());
    }

    const telemetryData: CreateTelemetryData = req.body;

    // Create telemetry record
    const telemetry = await this.telemetryRepository.create(telemetryData);

    // Update device batteryLevel and location if available
    try {
      const device = await this.deviceService.getDeviceByDeviceId(telemetryData.deviceId);
      
      if (device) {
        const updateData: any = {
          isOnline: true,
          lastSeenAt: new Date(),
        };

        // Update battery level if available
        if (telemetryData.batteryInfo?.percentage) {
          const batteryLevel = parseInt(telemetryData.batteryInfo.percentage);
          if (!isNaN(batteryLevel)) {
            updateData.batteryLevel = batteryLevel;
          }
        }

        // Update location if provided in request
        if (req.body.locationInfo) {
          updateData.location = req.body.locationInfo;
        }

        await this.deviceService.updateDeviceStatus(telemetryData.deviceId, updateData);
        
        logger.info('Device status updated from telemetry', { 
          deviceId: telemetryData.deviceId,
          batteryLevel: updateData.batteryLevel,
          hasLocation: !!updateData.location
        });
      }
    } catch (error) {
      // Don't fail the telemetry upload if device update fails
      logger.warn('Failed to update device status from telemetry', { 
        deviceId: telemetryData.deviceId,
        error 
      });
    }

    logger.info('Telemetry data received', { 
      deviceId: telemetryData.deviceId,
      collectedAt: new Date(telemetryData.collectedAt)
    });

    res.status(201).json({
      success: true,
      message: 'Telemetry data received successfully',
      data: { telemetry },
    });
  });

  // Get telemetry history for a device
  getTelemetryByDevice = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Validation failed', errors.array());
    }

    const { deviceId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const paginationOptions = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    };

    const result = await this.telemetryRepository.findByDevice(deviceId, paginationOptions);

    res.status(200).json({
      success: true,
      message: 'Telemetry data retrieved successfully',
      data: result,
    });
  });

  // Get latest telemetry for a device
  getLatestTelemetry = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Validation failed', errors.array());
    }

    const { deviceId } = req.params;

    const telemetry = await this.telemetryRepository.getLatestByDevice(deviceId);

    if (!telemetry) {
      throw new NotFoundError('No telemetry data found for this device');
    }

    res.status(200).json({
      success: true,
      message: 'Latest telemetry retrieved successfully',
      data: { telemetry },
    });
  });

  // Delete old telemetry records (keep last N)
  cleanupOldTelemetry = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Validation failed', errors.array());
    }

    const { deviceId } = req.params;
    const { keepLast = 100 } = req.query;

    const deletedCount = await this.telemetryRepository.deleteOldRecords(
      deviceId,
      parseInt(keepLast as string)
    );

    res.status(200).json({
      success: true,
      message: `Deleted ${deletedCount} old telemetry records`,
      data: { deletedCount },
    });
  });
}

// Validation rules
export const telemetryValidation = {
  callHome: [
    body('deviceId').isString().notEmpty().withMessage('Device ID is required'),
    body('collectedAt').isInt().withMessage('Collection timestamp is required'),
    // Device Info (optional)
    body('deviceInfo.orientation').optional().isString(),
    body('deviceInfo.isRooted').optional().isBoolean(),
    body('deviceInfo.isEmulator').optional().isBoolean(),
    body('deviceInfo.screenDensity').optional().isFloat(),
    body('deviceInfo.screenResolution').optional().isString(),
    // Memory Info (optional)
    body('memoryInfo.totalMemory').optional().isFloat(),
    body('memoryInfo.freeMemory').optional().isFloat(),
    body('memoryInfo.totalStorage').optional().isFloat(),
    body('memoryInfo.freeStorage').optional().isFloat(),
    body('memoryInfo.usedMemoryPercentage').optional().isInt(),
    // System Info (optional)
    body('systemInfo.brand').optional().isString(),
    body('systemInfo.manufacturer').optional().isString(),
    body('systemInfo.model').optional().isString(),
    body('systemInfo.device').optional().isString(),
    body('systemInfo.product').optional().isString(),
    body('systemInfo.board').optional().isString(),
    body('systemInfo.hardware').optional().isString(),
    // OS Info (optional)
    body('osInfo.sdkVersion').optional().isInt(),
    body('osInfo.androidVersion').optional().isString(),
    body('osInfo.version').optional().isString(),
    body('osInfo.codename').optional().isString(),
    body('osInfo.incremental').optional().isString(),
    body('osInfo.securityPatch').optional().isString(),
    // Battery Info (optional)
    body('batteryInfo.percentage').optional().isString(),
    body('batteryInfo.temperature').optional().isString(),
    body('batteryInfo.voltage').optional().isString(),
    body('batteryInfo.current').optional().isString(),
    body('batteryInfo.capacity').optional().isString(),
    body('batteryInfo.batteryStatus').optional().isString(),
    body('batteryInfo.chargeCounter').optional().isString(),
    body('batteryInfo.energyCounter').optional().isString(),
    // App Version Info (optional)
    body('appVersionInfo.appVersion').optional().isString(),
    body('appVersionInfo.appVersionCode').optional().isInt(),
    body('appVersionInfo.appInstallTime').optional().isInt(),
    // Network Info (optional)
    body('networkInfo.networkOperator').optional().isString(),
    body('networkInfo.simOperator').optional().isString(),
    body('networkInfo.simCountryISO').optional().isString(),
    // Location Info (optional) - for updating device location
    body('locationInfo.latitude').optional().isFloat({ min: -90, max: 90 }),
    body('locationInfo.longitude').optional().isFloat({ min: -180, max: 180 }),
    body('locationInfo.accuracy').optional().isFloat({ min: 0 }),
    body('locationInfo.altitude').optional().isFloat(),
    body('locationInfo.speed').optional().isFloat({ min: 0 }),
    body('locationInfo.heading').optional().isFloat({ min: 0, max: 360 }),
    body('locationInfo.address').optional().isString(),
  ],
  getTelemetryByDevice: [
    param('deviceId').isString().notEmpty().withMessage('Device ID is required'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  ],
  getLatestTelemetry: [
    param('deviceId').isString().notEmpty().withMessage('Device ID is required'),
  ],
  cleanupOldTelemetry: [
    param('deviceId').isString().notEmpty().withMessage('Device ID is required'),
    query('keepLast').optional().isInt({ min: 1 }).withMessage('keepLast must be a positive integer'),
  ],
};

