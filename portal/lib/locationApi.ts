import apiClient from './api';
import { LocationResponse, CurrentLocationResponse } from '@/types/location';
import { handleApiError } from './api';
import { AxiosError } from 'axios';

export const getLocationHistory = async (
  deviceId: string,
  filters: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  } = {}
): Promise<LocationResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const response = await apiClient.get(`/location/device/${deviceId}?${params.toString()}`);
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

export const getCurrentLocation = async (
  deviceId: string
): Promise<CurrentLocationResponse> => {
  try {
    const response = await apiClient.get(`/location/device/${deviceId}/current`);
    return response.data;
  } catch (error) {
    const apiError = error instanceof Error ? handleApiError(error as AxiosError) : { message: 'An unexpected error occurred', status: 0, data: null };
    return {
      success: false,
      error: apiError,
      data: {
        id: '',
        latitude: 0,
        longitude: 0,
        accuracy: 0,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
    };
  }
};
