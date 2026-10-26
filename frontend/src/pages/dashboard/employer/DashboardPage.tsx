import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Briefcase, Users, FileText, TrendingUp, AlertCircle } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function EmployerDashboard() {
  const { data: stats, isLoading, isError, error } = useQuery({
    queryKey: ['employer-stats'],
    queryFn: async () => {
      const response = await api.get('/analytics/employer');
      return response.data.data;
    },
    retry: 2,
    refetchOnWindowFocus: false,
  });

  if (isLoading) return <LoadingSpinner fullScreen />;

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Dashboard</h3>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'Unable to fetch analytics data'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    { 
      icon: Briefcase, 
      label: 'Active Jobs', 
      value: stats?.overview?.totalJobs || 0, 
      color: 'text-blue-500' 
    },
    { 
      icon: FileText, 
      label: 'Total Applications', 
      value: stats?.overview?.totalApplications || 0, 
      color: 'text-green-500' 
    },
    { 
      icon: Users, 
      label: 'Avg Match Score', 
      value: stats?.overview?.avgMatchScore ? `${stats.overview.avgMatchScore}%` : '0%', 
      color: 'text-purple-500' 
    },
    { 
      icon: TrendingUp, 
      label: 'Profile Views', 
      value: stats?.overview?.totalViews || 0, 
      color: 'text-orange-500' 
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Employer Dashboard</h1>

      <div className="grid md:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="border rounded-lg p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
            <p className="text-3xl font-bold mb-1">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Applications by Status</h2>
          {stats?.applicationsByStatus && stats.applicationsByStatus.length > 0 ? (
            <div className="space-y-2">
              {stats.applicationsByStatus.map((status: any) => (
                <div key={status._id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="capitalize text-sm">{status._id}</span>
                  <span className="font-semibold">{status.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No applications yet</p>
          )}
        </div>
        
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Top Jobs by Applications</h2>
          {stats?.applicationsByJob && stats.applicationsByJob.length > 0 ? (
            <div className="space-y-2">
              {stats.applicationsByJob.slice(0, 5).map((job: any) => (
                <div key={job._id.jobId} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm truncate flex-1">{job._id.title}</span>
                  <span className="font-semibold ml-2">{job.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No job data yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
