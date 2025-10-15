import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  loadMediaFiles,
  deleteMedia,
  downloadMedia,
  setSelectedDevice,
  updateFilters,
  clearMediaData,
} from '@/store/slices/mediaSlice';
import { MediaFilters } from '@/types/media';

export const useMedia = (deviceId?: string) => {
  const dispatch = useAppDispatch();
  const {
    mediaFiles,
    selectedDeviceId,
    filters,
    pagination,
    isLoading,
    error,
  } = useAppSelector((state) => state.media);

  // Load media files
  const loadMedia = useCallback(async () => {
    const targetDeviceId = deviceId || selectedDeviceId;
    if (targetDeviceId) {
      await dispatch(loadMediaFiles({ deviceId: targetDeviceId, filters }));
    }
  }, [dispatch, deviceId, selectedDeviceId, filters]);

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
    async (mediaId: string, fileName: string) => {
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
    (newDeviceId: string | null) => {
      dispatch(setSelectedDevice(newDeviceId));
    },
    [dispatch]
  );

  // Clear media data
  const handleClearMediaData = useCallback(() => {
    dispatch(clearMediaData());
  }, [dispatch]);

  // Load media files when device or filters change
  useEffect(() => {
    if (deviceId || selectedDeviceId) {
      loadMedia();
    }
  }, [deviceId, selectedDeviceId, filters.page, filters.limit, filters.fileType, loadMedia]);

  return {
    mediaFiles,
    selectedDeviceId,
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

