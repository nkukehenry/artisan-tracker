import { PrismaClient } from '@prisma/client';
import { BaseRepositoryImpl } from './base.repository';
import { MessageRepository, Message, CreateMessageData } from '../interfaces/message.interface';
import { logger } from '../config/logger';

export class MessageRepositoryImpl extends BaseRepositoryImpl<Message> implements MessageRepository {
  constructor(prisma: PrismaClient) {
    super(prisma, 'message');
  }

  async findByDevice(
    deviceId: string,
    paginationOptions: { page: number; limit: number },
    filterOptions?: {
      messageType?: string;
      direction?: string;
      sender?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<{
    data: Message[];
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
      
      if (filterOptions?.messageType) {
        where.messageType = filterOptions.messageType;
      }
      
      if (filterOptions?.sender) {
        where.sender = { contains: filterOptions.sender };
      }
      
      if (filterOptions?.startDate || filterOptions?.endDate) {
        where.timestamp = {};
        if (filterOptions.startDate) where.timestamp.gte = filterOptions.startDate;
        if (filterOptions.endDate) where.timestamp.lte = filterOptions.endDate;
      }

      const [data, total] = await Promise.all([
        this.prisma.message.findMany({
          where,
          skip,
          take: limit,
          orderBy: { timestamp: 'desc' },
        }),
        this.prisma.message.count({ where }),
      ]);

      // Map Prisma data to interface format
      const mappedData: Message[] = data.map(item => ({
        id: item.id,
        deviceId: item.deviceId,
        messageType: item.messageType,
        // platform removed - not in Prisma schema
        sender: item.sender || undefined,
        recipient: item.recipient || undefined,
        content: item.content,
        // direction removed - not in Prisma schema
        timestamp: item.timestamp,
        isRead: item.isRead,
        metadata: (item.metadata as Record<string, any>) || {},
        location: item.location || undefined,
        gpsCoordinates: item.gpsCoordinates || undefined,
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
      logger.error('Error finding messages by device', { deviceId, paginationOptions, filterOptions, error });
      throw error;
    }
  }

  async getConversations(
    deviceId: string,
    paginationOptions: { page: number; limit: number },
    filterOptions?: {
      messageType?: string;
    }
  ): Promise<{
    contact: string;
    messageType: string;
    lastMessage: string;
    lastMessageTime: Date;
    messageCount: number;
    unreadCount: number;
  }[]> {
    try {
      const { page, limit } = paginationOptions;
      const skip = (page - 1) * limit;

      // First get the device to get its ID
      const device = await this.prisma.device.findUnique({
        where: { deviceId }
      });

      if (!device) {
        return [];
      }

      const where: any = { deviceId: device.id };
      
      if (filterOptions?.messageType) {
        where.messageType = filterOptions.messageType;
      }

      // Get unique conversations grouped by sender/recipient and message type
      const conversations = await this.prisma.message.groupBy({
        by: ['sender', 'messageType'],
        where: {
          ...where,
          sender: { not: null }, // Only group by non-null senders
        },
        _max: {
          timestamp: true,
        },
        _count: {
          id: true,
        },
        orderBy: {
          _max: {
            timestamp: 'desc',
          },
        },
        skip,
        take: limit,
      });

      // Get the latest message content and unread count for each conversation
      const conversationsWithContent = await Promise.all(
        conversations.map(async (conv) => {
          const [latestMessage, unreadCount] = await Promise.all([
            this.prisma.message.findFirst({
              where: {
                deviceId: device.id,
                sender: conv.sender,
                messageType: conv.messageType,
                timestamp: conv._max.timestamp || new Date(),
              },
              select: {
                content: true,
              },
            }),
            this.prisma.message.count({
              where: {
                deviceId: device.id,
                sender: conv.sender,
                messageType: conv.messageType,
                isRead: false,
              },
            }),
          ]);

          return {
            contact: conv.sender || 'Unknown',
            messageType: conv.messageType,
            lastMessage: latestMessage?.content || '',
            lastMessageTime: conv._max.timestamp || new Date(),
            messageCount: conv._count.id,
            unreadCount,
          };
        })
      );

      return conversationsWithContent;
    } catch (error) {
      logger.error('Error getting message conversations', { deviceId, paginationOptions, filterOptions, error });
      throw error;
    }
  }
}
