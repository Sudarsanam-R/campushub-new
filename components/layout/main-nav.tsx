import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Icons } from '../icons';

interface NavItem {
  title: string;
  href: string;
  icon?: keyof typeof Icons;
  roles?: string[];
  children?: NavItem[];
}

export function MainNav() {
  const pathname = usePathname();
  
  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: 'dashboard',
    },
    {
      title: 'Events',
      href: '/dashboard/events',
      icon: 'calendar',
      children: [
        {
          title: 'All Events',
          href: '/dashboard/events',
        },
        {
          title: 'Create Event',
          href: '/dashboard/events/new',
          roles: ['ORGANIZER', 'ADMIN', 'SUPER_ADMIN'],
        },
        {
          title: 'My Events',
          href: '/dashboard/events/my-events',
        },
      ],
    },
    {
      title: 'Registrations',
      href: '/dashboard/registrations',
      icon: 'ticket',
    },
    {
      title: 'Profile',
      href: '/dashboard/profile',
      icon: 'user',
    },
    {
      title: 'Admin',
      href: '/admin',
      icon: 'settings',
      roles: ['ADMIN', 'SUPER_ADMIN'],
      children: [
        {
          title: 'Overview',
          href: '/admin',
        },
        {
          title: 'Users',
          href: '/admin/users',
        },
        {
          title: 'Events',
          href: '/admin/events',
        },
        {
          title: 'Categories',
          href: '/admin/categories',
        },
        {
          title: 'Analytics',
          href: '/admin/analytics',
        },
      ],
    },
  ];

  const renderNavItem = (item: NavItem, level = 0) => {
    const isActive = pathname === item.href || 
                    (item.href !== '/' && pathname.startsWith(item.href));
    const Icon = item.icon ? Icons[item.icon] : null;
    const hasChildren = item.children && item.children.length > 0;
    
    return (
      <div key={item.href} className="space-y-1">
        <Link
          href={item.href}
          className={cn(
            'group flex items-center rounded-md px-3 py-2 text-sm font-medium',
            'transition-colors',
            level === 0 ? 'text-sm font-medium' : 'text-sm',
            isActive
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground',
            'justify-between',
            {
              'pl-6': level > 0,
              'font-semibold': level === 0,
            }
          )}
        >
          <div className="flex items-center">
            {Icon && (
              <Icon
                className={cn(
                  'mr-3 h-4 w-4 flex-shrink-0',
                  isActive ? 'text-primary' : 'text-muted-foreground/70',
                  'transition-colors'
                )}
                aria-hidden="true"
              />
            )}
            <span>{item.title}</span>
          </div>
          {hasChildren && (
            <Icons.chevronDown
              className={cn(
                'ml-auto h-4 w-4 transition-transform',
                isActive && pathname.startsWith(item.href) ? 'rotate-180' : ''
              )}
              aria-hidden="true"
            />
          )}
        </Link>
        
        {hasChildren && pathname.startsWith(item.href) && (
          <div className="mt-1 space-y-1 pl-4 border-l border-border/50">
            {item.children?.map((child) => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className="flex flex-1 flex-col space-y-1 px-2" aria-label="Sidebar">
      {navItems.map((item) => renderNavItem(item))}
    </nav>
  );
}
