import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ApplicationsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['employer-applications'],
    queryFn: async () => {
      const response = await api.get('/employers/applications');
      return response.data.data;
    },
  });

  if (isLoading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Applications</h1>

      <div className="space-y-4">
        {data?.applications?.map((app: any) => (
          <div key={app._id} className="border rounded-lg p-6 hover:shadow-lg transition">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{app.applicant?.firstName} {app.applicant?.lastName}</h3>
                <p className="text-sm text-muted-foreground mb-2">Applied for: {app.job?.title}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">{app.status}</span>
                  <span>Match Score: {app.matchScore || 0}%</span>
                </div>
              </div>
              <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
