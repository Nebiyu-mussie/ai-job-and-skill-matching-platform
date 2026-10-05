import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, Briefcase, ScrollText, LogOut } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/employers', label: 'Employers', icon: Building2 },
  { href: '/admin/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/admin/audit', label: 'Audit Logs', icon: ScrollText },
];

export default function AdminSidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { logout } = useAuth();
  const location = useLocation();

  const isActive = (href: string, exact?: boolean) =>
    exact ? location.pathname === href : location.pathname.startsWith(href);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 bottom-0 z-30 flex flex-col bg-slate-900 text-white overflow-hidden transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-20'
      )}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700">
        {sidebarOpen && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">AI</span>
            </div>
            <span className="font-bold text-sm">Admin Panel</span>
          </div>
        )}
        <button onClick={toggleSidebar} className="ml-auto p-1.5 rounded-lg hover:bg-slate-700 transition-colors">
          <span className="sr-only">Toggle sidebar</span>
          <div className="w-4 h-4 flex flex-col justify-center gap-1">
            <span className="block h-0.5 bg-white"></span>
            <span className="block h-0.5 bg-white"></span>
            <span className="block h-0.5 bg-white"></span>
          </div>
        </button>
      </div>

      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {adminLinks.map((link) => (
          <Link
            key={link.href}
            to={link.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium',
              isActive(link.href, link.exact)
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700',
              !sidebarOpen && 'justify-center'
            )}
          >
            <link.icon className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>{link.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="p-2 border-t border-slate-700">
        <button
          onClick={() => logout()}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/20 transition-colors',
            !sidebarOpen && 'justify-center'
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {sidebarOpen && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
