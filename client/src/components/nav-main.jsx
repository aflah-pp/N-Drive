import { Button } from '@/components/ui/button';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Bell, CirclePlusIcon } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CreateFolderDialog } from '../pages/modals/CreateFolderModal';

export function NavMain({ items, title }) {
  const [folderOpen, setFolderOpen] = useState(false);

  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem className="flex items-center gap-2">
              <SidebarMenuButton
                tooltip="New Folder"
                onClick={() => setFolderOpen(true)}
                className="bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
              >
                <CirclePlusIcon />
                <span className="group-data-[collapsible=icon]:hidden">New Folder</span>
              </SidebarMenuButton>

              <Button size="icon" variant="outline" className="size-8 shrink-0 group-data-[collapsible=icon]:hidden">
                <Bell className="size-4" />
                <span className="sr-only">Notifications</span>
              </Button>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>{title}</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title}>
                  <Link to={item.url || '#'} className="flex w-full items-center gap-2">
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <CreateFolderDialog open={folderOpen} onOpenChange={setFolderOpen} />
    </>
  );
}
