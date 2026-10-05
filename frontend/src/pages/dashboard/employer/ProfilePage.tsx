import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function EmployerProfilePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['employer-profile'],
    queryFn: async () => {
      const response = await api.get('/employers/profile');
      return response.data.data;
    },
  });

  if (isLoading) return <LoadingSpinner fullScreen />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Company Profile</h1>

      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Company Information</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Company Name</label>
            <p className="text-lg">{data?.companyName}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Industry</label>
            <p className="text-lg">{data?.industry}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Company Size</label>
            <p className="text-lg">{data?.companySize}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Website</label>
            <p className="text-lg">{data?.website}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <p className="text-lg">{data?.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
