import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { CheckCircle, XCircle } from 'lucide-react';

export default function AdminEmployersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-employers'],
    queryFn: async () => {
      const response = await api.get('/admin/employers/pending');
      return response.data.data;
    },
  });

  if (isLoading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manage Employers</h1>

      <div className="space-y-4">
        {data?.employers?.map((employer: any) => (
          <div key={employer._id} className="border rounded-lg p-6 hover:shadow-lg transition">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">{employer.companyName}</h3>
                <p className="text-sm text-muted-foreground mb-2">{employer.industry}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    employer.verificationStatus === 'verified' 
                      ? 'bg-green-100 text-green-700' 
                      : employer.verificationStatus === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {employer.verificationStatus}
                  </span>
                  {employer.isVerified && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Verified Badge</span>
                  )}
                </div>
              </div>
              {employer.verificationStatus === 'pending' && (
                <div className="flex gap-2">
                  <button className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700">
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </button>
                  <button className="flex items-center gap-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700">
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
