import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Contact, ContactsResponse, ContactFilters } from '@/types/contact';
import { getContacts } from '@/lib/contactApi';

interface ContactState {
  contacts: Contact[];
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
  filters: ContactFilters;
  selectedDeviceId: string | null;
}

const initialState: ContactState = {
  contacts: [],
  isLoading: false,
  error: null,
  pagination: null,
  filters: {
    page: 1,
    limit: 20,
  },
  selectedDeviceId: null,
};

export const loadContacts = createAsyncThunk(
  'contacts/loadContacts',
  async ({ deviceId, filters }: { deviceId: string; filters?: ContactFilters }) => {
    const result = await getContacts(deviceId, filters);
    
    if (result.success) {
      return result;
    } else {
      throw new Error(result.error?.message || 'Failed to load contacts');
    }
  }
);

const contactSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {
    setSelectedDevice: (state, action: PayloadAction<string>) => {
      state.selectedDeviceId = action.payload;
      state.contacts = [];
      state.pagination = null;
      state.error = null;
    },
    updateFilters: (state, action: PayloadAction<Partial<ContactFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearContacts: (state) => {
      state.contacts = [];
      state.pagination = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadContacts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadContacts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.contacts = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(loadContacts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load contacts';
      });
  },
});

export const { setSelectedDevice, updateFilters, clearContacts, clearError } = contactSlice.actions;
export default contactSlice.reducer;
