"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import ClickSpark from "@/components/ClickSpark";
import Switch from "@/components/Switch";
import { useTheme } from "next-themes";
import { Eye, EyeOff, Check } from "lucide-react";
import PasswordCaret from "@/components/PasswordCaret";
import CustomCursor from "@/components/CustomCursor";
import RequireAuth from "@/components/RequireAuth";

const MIN_PASSWORD_LENGTH = 8;

const validatePassword = (password: string) => {
  return (
    password.length >= MIN_PASSWORD_LENGTH &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
};


export default function ResetPasswordPage() {
  // All hooks must be declared at the top, before any conditional returns
  const [showContent, setShowContent] = React.useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const confirmPasswordInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  React.useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!showContent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-indigo-200 dark:from-zinc-950 dark:via-zinc-900 dark:to-indigo-950 transition-colors duration-300">
        <div className="flex flex-col items-center gap-6 p-8 rounded-3xl shadow-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg border border-zinc-200 dark:border-zinc-800">
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

  const togglePasswordVisibility = () => setPasswordVisible((prev) => !prev);
  const toggleConfirmPasswordVisibility = () => setConfirmPasswordVisible((prev) => !prev);
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !email) {
      toast.error("Invalid or expired reset link.");
      return;
    }
    if (!validatePassword(password)) {
      toast.error("Password does not meet requirements.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password })
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Reset failed");
        setLoading(false);
        return;
      }
      toast.success("Password reset successful! Redirecting to login...");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;
  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white">
        <div className="p-8 rounded-xl shadow bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700">
          <h1 className="text-2xl font-bold mb-4">Invalid or Expired Link</h1>
          <p className="mb-2">The password reset link is invalid or has expired.</p>
          <a href="/forgot-password" className="text-indigo-600 hover:underline">Request a new reset link</a>
        </div>
      </div>
    );
  }

  return (
    <RequireAuth>
      <CustomCursor />
      <ClickSpark />
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white transition relative overflow-hidden">
        <div className="absolute top-4 right-4 flex gap-3 z-30">
          <Switch />
        </div>
        <div className="relative w-[98vw] max-w-xs sm:max-w-sm md:max-w-md rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-[0_0_30px_rgba(99,102,241,0.4)] dark:shadow-[0_0_30px_rgba(99,102,241,0.3)] p-6">
          <h1 className="text-3xl font-bold mb-6 text-center text-black dark:text-white">
            Reset Password
          </h1>
          <form onSubmit={handleReset} className="flex flex-col gap-4">
            <div className="relative">
              <div className="relative">
                <input
                  ref={passwordInputRef}
                  type={passwordVisible ? "text" : "password"}
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 caret-transparent"
                  
                  required
                />
                {!passwordVisible && (
                  <PasswordCaret
                    caretIndex={passwordInputRef.current?.selectionStart ?? password.length}
                    fillPercent={Math.min(password.length, MIN_PASSWORD_LENGTH) / MIN_PASSWORD_LENGTH}
                    minLength={MIN_PASSWORD_LENGTH}
                  />
                )}
                
              </div>
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                title={passwordVisible ? "Hide Password" : "Show Password"}
              >
                {passwordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {validatePassword(password) && (
                <Check className="absolute right-24 top-1/2 -translate-y-1/2 text-green-500" size={20} />
              )}
            </div>
            <div className="relative">
              <input
                ref={confirmPasswordInputRef}
                type={confirmPasswordVisible ? "text" : "password"}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 pr-16 text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 caret-transparent"
                
                required
              />
              
              {!confirmPasswordVisible && (
                <PasswordCaret
                  caretIndex={confirmPasswordInputRef.current?.selectionStart ?? confirmPassword.length}
                  fillPercent={Math.min(confirmPassword.length, MIN_PASSWORD_LENGTH) / MIN_PASSWORD_LENGTH}
                  minLength={MIN_PASSWORD_LENGTH}
                />
              )}
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                title={confirmPasswordVisible ? "Hide Password" : "Show Password"}
              >
                {confirmPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {password && confirmPassword && password === confirmPassword && (
                <Check className="absolute right-24 top-1/2 -translate-y-1/2 text-green-500" size={20} />
              )}
            </div>
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-full bg-indigo-600 hover:bg-indigo-700 transition text-white font-semibold overflow-hidden relative mt-2"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </main>
    </RequireAuth>
  );
}
