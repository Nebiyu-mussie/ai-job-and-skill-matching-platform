import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Briefcase, Users, FileText, TrendingUp } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function EmployerDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['employer-stats'],
    queryFn: async () => {
      const response = await api.get('/analytics/employer');
      return response.data.data;
    },
  });

  if (isLoading) return <LoadingSpinner fullScreen />;

  const statCards = [
    { icon: Briefcase, label: 'Active Jobs', value: stats?.activeJobs || 0, color: 'text-blue-500' },
    { icon: FileText, label: 'Total Applications', value: stats?.totalApplications || 0, color: 'text-green-500' },
    { icon: Users, label: 'Shortlisted', value: stats?.shortlisted || 0, color: 'text-purple-500' },
    { icon: TrendingUp, label: 'Profile Views', value: stats?.profileViews || 0, color: 'text-orange-500' },
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
          <h2 className="text-xl font-semibold mb-4">Recent Applications</h2>
          <p className="text-muted-foreground">Recent applications will be displayed here.</p>
        </div>
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Top Performing Jobs</h2>
          <p className="text-muted-foreground">Job performance metrics will be displayed here.</p>
        </div>
      </div>
    </div>
  );
}
