import { BaseEntity, BaseRepository } from './repository.interface';

export interface Message extends BaseEntity {
  id: string;
  deviceId: string;
  messageType: 'SMS' | 'WHATSAPP' | 'TELEGRAM' | 'FACEBOOK' | 'INSTAGRAM' | 'TWITTER' | 'EMAIL' | 'OTHER';
  platform?: string;
  sender?: string;
  recipient?: string;
  content: string;
  direction?: 'INCOMING' | 'OUTGOING';
  timestamp: Date;
  isRead: boolean;
  metadata?: Record<string, any>;
  isEncrypted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMessageData {
  deviceId: string;
  messageType: 'SMS' | 'WHATSAPP' | 'TELEGRAM' | 'FACEBOOK' | 'INSTAGRAM' | 'TWITTER' | 'EMAIL' | 'OTHER';
  platform?: string;
  sender?: string;
  recipient?: string;
  content: string;
  direction?: 'INCOMING' | 'OUTGOING';
  timestamp: Date;
  isRead: boolean;
  metadata?: Record<string, any>;
  isEncrypted: boolean;
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
  }>;

  getConversations(
    deviceId: string,
    paginationOptions: { page: number; limit: number },
    filterOptions?: {
      messageType?: string;
    }
  ): Promise<MessageConversation[]>;
}