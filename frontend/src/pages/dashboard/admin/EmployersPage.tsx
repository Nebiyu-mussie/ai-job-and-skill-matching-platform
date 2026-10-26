import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { CheckCircle, XCircle, Building2, MapPin, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function AdminEmployersPage() {
  const [showAll, setShowAll] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-employers', showAll],
    queryFn: async () => {
      const endpoint = showAll ? '/employers' : '/admin/employers/pending';
      const response = await api.get(endpoint);
      return response.data;
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (employerId: string) => {
      await api.patch(`/admin/employers/${employerId}/verify`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-employers'] });
      toast.success('Employer verified successfully');
    },
    onError: () => {
      toast.error('Failed to verify employer');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ employerId, reason }: { employerId: string; reason: string }) => {
      await api.patch(`/admin/employers/${employerId}/reject`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-employers'] });
      toast.success('Employer verification rejected');
    },
    onError: () => {
      toast.error('Failed to reject employer');
    },
  });

  const handleVerify = (employerId: string) => {
    if (confirm('Are you sure you want to verify this employer?')) {
      verifyMutation.mutate(employerId);
    }
  };

  const handleReject = (employerId: string) => {
    const reason = prompt('Enter reason for rejection:');
    if (reason) {
      rejectMutation.mutate({ employerId, reason });
    }
  };

  if (isLoading) return <LoadingSpinner fullScreen />;

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Manage Employers</h1>
        <div className="text-center py-12 text-red-600">
          Failed to load employers. Please try again later.
        </div>
      </div>
    );
  }

  const employers = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Manage Employers</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition w-full sm:w-auto"
          >
            {showAll ? 'Show Pending Only' : 'Show All Employers'}
          </button>
          <div className="text-sm text-muted-foreground">
            {pagination?.total || employers.length} {showAll ? 'total' : 'pending'}
          </div>
        </div>
      </div>

      {employers.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium">No {showAll ? 'employers' : 'pending verifications'} found</p>
          <p className="text-sm mt-1">
            {showAll ? 'There are no employers in the system yet.' : 'All employers have been verified!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {employers.map((employer: any) => (
            <div key={employer._id} className="border border-border rounded-lg p-4 sm:p-6 hover:shadow-lg transition bg-card">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-1 truncate">{employer.companyName}</h3>
                      <p className="text-sm text-muted-foreground truncate">{employer.industry}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{employer.location?.city || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4 flex-shrink-0" />
                      <span className="capitalize truncate">{employer.companySize || 'N/A'}</span>
                    </div>
                  </div>

                  {employer.website && (
                    <a
                      href={employer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-brand-600 hover:underline truncate block"
                    >
                      {employer.website}
                    </a>
                  )}

                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      employer.isVerified
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {employer.isVerified ? 'Verified' : 'Pending Verification'}
                    </span>
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                      {employer.activeJobCount || 0} Active Jobs
                    </span>
                  </div>
                </div>

                {!employer.isVerified && (
                  <div className="flex gap-2 lg:ml-4 lg:flex-shrink-0">
                    <button
                      onClick={() => handleVerify(employer._id)}
                      disabled={verifyMutation.isPending}
                      className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex-1 lg:flex-initial justify-center"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Approve</span>
                    </button>
                    <button
                      onClick={() => handleReject(employer._id)}
                      disabled={rejectMutation.isPending}
                      className="flex items-center gap-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex-1 lg:flex-initial justify-center"
                    >
                      <XCircle className="h-4 w-4" />
                      <span className="text-sm">Reject</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
