import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';
import { AppActivitiesController, appActivitiesValidation } from '../controllers/app-activities.controller';

const router = Router();

const appActivitiesController = new AppActivitiesController();

// All app activities routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /app-activities/upload:
 *   post:
 *     summary: Upload app activities data
 *     tags: [App Activities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceId
 *               - appActivities
 *             properties:
 *               deviceId:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *                 example: DEVICE-001
 *                 description: Device ID
 *               appActivities:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/AppActivity'
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: App activities uploaded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     uploadedCount:
 *                       type: integer
 *                       example: 8
 *                     appActivities:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AppActivity'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post('/upload', appActivitiesValidation.uploadAppActivities, asyncHandler(appActivitiesController.uploadAppActivities));

/**
 * @swagger
 * /app-activities/device/{deviceId}:
 *   get:
 *     summary: Get app activities for device
 *     tags: [App Activities]
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
 *         name: appName
 *         schema:
 *           type: string
 *         description: Filter by app name
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter activities from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter activities until this date
 *     responses:
 *       200:
 *         description: App activities retrieved successfully
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
 *                   example: App activities retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AppActivity'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/device/:deviceId', appActivitiesValidation.getAppActivitiesByDevice, asyncHandler(appActivitiesController.getAppActivitiesByDevice));

/**
 * @swagger
 * /app-activities/device/{deviceId}/summary:
 *   get:
 *     summary: Get app usage summary for device
 *     tags: [App Activities]
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
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Summary from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Summary until this date
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: App usage summary retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     summary:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           appName:
 *                             type: string
 *                             example: "WhatsApp"
 *                           totalUsageTime:
 *                             type: integer
 *                             example: 3600
 *                           sessionCount:
 *                             type: integer
 *                             example: 15
 *                           lastUsed:
 *                             type: string
 *                             format: date-time
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/device/:deviceId/summary', appActivitiesValidation.getAppUsageSummary, asyncHandler(appActivitiesController.getAppUsageSummary));

/**
 * @swagger
 * /app-activities/{id}:
 *   get:
 *     summary: Get app activity by ID
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: App activity retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     appActivity:
 *                       $ref: '#/components/schemas/AppActivity'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     summary: Delete app activity
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: App activity deleted successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
/**
 * @swagger
 * /app-activities/{id}:
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
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/AppActivity'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "App activity deleted successfully"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', appActivitiesValidation.getAppActivityById, asyncHandler(appActivitiesController.getAppActivityById));
router.delete('/:id', appActivitiesValidation.deleteAppActivity, asyncHandler(appActivitiesController.deleteAppActivity));

export default router;
