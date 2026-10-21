import {
  BrainCircuitIcon,
  CircleHelpIcon,
  CogIcon,
  DollarSignIcon,
  FolderOpen,
  ImageIcon,
  LayoutDashboardIcon,
  Receipt,
  SearchIcon,
  Trash2Icon,
} from 'lucide-react';

export const data = {
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
