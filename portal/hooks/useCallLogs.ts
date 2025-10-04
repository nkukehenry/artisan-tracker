import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { loadCallLogs, setSelectedDevice, updateFilters, clearCallLogs } from '@/store/slices/callLogSlice';

export const useCallLogs = (deviceId?: string) => {
  const dispatch = useAppDispatch();
  const { callLogs, isLoading, error, pagination, filters, selectedDeviceId } = useAppSelector(
    (state) => state.callLogs
  );

  const loadData = useCallback(
    (newFilters?: typeof filters) => {
      if (!deviceId) return;
      dispatch(loadCallLogs({ deviceId, filters: newFilters || filters }));
    },
    [deviceId, dispatch, filters]
  );

  const updateFiltersAndLoad = useCallback(
    (newFilters: Partial<typeof filters>) => {
      dispatch(updateFilters(newFilters));
      if (deviceId) {
        dispatch(loadCallLogs({ deviceId, filters: { ...filters, ...newFilters } }));
      }
    },
    [deviceId, dispatch, filters]
  );

  const setDevice = useCallback(
    (newDeviceId: string) => {
      dispatch(setSelectedDevice(newDeviceId));
      dispatch(loadCallLogs({ deviceId: newDeviceId, filters }));
    },
    [dispatch, filters]
  );

  const clearData = useCallback(() => {
    dispatch(clearCallLogs());
  }, [dispatch]);

  // Load data when deviceId changes
  useEffect(() => {
    if (deviceId && deviceId !== selectedDeviceId) {
      setDevice(deviceId);
    }
  }, [deviceId, selectedDeviceId, setDevice]);

  return {
    callLogs,
    isLoading,
    error,
    pagination,
    filters,
    selectedDeviceId,
    loadData,
    updateFilters: updateFiltersAndLoad,
    setDevice,
    clearData,
  };
};
