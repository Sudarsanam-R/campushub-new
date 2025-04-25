'use client'

import React from 'react';
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'react-hot-toast'
import Aurora from '@/components/Aurora'
import CookieConsentDialog from '@/components/CookieConsentDialog'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
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
        {children}
        <CookieConsentDialog />
      </ThemeProvider>
    </SessionProvider>
  );
}
