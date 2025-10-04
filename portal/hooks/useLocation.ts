import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { loadLocationHistory, loadCurrentLocation, setSelectedDevice, updateFilters, clearLocationData } from '@/store/slices/locationSlice';

export const useLocation = (deviceId?: string) => {
  const dispatch = useAppDispatch();
  const { 
    locationHistory, 
    currentLocation,
    isLoading, 
    currentLocationLoading,
    error, 
    pagination, 
    filters, 
    selectedDeviceId 
  } = useAppSelector((state) => state.location);

  const loadHistory = useCallback(
    (newFilters?: typeof filters) => {
      if (!deviceId) return;
      dispatch(loadLocationHistory({ deviceId, filters: newFilters || filters }));
    },
    [deviceId, dispatch, filters]
  );

  const loadCurrent = useCallback(() => {
    if (!deviceId) return;
    dispatch(loadCurrentLocation(deviceId));
  }, [deviceId, dispatch]);

  const updateFiltersAndLoad = useCallback(
    (newFilters: Partial<typeof filters>) => {
      dispatch(updateFilters(newFilters));
      if (deviceId) {
        dispatch(loadLocationHistory({ deviceId, filters: { ...filters, ...newFilters } }));
      }
    },
    [deviceId, dispatch, filters]
  );

  const setDevice = useCallback(
    (newDeviceId: string) => {
      dispatch(setSelectedDevice(newDeviceId));
      dispatch(loadLocationHistory({ deviceId: newDeviceId, filters }));
      dispatch(loadCurrentLocation(newDeviceId));
    },
    [dispatch, filters]
  );

  const clearData = useCallback(() => {
    dispatch(clearLocationData());
  }, [dispatch]);

  // Load data when deviceId changes
  useEffect(() => {
    if (deviceId && deviceId !== selectedDeviceId) {
      setDevice(deviceId);
    }
  }, [deviceId, selectedDeviceId, setDevice]);

  return {
    locationHistory,
    currentLocation,
    isLoading,
    currentLocationLoading,
    error,
    pagination,
    filters,
    selectedDeviceId,
    loadHistory,
    loadCurrent,
    updateFilters: updateFiltersAndLoad,
    setDevice,
    clearData,
  };
};
