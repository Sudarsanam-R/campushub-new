import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from './providers' // ✅ use this one only
import * as Sentry from '@sentry/nextjs';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'CampusHub',
  description: 'Discover college events and hackathons',
}

import { cookies } from 'next/headers'
import Head from 'next/head';

// Error Boundary Component
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const fallback = ({ error, componentStack, resetError }: { 
    error: unknown; 
    componentStack: string; 
    resetError: () => void 
  }) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong!</h2>
        <p className="mb-2">Error: {errorMessage}</p>
        <details className="mb-4">
          <summary>Error details</summary>
          <pre className="bg-gray-100 p-2 rounded overflow-auto text-sm">
            {componentStack}
          </pre>
        </details>
        <button
          onClick={resetError}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try again
        </button>
      </div>
    );
  };

  return (
    <Sentry.ErrorBoundary fallback={fallback}>
      {children}
    </Sentry.ErrorBoundary>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      <body className={inter.className}>
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}

