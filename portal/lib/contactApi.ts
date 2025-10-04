import apiClient from './api';
import { ContactsResponse } from '@/types/contact';
import { handleApiError } from './api';
import { AxiosError } from 'axios';

export const getContacts = async (
  deviceId: string,
  filters: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}
): Promise<ContactsResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);

    const response = await apiClient.get(`/contacts/device/${deviceId}?${params.toString()}`);
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
