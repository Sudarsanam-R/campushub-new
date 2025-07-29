'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';
import { useEffect } from 'react';
import { useTheme } from 'next-themes';

// Custom hook to handle system theme changes
export function useThemeWatcher() {
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };

    // Set initial theme based on system preference
    if (resolvedTheme === 'system') {
      setTheme(mediaQuery.matches ? 'dark' : 'light');
    }

    // Listen for system theme changes
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [resolvedTheme, setTheme]);

  return null;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      <ThemeWatcher />
      {children}
    </NextThemesProvider>
  );
}

// Component that uses the theme watcher hook
function ThemeWatcher() {
  useThemeWatcher();
  return null;
}
