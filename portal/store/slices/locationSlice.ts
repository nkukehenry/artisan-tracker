import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Location, LocationResponse, CurrentLocationResponse, LocationFilters } from '@/types/location';
import { getLocationHistory, getCurrentLocation } from '@/lib/locationApi';

interface LocationState {
  locationHistory: Location[];
  currentLocation: Location | null;
  isLoading: boolean;
  currentLocationLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  filters: LocationFilters;
  selectedDeviceId: string | null;
}

const initialState: LocationState = {
  locationHistory: [],
  currentLocation: null,
  isLoading: false,
  currentLocationLoading: false,
  error: null,
  pagination: null,
  filters: {
    page: 1,
    limit: 20,
  },
  selectedDeviceId: null,
};

export const loadLocationHistory = createAsyncThunk(
  'location/loadLocationHistory',
  async ({ deviceId, filters }: { deviceId: string; filters?: LocationFilters }) => {
    const result = await getLocationHistory(deviceId, filters);
    
    if (result.success) {
      return result;
    } else {
      throw new Error(result.error?.message || 'Failed to load location history');
    }
  }
);

export const loadCurrentLocation = createAsyncThunk(
  'location/loadCurrentLocation',
  async (deviceId: string) => {
    const result = await getCurrentLocation(deviceId);
    
    if (result.success) {
      return result;
    } else {
      throw new Error(result.error?.message || 'Failed to load current location');
    }
  }
);

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setSelectedDevice: (state, action: PayloadAction<string>) => {
      state.selectedDeviceId = action.payload;
      state.locationHistory = [];
      state.currentLocation = null;
      state.pagination = null;
      state.error = null;
    },
    updateFilters: (state, action: PayloadAction<Partial<LocationFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearLocationData: (state) => {
      state.locationHistory = [];
      state.currentLocation = null;
      state.pagination = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadLocationHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadLocationHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.locationHistory = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(loadLocationHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load location history';
      })
      .addCase(loadCurrentLocation.pending, (state) => {
        state.currentLocationLoading = true;
        state.error = null;
      })
      .addCase(loadCurrentLocation.fulfilled, (state, action) => {
        state.currentLocationLoading = false;
        state.currentLocation = action.payload.data;
        state.error = null;
      })
      .addCase(loadCurrentLocation.rejected, (state, action) => {
        state.currentLocationLoading = false;
        state.error = action.error.message || 'Failed to load current location';
      });
  },
});

export const { setSelectedDevice, updateFilters, clearLocationData, clearError } = locationSlice.actions;
export default locationSlice.reducer;
