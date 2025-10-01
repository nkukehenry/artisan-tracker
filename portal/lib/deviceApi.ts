import apiClient, { handleApiError } from './api';

// Device API endpoints
export const deviceApi = {
  // Get all devices for the current tenant
  getDevices: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    type?: string;
  }) => {
    try {
      const response = await apiClient.get('/devices', { params });
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

  // Get a single device by ID
  getDevice: async (deviceId: string) => {
    try {
      const response = await apiClient.get(`/devices/${deviceId}`);
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

  // Create a new device
  createDevice: async (data: {
    deviceId: string;
    name: string;
    model: string;
    osVersion: string;
    appVersion: string;
  }) => {
    try {
      const response = await apiClient.post('/devices/register', data);
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

  // Update an existing device
  updateDevice: async (deviceId: string, data: {
    name?: string;
    type?: string;
    owner?: string;
    location?: string;
    description?: string;
  }) => {
    try {
      const response = await apiClient.put(`/devices/${deviceId}`, data);
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

  // Delete a device
  deleteDevice: async (deviceId: string) => {
    try {
      const response = await apiClient.delete(`/devices/${deviceId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: handleApiError(error),
      };
    }
  },

  // Get device location history
  getDeviceLocationHistory: async (deviceId: string, params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }) => {
    try {
      const response = await apiClient.get(`/devices/${deviceId}/locations`, { params });
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

  // Get device call logs
  getDeviceCallLogs: async (deviceId: string, params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }) => {
    try {
      const response = await apiClient.get(`/devices/${deviceId}/call-logs`, { params });
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

  // Get device messages
  getDeviceMessages: async (deviceId: string, params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }) => {
    try {
      const response = await apiClient.get(`/devices/${deviceId}/messages`, { params });
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

  // Get device media
  getDeviceMedia: async (deviceId: string, params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    type?: string;
  }) => {
    try {
      const response = await apiClient.get(`/devices/${deviceId}/media`, { params });
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

  // Get device app activities
  getDeviceAppActivities: async (deviceId: string, params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }) => {
    try {
      const response = await apiClient.get(`/devices/${deviceId}/app-activities`, { params });
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

  // Send command to device
  sendDeviceCommand: async (deviceId: string, command: {
    type: string;
    payload?: any;
  }) => {
    try {
      const response = await apiClient.post(`/devices/${deviceId}/commands`, command);
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

  // Get device commands
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
};
