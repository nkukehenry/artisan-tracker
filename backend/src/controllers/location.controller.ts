import { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { Container } from '../config/container';
import { LocationRepository, CreateLocationData } from '../interfaces/location.interface';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireAuth, requireRole } from '../middleware/auth';
import { BadRequestError, NotFoundError } from '../utils/error';

/**
 * @swagger
 * components:
 *   schemas:
 *     Location:
 *       type: object
 *       required:
 *         - id
 *         - deviceId
 *         - latitude
 *         - longitude
 *         - accuracy
 *         - timestamp
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the location entry
 *         deviceId:
 *           type: string
 *           format: uuid
 *           description: ID of the device that reported this location
 *         latitude:
 *           type: number
 *           format: double
 *           minimum: -90
 *           maximum: 90
 *           description: Latitude coordinate
 *         longitude:
 *           type: number
 *           format: double
 *           minimum: -180
 *           maximum: 180
 *           description: Longitude coordinate
 *         accuracy:
 *           type: number
 *           format: float
 *           minimum: 0
 *           description: Location accuracy in meters
 *         altitude:
 *           type: number
 *           format: float
 *           description: Altitude in meters
 *         speed:
 *           type: number
 *           format: float
 *           minimum: 0
 *           description: Speed in meters per second
 *         heading:
 *           type: number
 *           format: float
 *           minimum: 0
 *           maximum: 360
 *           description: Direction of travel in degrees
 *         address:
 *           type: string
 *           description: Human-readable address
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: When the location was recorded
 *         isEncrypted:
 *           type: boolean
 *           description: Whether the location data is encrypted
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     CreateLocationRequest:
 *       type: object
 *       required:
 *         - deviceId
 *         - latitude
 *         - longitude
 *         - accuracy
 *         - timestamp
 *       properties:
 *         deviceId:
 *           type: string
 *           format: uuid
 *         latitude:
 *           type: number
 *           format: double
 *           minimum: -90
 *           maximum: 90
 *         longitude:
 *           type: number
 *           format: double
 *           minimum: -180
 *           maximum: 180
 *         accuracy:
 *           type: number
 *           format: float
 *           minimum: 0
 *         altitude:
 *           type: number
 *           format: float
 *         speed:
 *           type: number
 *           format: float
 *           minimum: 0
 *         heading:
 *           type: number
 *           format: float
 *           minimum: 0
 *           maximum: 360
 *         address:
 *           type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 *         isEncrypted:
 *           type: boolean
 *           default: false
 *     
 *     LocationsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Location'
 *         pagination:
 *           $ref: '#/components/schemas/PaginationInfo'
 */

export class LocationController {
  private locationRepository: LocationRepository;

  constructor() {
    this.locationRepository = Container.getRepository<LocationRepository>('locationRepository');
  }

  /**
   * @swagger
   * /api/locations:
   *   post:
   *     summary: Upload location data from device
   *     tags: [Location]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               locations:
   *                 type: array
   *                 items:
   *                   $ref: '#/components/schemas/CreateLocationRequest'
   *     responses:
   *       201:
   *         description: Location data uploaded successfully
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
   *                     $ref: '#/components/schemas/Location'
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
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
      const location: CreateLocationData = {
        ...locationData,
        isEncrypted: locationData.isEncrypted ?? false,
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

  /**
   * @swagger
   * /api/locations/device/{deviceId}:
   *   get:
   *     summary: Get location history for a specific device
   *     tags: [Location]
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
   *       - in: query
   *         name: minAccuracy
   *         schema:
   *           type: number
   *           format: float
   *         description: Minimum accuracy filter (in meters)
   *     responses:
   *       200:
   *         description: Location history retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/LocationsResponse'
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
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

  /**
   * @swagger
   * /api/locations/device/{deviceId}/current:
   *   get:
   *     summary: Get current location for a specific device
   *     tags: [Location]
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
   *     responses:
   *       200:
   *         description: Current location retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/Location'
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
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

  /**
   * @swagger
   * /api/locations/{id}:
   *   get:
   *     summary: Get a specific location entry by ID
   *     tags: [Location]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Location ID
   *     responses:
   *       200:
   *         description: Location entry retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/Location'
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
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

  /**
   * @swagger
   * /api/locations/{id}:
   *   delete:
   *     summary: Delete a location entry
   *     tags: [Location]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Location ID
   *     responses:
   *       200:
   *         description: Location entry deleted successfully
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
      .isUUID()
      .withMessage('Device ID must be a valid UUID'),
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
    body('locations.*.isEncrypted')
      .optional()
      .isBoolean()
      .withMessage('isEncrypted must be a boolean'),
  ],

  getLocationsByDevice: [
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
      .isUUID()
      .withMessage('Device ID must be a valid UUID'),
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
