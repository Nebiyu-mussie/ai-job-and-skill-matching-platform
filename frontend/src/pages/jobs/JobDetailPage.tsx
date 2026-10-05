import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Clock, DollarSign, Users, Bookmark, BookmarkCheck, ArrowLeft, Building2, CheckCircle2, ExternalLink } from 'lucide-react';
import { useJob, useBookmarkJob, useUnbookmarkJob } from '@/hooks/useJobs';
import { JobCardSkeleton } from '@/components/ui/SkeletonCard';
import MatchScoreRing from '@/components/ui/MatchScoreRing';
import SkillAnalysis from '@/components/jobs/SkillAnalysis';
import { cn, formatSalary, timeAgo, getStatusColor } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import ApplyModal from '@/components/jobs/ApplyModal';

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: job, isLoading } = useJob(id!);
  const { user } = useAuthStore();
  const bookmarkMutation = useBookmarkJob();
  const unbookmarkMutation = useUnbookmarkJob();
  const [applyOpen, setApplyOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-24 px-4">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <JobCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  if (!job) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground mb-2">Job not found</h2>
        <Link to="/jobs" className="text-primary hover:underline">Browse all jobs</Link>
      </div>
    </div>
  );

  const employer = job.employer || {};
  const toggleBookmark = () => {
    if (job.isBookmarked) unbookmarkMutation.mutate(job._id);
    else bookmarkMutation.mutate(job._id);
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/jobs" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to jobs
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
              {/* Company info */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center border border-border overflow-hidden flex-shrink-0">
                  {employer.logo
                    ? <img src={employer.logo} alt={employer.companyName} className="w-full h-full object-contain p-1" />
                    : <Building2 className="w-7 h-7 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h1 className="text-xl font-bold text-foreground leading-tight">{job.title}</h1>
                      <Link to={`/companies/${employer.slug}`} className="text-primary hover:underline text-sm mt-0.5 inline-block">
                        {employer.companyName}
                      </Link>
                    </div>
                    {job.matchScore > 0 && <MatchScoreRing score={job.matchScore} size="md" />}
                  </div>

                  <div className="flex flex-wrap gap-3 mt-3">
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" /> {job.location?.city}{job.location?.isRemote && ' · Remote'}
                    </span>
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" /> {timeAgo(job.createdAt)}
                    </span>
                    {job.salary?.isVisible && job.salary?.min && (
                      <span className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                        <DollarSign className="w-4 h-4" />
                        {formatSalary(job.salary.min, job.salary.max, job.salary.currency, job.salary.period)}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className={cn('badge px-2.5 py-1', getStatusColor(job.jobType))}>{job.jobType?.replace('-', ' ')}</span>
                    <span className="badge px-2.5 py-1 bg-muted text-muted-foreground capitalize">{job.experienceLevel}</span>
                    {job.location?.isRemote && <span className="badge px-2.5 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Remote</span>}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <h3 className="font-semibold text-foreground mb-3">Job Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{job.description}</p>
              </div>

              {/* Responsibilities */}
              {job.responsibilities?.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-foreground mb-3">Responsibilities</h3>
                  <ul className="space-y-2">
                    {job.responsibilities.map((r: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Requirements */}
              {job.requirements?.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-foreground mb-3">Requirements</h3>
                  <ul className="space-y-2">
                    {job.requirements.map((r: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skills */}
              {job.requiredSkills?.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-foreground mb-3">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.requiredSkills.map((s: any) => (
                      <span key={s.name} className="px-3 py-1 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 text-sm font-medium">
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Skill Analysis Section - Only show for job seekers with match data */}
            {user?.role === 'jobseeker' && job.matchScore > 0 && job.matchDetails && (
              <SkillAnalysis
                matchScore={job.matchScore}
                matchDetails={job.matchDetails}
                skillGapAnalysis={job.skillGapAnalysis}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Apply card */}
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="card p-5 space-y-3">
              {job.hasApplied ? (
                <div className="text-center py-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="font-semibold text-foreground text-sm">Applied</p>
                  <p className="text-xs text-muted-foreground capitalize">Status: {job.applicationStatus}</p>
                </div>
              ) : (
                <>
                  {user?.role === 'jobseeker' && (
                    <button onClick={() => setApplyOpen(true)} className="btn-primary w-full py-3">
                      Apply Now
                    </button>
                  )}
                  {!user && (
                    <Link to="/login" className="btn-primary w-full py-3 block text-center">
                      Sign in to Apply
                    </Link>
                  )}
                  {job.externalApplicationUrl && (
                    <a href={job.externalApplicationUrl} target="_blank" rel="noopener noreferrer"
                       className="btn-secondary w-full py-2.5 flex items-center justify-center gap-2 text-sm">
                      Apply Externally <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </>
              )}

              {user?.role === 'jobseeker' && (
                <button onClick={toggleBookmark} className="btn-secondary w-full py-2.5 flex items-center justify-center gap-2 text-sm">
                  {job.isBookmarked
                    ? <><BookmarkCheck className="w-4 h-4 text-primary" /> Saved</>
                    : <><Bookmark className="w-4 h-4" /> Save Job</>}
                </button>
              )}
            </motion.div>

            {/* Job details */}
            <div className="card p-5">
              <h3 className="font-semibold text-foreground text-sm mb-4">Job Details</h3>
              <dl className="space-y-3">
                {[
                  { label: 'Job Type', value: job.jobType?.replace('-', ' ') },
                  { label: 'Experience', value: job.experienceLevel },
                  { label: 'Category', value: job.category },
                  { label: 'Location', value: `${job.location?.city}, ${job.location?.country}` },
                  { label: 'Applicants', value: job.applicationCount },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center text-sm">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="font-medium text-foreground capitalize">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Company card */}
            <div className="card p-5">
              <h3 className="font-semibold text-foreground text-sm mb-4">About {employer.companyName}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">
                {employer.description || 'No description available.'}
              </p>
              <Link to={`/companies/${employer.slug}`} className="text-xs text-primary hover:underline mt-3 inline-block">
                View company profile →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {applyOpen && job && (
        <ApplyModal job={job} onClose={() => setApplyOpen(false)} />
      )}
    </div>
  );
}
