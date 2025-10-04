import { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { container } from '../config/container';
import { LocationRepository, CreateLocationData } from '../interfaces/location.interface';
import { IDeviceService } from '../interfaces/device.interface';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireAuth, requireRole } from '../middleware/auth';
import { BadRequestError, NotFoundError } from '../utils/error';

// Swagger documentation removed - kept only in routes

export class LocationController {
  private locationRepository: LocationRepository;
  private deviceService: IDeviceService;

  constructor() {
    this.locationRepository = container.getRepository<LocationRepository>('locationRepository');
    this.deviceService = container.getService<IDeviceService>('deviceService');
  }

  // Swagger documentation removed - kept only in routes
  uploadLocations = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Validation failed', errors.array());
    }

    const { locations } = req.body;
    const userId = req.user?.id;

    if (!Array.isArray(locations) || locations.length === 0) {
      throw new BadRequestError('locations must be a non-empty array');
    }

    const createdLocations = [];
    for (const locationData of locations) {
      // Look up device by deviceId to get the database ID
      const device = await this.deviceService.getDeviceByDeviceId(locationData.deviceId);
      if (!device) {
        throw new NotFoundError(`Device with deviceId '${locationData.deviceId}' not found`);
      }

      const location: CreateLocationData = {
        deviceId: device.id, // Use the database ID from the lookup
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        accuracy: locationData.accuracy,
        altitude: locationData.altitude,
        speed: locationData.speed,
        heading: locationData.heading,
        address: locationData.address,
        timestamp: new Date(locationData.timestamp),
        // isEncrypted removed - not in Prisma schema
      };
      
      const created = await this.locationRepository.create(location);
      createdLocations.push(created);
    }

    res.status(201).json({
      success: true,
      message: `${createdLocations.length} location entries uploaded successfully`,
      data: createdLocations,
    });
  });

  // Swagger documentation removed - kept only in routes
  getLocationsByDevice = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Validation failed', errors.array());
    }

    const { deviceId } = req.params;
    const { page = 1, limit = 20, startDate, endDate, minAccuracy } = req.query;
    const userId = req.user?.id;

    const paginationOptions = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    };

    const filterOptions = {
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      minAccuracy: minAccuracy ? parseFloat(minAccuracy as string) : undefined,
    };

    const result = await this.locationRepository.findByDevice(
      deviceId,
      paginationOptions,
      filterOptions
    );

    res.json({
      success: true,
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  });

  // Swagger documentation removed - kept only in routes
  getCurrentLocation = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Validation failed', errors.array());
    }

    const { deviceId } = req.params;
    const userId = req.user?.id;

    const currentLocation = await this.locationRepository.findCurrentByDevice(deviceId);
    if (!currentLocation) {
      throw new NotFoundError('No current location found for this device');
    }

    res.json({
      success: true,
      data: currentLocation,
    });
  });

  // Swagger documentation removed - kept only in routes
  getLocationById = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Validation failed', errors.array());
    }

    const { id } = req.params;
    const userId = req.user?.id;

    const location = await this.locationRepository.findById(id);
    if (!location) {
      throw new NotFoundError('Location entry not found');
    }

    res.json({
      success: true,
      data: location,
    });
  });

  // Swagger documentation removed - kept only in routes
  deleteLocation = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Validation failed', errors.array());
    }

    const { id } = req.params;
    const userId = req.user?.id;

    const location = await this.locationRepository.findById(id);
    if (!location) {
      throw new NotFoundError('Location entry not found');
    }

    await this.locationRepository.delete(id);

    res.json({
      success: true,
      message: 'Location entry deleted successfully',
    });
  });
}

// Validation rules for location endpoints
export const locationValidation = {
  uploadLocations: [
    body('locations')
      .isArray({ min: 1 })
      .withMessage('locations must be a non-empty array'),
    body('locations.*.deviceId')
      .isString()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Device ID must be between 1 and 50 characters'),
    body('locations.*.latitude')
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitude must be between -90 and 90'),
    body('locations.*.longitude')
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitude must be between -180 and 180'),
    body('locations.*.accuracy')
      .isFloat({ min: 0 })
      .withMessage('Accuracy must be a non-negative number'),
    body('locations.*.altitude')
      .optional()
      .isFloat()
      .withMessage('Altitude must be a number'),
    body('locations.*.speed')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Speed must be a non-negative number'),
    body('locations.*.heading')
      .optional()
      .isFloat({ min: 0, max: 360 })
      .withMessage('Heading must be between 0 and 360 degrees'),
    body('locations.*.address')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Address must be less than 200 characters'),
    body('locations.*.timestamp')
      .isISO8601()
      .withMessage('Timestamp must be a valid ISO 8601 date'),
    // isEncrypted validation removed - not in Prisma schema
  ],

  getLocationsByDevice: [
    param('deviceId')
      .isString()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Device ID must be between 1 and 50 characters'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid ISO 8601 date'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid ISO 8601 date'),
    query('minAccuracy')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Minimum accuracy must be a non-negative number'),
  ],

  getCurrentLocation: [
    param('deviceId')
      .isString()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Device ID must be between 1 and 50 characters'),
  ],

  getLocationById: [
    param('id')
      .isUUID()
      .withMessage('Location ID must be a valid UUID'),
  ],

  deleteLocation: [
    param('id')
      .isUUID()
      .withMessage('Location ID must be a valid UUID'),
  ],
};

