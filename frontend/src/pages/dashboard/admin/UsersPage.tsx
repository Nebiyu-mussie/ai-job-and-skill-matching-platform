import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Ban, CheckCircle } from 'lucide-react';

export default function AdminUsersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await api.get('/admin/users');
      return response.data.data;
    },
  });

  if (isLoading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manage Users</h1>

      <div className="space-y-4">
        {data?.users?.map((user: any) => (
          <div key={user._id} className="border rounded-lg p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold">{user.firstName[0]}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{user.firstName} {user.lastName}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{user.role}</span>
                    {user.isEmailVerified && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Verified</span>
                    )}
                    {user.isBanned && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Banned</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 border rounded hover:bg-gray-50">
                  {user.isBanned ? <CheckCircle className="h-5 w-5 text-green-600" /> : <Ban className="h-5 w-5 text-red-600" />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
