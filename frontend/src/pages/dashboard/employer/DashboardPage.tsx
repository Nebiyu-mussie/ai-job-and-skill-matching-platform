import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import api from '@/lib/api';
import { Briefcase, Users, FileText, TrendingUp, AlertCircle, LogIn } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuthStore } from '@/store/authStore';

export default function EmployerDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  
  const { data: stats, isLoading, isError, error } = useQuery({
    queryKey: ['employer-stats'],
    queryFn: async () => {
      try {
        const response = await api.get('/analytics/employer');
        return response.data.data;
      } catch (err: any) {
        // If it's a 401 error, log out and redirect
        if (err?.response?.status === 401) {
          console.error('401 Unauthorized on employer dashboard');
          logout();
          navigate('/login', { replace: true });
          throw new Error('Session expired. Please log in again.');
        }
        throw err;
      }
    },
    retry: (failureCount, error: any) => {
      // Don't retry on 401 errors
      if (error?.response?.status === 401) {
        return false;
      }
      // Retry other errors up to 2 times
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
    // Set a stale time to avoid unnecessary refetches
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle auth errors by redirecting to login
  useEffect(() => {
    if (isError && error) {
      const errorMessage = (error as any)?.message || '';
      const is401 = (error as any)?.response?.status === 401 || 
                    errorMessage.includes('Session expired') ||
                    errorMessage.includes('Unauthorized');
      
      if (is401) {
        console.log('Auth error detected, redirecting to login...');
        logout();
        navigate('/login', { replace: true });
      }
    }
  }, [isError, error, logout, navigate]);

  if (isLoading) return <LoadingSpinner fullScreen />;

  if (isError) {
    const errorMessage = (error as any)?.message || 'Unable to fetch analytics data';
    const is401 = (error as any)?.response?.status === 401 || 
                  errorMessage.includes('Session expired') ||
                  errorMessage.includes('Unauthorized');

    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          {is401 ? (
            <>
              <LogIn className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Session Expired</h3>
              <p className="text-muted-foreground mb-4">
                Your session has expired. Please log in again.
              </p>
              <button
                onClick={() => navigate('/login', { replace: true })}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Go to Login
              </button>
            </>
          ) : (
            <>
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to Load Dashboard</h3>
              <p className="text-muted-foreground mb-4">
                {errorMessage}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Retry
              </button>
            </>
          )}
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
