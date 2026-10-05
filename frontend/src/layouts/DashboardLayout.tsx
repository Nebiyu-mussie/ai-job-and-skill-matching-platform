import { Outlet } from 'react-router-dom';
import DashboardSidebar from '@/components/navigation/DashboardSidebar';
import DashboardHeader from '@/components/navigation/DashboardHeader';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';

export default function DashboardLayout() {
  const { sidebarOpen } = useUIStore();
  // Socket connection is handled by useSocket hook in App.tsx

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar />
      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 transition-all duration-300',
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        )}
      >
        <DashboardHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
