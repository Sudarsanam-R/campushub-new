import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { AccessibleButton } from '../ui/accessible-button';
import { ThemeToggle } from '../theme-toggle';
import { Icons } from '../icons';
import { UserNav } from './user-nav';
import { useSession } from 'next-auth/react';

interface MobileNavProps {
  isOpen: boolean;
  mainNav: Array<{ title: string; href: string }>;
  authNav: Array<{ title: string; href: string }>;
  isAuthenticated: boolean;
  onClose: () => void;
}

export function MobileNav({
  isOpen,
  mainNav,
  authNav,
  isAuthenticated,
  onClose,
}: MobileNavProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isMounted, setIsMounted] = React.useState(false);

  // Prevent hydration mismatch
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Close menu when route changes
  React.useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [pathname]);

  if (!isMounted) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 top-16 z-50 md:hidden',
        'bg-background/95 backdrop-blur-sm',
        'transition-all duration-200 ease-in-out',
        isOpen ? 'opacity-100 visible' : 'opacity-0 invisible',
        'overflow-y-auto'
      )}
      aria-hidden={!isOpen}
    >
      <div className="container px-4 py-6 space-y-8">
        {/* Main Navigation */}
        <nav className="space-y-4">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'block py-2 text-lg font-medium transition-colors',
                'border-l-4 pl-4',
                pathname === item.href
                  ? 'text-primary border-primary'
                  : 'text-muted-foreground border-transparent hover:border-muted-foreground/30',
                'hover:text-foreground'
              )}
              onClick={onClose}
            >
              {item.title}
            </Link>
          ))}
          
          {isAuthenticated && authNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'block py-2 text-lg font-medium transition-colors',
                'border-l-4 pl-4',
                pathname.startsWith(item.href)
                  ? 'text-primary border-primary'
                  : 'text-muted-foreground border-transparent hover:border-muted-foreground/30',
                'hover:text-foreground'
              )}
              onClick={onClose}
            >
              {item.title}
            </Link>
          ))}
        </nav>

        {/* Theme Toggle */}
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-sm font-medium">Theme</span>
          <ThemeToggle />
        </div>

        {/* Auth Buttons */}
        {!isAuthenticated ? (
          <div className="space-y-3 pt-4 border-t">
            <AccessibleButton 
              asChild 
              variant="outline" 
              className="w-full"
              size="lg"
            >
              <Link href="/login">Sign in</Link>
            </AccessibleButton>
            <AccessibleButton 
              asChild 
              className="w-full"
              size="lg"
            >
              <Link href="/register">Sign up</Link>
            </AccessibleButton>
          </div>
        ) : (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <Icons.user className="h-10 w-10 rounded-full bg-muted p-2" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {session?.user?.name || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {session?.user?.email}
                  </p>
                </div>
              </div>
              <UserNav user={session?.user} variant="icon" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
