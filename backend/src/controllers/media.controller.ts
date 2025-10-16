import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { container } from '../config/container';
import { logger } from '../config/logger';
import { createError } from '../utils/error';
import { IMediaService } from '../interfaces/media.interface';
import { MediaType } from '../interfaces/media.interface';
import { IDeviceService } from '../interfaces/device.interface';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export class MediaController {
  private mediaService: IMediaService;
  private deviceService: IDeviceService;

  constructor() {
    this.mediaService = container.getService<IMediaService>('mediaService');
    this.deviceService = container.getService<IDeviceService>('deviceService');
  }

  /**
   * Upload media file
   */
  public uploadMedia = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createError('Validation failed', 400, errors.array());
      }

      const user = (req as any).user;
      const { deviceId, fileType, callId, location, gpsCoordinates } = req.body;
      const file = req.file;

      if (!file) {
        throw createError('No file uploaded', 400);
      }

      // Check if device exists and user has access
      const device = await this.deviceService.getDeviceByDeviceId(deviceId);
      if (!device) {
        throw createError('Device not found', 404);
      }

      if (device.userId !== user.id && user.role !== 'SUPER_ADMIN') {
        throw createError('Access denied', 403);
      }

      // Create media file record using MediaService
      const mediaFileData = {
        callId: callId || undefined,
        fileName: file.filename,
        filePath: file.path,
        fileSize: BigInt(file.size),
        mimeType: file.mimetype,
        fileType: fileType as MediaType,
        metadata: {
          originalName: file.originalname,
          uploadedAt: new Date().toISOString(),
          uploadedBy: user.id,
        },
        isEncrypted: false,
        location: location || undefined,
        gpsCoordinates: gpsCoordinates || undefined,
        deviceId: device.id,
      };

      const mediaFile = await this.mediaService.uploadMedia(mediaFileData, user.tenantId, user.id);

      logger.info('Media file uploaded successfully', { 
        fileName: file.filename, 
        deviceId, 
        userId: user.id,
        fileSize: file.size 
      });

      res.status(201).json({
        success: true,
        message: 'Media file uploaded successfully',
        data: { 
          mediaFile: JSON.parse(
            JSON.stringify(mediaFile, (key, value) =>
              typeof value === 'bigint' ? value.toString() : value
            )
          )
        },
      });
    } catch (error) {
      logger.error('Media upload failed', { error, body: req.body });
      next(error);
    }
  };

  /**
   * Get media files for device
   */
  public getDeviceMedia = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { deviceId } = req.params;
      const user = (req as any).user;
      const { page = 1, limit = 10, fileType, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

      // Check if device exists and user has access
      const device = await this.deviceService.getDeviceByDeviceId(deviceId);
      if (!device) {
        throw createError('Device not found', 404);
      }

      if (device.userId !== user.id && user.role !== 'SUPER_ADMIN') {
        throw createError('Access denied', 403);
      }

      // Get media files using MediaService
      const options = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        fileType: fileType as string,
      };

      const mediaFiles = await this.mediaService.getMediaByDevice(deviceId, user.tenantId, options);

      res.status(200).json({
        success: true,
        message: 'Media files retrieved successfully',
        data: JSON.parse(
          JSON.stringify(mediaFiles, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
          )
        ),
      });
    } catch (error) {
      logger.error('Get device media failed', { error, deviceId: req.params.deviceId });
      next(error);
    }
  };

  /**
   * Download media file
   */
  public downloadMedia = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createError('Validation failed', 400, errors.array());
      }

      const { mediaId } = req.params;
      const user = (req as any).user;

      // This would be implemented in a MediaService
      // For now, return error as media service is not implemented
      throw createError('Media service not implemented', 501);

      // Mock implementation structure:
      // const mediaFile = await mediaService.getMediaById(mediaId);
      // if (!mediaFile) {
      //   throw createError('Media file not found', 404);
      // }
      // 
      // // Check access permissions
      // const device = await deviceService.getDeviceById(mediaFile.deviceId);
      // if (device.userId !== user.id && user.role !== 'SUPER_ADMIN') {
      //   throw createError('Access denied', 403);
      // }
      // 
      // // Check if file exists
      // if (!fs.existsSync(mediaFile.filePath)) {
      //   throw createError('File not found on disk', 404);
      // }
      // 
      // res.setHeader('Content-Type', mediaFile.mimeType);
      // res.setHeader('Content-Disposition', `attachment; filename="${mediaFile.fileName}"`);
      // res.sendFile(path.resolve(mediaFile.filePath));

    } catch (error) {
      logger.error('Download media failed', { error, mediaId: req.params.mediaId });
      next(error);
    }
  };

  /**
   * Delete media file
   */
  public deleteMedia = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createError('Validation failed', 400, errors.array());
      }

      const { mediaId } = req.params;
      const user = (req as any).user;

      // This would be implemented in a MediaService
      // For now, return error as media service is not implemented
      throw createError('Media service not implemented', 501);

      // Mock implementation structure:
      // const mediaFile = await mediaService.getMediaById(mediaId);
      // if (!mediaFile) {
      //   throw createError('Media file not found', 404);
      // }
      // 
      // // Check access permissions
      // const device = await deviceService.getDeviceById(mediaFile.deviceId);
      // if (device.userId !== user.id && user.role !== 'SUPER_ADMIN') {
      //   throw createError('Access denied', 403);
      // }
      // 
      // // Delete file from disk
      // if (fs.existsSync(mediaFile.filePath)) {
      //   fs.unlinkSync(mediaFile.filePath);
      // }
      // 
      // // Delete record from database
      // await mediaService.deleteMedia(mediaId);
      // 
      // logger.info('Media file deleted successfully', { mediaId, userId: user.id });
      // 
      // res.status(200).json({
      //   success: true,
      //   message: 'Media file deleted successfully',
      // });

    } catch (error) {
      logger.error('Delete media failed', { error, mediaId: req.params.mediaId });
      next(error);
    }
  };

  /**
   * Get media file metadata
   */
  public getMediaMetadata = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createError('Validation failed', 400, errors.array());
      }

      const { mediaId } = req.params;
      const user = (req as any).user;

      // This would be implemented in a MediaService
      // For now, return error as media service is not implemented
      throw createError('Media service not implemented', 501);

      // Mock implementation structure:
      // const mediaFile = await mediaService.getMediaById(mediaId);
      // if (!mediaFile) {
      //   throw createError('Media file not found', 404);
      // }
      // 
      // // Check access permissions
      // const device = await deviceService.getDeviceById(mediaFile.deviceId);
      // if (device.userId !== user.id && user.role !== 'SUPER_ADMIN') {
      //   throw createError('Access denied', 403);
      // }
      // 
      // res.status(200).json({
      //   success: true,
      //   message: 'Media metadata retrieved successfully',
      //   data: { mediaFile },
      // });

    } catch (error) {
      logger.error('Get media metadata failed', { error, mediaId: req.params.mediaId });
      next(error);
    }
  };
}

