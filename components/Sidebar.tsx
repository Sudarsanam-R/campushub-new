'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PlusCircle, User } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface SidebarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ collapsed, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Event', href: '/Events', icon: <PlusCircle size={20} /> },
    { label: 'Profile', href: '/account', icon: <User size={20} /> },
  ];

  return (
    <>
      {/* Overlay for blur when sidebar is open */}
      {!collapsed && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-40 shadow-lg transition-all duration-300
        ${collapsed ? 'w-0 overflow-hidden' : 'w-64'} 
        bg-white dark:bg-zinc-900`}
      >
        <div className="h-16 flex items-center justify-center border-b border-zinc-200 dark:border-zinc-700 px-4">
          <span className="text-xl font-bold text-indigo-600 dark:text-indigo-300">
            CampusHub
          </span>
        </div>

        <nav className="p-4 flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-md font-medium transition
              ${
                pathname === item.href
                  ? 'bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-white'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {item.icon}
              {!collapsed && item.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
