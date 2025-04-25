'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PlusCircle, User } from 'lucide-react';
// import { cn } from '@/lib/utils'; // Optional utility to combine classes
import { useEffect, useState } from 'react';

interface SidebarProps {
  collapsed: boolean;
}

export default function Sidebar({ collapsed }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Add Event', href: '/add-event', icon: <PlusCircle size={20} /> },
    { label: 'Profile', href: '/profile', icon: <User size={20} /> },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-white dark:bg-zinc-900 shadow-lg transition-all duration-300 z-40
        ${collapsed ? 'w-16' : 'w-64'}`}
    >
      <div className="h-16 flex items-center justify-center border-b border-zinc-200 dark:border-zinc-700">
        <span className="text-xl font-bold text-indigo-600 dark:text-indigo-300">
          {!collapsed && 'CampusHub'}
        </span>
      </div>

      <nav className="flex-1 p-4 flex flex-col gap-2">
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
  );
}