// Multer configuration for file uploads
export const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = process.env.UPLOAD_PATH || './uploads';
      const mediaType = req.body.fileType || 'OTHER';
      const fullPath = path.join(uploadPath, mediaType.toLowerCase());
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
      
      cb(null, fullPath);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  }),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes: { [key: string]: string[] } = {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'video/mp4': ['.mp4'],
      'video/avi': ['.avi'],
      'video/mov': ['.mov'],
      'audio/mp3': ['.mp3'],
      'audio/wav': ['.wav'],
      'audio/m4a': ['.m4a'],
    };

    const fileType = file.mimetype;
    const fileExt = path.extname(file.originalname).toLowerCase();

    if (allowedTypes[fileType] && allowedTypes[fileType].includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${fileType} is not allowed`) as any, false);
    }
  },
});

// Validation rules for media endpoints
export const mediaValidation = {
  uploadMedia: [
    body('deviceId')
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('Device ID must be between 3 and 50 characters'),
    body('fileType')
      .isIn(['PHOTO', 'VIDEO', 'AUDIO', 'DOCUMENT', 'OTHER'])
      .withMessage('Invalid file type'),
  ],

  getDeviceMedia: [
    param('deviceId')
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('Device ID must be between 3 and 50 characters'),
    query('fileType')
      .optional()
      .isIn(['PHOTO', 'VIDEO', 'AUDIO', 'DOCUMENT', 'OTHER'])
      .withMessage('Invalid file type filter'),
  ],

  downloadMedia: [
    param('mediaId')
      .isUUID()
      .withMessage('Media ID must be a valid UUID'),
  ],

  deleteMedia: [
    param('mediaId')
      .isUUID()
      .withMessage('Media ID must be a valid UUID'),
  ],

  getMediaMetadata: [
    param('mediaId')
      .isUUID()
      .withMessage('Media ID must be a valid UUID'),
  ],
};

