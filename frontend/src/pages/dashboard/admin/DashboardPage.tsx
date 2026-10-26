import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Users, Briefcase, Building2, TrendingUp, Activity, Database, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const response = await api.get('/analytics/admin');
      return response.data.data;
    },
    refetchInterval: 60000, // Refetch every minute
  });

  if (isLoading) return <LoadingSpinner fullScreen />;

  const stats = [
    { 
      icon: Users, 
      label: 'Total Users', 
      value: data?.users.total || 0, 
      change: `+${data?.users.new || 0} this month`,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    { 
      icon: Building2, 
      label: 'Employers', 
      value: data?.employers.total || 0,
      change: `${data?.employers.pending || 0} pending verification`,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    { 
      icon: Briefcase, 
      label: 'Active Jobs', 
      value: data?.jobs.active || 0,
      change: `${data?.jobs.total || 0} total jobs`,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    { 
      icon: TrendingUp, 
      label: 'Applications', 
      value: data?.applications.total || 0,
      change: `${data?.applications.pending || 0} pending review`,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    },
  ];

  const ActivityItem = ({ activity }: { activity: any }) => (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
        activity.type === 'user_registration' ? 'bg-blue-500/10 text-blue-500' :
        activity.type === 'job_posted' ? 'bg-purple-500/10 text-purple-500' :
        'bg-green-500/10 text-green-500'
      }`}>
        {activity.type === 'user_registration' ? '👤' :
         activity.type === 'job_posted' ? '💼' : '📝'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground line-clamp-1">{activity.description}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Monitor platform health and activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="border border-border rounded-xl p-6 hover:shadow-lg transition-shadow bg-card"
          >
            <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center mb-4`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">{stat.value.toLocaleString()}</p>
            <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
            <p className="text-xs text-muted-foreground">{stat.change}</p>
          </motion.div>
        ))}
      </div>

      {/* Database Health & Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Database Health */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="border border-border rounded-xl p-6 bg-card"
        >
          <div className="flex items-center gap-2 mb-6">
            <Database className="h-5 w-5 text-brand-600" />
            <h2 className="text-xl font-semibold text-foreground">Database Health</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Status</span>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-foreground capitalize">
                  {data?.database?.status || 'Healthy'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Database Size</span>
              <span className="text-sm font-medium text-foreground">{data?.database?.size || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Collections</span>
              <span className="text-sm font-medium text-foreground">{data?.database?.collections || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Total Documents</span>
              <span className="text-sm font-medium text-foreground">{data?.database?.documents?.toLocaleString() || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Index Size</span>
              <span className="text-sm font-medium text-foreground">{data?.database?.indexSize || 'N/A'}</span>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="border border-border rounded-xl p-6 bg-card"
        >
          <div className="flex items-center gap-2 mb-6">
            <Activity className="h-5 w-5 text-brand-600" />
            <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {data?.recentActivity?.users?.slice(0, 3).map((activity: any, idx: number) => (
              <ActivityItem key={`user-${idx}`} activity={activity} />
            ))}
            {data?.recentActivity?.jobs?.slice(0, 3).map((activity: any, idx: number) => (
              <ActivityItem key={`job-${idx}`} activity={activity} />
            ))}
            {data?.recentActivity?.applications?.slice(0, 3).map((activity: any, idx: number) => (
              <ActivityItem key={`app-${idx}`} activity={activity} />
            ))}
            {(!data?.recentActivity || (
              !data.recentActivity.users?.length &&
              !data.recentActivity.jobs?.length &&
              !data.recentActivity.applications?.length
            )) && (
              <p className="text-center text-muted-foreground py-8">No recent activity</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* User Distribution & Application Stats */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* User Distribution */}
        <div className="border border-border rounded-xl p-6 bg-card">
          <h2 className="text-xl font-semibold text-foreground mb-6">User Distribution</h2>
          <div className="space-y-3">
            {Object.entries(data?.users?.byRole || {}).map(([role, count]: [string, any]) => (
              <div key={role} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium text-foreground capitalize">{role}s</span>
                <span className="text-sm font-bold text-brand-600">{count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Application Status */}
        <div className="border border-border rounded-xl p-6 bg-card">
          <h2 className="text-xl font-semibold text-foreground mb-6">Application Status</h2>
          <div className="space-y-3">
            {Object.entries(data?.applications?.byStatus || {}).map(([status, count]: [string, any]) => (
              <div key={status} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium text-foreground capitalize">{status}</span>
                <span className="text-sm font-bold text-brand-600">{count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Matching Stats */}
      {data?.matching && (
        <div className="border border-border rounded-xl p-6 bg-card">
          <h2 className="text-xl font-semibold text-foreground mb-6">AI Matching Performance</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Total Matches Generated</p>
              <p className="text-3xl font-bold text-foreground">{data.matching.totalMatches?.toLocaleString() || 0}</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Average Match Score</p>
              <p className="text-3xl font-bold text-brand-600">{data.matching.avgMatchScore || 0}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
