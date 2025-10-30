import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { createError } from '../middleware/errorHandler';

export class PortalController {
    public getDashboard = async (req: Request, res: Response) => {
        try {
            if (!req.user) {
                throw createError('Authentication required', 401);
            }

            const { deviceId, days } = req.query as { deviceId?: string; days?: string };

            const daysInt = Number.isFinite(Number(days)) && Number(days) > 0 ? Number(days) : 30;
            const dateFrom = new Date();
            dateFrom.setDate(dateFrom.getDate() - daysInt);

            // Build reusable relation filter (scope to tenant and optional deviceId)
            const deviceWhere: any = {
                tenantId: req.user.tenantId,
            };
            if (deviceId) {
                deviceWhere.deviceId = deviceId;
            }

            const whereByDeviceRelation = { device: deviceWhere } as const;

            // Parallel aggregate queries
            const [
                messagesCount,
                locationsCount,
                callsCount,
                contactsCount,
                commandsCount,
                mediaFilesCount,
                messagesByType,
                callsByType,
                incomingMessages,
                outgoingMessages,
            ] = await Promise.all([
                prisma.message.count({ where: whereByDeviceRelation }),
                prisma.location.count({ where: whereByDeviceRelation }),
                prisma.callLog.count({ where: whereByDeviceRelation }),
                prisma.contact.count({
                    where: {
                        device: { tenantId: req.user.tenantId },
                        ...(deviceId ? { device: { tenantId: req.user.tenantId, deviceId } } : {}),
                    },
                }),
                prisma.deviceCommand.count({
                    where: {
                        device: { tenantId: req.user.tenantId },
                        ...(deviceId ? { device: { tenantId: req.user.tenantId, deviceId } } : {}),
                    },
                }),
                prisma.mediaFile.count({
                    where: {
                        device: { tenantId: req.user.tenantId },
                        ...(deviceId ? { device: { tenantId: req.user.tenantId, deviceId } } : {}),
                    },
                }),
                prisma.message.groupBy({
                    by: ['messageType'],
                    _count: { _all: true },
                    where: whereByDeviceRelation,
                }),
                prisma.callLog.groupBy({
                    by: ['callType'],
                    _count: { _all: true },
                    where: whereByDeviceRelation,
                }),
                prisma.message.count({ where: { ...whereByDeviceRelation, isIncoming: true } }),
                prisma.message.count({ where: { ...whereByDeviceRelation, isIncoming: false } }),
            ]);

            const mediaByType = await prisma.mediaFile.groupBy({
                by: ['fileType'],
                _count: { _all: true },
                where: {
                    device: { tenantId: req.user.tenantId, ...(deviceId ? { deviceId } : {}) },
                },
            });

            // Optional simple timeseries (daily) for last N days using raw query
            // NOTE: Works on MySQL (DATE(timestamp))
            const [messageSeries, callSeries] = await Promise.all([
                prisma.$queryRawUnsafe<any[]>(
                    `SELECT DATE(timestamp) AS day, COUNT(*) AS count
           FROM messages m
           JOIN devices d ON d.id = m.deviceId
           WHERE d.tenantId = ? ${deviceId ? 'AND d.deviceId = ?' : ''} AND timestamp >= ?
           GROUP BY DATE(timestamp)
           ORDER BY day ASC`,
                    ...(deviceId ? [req.user.tenantId, deviceId, dateFrom] : [req.user.tenantId, dateFrom])
                ),
                prisma.$queryRawUnsafe<any[]>(
                    `SELECT DATE(timestamp) AS day, COUNT(*) AS count
           FROM call_logs c
           JOIN devices d ON d.id = c.deviceId
           WHERE d.tenantId = ? ${deviceId ? 'AND d.deviceId = ?' : ''} AND timestamp >= ?
           GROUP BY DATE(timestamp)
           ORDER BY day ASC`,
                    ...(deviceId ? [req.user.tenantId, deviceId, dateFrom] : [req.user.tenantId, dateFrom])
                ),
            ]);

            const response = {
                counts: {
                    messages: messagesCount,
                    locations: locationsCount,
                    calls: callsCount,
                    contacts: contactsCount,
                    commands: commandsCount,
                    mediaFiles: mediaFilesCount,
                },
                breakdowns: {
                    messagesByType: messagesByType.map((r) => ({ type: r.messageType, count: r._count._all })),
                    callsByType: callsByType.map((r) => ({ type: r.callType, count: r._count._all })),
                    mediaByType: mediaByType.map((r) => ({ type: r.fileType, count: r._count._all })),
                    messageDirection: [ // kept for backward compatibility
                        { type: 'INCOMING', count: incomingMessages },
                        { type: 'OUTGOING', count: outgoingMessages },
                    ],
                },
                series: {
                    messagesPerDay: messageSeries.map((r) => ({ day: String(r.day), count: Number(r.count) })),
                    callsPerDay: callSeries.map((r) => ({ day: String(r.day), count: Number(r.count) })),
                },
                scope: {
                    tenantId: req.user.tenantId,
                    deviceId: deviceId || null,
                    days: daysInt,
                },
            };

            res.json({ success: true, message: 'Dashboard metrics', data: response });
        } catch (error) {
            logger.error('Failed to get dashboard metrics', { error });
            throw error;
        }
    };
}

export default new PortalController();


