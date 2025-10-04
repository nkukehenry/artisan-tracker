import { PrismaClient } from '@prisma/client';
import { BaseRepositoryImpl } from './base.repository';
import { ContactRepository, Contact, CreateContactData, UpdateContactData } from '../interfaces/media.interface';
import { logger } from '../config/logger';

export class ContactRepositoryImpl extends BaseRepositoryImpl<Contact> implements ContactRepository {
  constructor(prisma: PrismaClient) {
    super(prisma, 'contact');
  }

  async findByDevice(deviceId: string, options: { page?: number; limit?: number } = {}): Promise<{ data: Contact[]; pagination: any }> {
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
        this.prisma.contact.findMany({
          where: { deviceId: device.id },
          skip,
          take: limit,
          orderBy: { name: 'asc' },
        }),
        this.prisma.contact.count({ where: { deviceId: device.id } }),
      ]);

      const totalPages = Math.ceil(total / limit);

      // Map Prisma data to interface format
      const mappedData: Contact[] = data.map(item => ({
        id: item.id,
        name: item.name,
        phoneNumber: item.phoneNumber || undefined, // Convert null to undefined
        email: item.email || undefined,
        avatar: item.avatar || undefined,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        deviceId: item.deviceId,
      }));

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
      logger.error('Error finding contacts by device', { deviceId, options, error });
      throw error;
    }
  }

  async findByPhoneNumber(phoneNumber: string, deviceId?: string): Promise<Contact[]> {
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

      const data = await this.prisma.contact.findMany({
        where,
        orderBy: { name: 'asc' },
      });

      return data.map(item => ({
        id: item.id,
        name: item.name,
        phoneNumber: item.phoneNumber || undefined,
        email: item.email || undefined,
        avatar: item.avatar || undefined,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        deviceId: item.deviceId,
      }));
    } catch (error) {
      logger.error('Error finding contacts by phone number', { phoneNumber, deviceId, error });
      throw error;
    }
  }

  async searchContacts(query: string, deviceId?: string): Promise<Contact[]> {
    try {
      const where: any = {
        OR: [
          { name: { contains: query } },
          { phoneNumber: { contains: query } },
          { email: { contains: query } },
        ],
      };
      
      if (deviceId) {
        const device = await this.prisma.device.findUnique({
          where: { deviceId }
        });
        if (device) {
          where.deviceId = device.id;
        }
      }

      const data = await this.prisma.contact.findMany({
        where,
        orderBy: { name: 'asc' },
      });

      return data.map(item => ({
        id: item.id,
        name: item.name,
        phoneNumber: item.phoneNumber || undefined,
        email: item.email || undefined,
        avatar: item.avatar || undefined,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        deviceId: item.deviceId,
      }));
    } catch (error) {
      logger.error('Error searching contacts', { query, deviceId, error });
      throw error;
    }
  }
}
