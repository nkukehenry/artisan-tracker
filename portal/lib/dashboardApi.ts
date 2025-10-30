import apiClient, { handleApiError } from './api';

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

export async function fetchDashboardMetrics(params?: { deviceId?: string; days?: number }) {
    try {
        const response = await apiClient.get('/portal/dashboard', { params });
        return response.data.data as MetricsCountResponse;
    } catch (error: any) {
        throw handleApiError(error);
    }
}


