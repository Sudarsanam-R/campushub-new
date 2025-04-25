import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from './providers' // ✅ use this one only

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'CampusHub',
  description: 'Discover college events and hackathons',
}

import { cookies } from 'next/headers'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

