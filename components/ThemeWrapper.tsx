"use client";
import React, { useEffect } from "react";

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.add("dark");
    // If you want to support toggling, you can add logic here
  }, []);

  return <>{children}</>;
}
