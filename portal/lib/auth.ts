import apiClient, { handleApiError } from './api';

// Auth API endpoints
export const authApi = {
  // Register new user and tenant
  register: async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    tenantName: string;
    domain?: string;
  }) => {
    console.log('Register attempt with:', { email: data.email });
    
    try {
      const response = await apiClient.post('/auth/register', data);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: handleApiError(error),
      };
    }
  },

  // Login user
  login: async (data: { email: string; password: string }) => {
    console.log('Login attempt with:', { email: data.email });
    
    try {
      const response = await apiClient.post('/auth/login', data);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: handleApiError(error),
      };
    }
  },

  // Refresh access token
  refreshToken: async (refreshToken: string) => {
    try {
      const response = await apiClient.post('/auth/refresh', { refreshToken });
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: handleApiError(error),
      };
    }
  },

  // Logout user
  logout: async (refreshToken: string) => {
    try {
      const response = await apiClient.post('/auth/logout', { refreshToken });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: handleApiError(error),
      };
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await apiClient.get('/auth/profile');
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: handleApiError(error),
      };
    }
  },
};

// Token management utilities
export const tokenUtils = {
  setTokens: (accessToken: string, refreshToken: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      // Store timestamp for token expiration check
      localStorage.setItem('tokenTimestamp', Date.now().toString());
    }
  },

  getTokens: () => {
    if (typeof window !== 'undefined') {
      return {
        accessToken: localStorage.getItem('accessToken'),
        refreshToken: localStorage.getItem('refreshToken'),
      };
    }
    return { accessToken: null, refreshToken: null };
  },

  clearTokens: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenTimestamp');
      localStorage.removeItem('userData');
    }
  },

  isAuthenticated: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      const timestamp = localStorage.getItem('tokenTimestamp');
      
      if (!token || !timestamp) {
        return false;
      }
      
      // Check if token is older than 7 days (more lenient for better UX)
      const tokenAge = Date.now() - parseInt(timestamp);
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
      
      if (tokenAge > maxAge) {
        // Token is too old, clear it
        tokenUtils.clearTokens();
        return false;
      }
      
      return true;
    }
    return false;
  },

  isTokenExpired: () => {
    if (typeof window !== 'undefined') {
      const timestamp = localStorage.getItem('tokenTimestamp');
      if (!timestamp) return true;
      
      const tokenAge = Date.now() - parseInt(timestamp);
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
      
      return tokenAge > maxAge;
    }
    return true;
  },
};
