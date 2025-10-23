import apiClient from './api';
import { TelemetryResponse } from '@/types/telemetry';

export const telemetryApi = {
    /**
     * Get latest telemetry data for a device
     */
    getLatestTelemetry: async (deviceId: string): Promise<TelemetryResponse> => {
        const response = await apiClient.get(`/telemetry/device/${deviceId}/latest`);
        return response.data;
    },

    /**
     * Get telemetry history for a device with pagination
     */
    getTelemetryHistory: async (
        deviceId: string,
        page: number = 1,
        limit: number = 20
    ): Promise<unknown> => {
        const response = await apiClient.get(`/telemetry/device/${deviceId}`, {
            params: { page, limit }
        });
        return response.data;
    }
};
