import { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { container } from '../config/container';
import { CallLogRepository, CreateCallLogData } from '../interfaces/media.interface';
import { IDeviceService } from '../interfaces/device.interface';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticateToken, requireRole } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { BadRequestError, NotFoundError } from '../utils/error';

// Call Logs Controller - handles call log operations

export class CallLogsController {
  private callLogRepository: CallLogRepository;
  private deviceService: IDeviceService;

  constructor() {
    this.callLogRepository = container.getRepository<CallLogRepository>('callLogRepository');
    this.deviceService = container.getService<IDeviceService>('deviceService');
  }

  // Upload call logs from device
  uploadCallLogs = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Validation failed', errors.array());
    }

    const { callLogs } = req.body;
    const userId = req.user?.id;

    if (!Array.isArray(callLogs) || callLogs.length === 0) {
      throw createError('callLogs must be a non-empty array', 400);
    }

    const createdCallLogs = [];
    for (const callLogData of callLogs) {
      // Look up device by deviceId to get the database ID
      const device = await this.deviceService.getDeviceByDeviceId(callLogData.deviceId);
      if (!device) {
        throw new NotFoundError(`Device with deviceId '${callLogData.deviceId}' not found`);
      }

      const callLog: CreateCallLogData = {
        phoneNumber: callLogData.phoneNumber,
        contactName: callLogData.contactName,
        callType: callLogData.callType,
        duration: callLogData.duration,
        timestamp: new Date(callLogData.timestamp),
        isIncoming: callLogData.callType === 'INCOMING',
        deviceId: device.id, // Use the database ID from the lookup
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

  // Get call logs for a specific device
  getCallLogsByDevice = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Validation failed', errors.array());
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
      paginationOptions
    );

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  });

  // Get a specific call log by ID
  getCallLogById = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Validation failed', errors.array());
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

  // Delete a call log
  deleteCallLog = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Validation failed', errors.array());
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
      .isString()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Device ID must be between 1 and 50 characters'),
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
      .optional()
      .isInt({ min: 0 })
      .withMessage('Duration must be a non-negative integer'),
    body('callLogs.*.timestamp')
      .isISO8601()
      .withMessage('Timestamp must be a valid ISO 8601 date'),
    // isEncrypted validation removed - not in Prisma schema
  ],

  getCallLogsByDevice: [
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

