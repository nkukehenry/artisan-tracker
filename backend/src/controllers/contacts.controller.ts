import { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { container } from '../config/container';
import { ContactRepository, CreateContactData } from '../interfaces/media.interface';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticateToken, requireRole } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { BadRequestError, NotFoundError } from '../utils/error';

/**
 * @swagger
 * components:
 *   schemas:
 *     Contact:
 *       type: object
 *       required:
 *         - id
 *         - deviceId
 *         - name
 *         - phoneNumber
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the contact
 *         deviceId:
 *           type: string
 *           format: uuid
 *           description: ID of the device that owns this contact
 *         name:
 *           type: string
 *           description: Contact name
 *         phoneNumber:
 *           type: string
 *           description: Primary phone number
 *         email:
 *           type: string
 *           format: email
 *           description: Email address
 *         additionalPhoneNumbers:
 *           type: array
 *           items:
 *             type: string
 *           description: Additional phone numbers
 *         address:
 *           type: string
 *           description: Contact address
 *         company:
 *           type: string
 *           description: Company name
 *         notes:
 *           type: string
 *           description: Additional notes
 *         isEncrypted:
 *           type: boolean
 *           description: Whether the contact data is encrypted
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     CreateContactRequest:
 *       type: object
 *       required:
 *         - deviceId
 *         - name
 *         - phoneNumber
 *       properties:
 *         deviceId:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         additionalPhoneNumbers:
 *           type: array
 *           items:
 *             type: string
 *         address:
 *           type: string
 *         company:
 *           type: string
 *         notes:
 *           type: string
 *         isEncrypted:
 *           type: boolean
 *           default: false
 *     
 *     ContactsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Contact'
 *         pagination:
 *           $ref: '#/components/schemas/PaginationInfo'
 */

export class ContactsController {
  private contactRepository: ContactRepository;

  constructor() {
    this.contactRepository = container.getRepository<ContactRepository>('contactRepository');
  }

  /**
   * @swagger
   * /api/contacts:
   *   post:
   *     summary: Upload contacts from device
   *     tags: [Contacts]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               contacts:
   *                 type: array
   *                 items:
   *                   $ref: '#/components/schemas/CreateContactRequest'
   *     responses:
   *       201:
   *         description: Contacts uploaded successfully
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
   *                     $ref: '#/components/schemas/Contact'
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  uploadContacts = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Validation failed', errors.array());
    }

    const { contacts } = req.body;
    const userId = req.user?.id;

    if (!Array.isArray(contacts) || contacts.length === 0) {
      throw createError('contacts must be a non-empty array', 400);
    }

    const createdContacts = [];
    for (const contactData of contacts) {
      const contact: CreateContactData = {
        ...contactData,
        isEncrypted: contactData.isEncrypted ?? false,
      };
      
      const created = await this.contactRepository.create(contact);
      createdContacts.push(created);
    }

    res.status(201).json({
      success: true,
      message: `${createdContacts.length} contacts uploaded successfully`,
      data: createdContacts,
    });
  });

  /**
   * @swagger
   * /api/contacts/device/{deviceId}:
   *   get:
   *     summary: Get contacts for a specific device
   *     tags: [Contacts]
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
   *         name: search
   *         schema:
   *           type: string
   *         description: Search by name or phone number
   *     responses:
   *       200:
   *         description: Contacts retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ContactsResponse'
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  getContactsByDevice = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Validation failed', errors.array());
    }

    const { deviceId } = req.params;
    const { page = 1, limit = 20, search } = req.query;
    const userId = req.user?.id;

    const paginationOptions = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    };

    const filterOptions = {
      search: search as string,
    };

    const result = await this.contactRepository.findByDevice(
      deviceId,
      paginationOptions
    );

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  });

  /**
   * @swagger
   * /api/contacts/{id}:
   *   get:
   *     summary: Get a specific contact by ID
   *     tags: [Contacts]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Contact ID
   *     responses:
   *       200:
   *         description: Contact retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/Contact'
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  getContactById = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Validation failed', errors.array());
    }

    const { id } = req.params;
    const userId = req.user?.id;

    const contact = await this.contactRepository.findById(id);
    if (!contact) {
      throw new NotFoundError('Contact not found');
    }

    res.json({
      success: true,
      data: contact,
    });
  });

  /**
   * @swagger
   * /api/contacts/{id}:
   *   delete:
   *     summary: Delete a contact
   *     tags: [Contacts]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Contact ID
   *     responses:
   *       200:
   *         description: Contact deleted successfully
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
  deleteContact = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Validation failed', errors.array());
    }

    const { id } = req.params;
    const userId = req.user?.id;

    const contact = await this.contactRepository.findById(id);
    if (!contact) {
      throw new NotFoundError('Contact not found');
    }

    await this.contactRepository.delete(id);

    res.json({
      success: true,
      message: 'Contact deleted successfully',
    });
  });
}

// Validation rules for contacts endpoints
export const contactsValidation = {
  uploadContacts: [
    body('contacts')
      .isArray({ min: 1 })
      .withMessage('contacts must be a non-empty array'),
    body('contacts.*.deviceId')
      .isUUID()
      .withMessage('Device ID must be a valid UUID'),
    body('contacts.*.name')
      .isString()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Name must be between 1 and 100 characters'),
    body('contacts.*.phoneNumber')
      .isString()
      .trim()
      .isLength({ min: 1, max: 20 })
      .withMessage('Phone number must be between 1 and 20 characters'),
    body('contacts.*.email')
      .optional()
      .isEmail()
      .withMessage('Email must be a valid email address'),
    body('contacts.*.additionalPhoneNumbers')
      .optional()
      .isArray()
      .withMessage('Additional phone numbers must be an array'),
    body('contacts.*.additionalPhoneNumbers.*')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 20 })
      .withMessage('Additional phone number must be less than 20 characters'),
    body('contacts.*.address')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Address must be less than 200 characters'),
    body('contacts.*.company')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Company must be less than 100 characters'),
    body('contacts.*.notes')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Notes must be less than 500 characters'),
    body('contacts.*.isEncrypted')
      .optional()
      .isBoolean()
      .withMessage('isEncrypted must be a boolean'),
  ],

  getContactsByDevice: [
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
    query('search')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Search term must be less than 100 characters'),
  ],

  getContactById: [
    param('id')
      .isUUID()
      .withMessage('Contact ID must be a valid UUID'),
  ],

  deleteContact: [
    param('id')
      .isUUID()
      .withMessage('Contact ID must be a valid UUID'),
  ],
};
