import { useState, useEffect, useCallback } from 'react';
import { telemetryApi } from '@/lib/telemetryApi';
import { Telemetry } from '@/types/telemetry';

export const useTelemetry = (deviceId: string | null) => {
    const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchLatestTelemetry = useCallback(async () => {
        if (!deviceId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await telemetryApi.getLatestTelemetry(deviceId);
            if (response.success) {
                setTelemetry(response.data.telemetry);
            } else {
                setError('Failed to fetch telemetry data');
                setTelemetry(null); // Clear cached telemetry on error
            }
        } catch (err: unknown) {
            const errorMessage = err && typeof err === 'object' && 'response' in err
                ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
                : undefined;
            setError(errorMessage || 'Failed to fetch telemetry data');
            setTelemetry(null); // Clear cached telemetry on error
        } finally {
            setLoading(false);
        }
    }, [deviceId]);

    useEffect(() => {
        setTelemetry(null); // Clear telemetry when device changes
        setError(null);
        fetchLatestTelemetry();
    }, [deviceId, fetchLatestTelemetry]);

    return {
        telemetry,
        loading,
        error,
        refetch: fetchLatestTelemetry
    };
};
