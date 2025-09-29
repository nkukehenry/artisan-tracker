import { PrismaClient } from '@prisma/client';
import { BaseRepositoryImpl } from './base.repository';
import { DeviceRepository, Device, CreateDeviceData, UpdateDeviceData } from '../interfaces/device.interface';
import { logger } from '../config/logger';

export class DeviceRepositoryImpl extends BaseRepositoryImpl<Device> implements DeviceRepository {
  constructor(prisma: PrismaClient) {
    super(prisma, 'device');
  }

  async findByDeviceId(deviceId: string): Promise<Device | null> {
    try {
      const result = await this.prisma.device.findUnique({
        where: { deviceId },
      });
      return result;
    } catch (error) {
      logger.error('Error finding device by deviceId', { deviceId, error });
      throw error;
    }
  }

  async findByTenant(tenantId: string, options: { page?: number; limit?: number } = {}): Promise<{ data: Device[]; pagination: any }> {
    try {
      const { page = 1, limit = 10 } = options;
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.prisma.device.findMany({
          where: { tenantId },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.device.count({ where: { tenantId } }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data,
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
      logger.error('Error finding devices by tenant', { tenantId, options, error });
      throw error;
    }
  }

  async findByUser(userId: string, options: { page?: number; limit?: number } = {}): Promise<{ data: Device[]; pagination: any }> {
    try {
      const { page = 1, limit = 10 } = options;
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.prisma.device.findMany({
          where: { userId },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.device.count({ where: { userId } }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data,
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
      logger.error('Error finding devices by user', { userId, options, error });
      throw error;
    }
  }

  async findOnlineDevices(tenantId?: string): Promise<Device[]> {
    try {
      const where: any = { isOnline: true };
      if (tenantId) {
        where.tenantId = tenantId;
      }

      const result = await this.prisma.device.findMany({
        where,
        orderBy: { lastSeenAt: 'desc' },
      });
      return result;
    } catch (error) {
      logger.error('Error finding online devices', { tenantId, error });
      throw error;
    }
  }

  async updateDeviceStatus(deviceId: string, status: Partial<UpdateDeviceData>): Promise<void> {
    try {
      await this.prisma.device.update({
        where: { deviceId },
        data: status,
      });
      logger.info('Device status updated successfully', { deviceId, status });
    } catch (error) {
      logger.error('Error updating device status', { deviceId, status, error });
      throw error;
    }
  }

  async updateLastSeen(deviceId: string): Promise<void> {
    try {
      await this.prisma.device.update({
        where: { deviceId },
        data: { 
          lastSeenAt: new Date(),
          isOnline: true,
        },
      });
      logger.info('Device last seen updated successfully', { deviceId });
    } catch (error) {
      logger.error('Error updating device last seen', { deviceId, error });
      throw error;
    }
  }

  async getDeviceStats(tenantId?: string): Promise<{
    total: number;
    online: number;
    offline: number;
    active: number;
    inactive: number;
  }> {
    try {
      const where: any = {};
      if (tenantId) {
        where.tenantId = tenantId;
      }

      const [total, online, active] = await Promise.all([
        this.prisma.device.count({ where }),
        this.prisma.device.count({ where: { ...where, isOnline: true } }),
        this.prisma.device.count({ where: { ...where, isActive: true } }),
      ]);

      return {
        total,
        online,
        offline: total - online,
        active,
        inactive: total - active,
      };
    } catch (error) {
      logger.error('Error getting device stats', { tenantId, error });
      throw error;
    }
  }

  async updateStatus(id: string, isOnline: boolean, lastSeenAt?: Date, batteryLevel?: number): Promise<Device> {
    try {
      const device = await this.prisma.device.update({
        where: { id },
        data: {
          isOnline,
          lastSeenAt: lastSeenAt || new Date(),
          batteryLevel: batteryLevel || null,
        },
      });
      logger.info('Device status updated', { id, isOnline });
      return device as Device;
    } catch (error) {
      logger.error('Error updating device status', { id, error });
      throw error;
    }
  }

  async create(data: CreateDeviceData): Promise<Device> {
    return super.create({
      ...data,
      model: data.model ?? null,
      osVersion: data.osVersion ?? null,
      appVersion: data.appVersion ?? null,
      isOnline: data.isOnline ?? false,
      lastSeenAt: null,
      batteryLevel: data.batteryLevel ?? null,
      location: data.location ?? null,
      isActive: data.isActive ?? true,
    });
  }

  async update(id: string, data: UpdateDeviceData): Promise<Device> {
    return super.update(id, data);
  }
}
