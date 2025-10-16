'use client';

import { useDeviceContext } from '@/contexts/DeviceContext';
import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { loadLocationHistory, loadCurrentLocation, updateFilters, clearLocationData } from '@/store/slices/locationSlice';

export const useLocation = () => {
  const { selectedDevice } = useDeviceContext();
  const dispatch = useAppDispatch();
  const {
    locationHistory,
    currentLocation,
    isLoading,
    currentLocationLoading,
    error,
    pagination,
    filters
  } = useAppSelector((state) => state.location);

  const loadHistory = useCallback(
    (newFilters?: typeof filters) => {
      if (!selectedDevice) return;
      dispatch(loadLocationHistory({ deviceId: selectedDevice.deviceId, filters: newFilters || filters }));
    },
    [selectedDevice, dispatch, filters]
  );

  const loadCurrent = useCallback(() => {
    if (!selectedDevice) return;
    dispatch(loadCurrentLocation(selectedDevice.deviceId));
  }, [selectedDevice, dispatch]);

  const updateFiltersAndLoad = useCallback(
    (newFilters: Partial<typeof filters>) => {
      dispatch(updateFilters(newFilters));
      if (selectedDevice) {
        dispatch(loadLocationHistory({ deviceId: selectedDevice.deviceId, filters: { ...filters, ...newFilters } }));
      }
    },
    [selectedDevice, dispatch, filters]
  );

  const clearData = useCallback(() => {
    dispatch(clearLocationData());
  }, [dispatch]);

  // Load data when selected device changes
  useEffect(() => {
    if (selectedDevice) {
      loadHistory();
      loadCurrent();
    } else {
      clearData();
    }
  }, [selectedDevice, loadHistory, loadCurrent, clearData]);

  return {
    locationHistory,
    currentLocation,
    isLoading,
    currentLocationLoading,
    error,
    pagination,
    filters,
    selectedDevice,
    loadHistory,
    loadCurrent,
    updateFilters: updateFiltersAndLoad,
    clearData,
  };
};