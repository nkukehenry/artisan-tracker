import { Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { container } from '../config/container';
import { CallLogRepository, CreateCallLogData } from '../interfaces/media.interface';
import { asyncHandler } from '../middleware/asyncHandler';
import { AuthenticatedRequest, authenticateToken, requireRole } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

/**
 * @swagger
 * components:
 *   schemas:
 *     CallLog:
 *       type: object
 *       required:
 *         - id
 *         - deviceId
 *         - phoneNumber
 *         - callType
 *         - duration
 *         - timestamp
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the call log
 *         deviceId:
 *           type: string
 *           format: uuid
 *           description: ID of the device that made/received the call
 *         phoneNumber:
 *           type: string
 *           description: Phone number involved in the call
 *         contactName:
 *           type: string
 *           description: Name of the contact (if available)
 *         callType:
 *           type: string
 *           enum: [INCOMING, OUTGOING, MISSED]
 *           description: Type of call
 *         duration:
 *           type: integer
 *           minimum: 0
 *           description: Call duration in seconds
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: When the call occurred
 *         isEncrypted:
 *           type: boolean
 *           description: Whether the call log is encrypted
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     CreateCallLogRequest:
 *       type: object
 *       required:
 *         - deviceId
 *         - phoneNumber
 *         - callType
 *         - duration
 *         - timestamp
 *       properties:
 *         deviceId:
 *           type: string
 *           format: uuid
 *         phoneNumber:
 *           type: string
 *         contactName:
 *           type: string
 *         callType:
 *           type: string
 *           enum: [INCOMING, OUTGOING, MISSED]
 *         duration:
 *           type: integer
 *           minimum: 0
 *         timestamp:
 *           type: string
 *           format: date-time
 *         isEncrypted:
 *           type: boolean
 *           default: false
 *     
 *     CallLogsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CallLog'
 *         pagination:
 *           $ref: '#/components/schemas/PaginationInfo'
 */

export class CallLogsController {
  private callLogRepository: CallLogRepository;

  constructor() {
    this.callLogRepository = container.getRepository<CallLogRepository>('callLogRepository');
  }

  /**
   * @swagger
   * /api/call-logs:
   *   post:
   *     summary: Upload call logs from device
   *     tags: [Call Logs]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               callLogs:
   *                 type: array
   *                 items:
   *                   $ref: '#/components/schemas/CreateCallLogRequest'
   *     responses:
   *       201:
   *         description: Call logs uploaded successfully
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
   *                     $ref: '#/components/schemas/CallLog'
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  uploadCallLogs = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Validation failed', 400, errors.array());
    }

    const { callLogs } = req.body;
    const userId = req.user?.id;

    if (!Array.isArray(callLogs) || callLogs.length === 0) {
      throw createError('callLogs must be a non-empty array', 400);
    }

    const createdCallLogs = [];
    for (const callLogData of callLogs) {
      const callLog: CreateCallLogData = {
        ...callLogData,
        isEncrypted: callLogData.isEncrypted ?? false,
      };
      
      const created = await this.callLogRepository.create(callLog);
      createdCallLogs.push(created);
    }

    res.status(201).json({
      success: true,
      message: `${createdCallLogs.length} call logs uploaded successfully`,
      data: createdCallLogs,
    });
  });

  /**
   * @swagger
   * /api/call-logs/device/{deviceId}:
   *   get:
   *     summary: Get call logs for a specific device
   *     tags: [Call Logs]
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
   *         name: callType
   *         schema:
   *           type: string
   *           enum: [INCOMING, OUTGOING, MISSED]
   *         description: Filter by call type
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
   *         description: Call logs retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CallLogsResponse'
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  getCallLogsByDevice = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Validation failed', 400, errors.array());
    }

    const { deviceId } = req.params;
    const { page = 1, limit = 20, callType, startDate, endDate } = req.query;
    const userId = req.user?.id;

    const paginationOptions = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    };

    const filterOptions = {
      callType: callType as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    };

    const result = await this.callLogRepository.findByDevice(
      deviceId,
      paginationOptions,
      filterOptions
    );

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  });

  /**
   * @swagger
   * /api/call-logs/{id}:
   *   get:
   *     summary: Get a specific call log by ID
   *     tags: [Call Logs]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Call log ID
   *     responses:
   *       200:
   *         description: Call log retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/CallLog'
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  getCallLogById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Validation failed', 400, errors.array());
    }

    const { id } = req.params;
    const userId = req.user?.id;

    const callLog = await this.callLogRepository.findById(id);
    if (!callLog) {
      throw createError('Call log not found', 404);
    }

    res.json({
      success: true,
      data: callLog,
    });
  });

  /**
   * @swagger
   * /api/call-logs/{id}:
   *   delete:
   *     summary: Delete a call log
   *     tags: [Call Logs]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Call log ID
   *     responses:
   *       200:
   *         description: Call log deleted successfully
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
  deleteCallLog = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Validation failed', 400, errors.array());
    }

    const { id } = req.params;
    const userId = req.user?.id;

    const callLog = await this.callLogRepository.findById(id);
    if (!callLog) {
      throw createError('Call log not found', 404);
    }

    await this.callLogRepository.delete(id);

    res.json({
      success: true,
      message: 'Call log deleted successfully',
    });
  });
}

// Validation rules for call logs endpoints
export const callLogsValidation = {
  uploadCallLogs: [
    body('callLogs')
      .isArray({ min: 1 })
      .withMessage('callLogs must be a non-empty array'),
    body('callLogs.*.deviceId')
      .isUUID()
      .withMessage('Device ID must be a valid UUID'),
    body('callLogs.*.phoneNumber')
      .isString()
      .trim()
      .isLength({ min: 1, max: 20 })
      .withMessage('Phone number must be between 1 and 20 characters'),
    body('callLogs.*.contactName')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Contact name must be less than 100 characters'),
    body('callLogs.*.callType')
      .isIn(['INCOMING', 'OUTGOING', 'MISSED'])
      .withMessage('Call type must be INCOMING, OUTGOING, or MISSED'),
    body('callLogs.*.duration')
      .isInt({ min: 0 })
      .withMessage('Duration must be a non-negative integer'),
    body('callLogs.*.timestamp')
      .isISO8601()
      .withMessage('Timestamp must be a valid ISO 8601 date'),
    body('callLogs.*.isEncrypted')
      .optional()
      .isBoolean()
      .withMessage('isEncrypted must be a boolean'),
  ],

  getCallLogsByDevice: [
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
    query('callType')
      .optional()
      .isIn(['INCOMING', 'OUTGOING', 'MISSED'])
      .withMessage('Invalid call type filter'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid ISO 8601 date'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid ISO 8601 date'),
  ],

  getCallLogById: [
    param('id')
      .isUUID()
      .withMessage('Call log ID must be a valid UUID'),
  ],

  deleteCallLog: [
    param('id')
      .isUUID()
      .withMessage('Call log ID must be a valid UUID'),
  ],
};
