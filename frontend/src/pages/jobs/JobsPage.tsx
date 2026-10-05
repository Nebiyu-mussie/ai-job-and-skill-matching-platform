import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, MapPin, Briefcase, Clock, X } from 'lucide-react';
import { useJobs, JobFilters } from '@/hooks/useJobs';
import JobCard from '@/components/jobs/JobCard';
import { JobCardSkeleton } from '@/components/ui/SkeletonCard';
import { JOB_TYPES, EXPERIENCE_LEVELS, ETHIOPIAN_CITIES, JOB_CATEGORIES } from '@/lib/utils';

export default function JobsPage() {
  const [filters, setFilters] = useState<JobFilters>({ page: 1, limit: 12 });
  const [showFilters, setShowFilters] = useState(false);
  const { data, isLoading } = useJobs(filters);

  const jobs = data?.data || [];
  const pagination = data?.pagination;

  const setFilter = (key: keyof JobFilters, value: any) =>
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));

  const clearFilters = () => setFilters({ page: 1, limit: 12 });

  const activeFilterCount = Object.entries(filters).filter(
    ([k, v]) => !['page', 'limit'].includes(k) && v
  ).length;

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-brand-600 to-purple-700 py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-4">Find Your Next Opportunity</h1>
          <p className="text-brand-100 mb-8">Thousands of jobs across Ethiopia and Africa</p>
          {/* Search bar */}
          <div className="flex gap-2 bg-white dark:bg-card rounded-xl p-2 shadow-xl max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Job title, skills, keywords..."
                value={filters.search || ''}
                onChange={(e) => setFilter('search', e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
            <div className="relative hidden sm:block">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <select
                value={filters.city || ''}
                onChange={(e) => setFilter('city', e.target.value)}
                className="pl-9 pr-8 py-2.5 bg-transparent text-sm text-foreground focus:outline-none appearance-none border-l border-border"
              >
                <option value="">All Cities</option>
                {ETHIOPIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button className="btn-primary px-5 py-2.5 rounded-lg text-sm shrink-0">Search</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter bar */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary text-sm py-2 px-4 flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Quick filters */}
            {JOB_TYPES.slice(0, 3).map((t) => (
              <button
                key={t.value}
                onClick={() => setFilter('jobType', filters.jobType === t.value ? '' : t.value)}
                className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${filters.jobType === t.value ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary'}`}
              >
                {t.label}
              </button>
            ))}

            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={filters.isRemote === true}
                onChange={(e) => setFilter('isRemote', e.target.checked ? true : undefined)}
                className="rounded"
              />
              Remote only
            </label>

            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                <X className="w-3 h-3" /> Clear all
              </button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{pagination?.total || 0} jobs found</p>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="card p-5 mb-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Category</label>
              <select value={filters.category || ''} onChange={(e) => setFilter('category', e.target.value)} className="input-field text-sm">
                <option value="">All Categories</option>
                {JOB_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Job Type</label>
              <select value={filters.jobType || ''} onChange={(e) => setFilter('jobType', e.target.value)} className="input-field text-sm">
                <option value="">All Types</option>
                {JOB_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Experience Level</label>
              <select value={filters.experienceLevel || ''} onChange={(e) => setFilter('experienceLevel', e.target.value)} className="input-field text-sm">
                <option value="">All Levels</option>
                {EXPERIENCE_LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">City</label>
              <select value={filters.city || ''} onChange={(e) => setFilter('city', e.target.value)} className="input-field text-sm">
                <option value="">All Cities</option>
                {ETHIOPIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Job grid */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => <JobCardSkeleton key={i} />)}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No jobs found</h3>
            <p className="text-muted-foreground text-sm">Try adjusting your filters or search terms.</p>
            <button onClick={clearFilters} className="btn-primary mt-4 px-6 py-2 text-sm">Clear Filters</button>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {jobs.map((job: any, i: number) => (
                <motion.div key={job._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <JobCard job={job} />
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  disabled={!pagination.hasPrevPage}
                  onClick={() => setFilters((p) => ({ ...p, page: (p.page || 1) - 1 }))}
                  className="btn-secondary text-sm py-2 px-4 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  disabled={!pagination.hasNextPage}
                  onClick={() => setFilters((p) => ({ ...p, page: (p.page || 1) + 1 }))}
                  className="btn-secondary text-sm py-2 px-4 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
