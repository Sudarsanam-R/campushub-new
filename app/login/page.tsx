'use client'

import React, { useState, useEffect, useRef } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Check, Sun, Moon, Eye, EyeOff } from 'lucide-react'
import PasswordCaret from '@/components/custom_ui/PasswordCaret'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import ClickSpark from '@/components/ReactBits/ClickSpark'
import Switch from "@/components/custom_ui/Switch";
import ShinyText from '@/components/ReactBits/ShinyText'
// ShinyText will use className={theme === 'dark' ? '' : 'shinyLight'} for visibility in light mode
import TurnstileWidget from '@/components/TurnstileWidget'

const MIN_PASSWORD_LENGTH = 8;

const validatePassword = (password: string) => {
  return (
    password.length >= MIN_PASSWORD_LENGTH &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

// Helper functions for cookies
function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}
function getCookie(name: string) {
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=');
    return parts[0] === name ? decodeURIComponent(parts[1]) : r
  }, '');
}
function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export default function LoginPage() {
  const [showContent, setShowContent] = React.useState(false);
  const [captchaToken, setCaptchaToken] = React.useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [passwordVisible, setPasswordVisible] = useState(false)

  const emailInputRef = useRef<HTMLInputElement>(null)
  const passwordInputRef = useRef<HTMLInputElement>(null)

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  useEffect(() => {

    // On mount, check for campushub_email cookie
    const savedEmail = getCookie('campushub_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
    setMounted(true)
  }, [])

  

  const togglePasswordVisibility = () => {
    setPasswordVisible(prev => !prev);
    // Focus the password input after toggling visibility for better keyboard navigation
    setTimeout(() => {
      passwordInputRef.current?.focus();
    }, 0);
  }
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    // Provide feedback for screen readers
    const message = `Switched to ${newTheme} mode`;
    const liveRegion = document.getElementById('a11y-live-region');
    if (liveRegion) {
      liveRegion.textContent = message;
      // Clear the message after a delay
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 2000);
    }
  }

  useEffect(() => {
    const cursor = document.createElement('div')
    cursor.classList.add('custom-cursor')
    document.body.appendChild(cursor)

    const move = (e: MouseEvent) => {
      cursor.style.display = ''
      cursor.style.left = `${e.clientX}px`
      cursor.style.top = `${e.clientY}px`
    }

    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      const clickable = t.closest('button, a, input[type="checkbox"], label, [role="button"], .clickable')
      cursor.classList.toggle('cursor-hover', !!clickable)
      document.body.style.cursor = 'none'
    }

    document.addEventListener('mousemove', move)
    document.addEventListener('mouseover', over)
    
    // Hide cursor when leaving window
    const hideCursor = () => {
      cursor.style.display = 'none'
      cursor.style.left = '-9999px'
      cursor.style.top = '-9999px'
      document.body.style.cursor = ''
    }
    const showCursor = () => {
      cursor.style.display = ''
      document.body.style.cursor = 'none'
    }
    window.addEventListener('mouseleave', hideCursor)
    window.addEventListener('mouseenter', showCursor)
    document.addEventListener('mouseout', (e) => {
      if (!e.relatedTarget || (e.relatedTarget as HTMLElement).nodeName === 'HTML') {
        hideCursor()
      }
    })

    return () => {
      document.removeEventListener('mousemove', move)
      document.removeEventListener('mouseover', over)
      window.removeEventListener('mouseleave', hideCursor)
      window.removeEventListener('mouseenter', showCursor)
      cursor.remove()
    }
  }, [])

  if (!mounted) return null

  return (
    <>
      <ClickSpark />
      <style>{`
        .custom-cursor {
          position: fixed;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          mix-blend-mode: difference;
          background-color: white;
          transform: translate(-50%, -50%);
          transition: width 0.2s ease, height 0.2s ease;
        }
        .custom-cursor.cursor-hover {
          width: 25px;
          height: 25px;
        }
      `}</style>

      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white transition relative overflow-hidden">

        {mounted && (
          <div className="absolute top-4 right-4 flex gap-3 z-30">
            <Switch />
          </div>
        )}

        
          <div className="relative w-[98vw] max-w-xs sm:max-w-sm md:max-w-md rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-[0_0_30px_rgba(99,102,241,0.4)] dark:shadow-[0_0_30px_rgba(99,102,241,0.3)] p-6">
            <h1 className="text-2xl font-bold mb-2 text-center">
              Login to CampusHub
            </h1>
            <p className="text-center text-sm text-zinc-600 dark:text-zinc-400 mb-6">
              Don't have an account? <a href="/signup" className="text-indigo-600 hover:underline cursor-pointer">Sign up</a>
            </p>

            <div className="space-y-4">
              {/* Email */}
              <div className="relative">
                <div className="flex items-center justify-between">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Email address
                    <span className="text-red-500">*</span>
                    <span className="sr-only">Required</span>
                  </label>
                </div>
                <div className="mt-1 relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    aria-required="true"
                    aria-invalid={!isEmailValid && email ? 'true' : 'false'}
                    aria-describedby="email-error"
                    ref={emailInputRef}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`block w-full rounded-md border-0 py-3 px-4 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-400 sm:text-sm sm:leading-6 bg-white dark:bg-gray-800 ${!isEmailValid && email ? 'ring-2 ring-red-500' : ''}`}
                  />
                  {!isEmailValid && email && (
                    <p id="email-error" className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
                      Please enter a valid email address
                    </p>
                  )}
                </div>
              </div>

              {/* Password */}
              <div className="relative">
                <input
                  ref={passwordInputRef}
                  type={passwordVisible ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-4 py-3 pr-16 text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 caret-transparent"
                  autoComplete="current-password"
                  required
                />
                
                {!passwordVisible && (
                  <PasswordCaret
                    caretIndex={passwordInputRef.current?.selectionStart ?? password.length}
                    fillPercent={Math.min(password.length, MIN_PASSWORD_LENGTH) / MIN_PASSWORD_LENGTH}
                    minLength={MIN_PASSWORD_LENGTH}
                  />
                )}
                {validatePassword(password) && (
                  <Check className="absolute right-24 top-1/2 -translate-y-1/2 text-green-500" size={20} />
                )}
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                  title={passwordVisible ? 'Hide Password' : 'Show Password'}
                >
                  {passwordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Remember me */}
              <div className="flex justify-between items-center text-sm text-zinc-500 dark:text-zinc-400 px-1">
                <div className="inline-flex items-center">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800"
                      aria-describedby="remember-me-description"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                      Remember me
                      <span id="remember-me-description" className="sr-only">
                        Saves your email for future logins
                      </span>
                    </label>
                  </div>
                </div>
                <a href="/forgot-password" className="text-indigo-600 hover:underline cursor-pointer">Forgot password?</a>
              </div>

              <div className="flex justify-center my-2">
                <TurnstileWidget
                  key={theme}
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY as string}
                  theme={theme === 'dark' ? 'dark' : 'light'}
                  onVerify={setCaptchaToken}
                />
              </div>
              <button
                type="submit"
                disabled={!isEmailValid || !password || !captchaToken}
                className={`flex w-full justify-center rounded-md bg-indigo-600 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${(!isEmailValid || !password || !captchaToken) ? 'opacity-70 cursor-not-allowed' : ''}`}
                aria-disabled={!isEmailValid || !password || !captchaToken}
              >
                {(!isEmailValid || !password || !captchaToken) ? (
                  <span>Please fill in all required fields</span>
                ) : (
                  <span>Sign in</span>
                )}
              </button>
            </div>

            {/* OAuth Section */}
            <div className="mt-8">
              <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mb-4">Or sign in with</p>
              {/* Live region for accessibility announcements */}
              <div id="a11y-live-region" aria-live="polite" className="sr-only"></div>
              
              <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
                {/* Skip to main content link for keyboard users */}
                <a 
                  href="#main-content" 
                  className="skip-to-main absolute left-0 top-0 z-50 -translate-y-full bg-white p-4 text-indigo-600 transition-transform focus:translate-y-0 dark:bg-gray-900 dark:text-indigo-400"
                >
                  Skip to main content
                </a>
                <OAuthButton icon="/google.svg" name="Google" theme={theme || 'light'} />
                <OAuthButton icon="/facebook.svg" name="Facebook" theme={theme || 'light'} />
                <OAuthButton icon="/github-light.svg" darkIcon="/github-dark.svg" name="GitHub" theme={theme || 'light'} />
              </div>
            </div>
          </div>
        
      </main>
    </>
  )
}

function OAuthButton({ icon, darkIcon, name, iconComponent, theme }: {
  icon?: string; darkIcon?: string; name: string; iconComponent?: React.ReactNode; theme: string;
}) {
  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => signIn(name.toLowerCase())}
      className="flex items-center justify-center gap-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-full py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 transition text-zinc-800 dark:text-white w-[80vw] max-w-[8rem] sm:max-w-[10rem] md:max-w-[12rem] lg:max-w-[14rem] xl:max-w-[16rem] mx-auto"
    >
      {iconComponent ? iconComponent : (
        <Image
          src={theme === 'dark' && darkIcon ? darkIcon : icon ?? ''}
          alt={`${name} logo`}
          width={16}
          height={16}
        />
      )}
      <ShinyText text={name} className={theme === 'dark' ? '' : 'shinyLight'} />
    </button>
  )
}
