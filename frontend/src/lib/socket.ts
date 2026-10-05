import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

// Get base URL without /api/v1 for Socket.io
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';
const SOCKET_URL = API_URL.replace('/api/v1', '');

let socket: Socket | null = null;

export interface MatchAlertData {
  jobId: string;
  jobTitle: string;
  companyName: string;
  matchScore: number;
  message: string;
  link: string;
  timestamp: Date;
}

/**
 * Initialize Socket.io connection with authentication
 */
export const initializeSocket = (token: string): Socket => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('✅ Socket.io connected:', socket?.id);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Socket.io connection error:', error.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 Socket.io disconnected:', reason);
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log(`🔄 Socket.io reconnected after ${attemptNumber} attempts`);
  });

  return socket;
};

/**
 * Listen for NEW_MATCH_ALERT events (Task 4)
 */
export const listenForMatchAlerts = (callback: (data: MatchAlertData) => void): void => {
  if (!socket) {
    console.warn('Socket not initialized. Call initializeSocket() first.');
    return;
  }

  socket.on('NEW_MATCH_ALERT', (data: MatchAlertData) => {
    console.log('🔥 NEW_MATCH_ALERT received:', data);
    callback(data);
  });
};

/**
 * Listen for general notifications
 */
export const listenForNotifications = (callback: (notification: any) => void): void => {
  if (!socket) {
    console.warn('Socket not initialized');
    return;
  }

  socket.on('notification', (data) => {
    console.log('🔔 Notification received:', data);
    callback(data);
  });
};

/**
 * Disconnect socket
 */
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('🔌 Socket disconnected');
  }
};

/**
 * Get socket instance
 */
export const getSocket = (): Socket | null => {
  return socket;
};

/**
 * Check if socket is connected
 */
export const isSocketConnected = (): boolean => {
  return socket?.connected || false;
};

/**
 * Display match alert as toast notification
 */
export const showMatchAlertToast = (data: MatchAlertData): void => {
  toast(
    `🔥 Perfect Match! ${data.jobTitle} at ${data.companyName} - ${data.matchScore}% match`,
    {
      duration: 8000,
      position: 'top-right',
      icon: '🔥',
      style: {
        background: 'linear-gradient(to right, #4F46E5, #6366F1)',
        color: '#fff',
        fontWeight: '600',
        border: '1px solid #4F46E5',
      },
    }
  );

  // Also play a sound (optional)
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Perfect Job Match!', {
      body: `${data.jobTitle} matches your profile by ${data.matchScore}%`,
      icon: '/logo.png',
      tag: data.jobId,
    });
  }
};
