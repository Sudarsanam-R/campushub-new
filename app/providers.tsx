'use client'

import React from 'react';
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'react-hot-toast'
import Aurora from '@/components/Aurora'
import ThemeWrapper from '@/components/ThemeWrapper';
import CookieConsentDialog from '@/components/CookieConsentDialog'

export function Providers({ children, initialTheme }: { children: React.ReactNode, initialTheme?: string }) {
  // Sync theme to cookie globally
  if (typeof window !== 'undefined') {
    // Use next-themes hook
    const { theme } = require('next-themes').useTheme();
    React.useEffect(() => {
      if (theme === 'light' || theme === 'dark') {
        document.cookie = `theme=${theme}; path=/; max-age=31536000`; // 1 year
      }
    }, [theme]);
  }
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme={initialTheme || "system"} enableSystem>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
              borderRadius: '8px',
              fontSize: '14px',
            },
          }}
        />
        <Aurora />
        <ThemeWrapper initialTheme={initialTheme}>
          {children}
          <CookieConsentDialog />
        </ThemeWrapper>
      </ThemeProvider>
    </SessionProvider>
  )
}
