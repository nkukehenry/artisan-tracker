import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';
import { TelemetryController, telemetryValidation } from '../controllers/telemetry.controller';

const router = Router();
const telemetryController = new TelemetryController();

/**
 * @swagger
 * /telemetry/call-home:
 *   post:
 *     summary: Device call-home endpoint - Submit telemetry data
 *     tags: [Telemetry]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTelemetryRequest'
 *     responses:
 *       201:
 *         description: Telemetry data received successfully
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
 *                   example: Telemetry data received successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     telemetry:
 *                       $ref: '#/components/schemas/Telemetry'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/call-home', authenticateToken, telemetryValidation.callHome, asyncHandler(telemetryController.callHome));

/**
 * @swagger
 * /telemetry/device/{deviceId}:
 *   get:
 *     summary: Get telemetry history for a device
 *     tags: [Telemetry]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
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
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Telemetry data retrieved successfully
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
 *                   example: Telemetry data retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Telemetry'
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     total:
 *                       type: integer
 *                       example: 150
 *                     totalPages:
 *                       type: integer
 *                       example: 8
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/device/:deviceId', authenticateToken, telemetryValidation.getTelemetryByDevice, asyncHandler(telemetryController.getTelemetryByDevice));

/**
 * @swagger
 * /telemetry/device/{deviceId}/latest:
 *   get:
 *     summary: Get latest telemetry for a device
 *     tags: [Telemetry]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Device ID
 *     responses:
 *       200:
 *         description: Latest telemetry retrieved successfully
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
 *                   example: Latest telemetry retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     telemetry:
 *                       $ref: '#/components/schemas/Telemetry'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/device/:deviceId/latest', authenticateToken, telemetryValidation.getLatestTelemetry, asyncHandler(telemetryController.getLatestTelemetry));

/**
 * @swagger
 * /telemetry/device/{deviceId}/cleanup:
 *   delete:
 *     summary: Delete old telemetry records (keep last N)
 *     tags: [Telemetry]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Device ID
 *       - in: query
 *         name: keepLast
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 100
 *         description: Number of recent records to keep
 *     responses:
 *       200:
 *         description: Old telemetry records deleted successfully
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
 *                   example: Deleted 50 old telemetry records
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedCount:
 *                       type: integer
 *                       example: 50
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.delete('/device/:deviceId/cleanup', authenticateToken, telemetryValidation.cleanupOldTelemetry, asyncHandler(telemetryController.cleanupOldTelemetry));

export default router;

