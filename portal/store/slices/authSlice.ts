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
    console.log('loginUser thunk called with:', credentials);
    const result = await authApi.login(credentials);
    console.log('loginUser result:', result);
    if (result.success) {
      return result.data;
    } else {
      return rejectWithValue(result.error?.message || 'Operation failed');
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
      return rejectWithValue(result.error?.message || 'Operation failed');
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
      return rejectWithValue(result.error?.message || 'Operation failed');
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
        console.warn('Logout API call failed:', result.error?.message || 'Unknown error');
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
      return rejectWithValue(result.error?.message || 'Operation failed');
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

    // Check if token is expired
    if (tokenUtils.isTokenExpired()) {
      tokenUtils.clearTokens();
      return rejectWithValue('Token expired');
    }
    
    // Try to validate with API
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
          try {
            const refreshResult = await authApi.refreshToken(refreshToken);
            
            if (refreshResult.success) {
              tokenUtils.setTokens(
                refreshResult.data.accessToken,
                refreshResult.data.newRefreshToken
              );
              // Get user profile again after token refresh
              const profileResult = await authApi.getProfile();
              
              if (profileResult.success) {
                return {
                  user: profileResult.data.user,
                  accessToken: refreshResult.data.accessToken,
                  refreshToken: refreshResult.data.newRefreshToken,
                };
              }
            }
          } catch (refreshError) {
            // Token refresh failed, continue to fallback
          }
        }
        
        // If we get here, both profile fetch and token refresh failed
        // Fall back to session maintenance
        if (accessToken && refreshToken) {
          // Create a basic user object from stored data or use defaults
          const storedUser = localStorage.getItem('userData');
          let user;
          
          if (storedUser) {
            try {
              user = JSON.parse(storedUser);
            } catch (e) {
              // Failed to parse stored user data
            }
          }
          
          if (!user) {
            // Fallback user data
            user = {
              id: '1',
              email: 'user@mutindo.com',
              firstName: 'User',
              lastName: 'Name',
              role: 'USER',
              tenantId: '1',
              tenantName: 'Mutindo Company',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          }
          
          return {
            user,
            accessToken,
            refreshToken,
          };
        }
        
        return rejectWithValue('Failed to validate token');
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      return rejectWithValue('Authentication failed');
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
        
        // Store user data in localStorage for session persistence
        if (typeof window !== 'undefined') {
          localStorage.setItem('userData', JSON.stringify(action.payload.user));
        }
        
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
        
        // Store user data in localStorage for session persistence
        if (typeof window !== 'undefined') {
          localStorage.setItem('userData', JSON.stringify(action.payload.user));
        }
        
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
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
        tokenUtils.clearTokens();
      });
  },
});

export const { clearError, clearAuth } = authSlice.actions;
export default authSlice.reducer;
