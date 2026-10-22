import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

// Extend Axios config to include _retry flag
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Create main API instance with reasonable timeout
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 30000, // 30 seconds - reasonable for Render cold starts
  headers: {
    'Content-Type': 'application/json',
  },
});

// Health check function for server wake-up
export const checkServerHealth = async (): Promise<boolean> => {
  try {
    const healthUrl = BASE_URL.replace(/\/api\/v\d+$/, '/health');
    const response = await axios.get(healthUrl, { 
      timeout: 15000, // 15 second timeout for health check
      validateStatus: (status) => status < 500, // Accept any non-5xx status
    });
    return response.status === 200;
  } catch (error) {
    console.warn('Health check failed:', error);
    return false;
  }
};

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // DEBUG: Log job creation requests
    if (config.url?.includes('/jobs') && config.method === 'post') {
      console.log('=== AXIOS REQUEST INTERCEPTOR (JOBS POST) ===');
      console.log('URL:', config.url);
      console.log('Method:', config.method);
      console.log('Headers:', config.headers);
      console.log('Request Data Type:', typeof config.data);
      console.log('Request Data:', JSON.stringify(config.data, null, 2));
      console.log('============================================');
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Logout and redirect to login
const handleAuthFailure = () => {
  const authStore = useAuthStore.getState();
  
  // Set loading to false to prevent infinite spinners
  authStore.setLoading(false);
  
  // Clear all auth data
  authStore.logout();
  
  // Clear storage
  localStorage.clear();
  sessionStorage.clear();
  
  // Clear the failed request queue to prevent retries
  failedQueue = [];
  isRefreshing = false;
  
  // Show user-friendly message
  toast.error('Your session has expired. Please log in again.');
  
  // Forcefully redirect to login (only if not already there)
  if (window.location.pathname !== '/login' && 
      window.location.pathname !== '/register') {
    window.location.href = '/login';
  }
};

// Response interceptor - handle token refresh and auth failures
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig | undefined;

    // Handle timeout errors specifically
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      console.error('Request timeout:', originalRequest?.url);
      toast.error('Request timed out. Please check your connection and try again.');
      return Promise.reject(error);
    }

    // Handle network errors
    if (error.code === 'ERR_NETWORK' || !error.response) {
      console.error('Network error:', error.message);
      toast.error('Unable to connect to server. Please check your connection.');
      return Promise.reject(error);
    }

    // Guard: ensure originalRequest exists
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Handle 401 errors (Unauthorized)
    if (error.response?.status === 401) {
      // DO NOT attempt token refresh for login/register endpoints
      // A 401 on these means invalid credentials, not an expired session
      if (originalRequest.url?.includes('/auth/login') || 
          originalRequest.url?.includes('/auth/register')) {
        console.log('Login/register failed with 401 - invalid credentials');
        return Promise.reject(error);
      }

      // Special handling for logout endpoint - don't retry, just fail silently
      if (originalRequest.url?.includes('/auth/logout')) {
        console.log('Logout endpoint returned 401 (token expired) - ignoring');
        return Promise.resolve({ data: { success: true } } as AxiosResponse);
      }

      // Prevent infinite retry loops
      if (originalRequest._retry) {
        console.error('Token refresh already attempted, logging out');
        handleAuthFailure();
        return Promise.reject(error);
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            console.error('Queued request failed after token refresh');
            return Promise.reject(err);
          });
      }

      // Mark this request as retried
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the token
        console.log('Attempting token refresh...');
        const response = await api.post('/auth/refresh-token');
        const { accessToken } = response.data.data;

        // Update token in store
        useAuthStore.getState().setAccessToken(accessToken);
        
        console.log('Token refresh successful');
        
        // Process queued requests
        processQueue(null, accessToken);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return api(originalRequest);
      } catch (refreshError: any) {
        // Token refresh failed - log out user
        console.error('Token refresh failed:', refreshError?.response?.status || refreshError?.message);
        
        // Process queued requests with error
        processQueue(refreshError, null);
        
        // Handle auth failure (clear state, redirect to login)
        handleAuthFailure();
        
        // Return rejected promise to stop any pending operations
        return Promise.reject(new Error('Session expired. Please log in again.'));
      } finally {
        isRefreshing = false;
      }
    }

    // Handle specific error codes
    if (error.response?.status === 403) {
      toast.error('You are not authorized to perform this action');
    } else if (error.response?.status === 429) {
      toast.error('Too many requests. Please slow down.');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    }

    return Promise.reject(error);
  }
);

export default api;

// API helper functions
export const getErrorMessage = (error: any): string => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    'An unexpected error occurred'
  );
};
