import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { Suspense, lazy } from 'react';
import { useSocket, useNotificationPermission } from '@/hooks/useSocket';

import PublicLayout from '@/layouts/PublicLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import AdminLayout from '@/layouts/AdminLayout';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { RoleGuard } from '@/components/guards/RoleGuard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import NotFoundPage from '@/pages/NotFoundPage';

// Lazy imports
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('@/pages/auth/VerifyEmailPage'));
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const JobsPage = lazy(() => import('@/pages/jobs/JobsPage'));
const JobDetailPage = lazy(() => import('@/pages/jobs/JobDetailPage'));
const CompaniesPage = lazy(() => import('@/pages/CompaniesPage'));
const CompanyDetailPage = lazy(() => import('@/pages/CompanyDetailPage'));
const CoursesPage = lazy(() => import('@/pages/CoursesPage'));
const MessagesPage = lazy(() => import('@/pages/MessagesPage'));
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'));

// Static pages
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const BlogPage = lazy(() => import('@/pages/BlogPage'));
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'));
const TermsPage = lazy(() => import('@/pages/TermsPage'));

const JobSeekerDashboard = lazy(() => import('@/pages/dashboard/jobseeker/DashboardPage'));
const ProfilePage = lazy(() => import('@/pages/dashboard/jobseeker/ProfilePage'));
const ResumeManagerPage = lazy(() => import('@/pages/dashboard/jobseeker/ResumeManagerPage'));
const MyApplicationsPage = lazy(() => import('@/pages/dashboard/jobseeker/MyApplicationsPage'));
const SavedJobsPage = lazy(() => import('@/pages/dashboard/jobseeker/SavedJobsPage'));
const MatchesPage = lazy(() => import('@/pages/dashboard/jobseeker/MatchesPage'));
const SkillGapPage = lazy(() => import('@/pages/dashboard/jobseeker/SkillGapPage'));
const RecommendationsPage = lazy(() => import('@/pages/dashboard/jobseeker/RecommendationsPage'));

const EmployerDashboard = lazy(() => import('@/pages/dashboard/employer/DashboardPage'));
const PostJobPage = lazy(() => import('@/pages/dashboard/employer/PostJobPage'));
const ManageJobsPage = lazy(() => import('@/pages/dashboard/employer/ManageJobsPage'));
const ApplicationsPage = lazy(() => import('@/pages/dashboard/employer/ApplicationsPage'));
const CandidatesPage = lazy(() => import('@/pages/dashboard/employer/CandidatesPage'));
const EmployerProfilePage = lazy(() => import('@/pages/dashboard/employer/ProfilePage'));
const EmployerAnalyticsPage = lazy(() => import('@/pages/dashboard/employer/AnalyticsPage'));

