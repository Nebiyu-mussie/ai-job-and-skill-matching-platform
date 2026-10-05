import { Link } from 'react-router-dom';
import { Bell, Search, Sun, Moon, Menu } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function DashboardHeader() {
  const { user } = useAuthStore();
  const { theme, setTheme, notificationCount, toggleSidebar } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');

  const dashboardNotifHref =
    user?.role === 'employer' ? '/employer/notifications' : '/dashboard/notifications';

  return (
    <header className="sticky top-0 z-20 h-16 flex items-center gap-4 px-4 md:px-6 bg-background/80 backdrop-blur-xl border-b border-border">
      <button
        onClick={toggleSidebar}
        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-accent transition-colors lg:hidden"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search jobs, candidates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-muted/50 border border-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-accent transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <Link
          to={dashboardNotifHref}
          className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-accent transition-colors"
        >
          <Bell className="w-4 h-4" />
          {notificationCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </Link>

        {/* Breadcrumb / Page title area on mobile */}
        <div className="md:hidden text-sm font-medium text-foreground truncate max-w-32">
          {user?.firstName}
        </div>
      </div>
    </header>
  );
}
