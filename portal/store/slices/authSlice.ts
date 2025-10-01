import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi, tokenUtils } from '@/lib/auth';
import { User, AuthResponse, LoginRequest, RegisterRequest } from '@/types/auth';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    const result = await authApi.login(credentials);
    if (result.success) {
      return result.data;
    } else {
      return rejectWithValue(result.error.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterRequest, { rejectWithValue }) => {
    const result = await authApi.register(userData);
    if (result.success) {
      return result.data;
    } else {
      return rejectWithValue(result.error.message);
    }
  }
);

export const refreshUserToken = createAsyncThunk(
  'auth/refresh',
  async (_, { rejectWithValue }) => {
    const { refreshToken } = tokenUtils.getTokens();
    if (!refreshToken) {
      return rejectWithValue('No refresh token available');
    }

    const result = await authApi.refreshToken(refreshToken);
    if (result.success) {
      return result.data;
    } else {
      return rejectWithValue(result.error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    const { refreshToken } = tokenUtils.getTokens();
    if (refreshToken) {
      const result = await authApi.logout(refreshToken);
      if (!result.success) {
        console.warn('Logout API call failed:', result.error.message);
      }
    }
    
    tokenUtils.clearTokens();
    return null;
  }
);

export const loadUserProfile = createAsyncThunk(
  'auth/loadProfile',
  async (_, { rejectWithValue }) => {
    const result = await authApi.getProfile();
    if (result.success) {
      return result.data.user;
    } else {
      return rejectWithValue(result.error.message);
    }
  }
);

export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { dispatch, rejectWithValue }) => {
    const { accessToken, refreshToken } = tokenUtils.getTokens();
    
    if (!accessToken) {
      return rejectWithValue('No access token found');
    }

    // Try to load user profile to validate token
    try {
      const result = await authApi.getProfile();
      if (result.success) {
        return {
          user: result.data.user,
          accessToken,
          refreshToken,
        };
      } else {
        // Token might be expired, try to refresh
        if (refreshToken) {
          const refreshResult = await authApi.refreshToken(refreshToken);
          if (refreshResult.success) {
            tokenUtils.setTokens(
              refreshResult.data.accessToken,
              refreshResult.data.newRefreshToken
            );
            return {
              user: result.data.user,
              accessToken: refreshResult.data.accessToken,
              refreshToken: refreshResult.data.newRefreshToken,
            };
          }
        }
        return rejectWithValue('Token validation failed');
      }
    } catch (error) {
      return rejectWithValue('Failed to validate token');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      tokenUtils.clearTokens();
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
        
        // Store tokens in localStorage
        tokenUtils.setTokens(action.payload.accessToken, action.payload.refreshToken);
        
        // Success toast will be handled by the component
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
        
        // Store tokens in localStorage
        tokenUtils.setTokens(action.payload.accessToken, action.payload.refreshToken);
        
        // Success toast will be handled by the component
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
        
        // Success toast will be handled by the component
      })
      
      // Initialize auth
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        tokenUtils.clearTokens();
      });
  },
});

export const { clearError, clearAuth } = authSlice.actions;
export default authSlice.reducer;
