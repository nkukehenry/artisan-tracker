import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AppActivity, AppUsageSummary, AppActivitiesResponse, AppUsageSummaryResponse, AppActivityFilters } from '@/types/appActivity';
import { getAppActivities, getAppUsageSummary } from '@/lib/appActivityApi';

interface AppActivityState {
  appActivities: AppActivity[];
  usageSummary: AppUsageSummary | null;
  isLoading: boolean;
  summaryLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  filters: AppActivityFilters;
  selectedDeviceId: string | null;
}

const initialState: AppActivityState = {
  appActivities: [],
  usageSummary: null,
  isLoading: false,
  summaryLoading: false,
  error: null,
  pagination: null,
  filters: {
    page: 1,
    limit: 20,
  },
  selectedDeviceId: null,
};

export const loadAppActivities = createAsyncThunk(
  'appActivity/loadAppActivities',
  async ({ deviceId, filters }: { deviceId: string; filters?: AppActivityFilters }) => {
    const result = await getAppActivities(deviceId, filters);
    
    if (result.success) {
      return result;
    } else {
      throw new Error(result.error?.message || 'Failed to load app activities');
    }
  }
);

export const loadAppUsageSummary = createAsyncThunk(
  'appActivity/loadAppUsageSummary',
  async (deviceId: string) => {
    const result = await getAppUsageSummary(deviceId);
    
    if (result.success) {
      return result;
    } else {
      throw new Error(result.error?.message || 'Failed to load app usage summary');
    }
  }
);

const appActivitySlice = createSlice({
  name: 'appActivity',
  initialState,
  reducers: {
    setSelectedDevice: (state, action: PayloadAction<string>) => {
      state.selectedDeviceId = action.payload;
      state.appActivities = [];
      state.usageSummary = null;
      state.pagination = null;
      state.error = null;
    },
    updateFilters: (state, action: PayloadAction<Partial<AppActivityFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearAppActivityData: (state) => {
      state.appActivities = [];
      state.usageSummary = null;
      state.pagination = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadAppActivities.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadAppActivities.fulfilled, (state, action) => {
        state.isLoading = false;
        state.appActivities = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(loadAppActivities.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load app activities';
      })
      .addCase(loadAppUsageSummary.pending, (state) => {
        state.summaryLoading = true;
        state.error = null;
      })
      .addCase(loadAppUsageSummary.fulfilled, (state, action) => {
        state.summaryLoading = false;
        state.usageSummary = action.payload.data;
        state.error = null;
      })
      .addCase(loadAppUsageSummary.rejected, (state, action) => {
        state.summaryLoading = false;
        state.error = action.error.message || 'Failed to load app usage summary';
      });
  },
});

export const { setSelectedDevice, updateFilters, clearAppActivityData, clearError } = appActivitySlice.actions;
export default appActivitySlice.reducer;
