'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    console.log('RequireAuth session:', session);
    console.log('RequireAuth status:', status);
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (
      status === 'authenticated' &&
      session?.user?.isFirstLogin &&
      typeof window !== 'undefined' &&
      window.location.pathname !== '/new-user-details'
    ) {
      router.replace('/new-user-details');
    }
  }, [status, session, router]);

  if (status === 'loading') return null;

  return <>{children}</>;
}

