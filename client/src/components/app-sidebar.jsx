import { NavDocuments } from '@/components/nav-documents';
import { NavMain } from '@/components/nav-main';
import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  BrainCircuitIcon,
  CircleHelpIcon,
  CogIcon,
  DollarSignIcon,
  FolderOpen,
  HardDrive,
  ImageIcon,
  LayoutDashboardIcon,
  Receipt,
  SearchIcon,
  Trash2Icon,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const data = {
  user: {
    name: 'Admin',
    email: 'testing@mail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
    {
      title: 'Dashboard',
      url: '/',
      icon: <LayoutDashboardIcon />,
    },
    {
      title: 'My Files',
      url: '/files',
      icon: <FolderOpen />,
    },
    {
      title: 'Bin',
      url: '/trash',
      icon: <Trash2Icon />,
    },
  ],
  navSecondary: [
    {
      title: 'Get Help',
      url: '/help',
      icon: <CircleHelpIcon />,
    },
    {
      title: 'Search',
      url: '/look',
      icon: <SearchIcon />,
    },
  ],
  documents: [
    {
      name: 'Chat Assistant',
      url: '/ai/chat',
      icon: <BrainCircuitIcon />,
    },
    {
      name: 'Image Studio',
      url: '/ai/studio',
      icon: <ImageIcon />,
    },
  ],
  document2: [
    {
      name: 'Plans',
      url: '/plans',
      icon: <DollarSignIcon />,
    },
    {
      name: 'Billing & Receipts',
      url: '/invoice',
      icon: <Receipt />,
    },
    {
      name: 'Settings',
      url: '/settings',
      icon: <CogIcon />,
    },
  ],
};
export function AppSidebar({ ...props }) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="data-[slot=sidebar-menu-button]:p-1.5!" asChild>
              <Link to={'/'} className="flex w-full items-center gap-2">
                <HardDrive className="size-5!" />
                <span className="text-base font-semibold">N Drive.</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} title={'WorkSpace'} />
        <NavDocuments items={data.documents} title={'Create'} />
        <NavDocuments items={data.document2} title={'Account'} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
