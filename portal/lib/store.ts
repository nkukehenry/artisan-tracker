import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/store/slices/authSlice';
import appReducer from '@/store/slices/appSlice';
import callLogReducer from '@/store/slices/callLogSlice';
import messageReducer from '@/store/slices/messageSlice';
import contactReducer from '@/store/slices/contactSlice';
import locationReducer from '@/store/slices/locationSlice';
import appActivityReducer from '@/store/slices/appActivitySlice';
import mediaReducer from '@/store/slices/mediaSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    app: appReducer,
    callLogs: callLogReducer,
    messages: messageReducer,
    contacts: contactReducer,
    location: locationReducer,
    appActivity: appActivityReducer,
    media: mediaReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

