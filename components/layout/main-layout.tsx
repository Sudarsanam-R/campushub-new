import * as React from 'react';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { MainNav } from './main-nav';
import { SiteFooter } from './site-footer';
import { SiteHeader } from './site-header';
import { LoadingSpinner } from '../ui/loading-spinner';
import { SkipToContent } from './skip-to-content';
import { useLockBodyScroll } from '@/hooks/use-lock-body-scroll';

export interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  hideHeader?: boolean;
  hideFooter?: boolean;
  fullWidth?: boolean;
  withContainer?: boolean;
  loading?: boolean;
  requireAuth?: boolean;
  roles?: string[];
}

export function MainLayout({
  children,
  title = 'CampusHub',
  description = 'Your campus event management platform',
  className,
  hideHeader = false,
  hideFooter = false,
  fullWidth = false,
  withContainer = true,
  loading = false,
  requireAuth = false,
  roles = [],
}: MainLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  
  // Lock body scroll when mobile menu is open
  useLockBodyScroll(isMenuOpen);

  // Handle authentication and authorization
  React.useEffect(() => {
    if (status === 'loading') return;
    
    if (requireAuth && status === 'unauthenticated') {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (requireAuth && status === 'authenticated' && roles.length > 0) {
      const hasRequiredRole = roles.some(role => session?.user?.role === role);
      if (!hasRequiredRole) {
        router.push('/unauthorized');
      }
    }
  }, [status, requireAuth, roles, router, session?.user?.role]);

  // Show loading state
  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={cn(
      'flex min-h-screen flex-col',
      'bg-background text-foreground',
      'transition-colors duration-200',
      className
    )}>
      <Head>
        <title>{`${title} | CampusHub`}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <SkipToContent />

      {!hideHeader && (
        <SiteHeader 
          isMenuOpen={isMenuOpen} 
          onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} 
        />
      )}

      <main 
        id="main-content"
        className={cn(
          'flex-1 flex flex-col',
          'pt-16 md:pt-20', // Account for fixed header
          {
            'container mx-auto px-4 sm:px-6 lg:px-8': !fullWidth && withContainer,
            'w-full': fullWidth,
          }
        )}
      >
        {children}
      </main>

      {!hideFooter && <SiteFooter />}
    </div>
  );
}

// Layout variants for different page types
export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <MainLayout 
    hideHeader 
    hideFooter 
    className="bg-gradient-to-br from-background to-muted/20"
    withContainer={false}
  >
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md mx-auto">
        {children}
      </div>
    </div>
  </MainLayout>
);

export const DashboardLayout: React.FC<{ 
  children: React.ReactNode;
  title?: string;
  description?: string;
}> = ({ children, title, description }) => (
  <MainLayout 
    title={title}
    description={description}
    className="bg-muted/20"
    requireAuth
  >
    <div className="flex flex-col md:flex-row gap-6 py-6">
      <div className="md:w-64 flex-shrink-0">
        <MainNav />
      </div>
      <div className="flex-1">
        <div className="bg-background rounded-lg shadow-sm border p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  </MainLayout>
);

export const PublicLayout: React.FC<{ 
  children: React.ReactNode;
  title?: string;
  description?: string;
  fullWidth?: boolean;
}> = ({ children, title, description, fullWidth }) => (
  <MainLayout 
    title={title}
    description={description}
    fullWidth={fullWidth}
  >
    {children}
  </MainLayout>
);
