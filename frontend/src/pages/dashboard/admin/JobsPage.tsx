import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Trash2, Eye, MapPin, Briefcase, DollarSign, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export default function AdminJobsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-jobs'],
    queryFn: async () => {
      const response = await api.get('/jobs?limit=50');
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (jobId: string) => {
      await api.delete(`/admin/jobs/${jobId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
      toast.success('Job deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete job');
    },
  });

  const handleDelete = (jobId: string, jobTitle: string) => {
    if (confirm(`Are you sure you want to delete "${jobTitle}"? This action cannot be undone.`)) {
      deleteMutation.mutate(jobId);
    }
  };

  if (isLoading) return <LoadingSpinner fullScreen />;

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Manage Jobs</h1>
        <div className="text-center py-12 text-red-600">
          Failed to load jobs. Please try again later.
        </div>
      </div>
    );
  }

  const jobs = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Jobs</h1>
        <div className="text-sm text-muted-foreground">
          {pagination?.total || jobs.length} total jobs
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium">No jobs found</p>
          <p className="text-sm mt-1">There are no job postings in the system yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job: any) => (
            <div key={job._id} className="border border-border rounded-lg p-6 hover:shadow-lg transition bg-card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
                      <Briefcase className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-1">{job.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {job.employer?.companyName || 'Unknown Company'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{job.location?.city || 'Remote'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Briefcase className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate capitalize">{job.jobType}</span>
                    </div>
                    {job.salary && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">
                          {job.salary.min}-{job.salary.max} {job.salary.currency}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">
                        {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      job.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : job.status === 'closed'
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {job.status}
                    </span>
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                      {job.applicationCount || 0} applications
                    </span>
                    {job.isFeatured && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">Featured</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/jobs/${job._id}`}
                    className="p-2 border border-border rounded-lg hover:bg-accent transition"
                    title="View job details"
                  >
                    <Eye className="h-5 w-5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(job._id, job.title)}
                    disabled={deleteMutation.isPending}
                    className="p-2 border border-border rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                    title="Delete job"
                  >
                    <Trash2 className="h-5 w-5 text-red-600" />
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
