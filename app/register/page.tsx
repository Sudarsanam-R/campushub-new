'use client'

import React, { useState } from 'react'
import RequireAuth from '@/components/RequireAuth'
import Switch from "@/components/Switch";
import Image from "next/image";

export default function RegisterPage() {
  const [showContent, setShowContent] = React.useState(false);

  const [formData, setFormData] = useState({ name: '', email: '', phone: '' })

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Registration is now instant, no OTP required
    // ... your registration logic here ...
    alert('Registration successful! You can now log in.')
  }

  React.useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 1500);
    return () => clearTimeout(timer);
  }, []);
  if (!showContent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-indigo-200 dark:from-zinc-950 dark:via-zinc-900 dark:to-indigo-950 transition-colors duration-300">
        <div className="flex flex-col items-center gap-6 p-8 rounded-3xl shadow-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg border border-zinc-200 dark:border-zinc-800">
          <Image
            src="/spinner-double.svg"
            alt="Loading Spinner"
            width={64}
            height={64}
            className="animate-spin-slow drop-shadow-lg"
            priority
          />
          <span className="text-xl font-semibold text-zinc-700 dark:text-zinc-200 tracking-tight select-none">
            Loading, please wait...
          </span>
        </div>
      </div>
    );
  }

  return (
    <RequireAuth>
      <main className="min-h-screen flex items-center justify-center">
        <div className="p-6 max-w-md w-full bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white">
          <h1 className="text-2xl font-bold mb-4">Register for an Event</h1>

          <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 pr-12 text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoComplete="name"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 pr-12 text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoComplete="email"
              required
            />
            <input
              type="tel"
              placeholder="Phone"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 pr-12 text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoComplete="tel"
              required
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded hover:bg-indigo-700 transition"
            >
              Register
            </button>
          </form>
        </div>
      </main>
    </RequireAuth>
  )
}
