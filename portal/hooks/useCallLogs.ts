'use client';

import { useDeviceContext } from '@/contexts/DeviceContext';
import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { loadCallLogs, updateFilters, clearCallLogs } from '@/store/slices/callLogSlice';

export const useCallLogs = () => {
  const { selectedDevice } = useDeviceContext();
  const dispatch = useAppDispatch();
  const { callLogs, isLoading, error, pagination, filters } = useAppSelector(
    (state) => state.callLogs
  );

  const loadData = useCallback(
    (newFilters?: typeof filters) => {
      if (!selectedDevice) return;
      dispatch(loadCallLogs({ deviceId: selectedDevice.deviceId, filters: newFilters || filters }));
    },
    [selectedDevice, dispatch, filters]
  );

  const updateFiltersAndLoad = useCallback(
    (newFilters: Partial<typeof filters>) => {
      dispatch(updateFilters(newFilters));
      if (selectedDevice) {
        dispatch(loadCallLogs({ deviceId: selectedDevice.deviceId, filters: { ...filters, ...newFilters } }));
      }
    },
    [selectedDevice, dispatch, filters]
  );

  const clearData = useCallback(() => {
    dispatch(clearCallLogs());
  }, [dispatch]);

  // Load data when selected device changes
  useEffect(() => {
    if (selectedDevice) {
      loadData();
    } else {
      clearData();
    }
  }, [selectedDevice, loadData, clearData]);

  return {
    callLogs,
    isLoading,
    error,
    pagination,
    filters,
    selectedDevice,
    loadData,
    updateFilters: updateFiltersAndLoad,
    clearData,
  };
};