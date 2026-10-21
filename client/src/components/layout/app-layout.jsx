import { AppSidebar } from '@/components/app-sidebar';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { NotificationBell, NotificationModal, dummyNotifications } from '../../pages/modals/NotificationModel';
import ThemeToggle from '../theme-toggle';

export default function AppLayout({ children }) {
  const location = useLocation();
  const [modalOpen, setModalOpen] = useState(false);
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const lastSegment = pathSegments[pathSegments.length - 1] || '';
  const pageTitle = lastSegment
    ? lastSegment.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
    : 'Dashboard';

  return (
    <>
      <SidebarProvider
        style={{
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        }}
      >
        <AppSidebar variant="inset" />

        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-7" />
              <h1 className="text-sm font-semibold text-foreground transition-all duration-200">{pageTitle}</h1>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <NotificationBell
                count={dummyNotifications.filter((n) => !n.read).length}
                onClick={() => setModalOpen(true)}
              />
              <ThemeToggle />
            </div>
          </header>

          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <Outlet />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>

      <NotificationModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
