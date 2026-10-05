import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { BarChart3, TrendingUp, Users, Eye } from 'lucide-react';

export default function EmployerAnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['employer-analytics'],
    queryFn: async () => {
      const response = await api.get('/analytics/employer');
      return response.data.data;
    },
  });

  if (isLoading) return <LoadingSpinner fullScreen />;

  const metrics = [
    { icon: Eye, label: 'Total Views', value: data?.totalViews || 0, color: 'text-blue-500' },
    { icon: Users, label: 'Total Applicants', value: data?.totalApplicants || 0, color: 'text-green-500' },
    { icon: TrendingUp, label: 'Conversion Rate', value: `${data?.conversionRate || 0}%`, color: 'text-purple-500' },
    { icon: BarChart3, label: 'Avg Match Score', value: `${data?.avgMatchScore || 0}%`, color: 'text-orange-500' },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Analytics & Insights</h1>

      <div className="grid md:grid-cols-4 gap-6">
        {metrics.map((metric, idx) => (
          <div key={idx} className="border rounded-lg p-6">
            <metric.icon className={`h-8 w-8 mb-3 ${metric.color}`} />
            <p className="text-3xl font-bold mb-1">{metric.value}</p>
            <p className="text-sm text-muted-foreground">{metric.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Application Trends</h2>
          <p className="text-muted-foreground">Application trends will be displayed here.</p>
        </div>
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Top Performing Jobs</h2>
          <p className="text-muted-foreground">Job performance metrics will be displayed here.</p>
        </div>
      </div>
    </div>
  );
}
