import { CircleUserRoundIcon, EllipsisVerticalIcon, LogOutIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import useAuthStore from '../service/store/authStore';

export function NavUser({ onLogout }) {
  const { user } = useAuthStore();
  const { isMobile } = useSidebar();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const username = user?.username || 'User';
  const email = user?.email || 'user@ndrive.com';
  const avatar = user?.profile_img || null;
  const initials = username.slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await onLogout();
      toast.success('Logged out successfully');
      setLogoutDialogOpen(false);
    } catch (error) {
      const message =
        error?.error ||
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        'Could not log out. Please try again.';
      toast.error(message);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger render={<SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />}>
              <Avatar className="size-8 rounded-lg grayscale">
                <AvatarImage src={avatar} alt={username} />
                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{username}</span>
                <span className="truncate text-xs text-foreground/70">{email}</span>
              </div>
              <EllipsisVerticalIcon className="ml-auto size-4" />
            </DropdownMenuTrigger>

            <DropdownMenuContent className="min-w-56" side={isMobile ? 'bottom' : 'right'} align="end" sideOffset={4}>
              <DropdownMenuGroup>
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="size-8">
                      <AvatarImage src={avatar} alt={username} />
                      <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{username}</span>
                      <span className="truncate text-xs text-muted-foreground">{email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link to={'/profile'} className="flex w-full items-center gap-2">
                    <CircleUserRoundIcon />
                    Account
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => setLogoutDialogOpen(true)}>
                <LogOutIcon />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out of N-Drive?</AlertDialogTitle>
            <AlertDialogDescription>
              Choose how you want to end your session. Logging out of all devices will invalidate your active sessions
              everywhere.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex flex-col gap-2 sm:flex-col">
            <AlertDialogAction
              disabled={isLoggingOut}
              onClick={handleLogout}
              className={cn(buttonVariants({ variant: 'default' }), 'w-full')}
            >
              {isLoggingOut ? 'Logging out…' : 'Log out current session'}
            </AlertDialogAction>

            <AlertDialogCancel disabled={isLoggingOut} className="w-full">
              Cancel
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
