"use client";
import React, { useEffect, useState, createContext, useContext } from "react";
import { setThemeCookie } from "@/utils/setThemeCookie";

type Theme = "dark" | "light";
type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeContext must be used within ThemeWrapper");
  return ctx;
}

interface ThemeWrapperProps {
  children: React.ReactNode;
  initialTheme?: string;
}

export default function ThemeWrapper({ children, initialTheme }: ThemeWrapperProps) {
  // Use SSR theme as source of truth initially
  const getSystemTheme = (): Theme => {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "light";
};

const [theme, setThemeState] = useState<Theme>(() => {
  if (initialTheme === "dark" || initialTheme === "light") return initialTheme;
  // No cookie/SSR theme: use system
  if (typeof window !== "undefined") {
    return getSystemTheme();
  }
  return "light";
});

useEffect(() => {
  // If no SSR theme, set theme to system on mount
  if (!initialTheme) {
    const systemTheme = getSystemTheme();
    setThemeState(systemTheme);
    setThemeCookie(systemTheme);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

useEffect(() => {
  // Sync <html> class with theme
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
  setThemeCookie(theme);
}, [theme]);

// Theme toggle function
const setTheme = (newTheme: Theme) => setThemeState(newTheme);

return (
  <ThemeContext.Provider value={{ theme, setTheme }}>
    {children}
  </ThemeContext.Provider>
);
}
