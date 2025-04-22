import React from "react";
import Link from "next/link";
import ThemeLogo from "./ThemeLogo";

const sidebarLinks = [
  { label: "Account", href: "/profile" },
  { label: "Registered Events", href: "/profile/registered-events" },
  { label: "Organizing Events", href: "/profile/organizing-events" },
  { label: "Settings", href: "/profile/settings" },
];

export default function ProfileSidebar() {
  return (
    <aside
      className="w-64 min-h-screen flex flex-col justify-between border-r border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-lg shadow-2xl transition-colors duration-300"
      style={{ boxShadow: '0 8px 32px 0 rgba(99,102,241,0.12), 0 1.5px 5px 0 rgba(99,102,241,0.04)' }}
    >
      <div>
        <div className="font-extrabold text-2xl px-7 py-7 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2 tracking-tight text-indigo-600 dark:text-indigo-400 drop-shadow-sm select-none">
          <span className="w-10 h-10 flex items-center justify-center rounded-full bg-transparent">
            <ThemeLogo className="w-9 h-9" />
          </span>
          CampusHub
        </div>
        <nav className="mt-6">
          <ul className="space-y-1">
            {sidebarLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block px-7 py-2.5 rounded-xl font-medium text-base text-zinc-800 dark:text-zinc-100 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/40 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="px-7 py-5 border-t border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md">
        <button
          className="w-full py-2.5 rounded-xl font-semibold text-base text-red-600 dark:text-red-400 bg-red-50 dark:bg-zinc-800 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
