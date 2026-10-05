import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface RoleGuardProps {
  children: React.ReactNode;
  roles: string[];
}

export function RoleGuard({ children, roles }: RoleGuardProps) {
  const { user } = useAuthStore();

  if (!user || !roles.includes(user.role)) {
    // Redirect based on role
    if (user?.role === 'employer') return <Navigate to="/employer/dashboard" replace />;
    if (user?.role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
