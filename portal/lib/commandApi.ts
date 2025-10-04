import apiClient, { handleApiError } from './api';
import { AxiosError } from 'axios';
import { SendCommandData } from '@/types/command';

// Command API endpoints
export const commandApi = {
  // Send command to device
  sendCommand: async (deviceId: string, data: SendCommandData) => {
    try {
      const response = await apiClient.post(`/devices/${deviceId}/commands`, data);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? handleApiError(error as AxiosError) : { message: 'An unexpected error occurred', status: 0, data: null },
      };
    }
  },

  // Get device commands history
  getDeviceCommands: async (deviceId: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    try {
      const response = await apiClient.get(`/devices/${deviceId}/commands`, { params });
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? handleApiError(error as AxiosError) : { message: 'An unexpected error occurred', status: 0, data: null },
      };
    }
  },

  // Get specific command details
  getCommand: async (commandId: string) => {
    try {
      const response = await apiClient.get(`/commands/${commandId}`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? handleApiError(error as AxiosError) : { message: 'An unexpected error occurred', status: 0, data: null },
      };
    }
  },

  // Cancel a pending command
  cancelCommand: async (commandId: string) => {
    try {
      const response = await apiClient.patch(`/commands/${commandId}/cancel`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? handleApiError(error as AxiosError) : { message: 'An unexpected error occurred', status: 0, data: null },
      };
    }
  },
};
