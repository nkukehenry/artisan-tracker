import { PrismaClient } from '@prisma/client';
import { BaseRepositoryImpl } from './base.repository';
import { MediaFileRepository, MediaFile, CreateMediaFileData } from '../interfaces/media.interface';
import { logger } from '../config/logger';

export class MediaFileRepositoryImpl extends BaseRepositoryImpl<MediaFile> implements MediaFileRepository {
  constructor(prisma: PrismaClient) {
    super(prisma, 'mediaFile');
  }

  async create(data: CreateMediaFileData): Promise<MediaFile> {
    try {
      const result = await this.prisma.mediaFile.create({
        data: {
          callId: data.callId,
          fileName: data.fileName,
          filePath: data.filePath,
          fileSize: data.fileSize,
          mimeType: data.mimeType,
          fileType: data.fileType as any, // Cast to handle extended MediaType
          metadata: data.metadata,
          isEncrypted: data.isEncrypted ?? true,
          location: data.location,
          gpsCoordinates: data.gpsCoordinates,
          deviceId: data.deviceId,
        },
      });

      // Fetch related call if available
      let call = null;
      if (result.callId) {
        try {
          call = await this.prisma.callLog.findUnique({
            where: { id: result.callId },
          });
        } catch (error) {
          logger.warn('Failed to fetch related call', { callId: result.callId, error });
        }
      }

      const mappedResult: MediaFile = {
        id: result.id,
        callId: result.callId || undefined,
        fileName: result.fileName,
        filePath: result.filePath,
        fileSize: result.fileSize,
        mimeType: result.mimeType,
        fileType: result.fileType,
        metadata: result.metadata,
        isEncrypted: result.isEncrypted,
        location: result.location || undefined,
        gpsCoordinates: result.gpsCoordinates || undefined,
        createdAt: result.createdAt,
        updatedAt: result.createdAt, // Use createdAt as fallback
        deviceId: result.deviceId,
        call: call ? {
          id: call.id,
          phoneNumber: call.phoneNumber,
          contactName: call.contactName || undefined,
          callType: call.callType,
          duration: call.duration || undefined,
          timestamp: call.timestamp,
          location: call.location || undefined,
          gpsCoordinates: call.gpsCoordinates || undefined,
        } : undefined,
      };

      logger.info('MediaFile created successfully', { id: result.id });
      return mappedResult;
    } catch (error) {
      logger.error('Error creating MediaFile', { data, error });
      throw error;
    }
  }

  async findByDevice(
    deviceId: string,
    options: { page?: number; limit?: number; fileType?: string } = {}
  ): Promise<{ data: MediaFile[]; pagination: any }> {
    try {
      const { page = 1, limit = 10, fileType } = options;
      const skip = (page - 1) * limit;

      // First get the device to get its ID
      const device = await this.prisma.device.findUnique({
        where: { deviceId }
      });

      if (!device) {
        return { 
          data: [], 
          pagination: { 
            page, 
            limit, 
            total: 0, 
            totalPages: 0, 
            hasNext: false, 
            hasPrev: false 
          } 
        };
      }

      const where: any = { deviceId: device.id };
      if (fileType) {
        where.fileType = fileType;
      }

      const [data, total] = await Promise.all([
        this.prisma.mediaFile.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.mediaFile.count({ where }),
      ]);

      // Map Prisma data to interface format and fetch related calls if available
      const mappedData: MediaFile[] = await Promise.all(
        data.map(async (item) => {
          let call = null;
          if (item.callId) {
            try {
              call = await this.prisma.callLog.findUnique({
                where: { id: item.callId },
              });
            } catch (error) {
              logger.warn('Failed to fetch related call', { callId: item.callId, error });
            }
          }

          return {
            id: item.id,
            callId: item.callId || undefined,
            fileName: item.fileName,
            filePath: item.filePath,
            fileSize: item.fileSize,
            mimeType: item.mimeType,
            fileType: item.fileType,
            metadata: item.metadata,
            isEncrypted: item.isEncrypted,
            location: item.location || undefined,
            gpsCoordinates: item.gpsCoordinates || undefined,
            createdAt: item.createdAt,
            updatedAt: item.createdAt, // Use createdAt as fallback
            deviceId: item.deviceId,
            call: call ? {
              id: call.id,
              phoneNumber: call.phoneNumber,
              contactName: call.contactName || undefined,
              callType: call.callType,
              duration: call.duration || undefined,
              timestamp: call.timestamp,
              location: call.location || undefined,
              gpsCoordinates: call.gpsCoordinates || undefined,
            } : undefined,
          };
        })
      );

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
      logger.error('Error finding media files by device', { deviceId, options, error });
      throw error;
    }
  }

  async findByType(
    fileType: string,
    deviceId?: string,
    options: { page?: number; limit?: number } = {}
  ): Promise<{ data: MediaFile[]; pagination: any }> {
    try {
      const { page = 1, limit = 10 } = options;
      const skip = (page - 1) * limit;

      const where: any = { fileType };
      
      if (deviceId) {
        const device = await this.prisma.device.findUnique({
          where: { deviceId }
        });
        if (device) {
          where.deviceId = device.id;
        }
      }

      const [data, total] = await Promise.all([
        this.prisma.mediaFile.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.mediaFile.count({ where }),
      ]);

      const mappedData: MediaFile[] = await Promise.all(
        data.map(async (item) => {
          let call = null;
          if (item.callId) {
            try {
              call = await this.prisma.callLog.findUnique({
                where: { id: item.callId },
              });
            } catch (error) {
              logger.warn('Failed to fetch related call', { callId: item.callId, error });
            }
          }

          return {
            id: item.id,
            callId: item.callId || undefined,
            fileName: item.fileName,
            filePath: item.filePath,
            fileSize: item.fileSize,
            mimeType: item.mimeType,
            fileType: item.fileType,
            metadata: item.metadata,
            isEncrypted: item.isEncrypted,
            location: item.location || undefined,
            gpsCoordinates: item.gpsCoordinates || undefined,
            createdAt: item.createdAt,
            updatedAt: item.createdAt,
            deviceId: item.deviceId,
            call: call ? {
              id: call.id,
              phoneNumber: call.phoneNumber,
              contactName: call.contactName || undefined,
              callType: call.callType,
              duration: call.duration || undefined,
              timestamp: call.timestamp,
              location: call.location || undefined,
              gpsCoordinates: call.gpsCoordinates || undefined,
            } : undefined,
          };
        })
      );

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
      logger.error('Error finding media files by type', { fileType, deviceId, options, error });
      throw error;
    }
  }

  async getTotalSize(deviceId?: string): Promise<bigint> {
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

      const result = await this.prisma.mediaFile.aggregate({
        where,
        _sum: {
          fileSize: true,
        },
      });

      return result._sum.fileSize || BigInt(0);
    } catch (error) {
      logger.error('Error getting total media size', { deviceId, error });
      throw error;
    }
  }

  async deleteByDevice(deviceId: string): Promise<void> {
    try {
      const device = await this.prisma.device.findUnique({
        where: { deviceId }
      });

      if (device) {
        await this.prisma.mediaFile.deleteMany({
          where: { deviceId: device.id },
        });
        logger.info('Media files deleted for device', { deviceId });
      }
    } catch (error) {
      logger.error('Error deleting media files by device', { deviceId, error });
      throw error;
    }
  }
}

