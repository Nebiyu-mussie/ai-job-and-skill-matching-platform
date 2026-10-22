import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Link } from 'react-router-dom';
import { Plus, Edit, Eye } from 'lucide-react';

export default function ManageJobsPage() {
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['employer-jobs'],
    queryFn: async () => {
      const response = await api.get('/jobs/employer/my-jobs');
      console.log('Manage Jobs Response:', response.data);
      return response.data.data; // This is the jobs array directly
    },
  });

  if (isLoading) return <LoadingSpinner fullScreen />;

  const jobsList = jobs || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Jobs</h1>
        <Link
          to="/employer/post-job"
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
        >
          <Plus className="h-5 w-5" />
          Post New Job
        </Link>
      </div>

      {jobsList.length === 0 ? (
        <div className="text-center py-12 bg-white border rounded-lg">
          <div className="max-w-md mx-auto">
            <h3 className="text-xl font-semibold mb-2">No jobs posted yet</h3>
            <p className="text-muted-foreground mb-6">
              Start by posting your first job to find the perfect candidates.
            </p>
            <Link
              to="/employer/post-job"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90"
            >
              <Plus className="h-5 w-5" />
              Post Your First Job
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {jobsList.map((job: any) => (
            <div key={job._id} className="border rounded-lg p-6 hover:shadow-lg transition bg-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {job.location?.city}, {job.location?.country}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {job.jobType}
                    </span>
                    <span>{job.applicationCount || 0} Applications</span>
                    <span className={job.status === 'active' ? 'text-green-600' : 'text-gray-600'}>
                      {job.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/jobs/${job._id}`}
                    className="p-2 border rounded hover:bg-gray-50"
                    title="View Job"
                  >
                    <Eye className="h-5 w-5" />
                  </Link>
                  <button 
                    className="p-2 border rounded hover:bg-gray-50"
                    title="Edit Job"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
