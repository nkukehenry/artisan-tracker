'use client';

import { useDeviceContext } from '@/contexts/DeviceContext';
import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  loadMediaFiles,
  deleteMedia,
  downloadMedia,
  updateFilters,
  clearMediaData,
} from '@/store/slices/mediaSlice';
import { MediaFilters } from '@/types/media';

export const useMedia = () => {
  const { selectedDevice } = useDeviceContext();
  const dispatch = useAppDispatch();
  const {
    mediaFiles,
    filters,
    pagination,
    isLoading,
    error,
  } = useAppSelector((state) => state.media);

  // Load media files
  const loadMedia = useCallback(async () => {
    if (selectedDevice) {
      await dispatch(loadMediaFiles({ deviceId: selectedDevice.deviceId, filters }));
    }
  }, [dispatch, selectedDevice, filters]);

  // Delete media file
  const handleDeleteMedia = useCallback(
    async (mediaId: string) => {
      await dispatch(deleteMedia(mediaId));
      // Reload media files after deletion
      loadMedia();
    },
    [dispatch, loadMedia]
  );

  // Download media file
  const handleDownloadMedia = useCallback(
    async (mediaId: string, fileName?: string) => {
      await dispatch(downloadMedia({ mediaId, fileName }));
    },
    [dispatch]
  );

  // Update filters
  const handleUpdateFilters = useCallback(
    (newFilters: Partial<MediaFilters>) => {
      dispatch(updateFilters(newFilters));
    },
    [dispatch]
  );

  // Set selected device
  const handleSetSelectedDevice = useCallback(
    (deviceId: string | null) => {
      // This function is not needed since we're using useDeviceContext
      // The device selection is handled by the parent component
      console.log('Device selection handled by parent component');
    },
    []
  );

  // Clear media data
  const handleClearMediaData = useCallback(() => {
    dispatch(clearMediaData());
  }, [dispatch]);

  // Load media files when selected device changes
  useEffect(() => {
    if (selectedDevice) {
      loadMedia();
    } else {
      clearMediaData();
    }
  }, [selectedDevice, loadMedia, clearMediaData]);

  return {
    mediaFiles,
    selectedDevice,
    filters,
    pagination,
    isLoading,
    error,
    loadMedia,
    deleteMedia: handleDeleteMedia,
    downloadMedia: handleDownloadMedia,
    updateFilters: handleUpdateFilters,
    setSelectedDevice: handleSetSelectedDevice,
    clearMediaData: handleClearMediaData,
  };
};