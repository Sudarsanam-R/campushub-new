"use client";
import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Switch from "@/components/custom_ui/Switch";
import CustomCursor from "@/components/custom_ui/CustomCursor";
import ClickSpark from "@/components/ReactBits/ClickSpark";
import Link from "next/link";
import FuzzyText from "@/components/ReactBits/FuzzyText";


export default function NotFoundPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <>
      <CustomCursor />
      <ClickSpark />
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white transition relative overflow-hidden">
        <div className="absolute top-4 right-4">
          <button
            className="" style={{display:'flex',justifyContent:'flex-end'}}>
            <Switch />
          </button>
        </div>
        <div className="relative w-[98vw] max-w-xs sm:max-w-sm md:max-w-md rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-[0_0_30px_rgba(99,102,241,0.4)] dark:shadow-[0_0_30px_rgba(99,102,241,0.3)] p-6 flex flex-col items-center">
          <div className="mb-6">
            <FuzzyText fontSize="clamp(3rem, 10vw, 7rem)" fontWeight={900} color="#6366f1"
              baseIntensity={0.2} 
              hoverIntensity={0.4} 
              enableHover={true}>
              404
            </FuzzyText>
          </div>
          <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-200 mb-4 text-center">
            Oops! This page is lost in the nap zone.
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-8 text-center">
            The page you’re looking for doesn’t exist or is still snoozing. Try heading back home and waking up some awesome events!
          </p>
          <Link href="/" className="w-full py-3 px-4 rounded-full bg-indigo-600 hover:bg-indigo-700 transition text-white font-semibold text-center">
            Go Back Home
          </Link>
        </div>
      </main>
    </>
  );
}
