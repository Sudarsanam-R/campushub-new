import Link from "next/link";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

/**
 * Animated slider navigation for Login/Signup in header.
 * Blue pill slides between buttons on hover/active.
 */
export default function AuthSliderNav() {
  const [hovered, setHovered] = useState<null | "login" | "signup">(null);
  const pathname = usePathname();

  // Determine active tab based on current route
  const active = pathname === "/login" ? "login" : pathname === "/signup" ? "signup" : "signup";

  // Positioning logic
  const sliderLeft = hovered === "login"
    ? 0
    : hovered === "signup"
    ? 104 // width of one button + gap
    : active === "login"
    ? 0
    : 104;

  return (
    <div className="relative flex gap-2 w-[208px] h-10">
      {/* Blue slider */}
      <div
        className="absolute top-0 left-0 h-10 w-[100px] rounded-full bg-indigo-600 transition-all duration-300 z-0"
        style={{ left: sliderLeft }}
        aria-hidden
      />
      {/* Login Button */}
      <Link
        href="/login"
        className={`relative z-10 w-[100px] h-10 flex items-center justify-center font-semibold transition-colors duration-200 rounded-full ${
          (hovered === "login" || (hovered === null && active === "login"))
            ? "text-white"
            : "text-indigo-600"
        }`}
        onMouseEnter={() => setHovered("login")}
        onMouseLeave={() => setHovered(null)}
      >
        Login
      </Link>
      {/* Signup Button */}
      <Link
        href="/signup"
        className={`relative z-10 w-[100px] h-10 flex items-center justify-center font-semibold transition-colors duration-200 rounded-full ${
          (hovered === "signup" || (hovered === null && active === "signup"))
            ? "text-white"
            : "text-indigo-600"
        }`}
        onMouseEnter={() => setHovered("signup")}
        onMouseLeave={() => setHovered(null)}
      >
        Signup
      </Link>
    </div>
  );
}
