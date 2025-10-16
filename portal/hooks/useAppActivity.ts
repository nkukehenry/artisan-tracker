'use client';

import { useDeviceContext } from '@/contexts/DeviceContext';
import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { loadAppActivities, loadAppUsageSummary, updateFilters, clearAppActivityData } from '@/store/slices/appActivitySlice';

export const useAppActivity = () => {
  const { selectedDevice } = useDeviceContext();
  const dispatch = useAppDispatch();
  const {
    appActivities,
    usageSummary,
    isLoading,
    summaryLoading,
    error,
    pagination,
    filters
  } = useAppSelector((state) => state.appActivity);

  const loadActivities = useCallback(
    (newFilters?: typeof filters) => {
      if (!selectedDevice) return;
      dispatch(loadAppActivities({ deviceId: selectedDevice.deviceId, filters: newFilters || filters }));
    },
    [selectedDevice, dispatch, filters]
  );

  const loadSummary = useCallback(() => {
    if (!selectedDevice) return;
    dispatch(loadAppUsageSummary(selectedDevice.deviceId));
  }, [selectedDevice, dispatch]);

  const updateFiltersAndLoad = useCallback(
    (newFilters: Partial<typeof filters>) => {
      dispatch(updateFilters(newFilters));
      if (selectedDevice) {
        dispatch(loadAppActivities({ deviceId: selectedDevice.deviceId, filters: { ...filters, ...newFilters } }));
      }
    },
    [selectedDevice, dispatch, filters]
  );

  const clearData = useCallback(() => {
    dispatch(clearAppActivityData());
  }, [dispatch]);

  // Load data when selected device changes
  useEffect(() => {
    if (selectedDevice) {
      loadActivities();
      loadSummary();
    } else {
      clearData();
    }
  }, [selectedDevice, loadActivities, loadSummary, clearData]);

  return {
    appActivities,
    usageSummary,
    isLoading,
    summaryLoading,
    error,
    pagination,
    filters,
    selectedDevice,
    loadActivities,
    loadSummary,
    updateFilters: updateFiltersAndLoad,
    clearData,
  };
};