const AdminDashboard = lazy(() => import('@/pages/dashboard/admin/DashboardPage'));
const AdminUsersPage = lazy(() => import('@/pages/dashboard/admin/UsersPage'));
const AdminEmployersPage = lazy(() => import('@/pages/dashboard/admin/EmployersPage'));
const AdminJobsPage = lazy(() => import('@/pages/dashboard/admin/JobsPage'));
const AdminAuditPage = lazy(() => import('@/pages/dashboard/admin/AuditPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function SuspenseWrap({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingSpinner fullScreen />}>{children}</Suspense>;
}

export default function App() {
  // 🎯 TASK 4: Initialize Socket.io for real-time notifications
  useSocket();
  useNotificationPermission();

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<SuspenseWrap><LandingPage /></SuspenseWrap>} />
            <Route path="/jobs" element={<SuspenseWrap><JobsPage /></SuspenseWrap>} />
            <Route path="/jobs/:id" element={<SuspenseWrap><JobDetailPage /></SuspenseWrap>} />
            <Route path="/companies" element={<SuspenseWrap><CompaniesPage /></SuspenseWrap>} />
            <Route path="/companies/:slug" element={<SuspenseWrap><CompanyDetailPage /></SuspenseWrap>} />
            <Route path="/courses" element={<SuspenseWrap><CoursesPage /></SuspenseWrap>} />
            <Route path="/about" element={<SuspenseWrap><AboutPage /></SuspenseWrap>} />
            <Route path="/blog" element={<SuspenseWrap><BlogPage /></SuspenseWrap>} />
            <Route path="/privacy" element={<SuspenseWrap><PrivacyPage /></SuspenseWrap>} />
            <Route path="/terms" element={<SuspenseWrap><TermsPage /></SuspenseWrap>} />
          </Route>

          <Route path="/login" element={<SuspenseWrap><LoginPage /></SuspenseWrap>} />
          <Route path="/register" element={<SuspenseWrap><RegisterPage /></SuspenseWrap>} />
          <Route path="/forgot-password" element={<SuspenseWrap><ForgotPasswordPage /></SuspenseWrap>} />
          <Route path="/reset-password/:token" element={<SuspenseWrap><ResetPasswordPage /></SuspenseWrap>} />
          <Route path="/verify-email/:token" element={<SuspenseWrap><VerifyEmailPage /></SuspenseWrap>} />

          <Route element={<AuthGuard><RoleGuard roles={['jobseeker']}><DashboardLayout /></RoleGuard></AuthGuard>}>
            <Route path="/dashboard" element={<SuspenseWrap><JobSeekerDashboard /></SuspenseWrap>} />
            <Route path="/dashboard/profile" element={<SuspenseWrap><ProfilePage /></SuspenseWrap>} />
            <Route path="/dashboard/resumes" element={<SuspenseWrap><ResumeManagerPage /></SuspenseWrap>} />
            <Route path="/dashboard/applications" element={<SuspenseWrap><MyApplicationsPage /></SuspenseWrap>} />
            <Route path="/dashboard/saved-jobs" element={<SuspenseWrap><SavedJobsPage /></SuspenseWrap>} />
            <Route path="/dashboard/matches" element={<SuspenseWrap><MatchesPage /></SuspenseWrap>} />
            <Route path="/dashboard/skill-gap" element={<SuspenseWrap><SkillGapPage /></SuspenseWrap>} />
            <Route path="/dashboard/recommendations" element={<SuspenseWrap><RecommendationsPage /></SuspenseWrap>} />
            <Route path="/dashboard/messages" element={<SuspenseWrap><MessagesPage /></SuspenseWrap>} />
            <Route path="/dashboard/notifications" element={<SuspenseWrap><NotificationsPage /></SuspenseWrap>} />
          </Route>

          <Route element={<AuthGuard><RoleGuard roles={['employer']}><DashboardLayout /></RoleGuard></AuthGuard>}>
            <Route path="/employer/dashboard" element={<SuspenseWrap><EmployerDashboard /></SuspenseWrap>} />
            <Route path="/employer/post-job" element={<SuspenseWrap><PostJobPage /></SuspenseWrap>} />
            <Route path="/employer/jobs" element={<SuspenseWrap><ManageJobsPage /></SuspenseWrap>} />
            <Route path="/employer/applications" element={<SuspenseWrap><ApplicationsPage /></SuspenseWrap>} />
            <Route path="/employer/candidates" element={<SuspenseWrap><CandidatesPage /></SuspenseWrap>} />
            <Route path="/employer/profile" element={<SuspenseWrap><EmployerProfilePage /></SuspenseWrap>} />
            <Route path="/employer/analytics" element={<SuspenseWrap><EmployerAnalyticsPage /></SuspenseWrap>} />
          </Route>

          <Route element={<AuthGuard><RoleGuard roles={['admin']}><AdminLayout /></RoleGuard></AuthGuard>}>
            <Route path="/admin" element={<SuspenseWrap><AdminDashboard /></SuspenseWrap>} />
            <Route path="/admin/users" element={<SuspenseWrap><AdminUsersPage /></SuspenseWrap>} />
            <Route path="/admin/employers" element={<SuspenseWrap><AdminEmployersPage /></SuspenseWrap>} />
            <Route path="/admin/jobs" element={<SuspenseWrap><AdminJobsPage /></SuspenseWrap>} />
            <Route path="/admin/audit" element={<SuspenseWrap><AdminAuditPage /></SuspenseWrap>} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
          },
        }}
      />

      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
