"use client";

import React, { useState } from "react";
import Link from "next/link";
import ThemeLogo from "../ThemeLogo";
import { usePathname } from "next/navigation";
import { User, ChevronsLeft, ChevronsRight, Calendar, LogOutIcon, PlusCircle } from "lucide-react";

// All sidebar links (profile + events)
// Detect admin route
const isAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin-profile');

const sidebarLinks = isAdmin
  ? [
      { label: "Organized Events", href: "/admin-profile/organized-events", icon: <Calendar size={20} /> },
      { label: "New Event", href: "/admin-profile/new-event", icon: <PlusCircle size={20} /> },
      { label: "Account Details", href: "/admin-profile/account-details", icon: <User size={20} /> }
    ]
  : [
      { label: "Registered Events", href: "/student-profile/registered-events", icon: <Calendar size={20} /> },
      { label: "Events", href: "/events", icon: <ChevronsRight size={20} /> },
      { label: "Account Details", href: "/student-profile/account-details", icon: <User size={20} /> }
    ];

export default function UnifiedSidebar() {
  const [collapsed, setCollapsed] = useState(true);
  const pathname = usePathname();

  const toggleSidebar = () => setCollapsed((prev) => !prev);

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
        ${collapsed ? "w-16" : "w-64"}
        bg-white/70 dark:bg-zinc-900/70 backdrop-blur-lg transition-all`}
        style={{ boxShadow: '0 8px 32px 0 rgba(99,102,241,0.12), 0 1.5px 5px 0 rgba(99,102,241,0.04)' }}
      >
        {/* Logo and Title */}
        <div className={`h-16 flex items-center gap-2 ${collapsed ? 'justify-center px-0' : 'px-7'} border-b border-zinc-200 dark:border-zinc-800 select-none`}>
          <button
            onClick={toggleSidebar}
            aria-label="Toggle Sidebar"
            className="w-12 h-12 flex items-center justify-center rounded-lg bg-white dark:bg-zinc-800 shadow hover:bg-indigo-100 dark:hover:bg-zinc-700 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400"
            tabIndex={0}
          >
            <ThemeLogo className="w-9 h-9 transition-all duration-300" />
          </button>
          {!collapsed && (
            <span className="font-extrabold text-2xl tracking-tight text-indigo-600 dark:text-indigo-400 drop-shadow-sm">
              CampusHub
            </span>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="mt-6 p-2 flex flex-col gap-1">
          <ul className="space-y-1">
            {sidebarLinks.map((link) => (
              <li key={link.href}>
                <div className="relative group">
                  <Link
                    href={link.href}
                    className={`flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-7'} py-2.5 rounded-xl font-medium text-base transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900
                      ${pathname === link.href
                        ? "bg-indigo-100/70 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300"
                        : "text-zinc-800 dark:text-zinc-100 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/40 hover:text-indigo-700 dark:hover:text-indigo-300"}
                    `}
                  >
                    {link.icon && <span>{link.icon}</span>}
                    {!collapsed && link.label}
                  </Link>
                  {/* Tooltip for collapsed state */}
                  {collapsed && (
                    <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 whitespace-nowrap bg-zinc-800 text-white text-xs font-semibold px-3 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                      {link.label}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className={`absolute bottom-0 left-0 w-full ${collapsed ? 'px-2 py-3' : 'px-7 py-5'} border-t border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md`}>
          <div className="relative group">
            <button
              className={`w-full py-2.5 rounded-xl font-semibold text-base flex items-center justify-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-zinc-800 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900`}
            >
              <LogOutIcon size={20} />
              {!collapsed && 'Log out'}
            </button>
            {/* Tooltip for collapsed state */}
            {collapsed && (
              <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 whitespace-nowrap bg-zinc-800 text-white text-xs font-semibold px-3 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                Log out
              </span>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
