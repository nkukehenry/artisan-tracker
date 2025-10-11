export interface Message {
  id: string;
  messageType: 'SMS' | 'WHATSAPP' | 'TELEGRAM';
  sender: string;
  recipient: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  location?: string;
  gpsCoordinates?: string;
  metadata?: string;
  createdAt: string;
  [key: string]: unknown;
}

export interface MessageConversation {
  contact: string;
  messageType: 'SMS' | 'WHATSAPP' | 'TELEGRAM';
  messageCount: number;
  lastMessage: string;
  lastMessageTime: string;
}

export interface MessagesResponse {
  success: boolean;
  data: Message[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  error?: {
    message: string;
    status: number;
    data: unknown;
  };
}

export interface MessageConversationsResponse {
  success: boolean;
  data: MessageConversation[];
  error?: {
    message: string;
    status: number;
    data: unknown;
  };
}

export interface MessageFilters {
  page?: number;
  limit?: number;
  messageType?: 'SMS' | 'WHATSAPP' | 'TELEGRAM';
  startDate?: string;
  endDate?: string;
}
