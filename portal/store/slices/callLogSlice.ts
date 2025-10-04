import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CallLog, CallLogsResponse, CallLogFilters } from '@/types/callLog';
import { getCallLogs } from '@/lib/callLogApi';

interface CallLogState {
  callLogs: CallLog[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  filters: CallLogFilters;
  selectedDeviceId: string | null;
}

const initialState: CallLogState = {
  callLogs: [],
  isLoading: false,
  error: null,
  pagination: null,
  filters: {
    page: 1,
    limit: 20,
  },
  selectedDeviceId: null,
};

export const loadCallLogs = createAsyncThunk(
  'callLogs/loadCallLogs',
  async ({ deviceId, filters }: { deviceId: string; filters?: CallLogFilters }) => {
    const result = await getCallLogs(deviceId, filters);
    
    if (result.success) {
      return result;
    } else {
      throw new Error(result.error?.message || 'Failed to load call logs');
    }
  }
);

const callLogSlice = createSlice({
  name: 'callLogs',
  initialState,
  reducers: {
    setSelectedDevice: (state, action: PayloadAction<string>) => {
      state.selectedDeviceId = action.payload;
      state.callLogs = [];
      state.pagination = null;
      state.error = null;
    },
    updateFilters: (state, action: PayloadAction<Partial<CallLogFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCallLogs: (state) => {
      state.callLogs = [];
      state.pagination = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadCallLogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadCallLogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.callLogs = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(loadCallLogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load call logs';
      });
  },
});

export const { setSelectedDevice, updateFilters, clearCallLogs, clearError } = callLogSlice.actions;
export default callLogSlice.reducer;
