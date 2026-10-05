import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Clock, User, FileText } from 'lucide-react';

export default function AdminAuditPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: async () => {
      const response = await api.get('/admin/audit-logs');
      return response.data.data;
    },
  });

  if (isLoading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Audit Logs</h1>

      <div className="space-y-3">
        {data?.logs?.map((log: any) => (
          <div key={log._id} className="border rounded-lg p-4 hover:shadow-md transition">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-blue-100">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{log.action}</p>
                    <p className="text-sm text-muted-foreground">{log.resource}: {log.resourceId}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {new Date(log.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <User className="h-4 w-4" />
                  <span>{log.user?.email}</span>
                  <span className="bg-gray-100 px-2 py-0.5 rounded">{log.ipAddress}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
