"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import ClickSpark from "@/components/ReactBits/ClickSpark";
import Switch from "@/components/custom_ui/Switch";
import { useTheme } from "next-themes";
import { Eye, EyeOff, Check } from "lucide-react";
import PasswordCaret from "@/components/custom_ui/PasswordCaret";
import CustomCursor from "@/components/custom_ui/CustomCursor";
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
  // Step-based state
  const [step, setStep] = useState(1); // 1: email, 2: security Q, 3: reset
  const [email, setEmail] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswerInput, setSecurityAnswerInput] = useState("");
  const [securityAnswerError, setSecurityAnswerError] = useState("");
  const [fetchingQuestion, setFetchingQuestion] = useState(false);
  const [verifyingAnswer, setVerifyingAnswer] = useState(false);

  // ...existing state/hooks

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
  // const email = searchParams.get("email"); // Removed to avoid redeclaration error; using email state variable instead.

  React.useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Step 1: Enter Email
  const handleFetchQuestion = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFetchingQuestion(true);
    setSecurityAnswerError("");
    try {
      const res = await fetch(`/api/get-security-question?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (res.ok && data.security_question) {
        setSecurityQuestion(data.security_question);
        setStep(2);
      } else {
        setSecurityAnswerError(data.error || "Could not fetch security question");
      }
    } catch (err) {
      setSecurityAnswerError("Server error. Try again.");
    } finally {
      setFetchingQuestion(false);
    }
  };

  // Step 2: Verify Answer
  const handleVerifyAnswer = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setVerifyingAnswer(true);
    setSecurityAnswerError("");
    try {
      const res = await fetch('/api/verify-security-answer/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, security_answer: securityAnswerInput }),
      });
      const data = await res.json();
      if (data.success) {
        setStep(3);
      } else {
        setSecurityAnswerError(data.error || "Incorrect answer");
      }
    } catch (err) {
      setSecurityAnswerError("Server error. Try again.");
    } finally {
      setVerifyingAnswer(false);
    }
  };

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

  return (
    <>
      <CustomCursor />
      <ClickSpark />
      <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-indigo-200 dark:from-zinc-950 dark:via-zinc-900 dark:to-indigo-950 transition-colors duration-300">
        <div className="relative w-[98vw] max-w-xs sm:max-w-sm md:max-w-md rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-[0_0_30px_rgba(99,102,241,0.4)] dark:shadow-[0_0_30px_rgba(99,102,241,0.3)] p-6">
          <h1 className="text-3xl font-bold mb-6 text-center text-black dark:text-white">
            Reset Password
          </h1>
          {step === 1 && (
            <form onSubmit={handleFetchQuestion} className="flex flex-col gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 pr-12 text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              {securityAnswerError && <span className="text-red-500 text-sm">{securityAnswerError}</span>}
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-full bg-indigo-600 hover:bg-indigo-700 transition text-white font-semibold overflow-hidden relative mt-2"
                disabled={fetchingQuestion}
              >
                {fetchingQuestion ? "Checking..." : "Next"}
              </button>
            </form>
          )}
          {step === 2 && (
            <form onSubmit={handleVerifyAnswer} className="flex flex-col gap-4">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                {securityQuestion}
              </label>
              <input
                type="text"
                placeholder="Your Answer"
                value={securityAnswerInput}
                onChange={e => setSecurityAnswerInput(e.target.value)}
                className="w-full px-4 py-3 pr-12 text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              {securityAnswerError && <span className="text-red-500 text-sm">{securityAnswerError}</span>}
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-full bg-indigo-600 hover:bg-indigo-700 transition text-white font-semibold overflow-hidden relative mt-2"
                disabled={verifyingAnswer}
              >
                {verifyingAnswer ? "Verifying..." : "Next"}
              </button>
            </form>
          )}
          {step === 3 && (
            <form onSubmit={handleReset} className="flex flex-col gap-4">
              <div className="relative">
                <div className="relative">
                  <input
                    ref={passwordInputRef}
                    type={passwordVisible ? "text" : "password"}
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="w-full px-4 py-3 pr-16 text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
          )}
        </div>
      </main>
    </>
  );
}
