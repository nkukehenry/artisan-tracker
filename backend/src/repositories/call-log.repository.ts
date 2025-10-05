import { PrismaClient } from '@prisma/client';
import { BaseRepositoryImpl } from './base.repository';
import { CallLogRepository, CallLog, CreateCallLogData } from '../interfaces/media.interface';
import { logger } from '../config/logger';

export class CallLogRepositoryImpl extends BaseRepositoryImpl<CallLog> implements CallLogRepository {
  constructor(prisma: PrismaClient) {
    super(prisma, 'callLog');
  }

  async create(data: CreateCallLogData): Promise<CallLog> {
    try {
      // Filter out fields that don't exist in the Prisma schema
      const { isEncrypted, ...prismaData } = data as any;
      
      const result = await this.prisma.callLog.create({
        data: prismaData,
      });
      
      // Map the result back to the interface format
      const mappedResult: CallLog = {
        id: result.id,
        phoneNumber: result.phoneNumber,
        contactName: result.contactName || undefined,
        callType: result.callType,
        duration: result.duration || undefined,
        timestamp: result.timestamp,
        isIncoming: result.isIncoming,
        createdAt: result.createdAt,
        updatedAt: result.createdAt, // Use createdAt as fallback
        deviceId: result.deviceId,
      };
      
      logger.info('CallLog created successfully', { id: result.id });
      return mappedResult;
    } catch (error) {
      logger.error('Error creating CallLog', { data, error });
      throw error;
    }
  }

  async findByDevice(deviceId: string, options: { page?: number; limit?: number } = {}): Promise<{ data: CallLog[]; pagination: any }> {
    try {
      const { page = 1, limit = 10 } = options;
      const skip = (page - 1) * limit;

      // First get the device to get its ID
      const device = await this.prisma.device.findUnique({
        where: { deviceId }
      });

      if (!device) {
        return { data: [], pagination: { page, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false } };
      }

      const [data, total] = await Promise.all([
        this.prisma.callLog.findMany({
          where: { deviceId: device.id },
          skip,
          take: limit,
          orderBy: { timestamp: 'desc' },
        }),
        this.prisma.callLog.count({ where: { deviceId: device.id } }),
      ]);

      // Map Prisma data to interface format
      const mappedData: CallLog[] = data.map(item => ({
        id: item.id,
        phoneNumber: item.phoneNumber,
        contactName: item.contactName || undefined,
        callType: item.callType,
        duration: item.duration || undefined,
        timestamp: item.timestamp,
        isIncoming: item.isIncoming,
        createdAt: item.createdAt,
        updatedAt: item.createdAt, // Use createdAt as fallback since updatedAt not in schema
        deviceId: item.deviceId,
      }));

      const totalPages = Math.ceil(total / limit);

      return {
        data: mappedData,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      logger.error('Error finding call logs by device', { deviceId, options, error });
      throw error;
    }
  }

  async findByPhoneNumber(phoneNumber: string, deviceId?: string): Promise<CallLog[]> {
    try {
      const where: any = { phoneNumber };
      
      if (deviceId) {
        const device = await this.prisma.device.findUnique({
          where: { deviceId }
        });
        if (device) {
          where.deviceId = device.id;
        }
      }

      const data = await this.prisma.callLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
      });

      return data.map(item => ({
        id: item.id,
        phoneNumber: item.phoneNumber,
        contactName: item.contactName || undefined,
        callType: item.callType,
        duration: item.duration || undefined,
        timestamp: item.timestamp,
        isIncoming: item.isIncoming,
        createdAt: item.createdAt,
        updatedAt: item.createdAt,
        deviceId: item.deviceId,
      }));
    } catch (error) {
      logger.error('Error finding call logs by phone number', { phoneNumber, deviceId, error });
      throw error;
    }
  }

  async findByPhoneNumberAndTimestamp(phoneNumber: string, timestamp: Date, deviceId?: string): Promise<CallLog[]> {
    try {
      const where: any = { 
        phoneNumber,
        timestamp: {
          gte: new Date(timestamp.getTime() - 60000), // 1 minute before
          lte: new Date(timestamp.getTime() + 60000), // 1 minute after
        }
      };
      
      if (deviceId) {
        const device = await this.prisma.device.findUnique({
          where: { deviceId }
        });
        if (device) {
          where.deviceId = device.id;
        }
      }

      const data = await this.prisma.callLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
      });

      return data.map(item => ({
        id: item.id,
        phoneNumber: item.phoneNumber,
        contactName: item.contactName || undefined,
        callType: item.callType,
        duration: item.duration || undefined,
        timestamp: item.timestamp,
        isIncoming: item.isIncoming,
        createdAt: item.createdAt,
        updatedAt: item.createdAt,
        deviceId: item.deviceId,
      }));
    } catch (error) {
      logger.error('Error finding call logs by phone number and timestamp', { phoneNumber, timestamp, deviceId, error });
      throw error;
    }
  }

  async getCallStats(deviceId?: string): Promise<{
    total: number;
    incoming: number;
    outgoing: number;
    missed: number;
    rejected: number;
  }> {
    try {
      const where: any = {};
      
      if (deviceId) {
        const device = await this.prisma.device.findUnique({
          where: { deviceId }
        });
        if (device) {
          where.deviceId = device.id;
        }
      }

      const [total, incoming, outgoing, missed, rejected] = await Promise.all([
        this.prisma.callLog.count({ where }),
        this.prisma.callLog.count({ where: { ...where, callType: 'INCOMING' } }),
        this.prisma.callLog.count({ where: { ...where, callType: 'OUTGOING' } }),
        this.prisma.callLog.count({ where: { ...where, callType: 'MISSED' } }),
        this.prisma.callLog.count({ where: { ...where, callType: 'REJECTED' } }),
      ]);

      return {
        total,
        incoming,
        outgoing,
        missed,
        rejected,
      };
    } catch (error) {
      logger.error('Error getting call stats', { deviceId, error });
      throw error;
    }
  }
}
