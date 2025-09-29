import { PrismaClient } from '@prisma/client';
import { BaseRepositoryImpl } from './base.repository';
import { DeviceCommandRepository, DeviceCommand, CreateDeviceCommandData, UpdateDeviceCommandData } from '../interfaces/command.interface';
import { logger } from '../config/logger';

export class DeviceCommandRepositoryImpl extends BaseRepositoryImpl<DeviceCommand> implements DeviceCommandRepository {
  constructor(prisma: PrismaClient) {
    super(prisma, 'deviceCommand');
  }

  async findByDevice(deviceId: string, options: { page?: number; limit?: number; status?: string } = {}): Promise<{ data: DeviceCommand[]; pagination: any }> {
    try {
      const { page = 1, limit = 10, status } = options;
      const skip = (page - 1) * limit;

      const where: any = { deviceId };
      if (status) {
        where.status = status;
      }

      const [data, total] = await Promise.all([
        this.prisma.deviceCommand.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.deviceCommand.count({ where }),
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
      logger.error('Error finding device commands by device', { deviceId, options, error });
      throw error;
    }
  }

  async findByStatus(status: string, deviceId?: string): Promise<DeviceCommand[]> {
    try {
      const where: any = { status };
      if (deviceId) {
        where.deviceId = deviceId;
      }

      const result = await this.prisma.deviceCommand.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
      return result;
    } catch (error) {
      logger.error('Error finding device commands by status', { status, deviceId, error });
      throw error;
    }
  }

  async findPendingCommands(deviceId?: string): Promise<DeviceCommand[]> {
    try {
      const where: any = { status: 'PENDING' };
      if (deviceId) {
        where.deviceId = deviceId;
      }

      const result = await this.prisma.deviceCommand.findMany({
        where,
        orderBy: { createdAt: 'asc' },
      });
      return result;
    } catch (error) {
      logger.error('Error finding pending device commands', { deviceId, error });
      throw error;
    }
  }

  async updateCommandStatus(id: string, status: string, response?: any): Promise<void> {
    try {
      const updateData: any = { status };
      
      if (status === 'SENT') {
        updateData.sentAt = new Date();
      } else if (status === 'EXECUTED') {
        updateData.executedAt = new Date();
      }
      
      if (response) {
        updateData.response = response;
      }

      await this.prisma.deviceCommand.update({
        where: { id },
        data: updateData,
      });
      logger.info('Device command status updated successfully', { id, status });
    } catch (error) {
      logger.error('Error updating device command status', { id, status, error });
      throw error;
    }
  }

  async cancelPendingCommands(deviceId: string): Promise<void> {
    try {
      await this.prisma.deviceCommand.updateMany({
        where: { 
          deviceId,
          status: 'PENDING',
        },
        data: { status: 'CANCELLED' },
      });
      logger.info('Pending device commands cancelled successfully', { deviceId });
    } catch (error) {
      logger.error('Error cancelling pending device commands', { deviceId, error });
      throw error;
    }
  }

  async getCommandStats(deviceId?: string): Promise<{
    total: number;
    pending: number;
    sent: number;
    executed: number;
    failed: number;
    cancelled: number;
  }> {
    try {
      const where: any = {};
      if (deviceId) {
        where.deviceId = deviceId;
      }

      const [total, pending, sent, executed, failed, cancelled] = await Promise.all([
        this.prisma.deviceCommand.count({ where }),
        this.prisma.deviceCommand.count({ where: { ...where, status: 'PENDING' } }),
        this.prisma.deviceCommand.count({ where: { ...where, status: 'SENT' } }),
        this.prisma.deviceCommand.count({ where: { ...where, status: 'EXECUTED' } }),
        this.prisma.deviceCommand.count({ where: { ...where, status: 'FAILED' } }),
        this.prisma.deviceCommand.count({ where: { ...where, status: 'CANCELLED' } }),
      ]);

      return {
        total,
        pending,
        sent,
        executed,
        failed,
        cancelled,
      };
    } catch (error) {
      logger.error('Error getting device command stats', { deviceId, error });
      throw error;
    }
  }

  async create(data: CreateDeviceCommandData): Promise<DeviceCommand> {
    return super.create({
      ...data,
      status: data.status ?? 'PENDING',
      sentAt: new Date(),
    });
  }

  async update(id: string, data: UpdateDeviceCommandData): Promise<DeviceCommand> {
    return super.update(id, data);
  }
}
