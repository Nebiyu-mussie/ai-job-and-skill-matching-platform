import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Ban, CheckCircle, Search, Filter } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-users', searchTerm, roleFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter) params.append('role', roleFilter);
      
      const response = await api.get(`/admin/users?${params.toString()}`);
      return response.data;
    },
  });

  const banMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      await api.patch(`/admin/users/${userId}/ban`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User banned successfully');
    },
    onError: () => {
      toast.error('Failed to ban user');
    },
  });

  const unbanMutation = useMutation({
    mutationFn: async (userId: string) => {
      await api.patch(`/admin/users/${userId}/unban`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User unbanned successfully');
    },
    onError: () => {
      toast.error('Failed to unban user');
    },
  });

  const handleBanToggle = (user: any) => {
    if (user.isBanned) {
      unbanMutation.mutate(user._id);
    } else {
      const reason = prompt('Enter reason for banning this user:');
      if (reason) {
        banMutation.mutate({ userId: user._id, reason });
      }
    }
  };

  if (isLoading) return <LoadingSpinner fullScreen />;

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Manage Users</h1>
        <div className="text-center py-12 text-red-600">
          Failed to load users. Please try again later.
        </div>
      </div>
    );
  }

  const users = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Manage Users</h1>
        <div className="text-sm text-muted-foreground">
          {pagination?.total || 0} total users
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 w-full sm:w-auto"
        >
          <option value="">All Roles</option>
          <option value="jobseeker">Job Seekers</option>
          <option value="employer">Employers</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {/* Users List */}
      {users.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No users found matching your criteria.
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((user: any) => (
            <div key={user._id} className="border border-border rounded-lg p-4 sm:p-6 hover:shadow-lg transition bg-card">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex-shrink-0 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white">
                    {user.profileImage ? (
                      <img src={user.profileImage} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-xl font-bold">{user.firstName?.[0]?.toUpperCase()}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground truncate">{user.firstName} {user.lastName}</h3>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs bg-brand-100 text-brand-700 px-2 py-1 rounded capitalize">
                        {user.role}
                      </span>
                      {user.isEmailVerified && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Verified</span>
                      )}
                      {user.isBanned && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Banned</span>
                      )}
                      {!user.isActive && (
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Inactive</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 sm:flex-shrink-0">
                  {user.role !== 'admin' && (
                    <button
                      onClick={() => handleBanToggle(user)}
                      disabled={banMutation.isPending || unbanMutation.isPending}
                      className="p-2 border border-border rounded-lg hover:bg-accent transition disabled:opacity-50"
                      title={user.isBanned ? 'Unban user' : 'Ban user'}
                    >
                      {user.isBanned ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Ban className="h-5 w-5 text-red-600" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            disabled={!pagination.hasPrevPage}
            className="px-4 py-2 border border-border rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            disabled={!pagination.hasNextPage}
            className="px-4 py-2 border border-border rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
