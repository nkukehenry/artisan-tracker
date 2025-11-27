import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { logger } from '../config/logger';

/**
 * Middleware to update device lastSeenAt timestamp
 * This middleware should be called after authentication middleware
 * It checks for deviceId in path params, query params, or body
 */
export const updateDeviceLastSeen = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Extract deviceId from various sources
        // Priority: path params > query params > body
        let deviceId: string | undefined =
            req.params.deviceId ||
            req.query.deviceId as string ||
            req.body.deviceId;

        // If deviceId not found, check if :id param exists
        // It might be a database ID, so we need to look it up
        if (!deviceId && req.params.id) {
            const idParam = req.params.id;

            // Check if it looks like a database ID (Prisma CUID or UUID format)
            // Prisma CUID: 20-25 alphanumeric chars
            // UUID: 36 chars with dashes
            const isDatabaseId = /^[a-z0-9]{20,25}$/i.test(idParam) ||
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idParam);

            if (isDatabaseId) {
                // Look up device by database ID to get deviceId
                const device = await prisma.device.findUnique({
                    where: { id: idParam },
                    select: { deviceId: true },
                });

                if (device) {
                    deviceId = device.deviceId;
                }
            } else {
                // Assume it's a deviceId (3-50 chars as per validation)
                deviceId = idParam;
            }
        }

        // If no deviceId found, skip this middleware
        if (!deviceId) {
            next();
            return;
        }

        // Update device lastSeenAt in the background (don't block the request)
        // Use updateMany to avoid errors if device doesn't exist
        prisma.device.updateMany({
            where: { deviceId: deviceId },
            data: { lastSeenAt: new Date() },
        }).catch((error) => {
            // Log error but don't fail the request
            logger.debug('Failed to update device lastSeenAt', {
                deviceId,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        });

        // Continue to next middleware/route handler
        next();
    } catch (error) {
        // Log error but don't fail the request
        logger.debug('Error in updateDeviceLastSeen middleware', {
            error: error instanceof Error ? error.message : 'Unknown error',
        });
        next();
    }
};

