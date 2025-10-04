import { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { container } from '../config/container';
import { AppActivityRepository, CreateAppActivityData } from '../interfaces/app-activity.interface';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireAuth, requireRole } from '../middleware/auth';
import { BadRequestError, NotFoundError } from '../utils/error';

// App Activities Controller - handles app activity operations

export class AppActivitiesController {
  private appActivityRepository: AppActivityRepository;

  constructor() {
    this.appActivityRepository = container.getRepository<AppActivityRepository>('appActivityRepository');
  }

  // Swagger documentation removed - kept only in routes
  uploadAppActivities = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Validation failed', errors.array());
    }

    const { appActivities } = req.body;
    const userId = req.user?.id;

    if (!Array.isArray(appActivities) || appActivities.length === 0) {
      throw new BadRequestError('appActivities must be a non-empty array');
    }

    const createdAppActivities = [];
    for (const activityData of appActivities) {
      const activity: CreateAppActivityData = {
        ...activityData,
        // isEncrypted removed - not in Prisma schema
      };
      
      const created = await this.appActivityRepository.create(activity);
      createdAppActivities.push(created);
    }

    res.status(201).json({
      success: true,
      message: `${createdAppActivities.length} app activities uploaded successfully`,
      data: createdAppActivities,
    });
  });

  // Swagger documentation removed - kept only in routes
  getAppActivitiesByDevice = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Validation failed', errors.array());
    }

    const { deviceId } = req.params;
    const { page = 1, limit = 20, activityType, appName, startDate, endDate } = req.query;
    const userId = req.user?.id;

    const paginationOptions = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    };

    const filterOptions = {
      activityType: activityType as string,
      appName: appName as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    };

    const result = await this.appActivityRepository.findByDevice(
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
  getAppUsageSummary = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Validation failed', errors.array());
    }

    const { deviceId } = req.params;
    const { startDate, endDate } = req.query;
    const userId = req.user?.id;

    const filterOptions = {
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    };

    const summary = await this.appActivityRepository.getUsageSummary(deviceId, filterOptions);

    res.json({
      success: true,
      data: summary,
    });
  });

  // Swagger documentation removed - kept only in routes
  getAppActivityById = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Validation failed', errors.array());
    }

    const { id } = req.params;
    const userId = req.user?.id;

    const activity = await this.appActivityRepository.findById(id);
    if (!activity) {
      throw new NotFoundError('App activity not found');
    }

    res.json({
      success: true,
      data: activity,
    });
  });

  // Swagger documentation removed - kept only in routes
  deleteAppActivity = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Validation failed', errors.array());
    }

    const { id } = req.params;
    const userId = req.user?.id;

    const activity = await this.appActivityRepository.findById(id);
    if (!activity) {
      throw new NotFoundError('App activity not found');
    }

    await this.appActivityRepository.delete(id);

    res.json({
      success: true,
      message: 'App activity deleted successfully',
    });
  });
}

// Validation rules for app activities endpoints
export const appActivitiesValidation = {
  uploadAppActivities: [
    body('appActivities')
      .isArray({ min: 1 })
      .withMessage('appActivities must be a non-empty array'),
    body('appActivities.*.deviceId')
      .isUUID()
      .withMessage('Device ID must be a valid UUID'),
    body('appActivities.*.appName')
      .isString()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('App name must be between 1 and 100 characters'),
    body('appActivities.*.packageName')
      .isString()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Package name must be between 1 and 100 characters'),
    body('appActivities.*.activityType')
      .isIn(['OPENED', 'CLOSED', 'INSTALLED', 'UNINSTALLED', 'UPDATED', 'PERMISSION_GRANTED', 'PERMISSION_DENIED'])
      .withMessage('Invalid activity type'),
    body('appActivities.*.duration')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Duration must be a non-negative integer'),
    body('appActivities.*.timestamp')
      .isISO8601()
      .withMessage('Timestamp must be a valid ISO 8601 date'),
    body('appActivities.*.metadata')
      .optional()
      .isObject()
      .withMessage('Metadata must be an object'),
    // isEncrypted validation removed - not in Prisma schema
  ],

  getAppActivitiesByDevice: [
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
    query('activityType')
      .optional()
      .isIn(['OPENED', 'CLOSED', 'INSTALLED', 'UNINSTALLED', 'UPDATED', 'PERMISSION_GRANTED', 'PERMISSION_DENIED'])
      .withMessage('Invalid activity type filter'),
    query('appName')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 100 })
      .withMessage('App name filter must be less than 100 characters'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid ISO 8601 date'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid ISO 8601 date'),
  ],

  getAppUsageSummary: [
    param('deviceId')
      .isString()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Device ID must be between 1 and 50 characters'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid ISO 8601 date'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid ISO 8601 date'),
  ],

  getAppActivityById: [
    param('id')
      .isUUID()
      .withMessage('App activity ID must be a valid UUID'),
  ],

  deleteAppActivity: [
    param('id')
      .isUUID()
      .withMessage('App activity ID must be a valid UUID'),
  ],
};

