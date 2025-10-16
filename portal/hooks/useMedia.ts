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
    filters,
    pagination,
    isLoading,
    error,
    selectedDevice,
    loadMedia,
    deleteMedia: handleDeleteMedia,
    downloadMedia: handleDownloadMedia,
    updateFilters: handleUpdateFilters,
    clearMediaData: handleClearMediaData,
  };
};