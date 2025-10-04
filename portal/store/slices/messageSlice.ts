import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Message, MessageConversation, MessagesResponse, MessageConversationsResponse, MessageFilters } from '@/types/message';
import { getMessages, getMessageConversations } from '@/lib/messageApi';

interface MessageState {
  messages: Message[];
  conversations: MessageConversation[];
  isLoading: boolean;
  conversationsLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  filters: MessageFilters;
  selectedDeviceId: string | null;
}

const initialState: MessageState = {
  messages: [],
  conversations: [],
  isLoading: false,
  conversationsLoading: false,
  error: null,
  pagination: null,
  filters: {
    page: 1,
    limit: 20,
  },
  selectedDeviceId: null,
};

export const loadMessages = createAsyncThunk(
  'messages/loadMessages',
  async ({ deviceId, filters }: { deviceId: string; filters?: MessageFilters }) => {
    const result = await getMessages(deviceId, filters);
    
    if (result.success) {
      return result;
    } else {
      throw new Error(result.error?.message || 'Failed to load messages');
    }
  }
);

export const loadMessageConversations = createAsyncThunk(
  'messages/loadMessageConversations',
  async (deviceId: string) => {
    const result = await getMessageConversations(deviceId);
    
    if (result.success) {
      return result;
    } else {
      throw new Error(result.error?.message || 'Failed to load message conversations');
    }
  }
);

const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setSelectedDevice: (state, action: PayloadAction<string>) => {
      state.selectedDeviceId = action.payload;
      state.messages = [];
      state.conversations = [];
      state.pagination = null;
      state.error = null;
    },
    updateFilters: (state, action: PayloadAction<Partial<MessageFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearMessages: (state) => {
      state.messages = [];
      state.conversations = [];
      state.pagination = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(loadMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load messages';
      })
      .addCase(loadMessageConversations.pending, (state) => {
        state.conversationsLoading = true;
        state.error = null;
      })
      .addCase(loadMessageConversations.fulfilled, (state, action) => {
        state.conversationsLoading = false;
        state.conversations = action.payload.data;
        state.error = null;
      })
      .addCase(loadMessageConversations.rejected, (state, action) => {
        state.conversationsLoading = false;
        state.error = action.error.message || 'Failed to load message conversations';
      });
  },
});

export const { setSelectedDevice, updateFilters, clearMessages, clearError } = messageSlice.actions;
export default messageSlice.reducer;
