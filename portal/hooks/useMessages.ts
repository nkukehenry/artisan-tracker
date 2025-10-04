import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { loadMessages, loadMessageConversations, setSelectedDevice, updateFilters, clearMessages } from '@/store/slices/messageSlice';

export const useMessages = (deviceId?: string) => {
  const dispatch = useAppDispatch();
  const { 
    messages, 
    conversations,
    isLoading, 
    conversationsLoading,
    error, 
    pagination, 
    filters, 
    selectedDeviceId 
  } = useAppSelector((state) => state.messages);

  const loadData = useCallback(
    (newFilters?: typeof filters) => {
      if (!deviceId) return;
      dispatch(loadMessages({ deviceId, filters: newFilters || filters }));
    },
    [deviceId, dispatch, filters]
  );

  const loadConversations = useCallback(() => {
    if (!deviceId) return;
    dispatch(loadMessageConversations(deviceId));
  }, [deviceId, dispatch]);

  const updateFiltersAndLoad = useCallback(
    (newFilters: Partial<typeof filters>) => {
      dispatch(updateFilters(newFilters));
      if (deviceId) {
        dispatch(loadMessages({ deviceId, filters: { ...filters, ...newFilters } }));
      }
    },
    [deviceId, dispatch, filters]
  );

  const setDevice = useCallback(
    (newDeviceId: string) => {
      dispatch(setSelectedDevice(newDeviceId));
      dispatch(loadMessages({ deviceId: newDeviceId, filters }));
      dispatch(loadMessageConversations(newDeviceId));
    },
    [dispatch, filters]
  );

  const clearData = useCallback(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  // Load data when deviceId changes
  useEffect(() => {
    if (deviceId && deviceId !== selectedDeviceId) {
      setDevice(deviceId);
    }
  }, [deviceId, selectedDeviceId, setDevice]);

  return {
    messages,
    conversations,
    isLoading,
    conversationsLoading,
    error,
    pagination,
    filters,
    selectedDeviceId,
    loadData,
    loadConversations,
    updateFilters: updateFiltersAndLoad,
    setDevice,
    clearData,
  };
};
