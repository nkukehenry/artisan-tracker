import apiClient from './api';
import { AppActivitiesResponse, AppUsageSummaryResponse } from '@/types/appActivity';
import { handleApiError } from './api';
import { AxiosError } from 'axios';

export const getAppActivities = async (
  deviceId: string,
  filters: {
    page?: number;
    limit?: number;
    appName?: string;
    startDate?: string;
    endDate?: string;
  } = {}
): Promise<AppActivitiesResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.appName) params.append('appName', filters.appName);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const response = await apiClient.get(`/app-activities/device/${deviceId}?${params.toString()}`);
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

export const getAppUsageSummary = async (
  deviceId: string
): Promise<AppUsageSummaryResponse> => {
  try {
    const response = await apiClient.get(`/app-activities/device/${deviceId}/summary`);
    return response.data;
  } catch (error) {
    const apiError = error instanceof Error ? handleApiError(error as AxiosError) : { message: 'An unexpected error occurred', status: 0, data: null };
    return {
      success: false,
      error: apiError,
      data: {
        totalApps: 0,
        totalUsageTime: 0,
        mostUsedApps: '',
      },
    };
  }
};
