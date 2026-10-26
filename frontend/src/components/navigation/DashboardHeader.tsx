import { Link, useNavigate } from 'react-router-dom';
import { Search, Sun, Moon, Menu } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import NotificationBell from './NotificationBell';

export default function DashboardHeader() {
  const { user } = useAuthStore();
  const { theme, setTheme, toggleSidebar } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      // Navigate to dashboard search page with search query
      navigate(`/dashboard/search?search=${encodeURIComponent(trimmedQuery)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

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
            onKeyDown={handleKeyDown}
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

        <NotificationBell />

        {/* Breadcrumb / Page title area on mobile */}
        <div className="md:hidden text-sm font-medium text-foreground truncate max-w-32">
          {user?.firstName}
        </div>
      </div>
    </header>
  );
}
