import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from './providers' // ✅ use this one only

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'CampusHub',
  description: 'Discover college events and hackathons',
}

import { cookies } from 'next/headers'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // SSR: Read theme cookie
  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value;
  const htmlClass = theme === 'dark' ? 'dark' : '';
  return (
    <html lang="en" className={htmlClass}>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

