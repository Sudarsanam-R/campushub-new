'use client'

import { signOut, useSession } from 'next-auth/react'
import ThemeToggle from '../ThemeToggle'
import Link from 'next/link'
import Image from 'next/image'
import Switch from './Switch'
import ThemeLogo from '../ThemeLogo'
import AuthSliderNav from '../AuthSliderNav'
import React from 'react'

export default function Header() {
  const { data: session, status } = useSession();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-zinc-900/70 shadow-sm border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" aria-label="CampusHub home">
          <ThemeLogo className="w-10 h-10" />
          <span className="text-xl font-semibold tracking-tight text-indigo-600 dark:text-indigo-400">CampusHub</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          {status === 'authenticated' ? (
            <>
              <div className="flex items-center gap-6">
                <span className="text-base font-semibold text-zinc-800 dark:text-zinc-100 hidden sm:inline">
                  Welcome, {session.user?.name || 'User'}
                </span>
                {/* Navigation Links */}
                {/* Show links based on user type */}
                {session?.user?.email?.endsWith('@admin.com') ? (
                  <>
                    <Link href="/admin-profile/new-event" className="hover:text-indigo-600 dark:hover:text-indigo-300 transition">New Event</Link>
                    <Link href="/admin-profile/organized-events" className="hover:text-indigo-600 dark:hover:text-indigo-300 transition">Organized Events</Link>
                  </>
                ) : (
                  <>
                    <Link href="/events" className="hover:text-indigo-600 dark:hover:text-indigo-300 transition">Events</Link>
                    <Link href="/student-profile/registered-events" className="hover:text-indigo-600 dark:hover:text-indigo-300 transition">Registered Events</Link>
                  </>
                )}

                {/* Avatar Dropdown */}
                <div className="relative group" tabIndex={0} onBlur={() => setDropdownOpen(false)}>
                  <button
                    className="flex items-center gap-2 focus:outline-none"
                    onClick={() => setDropdownOpen((open) => !open)}
                    tabIndex={0}
                  >
                    {session.user?.image ? (
                      <Image src={session.user.image} alt="User Avatar" width={32} height={32} className="rounded-full border border-indigo-300 shadow-sm" />
                    ) : (
                      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold border border-indigo-300">
                        {session.user?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                    <span className="text-zinc-700 dark:text-zinc-200 font-medium">
                      {session.user?.name || 'User'}
                    </span>
                  </button>
                  {/* Dropdown */}
                  <div className={`absolute right-0 mt-2 w-44 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 py-2 z-50 transition-opacity duration-150 ${dropdownOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                    <Link
                      href={session?.user?.email?.endsWith('@admin.com') ? "/admin-profile/account-details" : "/student-profile/account-details"}
                      className="block px-5 py-2 text-zinc-800 dark:text-zinc-100 hover:bg-indigo-50 dark:hover:bg-indigo-800 rounded-xl transition"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => { setDropdownOpen(false); signOut(); }}
                      className="w-full text-left px-5 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-xl transition"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <AuthSliderNav />
            </>
          )}
          <Switch />
        </nav>
      </div>
    </header>
  );
}
