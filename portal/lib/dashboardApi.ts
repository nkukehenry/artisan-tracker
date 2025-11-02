import apiClient, { handleApiError } from './api';
import { AxiosError } from 'axios';

export interface MetricsCountResponse {
    counts: {
        messages: number;
        locations: number;
        calls: number;
        contacts: number;
        commands: number;
        mediaFiles: number;
    };
    breakdowns: {
        messagesByType: { type: string; count: number }[];
        callsByType: { type: string; count: number }[];
        mediaByType: { type: string; count: number }[];
        messageDirection?: { type: 'INCOMING' | 'OUTGOING'; count: number }[];
    };
    series: {
        messagesPerDay: { day: string; count: number }[];
        callsPerDay: { day: string; count: number }[];
    };
    scope: {
        tenantId: string;
        deviceId: string | null;
        days: number;
    };
}

export async function fetchDashboardMetrics(params?: { deviceId?: string; days?: number }): Promise<MetricsCountResponse> {
    try {
        type ApiResponse = {
            success: boolean;
            message: string;
            data: MetricsCountResponse;
        };
        const response = await apiClient.get<ApiResponse>('/portal/dashboard', { params: params as { deviceId?: string; days?: number } });
        return response.data.data;
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            throw handleApiError(error);
        }
        throw error;
    }
}


