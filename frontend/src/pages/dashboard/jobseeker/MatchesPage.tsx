import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Target, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import MatchScoreRing from '@/components/ui/MatchScoreRing';
import { JobCardSkeleton } from '@/components/ui/SkeletonCard';
import { formatSalary, getStatusColor, cn } from '@/lib/utils';

export default function MatchesPage() {
  const [minScore, setMinScore] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['my-matches', minScore],
    queryFn: async () => {
      const res = await api.get(`/matches/my-matches?minScore=${minScore}&limit=20`);
      return res.data.data;
    },
  });

  const matches = data || [];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-foreground">Job Matches</h1>
        <p className="text-muted-foreground mt-1">Jobs ranked by AI match score based on your profile.</p>
      </motion.div>

      {/* Filter */}
      <div className="card p-4 flex items-center gap-4">
        <SlidersHorizontal className="w-4 h-4 text-muted-foreground shrink-0" />
        <div className="flex items-center gap-3 flex-1">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Min score:</span>
          <input
            type="range" min={0} max={90} step={10} value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="flex-1 accent-primary"
          />
          <span className="text-sm font-bold text-primary w-10 text-right">{minScore}%</span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)}
        </div>
      ) : matches.length === 0 ? (
        <div className="card text-center py-16">
          <Target className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">No matches found</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Upload your resume and complete your profile to get AI-powered job matches.
          </p>
          <Link to="/dashboard/resumes" className="btn-primary text-sm px-6 py-2">Upload Resume</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {matches.map((match: any, i: number) => {
            const job = match.job;
            if (!job) return null;
            return (
              <motion.div key={match._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Link to={`/jobs/${job._id}`} className="block group">
                  <div className="card p-5 h-full hover:-translate-y-0.5 transition-all">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors truncate">{job.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{job.employer?.companyName}</p>
                      </div>
                      <MatchScoreRing score={match.overallScore} size="sm" animated={false} />
                    </div>

                    {/* Score breakdown */}
                    <div className="space-y-1.5 mb-4">
                      {[
                        { label: 'Skills', value: match.skillMatchScore },
                        { label: 'Experience', value: match.experienceMatchScore },
                        { label: 'Education', value: match.educationMatchScore },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-20 shrink-0">{label}</span>
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${value || 0}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-foreground w-8 text-right">{value || 0}%</span>
                        </div>
                      ))}
                    </div>

                    {/* Missing skills */}
                    {match.missingSkills?.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1.5">Missing skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {match.missingSkills.slice(0, 3).map((s: string) => (
                            <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                              {s}
                            </span>
                          ))}
                          {match.missingSkills.length > 3 && (
                            <span className="text-xs text-muted-foreground">+{match.missingSkills.length - 3}</span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 mt-4">
                      <span className={cn('badge text-xs px-2.5 py-0.5 capitalize', getStatusColor(job.jobType))}>
                        {job.jobType?.replace('-', ' ')}
                      </span>
                      <span className="badge text-xs px-2.5 py-0.5 bg-muted text-muted-foreground">{job.location?.city}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
