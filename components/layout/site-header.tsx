import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { AccessibleButton } from '../ui/accessible-button';
import { Icons } from '../icons';
import { UserNav } from './user-nav';
import { MobileNav } from './mobile-nav';
import { ThemeToggle } from '../theme-toggle';

interface NavItem {
  title: string;
  href: string;
  external?: boolean;
  roles?: string[];
}

const mainNav: NavItem[] = [
  {
    title: 'Events',
    href: '/events',
  },
  {
    title: 'About',
    href: '/about',
  },
  {
    title: 'Contact',
    href: '/contact',
  },
];

const authNav: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    roles: ['USER', 'ORGANIZER', 'ADMIN', 'SUPER_ADMIN'],
  },
  {
    title: 'Admin',
    href: '/admin',
    roles: ['ADMIN', 'SUPER_ADMIN'],
  },
];

export function SiteHeader({ 
  isMenuOpen, 
  onMenuToggle 
}: { 
  isMenuOpen: boolean; 
  onMenuToggle: () => void 
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isAuthenticated = status === 'authenticated';
  const userRole = session?.user?.role;

  // Filter navigation items based on user role
  const filteredMainNav = mainNav.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(userRole);
  });

  const filteredAuthNav = authNav.filter(item => {
    if (!item.roles) return true;
    return item.roles.some(role => userRole === role);
  });

  return (
    <header className={cn(
      'sticky top-0 z-40 w-full border-b',
      'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
      'transition-all duration-200'
    )}>
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center
         gap-6 md:gap-10">
          <Link 
            href="/" 
            className="flex items-center space-x-2"
            aria-label="CampusHub Home"
          >
            <Icons.logo className="h-6 w-6" />
            <span className="inline-block font-bold">CampusHub</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6">
            {filteredMainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center text-sm font-medium transition-colors hover:text-primary',
                  'relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all',
                  'hover:after:w-full',
                  pathname === item.href ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {item.title}
              </Link>
            ))}
            
            {isAuthenticated && filteredAuthNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center text-sm font-medium transition-colors hover:text-primary',
                  'relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all',
                  'hover:after:w-full',
                  pathname.startsWith(item.href) ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          
          {/* Mobile Menu Button */}
          <AccessibleButton
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuToggle}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <Icons.close className="h-5 w-5" />
            ) : (
              <Icons.menu className="h-5 w-5" />
            )}
          </AccessibleButton>

          {/* User Actions */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <UserNav user={session.user} />
            ) : (
              <>
                <AccessibleButton 
                  asChild 
                  variant="outline" 
                  size="sm"
                >
                  <Link href="/login">Sign in</Link>
                </AccessibleButton>
                <AccessibleButton asChild size="sm">
                  <Link href="/register">Sign up</Link>
                </AccessibleButton>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNav 
        isOpen={isMenuOpen} 
        mainNav={filteredMainNav} 
        authNav={isAuthenticated ? filteredAuthNav : []} 
        isAuthenticated={isAuthenticated}
        onClose={() => onMenuToggle()}
      />
    </header>
  );
}
