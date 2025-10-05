import { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { container } from '../config/container';
import { ContactRepository, CreateContactData } from '../interfaces/media.interface';
import { IDeviceService } from '../interfaces/device.interface';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticateToken, requireRole } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { BadRequestError, NotFoundError } from '../utils/error';

// Swagger documentation removed - kept only in routes

export class ContactsController {
  private contactRepository: ContactRepository;
  private deviceService: IDeviceService;

  constructor() {
    this.contactRepository = container.getRepository<ContactRepository>('contactRepository');
    this.deviceService = container.getService<IDeviceService>('deviceService');
  }

  // Swagger documentation removed - kept only in routes
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
    const skippedContacts = [];
    
    for (const contactData of contacts) {
      // Look up device by deviceId to get the database ID
      const device = await this.deviceService.getDeviceByDeviceId(contactData.deviceId);
      if (!device) {
        throw new NotFoundError(`Device with deviceId '${contactData.deviceId}' not found`);
      }

      // Check for duplicate contact by phone number for this device
      if (contactData.phoneNumber) {
        const existingContacts = await this.contactRepository.findByPhoneNumber(
          contactData.phoneNumber, 
          contactData.deviceId
        );
        
        if (existingContacts.length > 0) {
          // Contact already exists for this device, skip it
          skippedContacts.push({
            phoneNumber: contactData.phoneNumber,
            name: contactData.name,
            reason: 'Contact already exists for this device'
          });
          continue;
        }
      }

      const contact: CreateContactData = {
        name: contactData.name,
        phoneNumber: contactData.phoneNumber,
        email: contactData.email,
        avatar: contactData.avatar,
        deviceId: device.id, // Use the database ID from the lookup
      };
      
      const created = await this.contactRepository.create(contact);
      createdContacts.push(created);
    }

    const responseMessage = skippedContacts.length > 0 
      ? `${createdContacts.length} contacts uploaded successfully, ${skippedContacts.length} duplicates skipped`
      : `${createdContacts.length} contacts uploaded successfully`;

    res.status(201).json({
      success: true,
      message: responseMessage,
      data: {
        created: createdContacts,
        skipped: skippedContacts,
        summary: {
          total: contacts.length,
          created: createdContacts.length,
          skipped: skippedContacts.length
        }
      },
    });
  });

  // Swagger documentation removed - kept only in routes
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

  // Swagger documentation removed - kept only in routes
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

  // Swagger documentation removed - kept only in routes
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
      .isString()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Device ID must be between 1 and 50 characters'),
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
    // isEncrypted validation removed - not in Prisma schema
  ],

  getContactsByDevice: [
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

