import apiClient, { handleApiError } from './api';
import { SendCommandData, DeviceCommand } from '@/types/command';

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
    } catch (error: any) {
      return {
        success: false,
        error: handleApiError(error),
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
    } catch (error: any) {
      return {
        success: false,
        error: handleApiError(error),
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
    } catch (error: any) {
      return {
        success: false,
        error: handleApiError(error),
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
    } catch (error: any) {
      return {
        success: false,
        error: handleApiError(error),
      };
    }
  },
};
