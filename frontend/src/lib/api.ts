import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 60000, // Extended to 60s for Render free tier cold starts
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
  
  // Clear all auth data
  authStore.logout();
  
  // Clear storage
  localStorage.clear();
  sessionStorage.clear();
  
  // Redirect to login (only if not already there)
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

// Response interceptor - handle token refresh and auth failures
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (Unauthorized)
    if (error.response?.status === 401) {
      // Special handling for logout endpoint - don't retry, just fail silently
      if (originalRequest.url?.includes('/auth/logout')) {
        console.log('Logout endpoint returned 401 (token expired) - ignoring');
        return Promise.resolve({ data: { success: true } }); // Return success anyway
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
            originalRequest.headers.Authorization = `Bearer ${token}`;
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
        const response = await api.post('/auth/refresh-token');
        const { accessToken } = response.data.data;

        // Update token in store
        useAuthStore.getState().setAccessToken(accessToken);
        
        // Process queued requests
        processQueue(null, accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Token refresh failed - log out user
        console.error('Token refresh failed, logging out:', refreshError);
        processQueue(refreshError, null);
        handleAuthFailure();
        return Promise.reject(refreshError);
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
