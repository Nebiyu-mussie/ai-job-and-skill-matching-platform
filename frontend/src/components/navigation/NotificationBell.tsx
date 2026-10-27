import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  priority: string;
  createdAt: string;
  sender?: {
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await api.get('/notifications?limit=10');
      return response.data.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await api.patch(`/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await api.patch('/notifications/read-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Listen for real-time notifications from Socket.io
  useEffect(() => {
    // Invalidate query when new notification arrives
    const handleNewNotification = () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    // Listen to socket events (if socket is available)
    const socket = (window as any).__socket__;
    if (socket) {
      socket.on('notification', handleNewNotification);
      return () => {
        socket.off('notification', handleNewNotification);
      };
    }
  }, [queryClient]);

  const getNotificationIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      application_status_update: '📄',
      new_job_match: '🎯',
      application_received: '📨',
      interview_scheduled: '📅',
      message_received: '💬',
      job_expired: '⏰',
      profile_view: '👀',
      resume_parsed: '📋',
      skill_recommendation: '💡',
      employer_verified: '✅',
      job_shortlisted: '⭐',
      system: '🔔',
    };
    return iconMap[type] || '🔔';
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification._id);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon with Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-[85vw] max-w-sm sm:w-80 md:w-96 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-3 sm:p-4 border-b border-border bg-muted/30 flex items-center justify-between gap-2">
              <h3 className="font-semibold text-base sm:text-lg">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending}
                  className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1 whitespace-nowrap flex-shrink-0"
                >
                  <CheckCheck className="h-3 w-3" />
                  <span className="hidden sm:inline">Mark all read</span>
                  <span className="sm:hidden">Mark all</span>
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-[32rem] overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center text-muted-foreground">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto"></div>
                  <p className="mt-2 text-sm">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-3 opacity-40" />
                  <p className="font-medium">No notifications yet</p>
                  <p className="text-sm mt-1">We'll notify you when something happens</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((notification: Notification) => (
                    <div
                      key={notification._id}
                      className={cn(
                        'p-3 sm:p-4 hover:bg-accent/50 transition-colors cursor-pointer',
                        !notification.isRead && 'bg-brand-50/50 dark:bg-brand-950/20'
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      {notification.link ? (
                        <Link to={notification.link} className="block">
                          <NotificationContent notification={notification} getIcon={getNotificationIcon} />
                        </Link>
                      ) : (
                        <NotificationContent notification={notification} getIcon={getNotificationIcon} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-border bg-muted/30 text-center">
                <Link
                  to="/dashboard/notifications"
                  onClick={() => setIsOpen(false)}
                  className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                >
                  View all notifications →
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotificationContent({
  notification,
  getIcon,
}: {
  notification: Notification;
  getIcon: (type: string) => string;
}) {
  return (
    <div className="flex gap-2 sm:gap-3">
      <div className="flex-shrink-0 text-xl sm:text-2xl">{getIcon(notification.type)}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-sm text-foreground line-clamp-1">{notification.title}</p>
          {!notification.isRead && (
            <div className="flex-shrink-0 h-2 w-2 bg-brand-600 rounded-full mt-1"></div>
          )}
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
        <p className="text-xs text-muted-foreground mt-2">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}
