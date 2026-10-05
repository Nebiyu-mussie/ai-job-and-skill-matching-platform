import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Trash2, Eye } from 'lucide-react';

export default function AdminJobsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-jobs'],
    queryFn: async () => {
      const response = await api.get('/jobs');
      return response.data.data;
    },
  });

  if (isLoading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manage Jobs</h1>

      <div className="space-y-4">
        {data?.jobs?.map((job: any) => (
          <div key={job._id} className="border rounded-lg p-6 hover:shadow-lg transition">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">{job.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{job.employer?.companyName}</p>
                <div className="flex items-center gap-3 text-sm">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">{job.jobType}</span>
                  <span>{job.location}</span>
                  <span className={`px-2 py-1 rounded ${
                    job.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {job.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 border rounded hover:bg-gray-50">
                  <Eye className="h-5 w-5" />
                </button>
                <button className="p-2 border rounded hover:bg-red-50">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
