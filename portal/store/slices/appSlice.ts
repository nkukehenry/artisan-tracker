import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ToastMessage } from '@/components/ui/ErrorToast';

interface AppState {
  isLoading: boolean;
  loadingMessage: string;
  toasts: ToastMessage[];
}

const initialState: AppState = {
  isLoading: false,
  loadingMessage: 'Loading...',
  toasts: [],
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<{ isLoading: boolean; message?: string }>) => {
      state.isLoading = action.payload.isLoading;
      state.loadingMessage = action.payload.message || 'Loading...';
    },
    addToast: (state, action: PayloadAction<Omit<ToastMessage, 'id'>>) => {
      const id = Math.random().toString(36).substr(2, 9);
      const toast: ToastMessage = {
        ...action.payload,
        id,
      };
      state.toasts.push(toast);
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
    clearToasts: (state) => {
      state.toasts = [];
    },
  },
});

export const { setLoading, addToast, removeToast, clearToasts } = appSlice.actions;
export default appSlice.reducer;
