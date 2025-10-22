import { BaseEntity, BaseRepository } from './repository.interface';
import { MessageType } from '../config/messageTypes';

export interface Message extends BaseEntity {
  id: string;
  deviceId: string;
  messageType: MessageType;
  // platform removed - not in Prisma schema
  sender?: string;
  recipient?: string;
  content: string;
  // direction removed - not in Prisma schema
  timestamp: Date;
  isRead: boolean;
  isIncoming: boolean;
  metadata?: Record<string, any>;
  location?: string;
  gpsCoordinates?: string;
  // isEncrypted: boolean; // Removed as not in Prisma schema
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMessageData {
  deviceId: string;
  messageType: MessageType;
  // platform removed - not in Prisma schema
  sender?: string;
  recipient?: string;
  content: string;
  // direction removed - not in Prisma schema
  timestamp: Date;
  isRead: boolean;
  isIncoming: boolean;
  metadata?: Record<string, any>;
  location?: string;
  gpsCoordinates?: string;
  // isEncrypted: boolean; // Removed as not in Prisma schema
}

export interface MessageConversation {
  contact: string;
  messageType: string;
  lastMessage: string;
  lastMessageTime: Date;
  messageCount: number;
  unreadCount: number;
}

export interface MessageRepository extends BaseRepository<Message> {
  findByDevice(
    deviceId: string,
    paginationOptions: { page: number; limit: number },
    filterOptions?: {
      messageType?: string;
      isIncoming?: boolean;
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
  }>;

  getConversations(
    deviceId: string,
    paginationOptions: { page: number; limit: number },
    filterOptions?: {
      messageType?: string;
    }
  ): Promise<MessageConversation[]>;
}