import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import {
  initializeSocket,
  disconnectSocket,
  listenForMatchAlerts,
  listenForNotifications,
  showMatchAlertToast,
  MatchAlertData,
} from '@/lib/socket';

/**
 * Custom hook to manage Socket.io connection and real-time events
 * Automatically connects/disconnects based on authentication state
 */
export const useSocket = () => {
  const { user, accessToken } = useAuthStore();

  useEffect(() => {
    // Only initialize socket if user is logged in and is a jobseeker
    if (user && accessToken && user.role === 'jobseeker') {
      console.log('🔌 Initializing Socket.io for user:', user.email);
      
      const socket = initializeSocket(accessToken);

      // 🎯 TASK 4: Listen for NEW_MATCH_ALERT events
      listenForMatchAlerts((data: MatchAlertData) => {
        console.log('🔥 Match alert received:', data);
        showMatchAlertToast(data);
      });

      // Listen for general notifications
      listenForNotifications((notification) => {
        console.log('🔔 Notification received:', notification);
        // You can show a toast for general notifications here too
      });

      // Cleanup on unmount or logout
      return () => {
        console.log('🔌 Disconnecting Socket.io');
        disconnectSocket();
      };
    }
  }, [user, accessToken]);
};

/**
 * Hook to request browser notification permission
 */
export const useNotificationPermission = () => {
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        console.log('Notification permission:', permission);
      });
    }
  }, []);
};
