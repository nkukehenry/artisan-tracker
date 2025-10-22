import apiClient from './api';
import { MessagesResponse, MessageConversationsResponse } from '@/types/message';
import { handleApiError } from './api';
import { AxiosError } from 'axios';

export const getMessages = async (
  deviceId: string,
  filters: {
    page?: number;
    limit?: number;
    messageType?: 'SMS' | 'WHATSAPP' | 'TELEGRAM';
    isIncoming?: boolean;
    startDate?: string;
    endDate?: string;
  } = {}
): Promise<MessagesResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.messageType) params.append('messageType', filters.messageType);
    if (filters.isIncoming !== undefined) params.append('isIncoming', filters.isIncoming.toString());
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const response = await apiClient.get(`/messages/device/${deviceId}?${params.toString()}`);
    return response.data;
  } catch (error) {
    const apiError = error instanceof Error ? handleApiError(error as AxiosError) : { message: 'An unexpected error occurred', status: 0, data: null };
    return {
      success: false,
      error: apiError,
      data: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    };
  }
};

export const getMessageConversations = async (
  deviceId: string
): Promise<MessageConversationsResponse> => {
  try {
    const response = await apiClient.get(`/messages/device/${deviceId}/conversations`);
    return response.data;
  } catch (error) {
    const apiError = error instanceof Error ? handleApiError(error as AxiosError) : { message: 'An unexpected error occurred', status: 0, data: null };
    return {
      success: false,
      error: apiError,
      data: [],
    };
  }
};
