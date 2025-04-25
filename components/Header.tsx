'use client'

import { signOut, useSession } from 'next-auth/react'
import ThemeToggle from './ThemeToggle'
import Link from 'next/link'
import Image from 'next/image'
import Switch from './Switch'
import ThemeLogo from './ThemeLogo'
import AuthSliderNav from './AuthSliderNav'

export default function Header() {
  const { data: session, status } = useSession()

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
              <div className="flex items-center gap-3">
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt="User Avatar"
                    width={32}
                    height={32}
                    className="rounded-full border border-indigo-300 shadow-sm"
                  />
                ) : (
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold border border-indigo-300">
                    {session.user?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <span className="text-zinc-700 dark:text-zinc-200 font-medium">
                  {session.user?.name || 'User'}
                </span>
                <button
                  onClick={() => signOut()}
                  className="ml-2 px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-500 transition font-semibold shadow"
                  style={{
                    color: "#4f46e5",
                    textShadow: "none",
                  }}
                >
                  Logout
                </button>
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
  )
}
