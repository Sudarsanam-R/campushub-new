'use client';

import { ChevronsLeft, ChevronsRight } from 'lucide-react';

interface SidebarToggleButtonProps {
  collapsed: boolean;
  toggleSidebar: () => void;
}

export default function SidebarToggleButton({
  collapsed,
  toggleSidebar,
}: SidebarToggleButtonProps) {
  return (
    <button
      onClick={toggleSidebar}
      className="fixed top-4 left-4 z-50 bg-white dark:bg-zinc-800 p-2 rounded-full shadow hover:bg-zinc-100 dark:hover:bg-zinc-700 transition"
      aria-label="Toggle Sidebar"
    >
      {collapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
    </button>
  );
}
