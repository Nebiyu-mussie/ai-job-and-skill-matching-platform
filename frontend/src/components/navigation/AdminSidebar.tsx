import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, Briefcase, ScrollText, LogOut, Home, X } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/employers', label: 'Employers', icon: Building2 },
  { href: '/admin/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/admin/audit', label: 'Audit Logs', icon: ScrollText },
];

export default function AdminSidebar() {
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore();
  const { logout } = useAuth();
  const location = useLocation();

  const isActive = (href: string, exact?: boolean) =>
    exact ? location.pathname === href : location.pathname.startsWith(href);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location.pathname, setSidebarOpen]);

  // Set sidebar closed by default on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen, setSidebarOpen]);

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 bottom-0 z-50 flex flex-col bg-slate-900 text-white overflow-hidden transition-transform duration-300 ease-in-out',
          'w-64 lg:w-64',
          // Mobile: slide in from left
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          // Desktop: always visible, can collapse to icon bar
          'lg:z-30',
          !sidebarOpen && 'lg:w-20'
        )}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700 flex-shrink-0">
          {sidebarOpen ? (
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs">AI</span>
              </div>
              <span className="font-bold text-sm whitespace-nowrap">Admin Panel</span>
            </Link>
          ) : (
            <Link to="/" className="hover:opacity-80 transition-opacity lg:mx-auto">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">AI</span>
              </div>
            </Link>
          )}
          
          {/* Close button (mobile) or Toggle button (desktop) */}
          <button
            onClick={toggleSidebar}
            className="ml-auto p-1.5 rounded-lg hover:bg-slate-700 transition-colors lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
          
          <button
            onClick={toggleSidebar}
            className="hidden lg:block ml-auto p-1.5 rounded-lg hover:bg-slate-700 transition-colors"
            aria-label="Toggle sidebar"
          >
            <div className="w-4 h-4 flex flex-col justify-center gap-1">
              <span className="block h-0.5 bg-white"></span>
              <span className="block h-0.5 bg-white"></span>
              <span className="block h-0.5 bg-white"></span>
            </div>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setSidebarOpen(false);
                }
              }}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium',
                isActive(link.href, link.exact)
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700',
                !sidebarOpen && 'lg:justify-center'
              )}
            >
              <link.icon className="w-5 h-5 flex-shrink-0" />
              {(sidebarOpen || window.innerWidth < 1024) && <span className="whitespace-nowrap">{link.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-slate-700 space-y-0.5">
          <Link
            to="/"
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-700 transition-colors',
              !sidebarOpen && 'lg:justify-center'
            )}
            title={!sidebarOpen ? 'Back to Home' : undefined}
          >
            <Home className="w-5 h-5 flex-shrink-0" />
            {(sidebarOpen || window.innerWidth < 1024) && <span>Back to Home</span>}
          </Link>
          <button
            onClick={() => logout()}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/20 transition-colors',
              !sidebarOpen && 'lg:justify-center'
            )}
            title={!sidebarOpen ? 'Sign Out' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {(sidebarOpen || window.innerWidth < 1024) && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
