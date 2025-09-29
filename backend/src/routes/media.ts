import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';
import { MediaController, mediaValidation, upload } from '../controllers/media.controller';

const router = Router();
const mediaController = new MediaController();

// All media routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /media/upload:
 *   post:
 *     summary: Upload media file
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - deviceId
 *               - fileType
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Media file to upload
 *               deviceId:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *                 example: DEVICE-001
 *                 description: Device ID
 *               fileType:
 *                 type: string
 *                 enum: [PHOTO, VIDEO, AUDIO, DOCUMENT, OTHER]
 *                 example: PHOTO
 *                 description: Type of media file
 *     responses:
 *       201:
 *         description: Media file uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Media file uploaded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     mediaFile:
 *                       $ref: '#/components/schemas/MediaFile'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       413:
 *         description: File too large
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/upload', upload.single('file'), mediaValidation.uploadMedia, asyncHandler(mediaController.uploadMedia));

/**
 * @swagger
 * /media/device/{deviceId}:
 *   get:
 *     summary: Get media files for device
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 3
 *           maxLength: 50
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
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: fileType
 *         schema:
 *           type: string
 *           enum: [PHOTO, VIDEO, AUDIO, DOCUMENT, OTHER]
 *         description: Filter by file type
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for file name
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, fileName, fileSize]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Media files retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Media files retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MediaFile'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/device/:deviceId', mediaValidation.getDeviceMedia, asyncHandler(mediaController.getDeviceMedia));

/**
 * @swagger
 * /media/download/{mediaId}:
 *   get:
 *     summary: Download media file
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mediaId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Media file ID
 *     responses:
 *       200:
 *         description: File download
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *         headers:
 *           Content-Disposition:
 *             description: Attachment filename
 *             schema:
 *               type: string
 *               example: attachment; filename="photo.jpg"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       501:
 *         description: Media service not implemented
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/download/:mediaId', mediaValidation.downloadMedia, asyncHandler(mediaController.downloadMedia));

/**
 * @swagger
 * /media/{mediaId}:
 *   delete:
 *     summary: Delete media file
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mediaId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Media file ID
 *     responses:
 *       200:
 *         description: Media file deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       501:
 *         description: Media service not implemented
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:mediaId', mediaValidation.deleteMedia, asyncHandler(mediaController.deleteMedia));

/**
 * @swagger
 * /media/metadata/{mediaId}:
 *   get:
 *     summary: Get media file metadata
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mediaId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Media file ID
 *     responses:
 *       200:
 *         description: Media metadata retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Media metadata retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     mediaFile:
 *                       $ref: '#/components/schemas/MediaFile'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       501:
 *         description: Media service not implemented
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/metadata/:mediaId', mediaValidation.getMediaMetadata, asyncHandler(mediaController.getMediaMetadata));

export default router;
