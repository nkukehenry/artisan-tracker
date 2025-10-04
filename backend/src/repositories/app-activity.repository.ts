import { PrismaClient } from '@prisma/client';
import { BaseRepositoryImpl } from './base.repository';
import { AppActivityRepository, AppActivity, CreateAppActivityData } from '../interfaces/app-activity.interface';
import { logger } from '../config/logger';

export class AppActivityRepositoryImpl extends BaseRepositoryImpl<AppActivity> implements AppActivityRepository {
  constructor(prisma: PrismaClient) {
    super(prisma, 'appActivity');
  }

  async findByDevice(
    deviceId: string,
    paginationOptions: { page: number; limit: number },
    filterOptions?: {
      activityType?: string;
      appName?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<{
    data: AppActivity[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }> {
    try {
      const { page, limit } = paginationOptions;
      const skip = (page - 1) * limit;

      // First get the device to get its ID
      const device = await this.prisma.device.findUnique({
        where: { deviceId }
      });

      if (!device) {
        return { data: [], page, limit, total: 0, totalPages: 0 };
      }

      const where: any = { deviceId: device.id };
      
      if (filterOptions?.appName) {
        where.appName = { contains: filterOptions.appName };
      }
      
      if (filterOptions?.startDate || filterOptions?.endDate) {
        where.startTime = {};
        if (filterOptions.startDate) where.startTime.gte = filterOptions.startDate;
        if (filterOptions.endDate) where.startTime.lte = filterOptions.endDate;
      }

      const [data, total] = await Promise.all([
        this.prisma.appActivity.findMany({
          where,
          skip,
          take: limit,
          orderBy: { startTime: 'desc' },
        }),
        this.prisma.appActivity.count({ where }),
      ]);

      // Map Prisma data to interface format
      const mappedData: AppActivity[] = data.map(item => ({
        id: item.id,
        deviceId: item.deviceId,
        appName: item.appName,
        packageName: item.packageName,
        activityType: 'OPENED' as const, // Default since not in schema
        duration: item.duration || undefined,
        timestamp: item.startTime,
        metadata: {},
        isEncrypted: false, // Default since not in schema
        createdAt: item.createdAt,
        updatedAt: item.createdAt, // Use createdAt as fallback
      }));

      return {
        data: mappedData,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Error finding app activities by device', { deviceId, paginationOptions, filterOptions, error });
      throw error;
    }
  }

  async getUsageSummary(
    deviceId: string,
    filterOptions?: {
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<{
    totalApps: number;
    totalUsageTime: number;
    mostUsedApps: Array<{
      appName: string;
      packageName: string;
      usageTime: number;
      openCount: number;
    }>;
  }> {
    try {
      // First get the device to get its ID
      const device = await this.prisma.device.findUnique({
        where: { deviceId }
      });

      if (!device) {
        return {
          totalApps: 0,
          totalUsageTime: 0,
          mostUsedApps: [],
        };
      }

      const whereClause: any = { deviceId: device.id };
      
      if (filterOptions?.startDate || filterOptions?.endDate) {
        whereClause.startTime = {};
        if (filterOptions.startDate) whereClause.startTime.gte = filterOptions.startDate;
        if (filterOptions.endDate) whereClause.startTime.lte = filterOptions.endDate;
      }

      const [summary, totalApps, totalUsageTime] = await Promise.all([
        this.prisma.appActivity.groupBy({
          by: ['appName', 'packageName'],
          where: whereClause,
          _sum: {
            duration: true,
          },
          _count: {
            id: true,
          },
          orderBy: {
            _sum: {
              duration: 'desc',
            },
          },
          take: 10, // Top 10 most used apps
        }),
        this.prisma.appActivity.groupBy({
          by: ['appName'],
          where: whereClause,
        }),
        this.prisma.appActivity.aggregate({
          where: whereClause,
          _sum: {
            duration: true,
          },
        }),
      ]);

      return {
        totalApps: totalApps.length,
        totalUsageTime: totalUsageTime._sum.duration || 0,
        mostUsedApps: summary.map(item => ({
          appName: item.appName,
          packageName: item.packageName,
          usageTime: item._sum.duration || 0,
          openCount: item._count.id,
        })),
      };
    } catch (error) {
      logger.error('Error getting app usage summary', { deviceId, filterOptions, error });
      throw error;
    }
  }
}
