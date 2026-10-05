import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, User, FileText, Briefcase, Bookmark, Target,
  TrendingUp, Lightbulb, MessageSquare, Bell, LogOut, ChevronLeft,
  ChevronRight, PlusCircle, Users, BarChart3, Settings,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useAuth } from '@/hooks/useAuth';
import { cn, getInitials } from '@/lib/utils';

const jobSeekerLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/profile', label: 'My Profile', icon: User },
  { href: '/dashboard/resumes', label: 'Resumes', icon: FileText },
  { href: '/dashboard/applications', label: 'Applications', icon: Briefcase },
  { href: '/dashboard/saved-jobs', label: 'Saved Jobs', icon: Bookmark },
  { href: '/dashboard/matches', label: 'Job Matches', icon: Target },
  { href: '/dashboard/skill-gap', label: 'Skill Gap', icon: TrendingUp },
  { href: '/dashboard/recommendations', label: 'Recommendations', icon: Lightbulb },
  { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
];

const employerLinks = [
  { href: '/employer/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/employer/post-job', label: 'Post a Job', icon: PlusCircle },
  { href: '/employer/jobs', label: 'Manage Jobs', icon: Briefcase },
  { href: '/employer/applications', label: 'Applications', icon: FileText },
  { href: '/employer/candidates', label: 'Candidates', icon: Users },
  { href: '/employer/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/employer/profile', label: 'Company Profile', icon: Settings },
];

export default function DashboardSidebar() {
  const { user } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { logout } = useAuth();
  const location = useLocation();

  const links = user?.role === 'employer' ? employerLinks : jobSeekerLinks;

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return location.pathname === href;
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <motion.aside
        animate={{ width: sidebarOpen ? 256 : 80 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed left-0 top-0 bottom-0 z-30 flex flex-col bg-card border-r border-border overflow-hidden"
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border flex-shrink-0">
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2.5 overflow-hidden"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xs">AI</span>
                </div>
                <span className="font-bold text-sm text-foreground whitespace-nowrap">AI Job Platform</span>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={toggleSidebar}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors flex-shrink-0 ml-auto"
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* User info */}
        <div className={cn('p-3 border-b border-border', !sidebarOpen && 'flex justify-center')}>
          <div className={cn('flex items-center gap-3', !sidebarOpen && 'justify-center')}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden">
              {user?.profileImage ? (
                <img src={user.profileImage} alt={user.firstName} className="w-full h-full object-cover" />
              ) : (
                getInitials(`${user?.firstName || ''} ${user?.lastName || ''}`)
              )}
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="min-w-0"
                >
                  <p className="text-sm font-semibold text-foreground truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5 scrollbar-thin">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium group',
                isActive(link.href, link.exact)
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                !sidebarOpen && 'justify-center px-2'
              )}
              title={!sidebarOpen ? link.label : undefined}
            >
              <link.icon className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    {link.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-border">
          <button
            onClick={() => logout()}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors',
              !sidebarOpen && 'justify-center px-2'
            )}
            title={!sidebarOpen ? 'Sign Out' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>
    </>
  );
}
