import { useEffect, useMemo, useState } from 'react';
import { fetchDashboardMetrics, MetricsCountResponse } from '@/lib/dashboardApi';
import { useDeviceContext } from '@/contexts/DeviceContext';

export function useDashboard() {
    const { selectedDevice } = useDeviceContext();
    const [data, setData] = useState<MetricsCountResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const params = useMemo(() => ({
        deviceId: selectedDevice?.deviceId,
        days: 30,
    }), [selectedDevice?.deviceId]);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchDashboardMetrics({ deviceId: params.deviceId, days: params.days });
            setData(result);
        } catch (e: any) {
            setError(e?.message || 'Failed to load metrics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.deviceId]);

    return { data, loading, error, reload: load };
}


