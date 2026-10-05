import { Link } from 'react-router-dom';
import { MapPin, Clock, Bookmark, BookmarkCheck, DollarSign, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn, formatSalary, timeAgo, getStatusColor } from '@/lib/utils';
import MatchScoreRing from '@/components/ui/MatchScoreRing';
import { useBookmarkJob, useUnbookmarkJob } from '@/hooks/useJobs';
import { useAuthStore } from '@/store/authStore';

interface JobCardProps {
  job: any;
  compact?: boolean;
}

export default function JobCard({ job, compact = false }: JobCardProps) {
  const { user } = useAuthStore();
  const bookmarkMutation = useBookmarkJob();
  const unbookmarkMutation = useUnbookmarkJob();

  const toggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    if (job.isBookmarked) {
      unbookmarkMutation.mutate(job._id);
    } else {
      bookmarkMutation.mutate(job._id);
    }
  };

  const employer = job.employer || {};

  return (
    <Link to={`/jobs/${job._id}`} className="block group">
      <div className={cn(
        'card p-5 h-full flex flex-col gap-4 group-hover:-translate-y-0.5 transition-all duration-200',
        job.isFeatured && 'ring-1 ring-brand-500/30'
      )}>
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Company logo */}
          <div className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden border border-border">
            {employer.logo ? (
              <img src={employer.logo} alt={employer.companyName} className="w-full h-full object-contain p-1" />
            ) : (
              <Building2 className="w-5 h-5 text-muted-foreground" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground text-sm leading-tight truncate group-hover:text-primary transition-colors">
                  {job.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{employer.companyName}</p>
              </div>
              {job.matchScore !== undefined && job.matchScore > 0 && (
                <MatchScoreRing score={job.matchScore} size="sm" animated={false} />
              )}
            </div>
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-x-3 gap-y-1.5">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            {job.location?.city}{job.location?.isRemote && ' · Remote'}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            {timeAgo(job.createdAt)}
          </span>
          {job.salary?.isVisible && job.salary?.min && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <DollarSign className="w-3.5 h-3.5" />
              {formatSalary(job.salary.min, job.salary.max, job.salary.currency, job.salary.period)}
            </span>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          <span className={cn('badge px-2.5 py-0.5', getStatusColor(job.jobType || 'full-time'))}>
            {job.jobType?.replace('-', ' ')}
          </span>
          <span className="badge px-2.5 py-0.5 bg-muted text-muted-foreground capitalize">
            {job.experienceLevel}
          </span>
          {job.location?.isRemote && (
            <span className="badge px-2.5 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              Remote
            </span>
          )}
          {job.isFeatured && (
            <span className="badge px-2.5 py-0.5 bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
              Featured
            </span>
          )}
        </div>

        {/* Footer */}
        {!compact && (
          <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {job.applicationCount || 0} applicant{job.applicationCount !== 1 ? 's' : ''}
            </span>
            {user?.role === 'jobseeker' && (
              <button
                onClick={toggleBookmark}
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label={job.isBookmarked ? 'Remove bookmark' : 'Save job'}
              >
                {job.isBookmarked
                  ? <BookmarkCheck className="w-4 h-4 text-primary" />
                  : <Bookmark className="w-4 h-4" />}
              </button>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
