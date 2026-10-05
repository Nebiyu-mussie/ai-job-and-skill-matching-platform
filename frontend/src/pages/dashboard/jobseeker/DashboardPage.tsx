import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Briefcase, Clock, CheckCircle2, XCircle, Target, TrendingUp, ArrowRight, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { StatCardSkeleton, Skeleton } from '@/components/ui/SkeletonCard';
import { cn, getStatusColor, timeAgo } from '@/lib/utils';
import MatchScoreRing from '@/components/ui/MatchScoreRing';

function StatCard({ label, value, icon: Icon, color, href }: any) {
  const content = (
    <div className="card p-5 flex items-center gap-4 hover:-translate-y-0.5 transition-transform">
      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', color)}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-black text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
  return href ? <Link to={href}>{content}</Link> : content;
}

export default function JobSeekerDashboard() {
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['jobseeker-dashboard-stats'],
    queryFn: async () => {
      const res = await api.get('/users/dashboard/stats');
      return res.data.data;
    },
  });

  const { data: matchData } = useQuery({
    queryKey: ['my-matches', { limit: 5 }],
    queryFn: async () => {
      const res = await api.get('/matches/my-matches?limit=5');
      return res.data.data;
    },
  });

  const stats = data?.stats;
  const recentApplications = data?.recentApplications || [];
  const topMatches = matchData || [];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-foreground">
          {greeting()}, {user?.firstName}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">Here's what's happening with your job search.</p>
      </motion.div>

      {/* Profile completeness banner */}
      {stats && stats.profileCompleteness < 80 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-5 border-brand-200 dark:border-brand-800 bg-gradient-to-r from-brand-50 to-purple-50 dark:from-brand-950/30 dark:to-purple-950/30"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="font-semibold text-foreground text-sm">Complete your profile to get better matches</p>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-purple-600 rounded-full transition-all"
                    style={{ width: `${stats.profileCompleteness}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-brand-600 dark:text-brand-400 whitespace-nowrap">
                  {stats.profileCompleteness}%
                </span>
              </div>
            </div>
            <Link to="/dashboard/profile" className="btn-primary text-sm py-2 px-4 shrink-0">
              Complete Profile
            </Link>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Total Applications" value={stats?.totalApplications ?? 0} icon={Briefcase} color="bg-brand-500" href="/dashboard/applications" />
            <StatCard label="Pending Review" value={stats?.pendingApplications ?? 0} icon={Clock} color="bg-amber-500" href="/dashboard/applications?status=pending" />
            <StatCard label="Interviews" value={stats?.interviewApplications ?? 0} icon={CheckCircle2} color="bg-emerald-500" href="/dashboard/applications?status=shortlisted" />
            <StatCard label="Profile Score" value={`${stats?.profileCompleteness ?? 0}%`} icon={TrendingUp} color="bg-purple-500" href="/dashboard/profile" />
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-foreground">Recent Applications</h2>
            <Link to="/dashboard/applications" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
          ) : recentApplications.length === 0 ? (
            <div className="text-center py-10">
              <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No applications yet</p>
              <Link to="/jobs" className="btn-primary text-sm mt-3 px-5 py-2 inline-flex">Browse Jobs</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentApplications.map((app: any) => (
                <Link key={app._id} to={`/dashboard/applications`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors group">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                    {app.job?.employer?.logo
                      ? <img src={app.job.employer.logo} alt="" className="w-full h-full object-contain p-1" />
                      : <Briefcase className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {app.job?.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{app.job?.employer?.companyName} · {timeAgo(app.appliedAt)}</p>
                  </div>
                  <span className={cn('badge text-xs px-2 py-0.5 capitalize', getStatusColor(app.status))}>
                    {app.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Top Matches */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-foreground">Top Job Matches</h2>
            <Link to="/dashboard/matches" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {topMatches.length === 0 ? (
            <div className="text-center py-10">
              <Target className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No matches yet. Upload your resume to get started.</p>
              <Link to="/dashboard/resumes" className="btn-primary text-sm mt-3 px-5 py-2 inline-flex">Upload Resume</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {topMatches.slice(0, 5).map((match: any) => (
                <Link key={match._id} to={`/jobs/${match.job?._id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors group">
                  <MatchScoreRing score={match.overallScore} size="sm" animated={false} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {match.job?.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{match.job?.location?.city} · {match.job?.jobType}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-bold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Browse Jobs', icon: Briefcase, href: '/jobs', color: 'text-brand-600 bg-brand-50 dark:bg-brand-900/20' },
            { label: 'Upload Resume', icon: FileText, href: '/dashboard/resumes', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
            { label: 'Skill Gap', icon: TrendingUp, href: '/dashboard/skill-gap', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
            { label: 'Recommendations', icon: Target, href: '/dashboard/recommendations', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
          ].map(({ label, icon: Icon, href, color }) => (
            <Link key={label} to={href}
              className="card p-4 flex flex-col items-center gap-2 text-center hover:-translate-y-0.5 transition-transform">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', color)}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-foreground">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
