import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { loadAppActivities, loadAppUsageSummary, setSelectedDevice, updateFilters, clearAppActivityData } from '@/store/slices/appActivitySlice';

export const useAppActivity = (deviceId?: string) => {
  const dispatch = useAppDispatch();
  const { 
    appActivities, 
    usageSummary,
    isLoading, 
    summaryLoading,
    error, 
    pagination, 
    filters, 
    selectedDeviceId 
  } = useAppSelector((state) => state.appActivity);

  const loadActivities = useCallback(
    (newFilters?: typeof filters) => {
      if (!deviceId) return;
      dispatch(loadAppActivities({ deviceId, filters: newFilters || filters }));
    },
    [deviceId, dispatch, filters]
  );

  const loadSummary = useCallback(() => {
    if (!deviceId) return;
    dispatch(loadAppUsageSummary(deviceId));
  }, [deviceId, dispatch]);

  const updateFiltersAndLoad = useCallback(
    (newFilters: Partial<typeof filters>) => {
      dispatch(updateFilters(newFilters));
      if (deviceId) {
        dispatch(loadAppActivities({ deviceId, filters: { ...filters, ...newFilters } }));
      }
    },
    [deviceId, dispatch, filters]
  );

  const setDevice = useCallback(
    (newDeviceId: string) => {
      dispatch(setSelectedDevice(newDeviceId));
      dispatch(loadAppActivities({ deviceId: newDeviceId, filters }));
      dispatch(loadAppUsageSummary(newDeviceId));
    },
    [dispatch, filters]
  );

  const clearData = useCallback(() => {
    dispatch(clearAppActivityData());
  }, [dispatch]);

  // Load data when deviceId changes
  useEffect(() => {
    if (deviceId && deviceId !== selectedDeviceId) {
      setDevice(deviceId);
    }
  }, [deviceId, selectedDeviceId, setDevice]);

  return {
    appActivities,
    usageSummary,
    isLoading,
    summaryLoading,
    error,
    pagination,
    filters,
    selectedDeviceId,
    loadActivities,
    loadSummary,
    updateFilters: updateFiltersAndLoad,
    setDevice,
    clearData,
  };
};
