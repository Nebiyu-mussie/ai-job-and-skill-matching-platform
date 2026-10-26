import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Clock, User, FileText, Activity, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

export default function AdminAuditPage() {
  const [actionFilter, setActionFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-audit-logs', actionFilter, levelFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (actionFilter) params.append('action', actionFilter);
      if (levelFilter) params.append('level', levelFilter);
      
      const response = await api.get(`/admin/audit-logs?${params.toString()}`);
      return response.data;
    },
  });

  if (isLoading) return <LoadingSpinner fullScreen />;

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <div className="text-center py-12 text-red-600">
          Failed to load audit logs. Please try again later.
        </div>
      </div>
    );
  }

  const logs = data?.data || [];
  const pagination = data?.pagination;

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'error':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'warn':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'info':
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'critical':
      case 'error':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Audit Logs</h1>
        <div className="text-sm text-muted-foreground">
          {pagination?.total || logs.length} total logs
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 w-full sm:w-auto"
        >
          <option value="">All Actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="login">Login</option>
          <option value="logout">Logout</option>
        </select>
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 w-full sm:w-auto"
        >
          <option value="">All Levels</option>
          <option value="info">Info</option>
          <option value="warn">Warning</option>
          <option value="error">Error</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium">No audit logs found</p>
          <p className="text-sm mt-1">Audit logs will appear here as system activity occurs.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log: any) => (
            <div
              key={log._id}
              className={`border rounded-lg p-4 hover:shadow-md transition ${getLevelColor(log.level)} bg-card`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                <div className={`p-2 rounded-lg ${getLevelColor(log.level)} flex-shrink-0 w-fit`}>
                  {getLevelIcon(log.level)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-semibold text-foreground truncate">{log.action}</p>
                        <span className={`text-xs px-2 py-0.5 rounded border ${getLevelColor(log.level)} flex-shrink-0`}>
                          {log.level}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {log.resource}
                        {log.resourceId && ` • ID: ${log.resourceId.substring(0, 8)}...`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground flex-shrink-0">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span className="whitespace-nowrap text-xs sm:text-sm">
                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
                    {log.user && (
                      <div className="flex items-center gap-2 text-muted-foreground min-w-0">
                        <User className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">
                          {log.user.firstName} {log.user.lastName}
                          <span className="text-xs ml-1 hidden sm:inline">({log.user.email})</span>
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      {log.ipAddress && (
                        <span className="bg-muted px-2 py-0.5 rounded text-xs text-muted-foreground">
                          {log.ipAddress}
                        </span>
                      )}
                      {log.method && log.path && (
                        <span className="text-xs text-muted-foreground truncate">
                          {log.method} {log.path}
                        </span>
                      )}
                      {log.statusCode && (
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          log.statusCode < 400 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {log.statusCode}
                        </span>
                      )}
                    </div>
                  </div>

                  {log.details && Object.keys(log.details).length > 0 && (
                    <details className="mt-2">
                      <summary className="text-xs text-brand-600 cursor-pointer hover:underline">
                        View details
                      </summary>
                      <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto max-w-full">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
