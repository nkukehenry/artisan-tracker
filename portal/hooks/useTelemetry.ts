import { useState, useEffect } from 'react';
import { telemetryApi } from '@/lib/telemetryApi';
import { Telemetry } from '@/types/telemetry';

export const useTelemetry = (deviceId: string | null) => {
    const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchLatestTelemetry = async () => {
        if (!deviceId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await telemetryApi.getLatestTelemetry(deviceId);
            if (response.success) {
                setTelemetry(response.data.telemetry);
            } else {
                setError('Failed to fetch telemetry data');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch telemetry data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLatestTelemetry();
    }, [deviceId]);

    return {
        telemetry,
        loading,
        error,
        refetch: fetchLatestTelemetry
    };
};
