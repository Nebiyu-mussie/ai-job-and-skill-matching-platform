import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Users, Briefcase, Building2, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const response = await api.get('/analytics/admin');
      return response.data.data;
    },
  });

  if (isLoading) return <LoadingSpinner fullScreen />;

  const stats = [
    { icon: Users, label: 'Total Users', value: data?.totalUsers || 0, color: 'text-blue-500' },
    { icon: Building2, label: 'Employers', value: data?.totalEmployers || 0, color: 'text-green-500' },
    { icon: Briefcase, label: 'Active Jobs', value: data?.activeJobs || 0, color: 'text-purple-500' },
    { icon: TrendingUp, label: 'Applications', value: data?.totalApplications || 0, color: 'text-orange-500' },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <div className="grid md:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="border rounded-lg p-6 hover:shadow-lg transition">
            <stat.icon className={`h-8 w-8 mb-3 ${stat.color}`} />
            <p className="text-3xl font-bold mb-1">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <p className="text-muted-foreground">Recent platform activity will be displayed here.</p>
        </div>
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Platform Growth</h2>
          <p className="text-muted-foreground">Growth metrics will be displayed here.</p>
        </div>
      </div>
    </div>
  );
}
