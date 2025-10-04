import { PrismaClient } from '@prisma/client';
import { BaseRepositoryImpl } from './base.repository';
import { LocationRepository, Location, CreateLocationData } from '../interfaces/location.interface';
import { logger } from '../config/logger';

export class LocationRepositoryImpl extends BaseRepositoryImpl<Location> implements LocationRepository {
  constructor(prisma: PrismaClient) {
    super(prisma, 'location');
  }

  async findByDevice(
    deviceId: string,
    paginationOptions: { page: number; limit: number },
    filterOptions?: {
      startDate?: Date;
      endDate?: Date;
      minAccuracy?: number;
    }
  ): Promise<{
    data: Location[];
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
      
      if (filterOptions?.startDate || filterOptions?.endDate) {
        where.timestamp = {};
        if (filterOptions.startDate) where.timestamp.gte = filterOptions.startDate;
        if (filterOptions.endDate) where.timestamp.lte = filterOptions.endDate;
      }
      
      if (filterOptions?.minAccuracy) {
        where.accuracy = { gte: filterOptions.minAccuracy };
      }

      const [data, total] = await Promise.all([
        this.prisma.location.findMany({
          where,
          skip,
          take: limit,
          orderBy: { timestamp: 'desc' },
        }),
        this.prisma.location.count({ where }),
      ]);

      // Map Prisma data to interface format
      const mappedData: Location[] = data.map(item => ({
        id: item.id,
        deviceId: item.deviceId,
        latitude: item.latitude,
        longitude: item.longitude,
        accuracy: item.accuracy || 0, // Default to 0 if null
        altitude: item.altitude || undefined,
        speed: item.speed || undefined,
        heading: item.heading || undefined,
        address: item.address || undefined,
        timestamp: item.timestamp,
        // isEncrypted removed - not in Prisma schema
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
      logger.error('Error finding locations by device', { deviceId, paginationOptions, filterOptions, error });
      throw error;
    }
  }

  async findCurrentByDevice(deviceId: string): Promise<Location | null> {
    try {
      // First get the device to get its ID
      const device = await this.prisma.device.findUnique({
        where: { deviceId }
      });

      if (!device) {
        return null;
      }

      const location = await this.prisma.location.findFirst({
        where: { deviceId: device.id },
        orderBy: { timestamp: 'desc' },
      });

      if (!location) {
        return null;
      }

      // Map Prisma data to interface format
      return {
        id: location.id,
        deviceId: location.deviceId,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy || 0,
        altitude: location.altitude || undefined,
        speed: location.speed || undefined,
        heading: location.heading || undefined,
        address: location.address || undefined,
        timestamp: location.timestamp,
        // isEncrypted removed - not in Prisma schema
        createdAt: location.createdAt,
        updatedAt: location.createdAt, // Use createdAt as fallback
      };
    } catch (error) {
      logger.error('Error finding current location by device', { deviceId, error });
      throw error;
    }
  }
}
