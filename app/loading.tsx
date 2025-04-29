import React from "react";
import Image from "next/image";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-indigo-200 dark:from-zinc-950 dark:via-zinc-900 dark:to-indigo-950 transition-colors duration-300">
      <div className="flex flex-col items-center gap-6 p-8 rounded-2xl shadow-[0_0_24px_3px_rgba(99,102,241,0.28)] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-[3px] border border-zinc-200 dark:border-zinc-800">
        <Image
          src="/spinner-double.svg"
          alt="Loading Spinner"
          width={64}
          height={64}
          className="animate-spin-slow drop-shadow-lg"
          priority
        />
        <span className="text-xl font-semibold text-zinc-700 dark:text-zinc-200 tracking-tight select-none">
          Loading, please wait...
        </span>
      </div>
    </div>
  );
}
