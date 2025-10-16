'use client';

import { useDeviceContext } from '@/contexts/DeviceContext';
import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { loadContacts, updateFilters, clearContacts } from '@/store/slices/contactSlice';

export const useContacts = () => {
  const { selectedDevice } = useDeviceContext();
  const dispatch = useAppDispatch();
  const { contacts, isLoading, error, pagination, filters } = useAppSelector(
    (state) => state.contacts
  );

  const loadData = useCallback(
    (newFilters?: typeof filters) => {
      if (!selectedDevice) return;
      dispatch(loadContacts({ deviceId: selectedDevice.deviceId, filters: newFilters || filters }));
    },
    [selectedDevice, dispatch, filters]
  );

  const updateFiltersAndLoad = useCallback(
    (newFilters: Partial<typeof filters>) => {
      dispatch(updateFilters(newFilters));
      if (selectedDevice) {
        dispatch(loadContacts({ deviceId: selectedDevice.deviceId, filters: { ...filters, ...newFilters } }));
      }
    },
    [selectedDevice, dispatch, filters]
  );

  const clearData = useCallback(() => {
    dispatch(clearContacts());
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
    contacts,
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