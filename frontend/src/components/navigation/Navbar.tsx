import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Bell, Briefcase, Building2, BookOpen, User, LogOut, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useAuth } from '@/hooks/useAuth';
import { cn, getInitials } from '@/lib/utils';

const navLinks = [
  { href: '/jobs', label: 'Find Jobs', icon: Briefcase },
  { href: '/companies', label: 'Companies', icon: Building2 },
  { href: '/courses', label: 'Courses', icon: BookOpen },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const { logout, getDashboardPath } = useAuth();
  const { theme, setTheme } = useUIStore();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  }, [location]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-background/80 backdrop-blur-xl border-b border-border shadow-sm'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-brand-500/25 transition-shadow">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-lg text-foreground">JobPlatform</span>
              <span className="text-xs text-muted-foreground block -mt-1">Ethiopia & Africa</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  location.pathname.startsWith(link.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                    {user.profileImage ? (
                      <img src={user.profileImage} alt={user.firstName} className="w-full h-full object-cover" />
                    ) : (
                      getInitials(`${user.firstName} ${user.lastName}`)
                    )}
                  </div>
                  <span className="hidden md:block text-sm font-medium text-foreground">{user.firstName}</span>
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 rounded-xl border bg-card shadow-xl overflow-hidden"
                    >
                      <div className="p-3 border-b">
                        <p className="font-semibold text-sm text-foreground">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="p-1">
                        <Link to={getDashboardPath()} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors">
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </Link>
                        <Link to={user.role === 'employer' ? '/employer/profile' : '/dashboard/profile'} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors">
                          <User className="w-4 h-4" />
                          Profile
                        </Link>
                      </div>
                      <div className="p-1 border-t">
                        <button
                          onClick={() => logout()}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary py-2 text-sm">
                  Get Started
                </Link>
              </div>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-accent"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden overflow-hidden border-t border-border"
            >
              <div className="py-4 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-accent transition-colors"
                  >
                    <link.icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                ))}
                {!isAuthenticated && (
                  <div className="pt-3 border-t border-border flex flex-col gap-2 px-4">
                    <Link to="/login" className="btn-secondary text-center py-2.5 text-sm">Sign In</Link>
                    <Link to="/register" className="btn-primary text-center py-2.5 text-sm">Get Started</Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
