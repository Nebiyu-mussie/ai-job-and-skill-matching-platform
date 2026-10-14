import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { disconnectSocket } from '@/lib/socket';

export const useAuth = () => {
  const { user, isAuthenticated, accessToken, setAuth, logout: storeLogout, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      // Direct login call - no pre-flight health check that could block
      console.log('Making login request to:', '/auth/login');
      const res = await api.post('/auth/login', credentials);
      return res.data.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      // Socket connection is handled by useSocket hook in App.tsx
      toast.success('Welcome back!');

      // Redirect based on role
      const role = data.user.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'employer') navigate('/employer/dashboard');
      else navigate('/dashboard');
    },
    onError: (error: any) => {
      console.error('Login error:', error);
      
      // Handle 401 specifically - invalid credentials
      if (error.response?.status === 401) {
        toast.error('Invalid email or password');
        return;
      }
      
      // Provide helpful error messages for other errors
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        toast.error('Login request timed out. The server might be waking up. Please try again.');
      } else if (error.code === 'ERR_NETWORK') {
        toast.error('Cannot connect to server. Please check your internet connection.');
      } else {
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage);
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/auth/register', data);
      return res.data.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      // Socket connection is handled by useSocket hook in App.tsx
      toast.success('Account created! Please verify your email.');

      const role = data.user.role;
      if (role === 'employer') navigate('/employer/dashboard');
      else navigate('/dashboard');
    },
    onError: (error: any) => {
      console.error('Registration error:', error);
      
      // Handle 401 specifically
      if (error.response?.status === 401) {
        toast.error('Registration failed. Please check your information.');
        return;
      }
      
      // Handle other errors
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    },
  });

  // Direct logout function
  const handleLogout = async () => {
    console.log('🔴 Logout clicked');
    
    try {
      // Try to call the backend
      await api.post('/auth/logout');
      console.log('✅ Backend logout successful');
    } catch (error) {
      console.warn('⚠️ Backend logout failed (will continue with local logout):', error);
    }
    
    // Always perform local cleanup
    console.log('🧹 Cleaning up local state...');
    storeLogout();
    disconnectSocket();
    queryClient.clear();
    
    console.log('🎉 Logout complete, showing toast and redirecting');
    toast.success('Logged out successfully');
    navigate('/login', { replace: true });
  };

  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await api.post('/auth/forgot-password', { email });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Password reset link sent to your email');
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: { token: string; password: string }) => {
      // Trim and sanitize token to prevent whitespace issues
      const cleanToken = data.token.trim();
      console.log('Reset password - token length:', cleanToken.length);
      
      const res = await api.post(`/auth/reset-password/${cleanToken}`, {
        password: data.password,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Password reset successfully');
      navigate('/login');
    },
    onError: (error: any) => {
      console.error('Reset password error:', error);
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    },
  });

  const getDashboardPath = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'employer') return '/employer/dashboard';
    return '/dashboard';
  };

  // Emergency logout function that bypasses API call
  const forceLogout = () => {
    storeLogout();
    disconnectSocket();
    queryClient.clear();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return {
    user,
    isAuthenticated,
    accessToken,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    logout: handleLogout,
    isLoggingOut: false,
    forceLogout,
    forgotPassword: forgotPasswordMutation.mutate,
    resetPassword: resetPasswordMutation.mutate,
    updateUser,
    getDashboardPath,
  };
};
