import { motion } from 'framer-motion';
import { Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSavedJobs } from '@/hooks/useJobs';
import JobCard from '@/components/jobs/JobCard';
import { JobCardSkeleton } from '@/components/ui/SkeletonCard';

export default function SavedJobsPage() {
  const { data: bookmarks, isLoading } = useSavedJobs();

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-foreground">Saved Jobs</h1>
        <p className="text-muted-foreground mt-1">Jobs you've bookmarked for later.</p>
      </motion.div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)}
        </div>
      ) : !bookmarks?.length ? (
        <div className="card text-center py-16">
          <Bookmark className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">No saved jobs yet</h3>
          <p className="text-muted-foreground text-sm mb-4">Browse jobs and click the bookmark icon to save them here.</p>
          <Link to="/jobs" className="btn-primary text-sm px-6 py-2">Browse Jobs</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {bookmarks.map((bookmark: any, i: number) => (
            <motion.div key={bookmark._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <JobCard job={{ ...bookmark.job, isBookmarked: true }} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
