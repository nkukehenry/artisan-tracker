import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { mediaApi } from '@/lib/mediaApi';
import { Media, MediaFilters } from '@/types/media';
import { downloadFile } from '@/lib/downloadUtils';

interface MediaState {
  mediaFiles: Media[];
  selectedDeviceId: string | null;
  filters: MediaFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: MediaState = {
  mediaFiles: [],
  selectedDeviceId: null,
  filters: {
    page: 1,
    limit: 20,
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  },
  isLoading: false,
  error: null,
};

// Async thunks
export const loadMediaFiles = createAsyncThunk(
  'media/loadMediaFiles',
  async ({ deviceId, filters }: { deviceId: string; filters?: MediaFilters }) => {
    const result = await mediaApi.getMediaFiles(deviceId, filters);
    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to load media files');
    }
    return result.data;
  }
);

export const deleteMedia = createAsyncThunk(
  'media/deleteMedia',
  async (mediaId: string) => {
    const result = await mediaApi.deleteMediaFile(mediaId);
    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to delete media file');
    }
    return mediaId;
  }
);

export const downloadMedia = createAsyncThunk(
  'media/downloadMedia',
  async ({ mediaId, fileName }: { mediaId: string; fileName?: string }) => {
    const result = await mediaApi.downloadMediaFile(mediaId);
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || 'Failed to download media file');
    }

    // Use filename from API response or fallback to provided fileName or mediaId
    const downloadFileName = result.filename || fileName || `media_${mediaId}`;

    // Use the enhanced download utility
    await downloadFile(result.data, downloadFileName);

    return { fileName: downloadFileName, mediaId };
  }
);

const mediaSlice = createSlice({
  name: 'media',
  initialState,
  reducers: {
    setSelectedDevice: (state, action: PayloadAction<string | null>) => {
      state.selectedDeviceId = action.payload;
      state.mediaFiles = [];
      state.filters.page = 1;
    },
    updateFilters: (state, action: PayloadAction<Partial<MediaFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearMediaData: (state) => {
      state.mediaFiles = [];
      state.selectedDeviceId = null;
      state.filters = initialState.filters;
      state.pagination = initialState.pagination;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Load media files
    builder.addCase(loadMediaFiles.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loadMediaFiles.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.mediaFiles = action.payload.data?.data || [];
        state.pagination = {
          page: action.payload.data?.pagination?.page || 1,
          limit: action.payload.data?.pagination?.limit || 20,
          total: action.payload.data?.pagination?.total || 0,
          totalPages: action.payload.data?.pagination?.totalPages || 0,
          hasNext: action.payload.data?.pagination?.hasNext || false,
          hasPrev: action.payload.data?.pagination?.hasPrev || false,
        };
      }
    });
    builder.addCase(loadMediaFiles.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Failed to load media files';
    });

    // Delete media
    builder.addCase(deleteMedia.fulfilled, (state, action) => {
      state.mediaFiles = state.mediaFiles.filter((media) => media.id !== action.payload);
    });

    // Download media (no state changes needed, just for tracking)
    builder.addCase(downloadMedia.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(downloadMedia.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(downloadMedia.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Failed to download media file';
    });
  },
});

export const { setSelectedDevice, updateFilters, clearMediaData } = mediaSlice.actions;
export default mediaSlice.reducer;

