import React from "react";
import Image from "next/image";

/**
 * ThemeLogo renders the CampusHub logo and automatically switches between logo-light.svg and logo-dark.svg based on theme.
 */
export default function ThemeLogo({ className = "", ...props }: { className?: string; [key: string]: any }) {
  return (
    <>
      {/* Light theme logo */}
      <Image
        src="/logo-light.svg"
        alt="CampusHub Logo"
        width={36}
        height={36}
        className={`block dark:hidden transition-all duration-300 drop-shadow-md ${className}`}
        priority
        {...props}
      />
      {/* Dark theme logo */}
      <Image
        src="/logo-dark.svg"
        alt="CampusHub Logo"
        width={36}
        height={36}
        className={`hidden dark:block transition-all duration-300 drop-shadow-md ${className}`}
        priority
        {...props}
      />
    </>
  );
}
