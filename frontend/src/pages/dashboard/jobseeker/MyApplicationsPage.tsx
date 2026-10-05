import { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, ChevronDown, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMyApplications, useWithdrawApplication } from '@/hooks/useApplications';
import { cn, getStatusColor, timeAgo } from '@/lib/utils';
import { Skeleton } from '@/components/ui/SkeletonCard';

const STATUSES = ['', 'pending', 'reviewing', 'shortlisted', 'interviewed', 'offered', 'hired', 'rejected', 'withdrawn'];

export default function MyApplicationsPage() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const withdrawMutation = useWithdrawApplication();

  const { data, isLoading } = useMyApplications({ status: status || undefined, page, limit: 10 });
  const applications = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-foreground">My Applications</h1>
        <p className="text-muted-foreground mt-1">Track the status of all your job applications.</p>
      </motion.div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1); }}
            className={cn(
              'text-sm px-4 py-1.5 rounded-full border transition-colors capitalize',
              status === s
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border hover:border-primary text-muted-foreground hover:text-foreground'
            )}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : applications.length === 0 ? (
        <div className="card text-center py-16">
          <Briefcase className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">No applications found</h3>
          <p className="text-muted-foreground text-sm mb-4">Start applying to jobs to see them here.</p>
          <Link to="/jobs" className="btn-primary text-sm px-6 py-2">Browse Jobs</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app: any) => (
            <motion.div
              key={app._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-5"
            >
              <div className="flex items-start gap-4">
                {/* Logo */}
                <div className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0 border border-border">
                  {app.job?.employer?.logo
                    ? <img src={app.job.employer.logo} alt="" className="w-full h-full object-contain p-1" />
                    : <Briefcase className="w-5 h-5 text-muted-foreground" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <Link to={`/jobs/${app.job?._id}`} className="font-semibold text-foreground hover:text-primary transition-colors text-sm">
                        {app.job?.title}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {app.job?.employer?.companyName} · {app.job?.location?.city} · Applied {timeAgo(app.appliedAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={cn('badge capitalize px-3 py-1 text-xs', getStatusColor(app.status))}>
                        {app.status}
                      </span>
                    </div>
                  </div>

                  {app.matchScore > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">Match score: <strong className="text-foreground">{app.matchScore}%</strong></p>
                  )}

                  <div className="flex items-center gap-3 mt-3">
                    <Link to={`/jobs/${app.job?._id}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> View Job
                    </Link>
                    {['pending', 'reviewing'].includes(app.status) && (
                      <button
                        onClick={() => withdrawMutation.mutate({ id: app._id })}
                        className="text-xs text-destructive hover:underline"
                      >
                        Withdraw
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button disabled={!pagination.hasPrevPage} onClick={() => setPage(p => p - 1)} className="btn-secondary text-sm py-2 px-4 disabled:opacity-50">Previous</button>
              <span className="text-sm text-muted-foreground">Page {page} of {pagination.totalPages}</span>
              <button disabled={!pagination.hasNextPage} onClick={() => setPage(p => p + 1)} className="btn-secondary text-sm py-2 px-4 disabled:opacity-50">Next</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
