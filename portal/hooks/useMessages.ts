'use client';

import { useDeviceContext } from '@/contexts/DeviceContext';
import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { loadMessages, loadMessageConversations, updateFilters, clearMessages } from '@/store/slices/messageSlice';

export const useMessages = () => {
  const { selectedDevice } = useDeviceContext();
  const dispatch = useAppDispatch();
  const {
    messages,
    conversations,
    isLoading,
    conversationsLoading,
    error,
    pagination,
    filters
  } = useAppSelector((state) => state.messages);

  const loadData = useCallback(
    (newFilters?: typeof filters) => {
      if (!selectedDevice) return;
      dispatch(loadMessages({ deviceId: selectedDevice.deviceId, filters: newFilters || filters }));
    },
    [selectedDevice, dispatch, filters]
  );

  const loadConversations = useCallback(() => {
    if (!selectedDevice) return;
    dispatch(loadMessageConversations(selectedDevice.deviceId));
  }, [selectedDevice, dispatch]);

  const updateFiltersAndLoad = useCallback(
    (newFilters: Partial<typeof filters>) => {
      dispatch(updateFilters(newFilters));
      if (selectedDevice) {
        dispatch(loadMessages({ deviceId: selectedDevice.deviceId, filters: { ...filters, ...newFilters } }));
      }
    },
    [selectedDevice, dispatch, filters]
  );

  const changePage = useCallback(
    (page: number) => {
      if (selectedDevice) {
        dispatch(loadMessages({ deviceId: selectedDevice.deviceId, filters: { ...filters, page } }));
      }
    },
    [selectedDevice, dispatch, filters]
  );

  const changeLimit = useCallback(
    (limit: number) => {
      if (selectedDevice) {
        dispatch(loadMessages({ deviceId: selectedDevice.deviceId, filters: { ...filters, limit, page: 1 } }));
      }
    },
    [selectedDevice, dispatch, filters]
  );

  const clearData = useCallback(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  // Load data when selected device changes
  useEffect(() => {
    if (selectedDevice) {
      loadData();
      loadConversations();
    } else {
      clearData();
    }
  }, [selectedDevice, loadData, loadConversations, clearData]);

  return {
    messages,
    conversations,
    isLoading,
    conversationsLoading,
    error,
    pagination,
    filters,
    selectedDevice,
    loadData,
    loadConversations,
    updateFilters: updateFiltersAndLoad,
    changePage,
    changeLimit,
    clearData,
  };
};