import { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { container } from '../config/container';
import { MessageRepository, CreateMessageData } from '../interfaces/message.interface';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireAuth, requireRole } from '../middleware/auth';
import { BadRequestError, NotFoundError } from '../utils/error';

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       required:
 *         - id
 *         - deviceId
 *         - messageType
 *         - content
 *         - timestamp
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the message
 *         deviceId:
 *           type: string
 *           format: uuid
 *           description: ID of the device that received/sent this message
 *         messageType:
 *           type: string
 *           enum: [SMS, WHATSAPP, TELEGRAM, FACEBOOK, INSTAGRAM, TWITTER, EMAIL, OTHER]
 *           description: Type of messaging platform
 *         platform:
 *           type: string
 *           description: Specific messaging platform name
 *         sender:
 *           type: string
 *           description: Sender identifier (phone number, username, email)
 *         recipient:
 *           type: string
 *           description: Recipient identifier (phone number, username, email)
 *         content:
 *           type: string
 *           description: Message content
 *         direction:
 *           type: string
 *           enum: [INCOMING, OUTGOING]
 *           description: Message direction
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: When the message was sent/received
 *         isRead:
 *           type: boolean
 *           description: Whether the message has been read
 *         metadata:
 *           type: object
 *           description: Additional message-specific data
 *         isEncrypted:
 *           type: boolean
 *           description: Whether the message content is encrypted
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     CreateMessageRequest:
 *       type: object
 *       required:
 *         - deviceId
 *         - messageType
 *         - content
 *         - timestamp
 *       properties:
 *         deviceId:
 *           type: string
 *           format: uuid
 *         messageType:
 *           type: string
 *           enum: [SMS, WHATSAPP, TELEGRAM, FACEBOOK, INSTAGRAM, TWITTER, EMAIL, OTHER]
 *         platform:
 *           type: string
 *         sender:
 *           type: string
 *         recipient:
 *           type: string
 *         content:
 *           type: string
 *         direction:
 *           type: string
 *           enum: [INCOMING, OUTGOING]
 *         timestamp:
 *           type: string
 *           format: date-time
 *         isRead:
 *           type: boolean
 *           default: false
 *         metadata:
 *           type: object
 *         isEncrypted:
 *           type: boolean
 *           default: false
 *     
 *     MessagesResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Message'
 *         pagination:
 *           $ref: '#/components/schemas/PaginationInfo'
 */

export class MessagesController {
  private messageRepository: MessageRepository;

  constructor() {
    this.messageRepository = container.getRepository<MessageRepository>('messageRepository');
  }

  /**
   * @swagger
   * /api/messages:
   *   post:
   *     summary: Upload messages from device
   *     tags: [Messages]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               messages:
   *                 type: array
   *                 items:
   *                   $ref: '#/components/schemas/CreateMessageRequest'
   *     responses:
   *       201:
   *         description: Messages uploaded successfully
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
   *                     $ref: '#/components/schemas/Message'
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
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
      const message: CreateMessageData = {
        ...messageData,
        isEncrypted: messageData.isEncrypted ?? false,
        isRead: messageData.isRead ?? false,
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

  /**
   * @swagger
   * /api/messages/device/{deviceId}:
   *   get:
   *     summary: Get messages for a specific device
   *     tags: [Messages]
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
   *         name: messageType
   *         schema:
   *           type: string
   *           enum: [SMS, WHATSAPP, TELEGRAM, FACEBOOK, INSTAGRAM, TWITTER, EMAIL, OTHER]
   *         description: Filter by message type
   *       - in: query
   *         name: direction
   *         schema:
   *           type: string
   *           enum: [INCOMING, OUTGOING]
   *         description: Filter by message direction
   *       - in: query
   *         name: sender
   *         schema:
   *           type: string
   *         description: Filter by sender
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
   *         description: Messages retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/MessagesResponse'
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  getMessagesByDevice = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Validation failed', errors.array());
    }

    const { deviceId } = req.params;
    const { page = 1, limit = 20, messageType, direction, sender, startDate, endDate } = req.query;
    const userId = req.user?.id;

    const paginationOptions = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    };

    const filterOptions = {
      messageType: messageType as string,
      direction: direction as string,
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

  /**
   * @swagger
   * /api/messages/device/{deviceId}/conversations:
   *   get:
   *     summary: Get message conversations for a specific device
   *     tags: [Messages]
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
   *         name: messageType
   *         schema:
   *           type: string
   *           enum: [SMS, WHATSAPP, TELEGRAM, FACEBOOK, INSTAGRAM, TWITTER, EMAIL, OTHER]
   *         description: Filter by message type
   *     responses:
   *       200:
   *         description: Message conversations retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       contact:
   *                         type: string
   *                       messageType:
   *                         type: string
   *                       lastMessage:
   *                         type: string
   *                       lastMessageTime:
   *                         type: string
   *                         format: date-time
   *                       messageCount:
   *                         type: integer
   *                       unreadCount:
   *                         type: integer
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
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

  /**
   * @swagger
   * /api/messages/{id}:
   *   get:
   *     summary: Get a specific message by ID
   *     tags: [Messages]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Message ID
   *     responses:
   *       200:
   *         description: Message retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/Message'
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
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

  /**
   * @swagger
   * /api/messages/{id}:
   *   delete:
   *     summary: Delete a message
   *     tags: [Messages]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Message ID
   *     responses:
   *       200:
   *         description: Message deleted successfully
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
      .isUUID()
      .withMessage('Device ID must be a valid UUID'),
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
    body('messages.*.isEncrypted')
      .optional()
      .isBoolean()
      .withMessage('isEncrypted must be a boolean'),
  ],

  getMessagesByDevice: [
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
    query('messageType')
      .optional()
      .isIn(['SMS', 'WHATSAPP', 'TELEGRAM', 'FACEBOOK', 'INSTAGRAM', 'TWITTER', 'EMAIL', 'OTHER'])
      .withMessage('Invalid message type filter'),
    query('direction')
      .optional()
      .isIn(['INCOMING', 'OUTGOING'])
      .withMessage('Invalid direction filter'),
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
