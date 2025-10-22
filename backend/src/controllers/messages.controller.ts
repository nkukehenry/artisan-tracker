import { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { container } from '../config/container';
import { MessageRepository, CreateMessageData } from '../interfaces/message.interface';
import { IDeviceService } from '../interfaces/device.interface';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireAuth, requireRole } from '../middleware/auth';
import { BadRequestError, NotFoundError } from '../utils/error';

// Swagger documentation removed - kept only in routes

export class MessagesController {
  private messageRepository: MessageRepository;
  private deviceService: IDeviceService;

  constructor() {
    this.messageRepository = container.getRepository<MessageRepository>('messageRepository');
    this.deviceService = container.getService<IDeviceService>('deviceService');
  }

  // Swagger documentation removed - kept only in routes
  uploadMessages = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Validation failed', errors.array());
    }

    const { messages } = req.body;
    const userId = req.user?.id;

    if (!Array.isArray(messages) || messages.length === 0) {
      throw new BadRequestError('messages must be a non-empty array');
    }

    const createdMessages = [];
    for (const messageData of messages) {
      // Look up device by deviceId to get the database ID
      const device = await this.deviceService.getDeviceByDeviceId(messageData.deviceId);
      if (!device) {
        throw new NotFoundError(`Device with deviceId '${messageData.deviceId}' not found`);
      }

      const message: CreateMessageData = {
        deviceId: device.id, // Use the database ID from the lookup
        messageType: messageData.messageType,
        // platform removed - not in Prisma schema
        sender: messageData.sender,
        recipient: messageData.recipient,
        content: messageData.content,
        // direction removed - not in Prisma schema
        timestamp: messageData.timestamp,
        isRead: messageData.isRead ?? false,
        isIncoming: messageData.isIncoming ?? false,
        metadata: messageData.metadata,
        location: messageData.location,
        gpsCoordinates: messageData.gpsCoordinates,
        // isEncrypted: messageData.isEncrypted ?? false, // Removed as not in schema
      };

      const created = await this.messageRepository.create(message);
      createdMessages.push(created);
    }

    res.status(201).json({
      success: true,
      message: `${createdMessages.length} messages uploaded successfully`,
      data: createdMessages,
    });
  });

  // Swagger documentation removed - kept only in routes
  getMessagesByDevice = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Validation failed', errors.array());
    }

    const { deviceId } = req.params;
    const { page = 1, limit = 20, messageType, isIncoming, sender, startDate, endDate } = req.query;
    const userId = req.user?.id;

    const paginationOptions = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    };

    const filterOptions = {
      messageType: messageType as string,
      isIncoming: isIncoming !== undefined ? isIncoming === 'true' : undefined,
      sender: sender as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    };

    const result = await this.messageRepository.findByDevice(
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
  getMessageConversations = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Validation failed', errors.array());
    }

    const { deviceId } = req.params;
    const { page = 1, limit = 20, messageType } = req.query;
    const userId = req.user?.id;

    const paginationOptions = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    };

    const filterOptions = {
      messageType: messageType as string,
    };

    const conversations = await this.messageRepository.getConversations(
      deviceId,
      paginationOptions,
      filterOptions
    );

    res.json({
      success: true,
      data: conversations,
    });
  });

  // Swagger documentation removed - kept only in routes
  getMessageById = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Validation failed', errors.array());
    }

    const { id } = req.params;
    const userId = req.user?.id;

    const message = await this.messageRepository.findById(id);
    if (!message) {
      throw new NotFoundError('Message not found');
    }

    res.json({
      success: true,
      data: message,
    });
  });

  // Swagger documentation removed - kept only in routes
  deleteMessage = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Validation failed', errors.array());
    }

    const { id } = req.params;
    const userId = req.user?.id;

    const message = await this.messageRepository.findById(id);
    if (!message) {
      throw new NotFoundError('Message not found');
    }

    await this.messageRepository.delete(id);

    res.json({
      success: true,
      message: 'Message deleted successfully',
    });
  });
}

// Validation rules for messages endpoints
export const messagesValidation = {
  uploadMessages: [
    body('messages')
      .isArray({ min: 1 })
      .withMessage('messages must be a non-empty array'),
    body('messages.*.deviceId')
      .isString()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Device ID must be between 1 and 50 characters'),
    body('messages.*.messageType')
      .isIn(['SMS', 'WHATSAPP', 'TELEGRAM', 'FACEBOOK', 'INSTAGRAM', 'TWITTER', 'EMAIL', 'OTHER'])
      .withMessage('Invalid message type'),
    body('messages.*.platform')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Platform must be less than 50 characters'),
    body('messages.*.sender')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Sender must be less than 100 characters'),
    body('messages.*.recipient')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Recipient must be less than 100 characters'),
    body('messages.*.content')
      .isString()
      .trim()
      .isLength({ min: 1, max: 10000 })
      .withMessage('Content must be between 1 and 10000 characters'),
    body('messages.*.direction')
      .optional()
      .isIn(['INCOMING', 'OUTGOING'])
      .withMessage('Direction must be INCOMING or OUTGOING'),
    body('messages.*.timestamp')
      .isISO8601()
      .withMessage('Timestamp must be a valid ISO 8601 date'),
    body('messages.*.isRead')
      .optional()
      .isBoolean()
      .withMessage('isRead must be a boolean'),
    body('messages.*.metadata')
      .optional()
      .isObject()
      .withMessage('Metadata must be an object'),
    // isEncrypted validation removed - not in Prisma schema
  ],

  getMessagesByDevice: [
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
    query('messageType')
      .optional()
      .isIn(['SMS', 'WHATSAPP', 'TELEGRAM', 'FACEBOOK', 'INSTAGRAM', 'TWITTER', 'EMAIL', 'OTHER'])
      .withMessage('Invalid message type filter'),
    query('isIncoming')
      .optional()
      .isBoolean()
      .withMessage('isIncoming must be a boolean value'),
    query('sender')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Sender filter must be less than 100 characters'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid ISO 8601 date'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid ISO 8601 date'),
  ],

  getMessageConversations: [
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
    query('messageType')
      .optional()
      .isIn(['SMS', 'WHATSAPP', 'TELEGRAM', 'FACEBOOK', 'INSTAGRAM', 'TWITTER', 'EMAIL', 'OTHER'])
      .withMessage('Invalid message type filter'),
  ],

  getMessageById: [
    param('id')
      .isUUID()
      .withMessage('Message ID must be a valid UUID'),
  ],

  deleteMessage: [
    param('id')
      .isUUID()
      .withMessage('Message ID must be a valid UUID'),
  ],
};

