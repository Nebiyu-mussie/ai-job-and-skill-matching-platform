import { motion } from 'framer-motion';
import { Bell, Trash2, Check, CheckCheck } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
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

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data, isLoading } = useQuery({
    queryKey: ['notifications', 'all'],
    queryFn: async () => {
      const response = await api.get('/notifications?limit=50');
      return response.data.data;
    },
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
      toast.success('All notifications marked as read');
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await api.delete(`/notifications/${notificationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification deleted');
    },
  });

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500';
      case 'high':
        return 'border-l-orange-500';
      case 'normal':
        return 'border-l-blue-500';
      case 'low':
        return 'border-l-gray-400';
      default:
        return 'border-l-blue-500';
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Notifications</h1>
              <p className="text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up! 🎉'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center mx-auto mb-6">
                <Bell className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">No notifications yet</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                When you receive notifications about job matches, applications, or important updates, they'll appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification: Notification) => (
                <motion.div
                  key={notification._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    'bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-all border-l-4',
                    getPriorityColor(notification.priority),
                    !notification.isRead && 'bg-brand-50/30 dark:bg-brand-950/20'
                  )}
                >
                  <div className="p-4 flex gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 text-3xl">{getNotificationIcon(notification.type)}</div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{notification.title}</h3>
                        {!notification.isRead && (
                          <div className="flex-shrink-0 h-2.5 w-2.5 bg-brand-600 rounded-full mt-1.5"></div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
                        {notification.priority !== 'normal' && (
                          <span className="px-2 py-0.5 bg-muted rounded-full font-medium capitalize">
                            {notification.priority}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 flex items-start gap-2">
                      {notification.link && (
                        <Link
                          to={notification.link}
                          onClick={() => {
                            if (!notification.isRead) {
                              markAsReadMutation.mutate(notification._id);
                            }
                          }}
                          className="px-3 py-1.5 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
                        >
                          View
                        </Link>
                      )}
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsReadMutation.mutate(notification._id)}
                          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotificationMutation.mutate(notification._id)}
                        className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                        title="Delete notification"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}