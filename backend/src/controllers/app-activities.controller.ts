import { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { Container } from '../config/container';
import { AppActivityRepository, CreateAppActivityData } from '../interfaces/app-activity.interface';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireAuth, requireRole } from '../middleware/auth';
import { BadRequestError, NotFoundError } from '../utils/error';

/**
 * @swagger
 * components:
 *   schemas:
 *     AppActivity:
 *       type: object
 *       required:
 *         - id
 *         - deviceId
 *         - appName
 *         - packageName
 *         - activityType
 *         - timestamp
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the app activity
 *         deviceId:
 *           type: string
 *           format: uuid
 *           description: ID of the device that recorded this activity
 *         appName:
 *           type: string
 *           description: Human-readable app name
 *         packageName:
 *           type: string
 *           description: Android package name or iOS bundle identifier
 *         activityType:
 *           type: string
 *           enum: [OPENED, CLOSED, INSTALLED, UNINSTALLED, UPDATED, PERMISSION_GRANTED, PERMISSION_DENIED]
 *           description: Type of app activity
 *         duration:
 *           type: integer
 *           minimum: 0
 *           description: Duration in seconds (for OPENED/CLOSED activities)
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: When the activity occurred
 *         metadata:
 *           type: object
 *           description: Additional activity-specific data
 *         isEncrypted:
 *           type: boolean
 *           description: Whether the activity data is encrypted
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     CreateAppActivityRequest:
 *       type: object
 *       required:
 *         - deviceId
 *         - appName
 *         - packageName
 *         - activityType
 *         - timestamp
 *       properties:
 *         deviceId:
 *           type: string
 *           format: uuid
 *         appName:
 *           type: string
 *         packageName:
 *           type: string
 *         activityType:
 *           type: string
 *           enum: [OPENED, CLOSED, INSTALLED, UNINSTALLED, UPDATED, PERMISSION_GRANTED, PERMISSION_DENIED]
 *         duration:
 *           type: integer
 *           minimum: 0
 *         timestamp:
 *           type: string
 *           format: date-time
 *         metadata:
 *           type: object
 *         isEncrypted:
 *           type: boolean
 *           default: false
 *     
 *     AppActivitiesResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AppActivity'
 *         pagination:
 *           $ref: '#/components/schemas/PaginationInfo'
 */

export class AppActivitiesController {
  private appActivityRepository: AppActivityRepository;

  constructor() {
    this.appActivityRepository = Container.getRepository<AppActivityRepository>('appActivityRepository');
  }

  /**
   * @swagger
   * /api/app-activities:
   *   post:
   *     summary: Upload app activities from device
   *     tags: [App Activities]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               appActivities:
   *                 type: array
   *                 items:
   *                   $ref: '#/components/schemas/CreateAppActivityRequest'
   *     responses:
   *       201:
   *         description: App activities uploaded successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/AppActivity'
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
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
        isEncrypted: activityData.isEncrypted ?? false,
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

  /**
   * @swagger
   * /api/app-activities/device/{deviceId}:
   *   get:
   *     summary: Get app activities for a specific device
   *     tags: [App Activities]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: deviceId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Device ID
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 20
   *         description: Number of items per page
   *       - in: query
   *         name: activityType
   *         schema:
   *           type: string
   *           enum: [OPENED, CLOSED, INSTALLED, UNINSTALLED, UPDATED, PERMISSION_GRANTED, PERMISSION_DENIED]
   *         description: Filter by activity type
   *       - in: query
   *         name: appName
   *         schema:
   *           type: string
   *         description: Filter by app name
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *           format: date-time
   *         description: Start date filter
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *           format: date-time
   *         description: End date filter
   *     responses:
   *       200:
   *         description: App activities retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AppActivitiesResponse'
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
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

  /**
   * @swagger
   * /api/app-activities/device/{deviceId}/summary:
   *   get:
   *     summary: Get app usage summary for a specific device
   *     tags: [App Activities]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: deviceId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Device ID
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *           format: date-time
   *         description: Start date for summary
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *           format: date-time
   *         description: End date for summary
   *     responses:
   *       200:
   *         description: App usage summary retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *                   properties:
   *                     totalApps:
   *                       type: integer
   *                     totalUsageTime:
   *                       type: integer
   *                       description: Total usage time in seconds
   *                     mostUsedApps:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           appName:
   *                             type: string
   *                           packageName:
   *                             type: string
   *                           usageTime:
   *                             type: integer
   *                           openCount:
   *                             type: integer
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
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

  /**
   * @swagger
   * /api/app-activities/{id}:
   *   get:
   *     summary: Get a specific app activity by ID
   *     tags: [App Activities]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: App activity ID
   *     responses:
   *       200:
   *         description: App activity retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/AppActivity'
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
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

  /**
   * @swagger
   * /api/app-activities/{id}:
   *   delete:
   *     summary: Delete an app activity
   *     tags: [App Activities]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: App activity ID
   *     responses:
   *       200:
   *         description: App activity deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
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
    body('appActivities.*.isEncrypted')
      .optional()
      .isBoolean()
      .withMessage('isEncrypted must be a boolean'),
  ],

  getAppActivitiesByDevice: [
    param('deviceId')
      .isUUID()
      .withMessage('Device ID must be a valid UUID'),
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
      .isUUID()
      .withMessage('Device ID must be a valid UUID'),
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
