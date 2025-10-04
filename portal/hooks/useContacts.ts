import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { loadContacts, setSelectedDevice, updateFilters, clearContacts } from '@/store/slices/contactSlice';

export const useContacts = (deviceId?: string) => {
  const dispatch = useAppDispatch();
  const { contacts, isLoading, error, pagination, filters, selectedDeviceId } = useAppSelector(
    (state) => state.contacts
  );

  const loadData = useCallback(
    (newFilters?: typeof filters) => {
      if (!deviceId) return;
      dispatch(loadContacts({ deviceId, filters: newFilters || filters }));
    },
    [deviceId, dispatch, filters]
  );

  const updateFiltersAndLoad = useCallback(
    (newFilters: Partial<typeof filters>) => {
      dispatch(updateFilters(newFilters));
      if (deviceId) {
        dispatch(loadContacts({ deviceId, filters: { ...filters, ...newFilters } }));
      }
    },
    [deviceId, dispatch, filters]
  );

  const setDevice = useCallback(
    (newDeviceId: string) => {
      dispatch(setSelectedDevice(newDeviceId));
      dispatch(loadContacts({ deviceId: newDeviceId, filters }));
    },
    [dispatch, filters]
  );

  const clearData = useCallback(() => {
    dispatch(clearContacts());
  }, [dispatch]);

  // Load data when deviceId changes
  useEffect(() => {
    if (deviceId && deviceId !== selectedDeviceId) {
      setDevice(deviceId);
    }
  }, [deviceId, selectedDeviceId, setDevice]);

  return {
    contacts,
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
