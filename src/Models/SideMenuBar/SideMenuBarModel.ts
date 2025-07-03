export interface Language {
  title: string;
  mobileTitle: string;
  value: string;
  isShow: boolean;
}

export interface SidebarProps {
  classes: any;
  currentPage?: string;
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed?: boolean;
}