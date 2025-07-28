import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit, RateLimitTier } from '@/utils/rateLimit';
import { sanitizeString, sanitizeEmail } from '@/utils/sanitize';
import { env } from '@/utils/env';

// Rate limit configuration for login attempts
const RATE_LIMIT_TIER = RateLimitTier.AUTH;

// Maximum number of failed login attempts before locking the account
const MAX_FAILED_ATTEMPTS = 5;

// Lockout duration in milliseconds (30 minutes)
const LOCKOUT_DURATION = 30 * 60 * 1000;

// Track failed login attempts (in a real app, use Redis or your database)
const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();

/**
 * Check if an IP address is currently locked out
 */
function isLockedOut(ip: string): boolean {
  const attempt = failedAttempts.get(ip);
  if (!attempt) return false;
  
  // Reset counter if lockout period has passed
  if (Date.now() - attempt.lastAttempt > LOCKOUT_DURATION) {
    failedAttempts.delete(ip);
    return false;
  }
  
  return attempt.count >= MAX_FAILED_ATTEMPTS;
}

/**
 * Record a failed login attempt
 */
function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const attempt = failedAttempts.get(ip) || { count: 0, lastAttempt: 0 };
  
  // Reset counter if last attempt was before the lockout period
  if (now - attempt.lastAttempt > LOCKOUT_DURATION) {
    attempt.count = 0;
  }
  
  attempt.count++;
  attempt.lastAttempt = now;
  failedAttempts.set(ip, attempt);
}

/**
 * Reset failed login attempts for an IP address
 */
function resetFailedAttempts(ip: string): void {
  failedAttempts.delete(ip);
}

/**
 * Handle login request
 */
async function handleLogin(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    
    // Check if IP is locked out
    if (isLockedOut(ip)) {
      return NextResponse.json(
        { error: 'Too many failed login attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': (LOCKOUT_DURATION / 1000).toString() } }
      );
    }
    
    // Parse and validate request body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    const { email: rawEmail, password: rawPassword } = body;
    
    // Validate input
    if (!rawEmail || !rawPassword) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Sanitize inputs
    const email = sanitizeEmail(rawEmail);
    const password = sanitizeString(rawPassword);
    
    if (!email) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }
    
    try {
      // Proxy to Django backend with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Forwarded-For': ip,
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      if (!response.ok) {
        // Record failed attempt
        recordFailedAttempt(ip);
        
        return NextResponse.json(
          { 
            error: data.error || 'Login failed',
            remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - (failedAttempts.get(ip)?.count || 0)),
          },
          { status: response.status }
        );
      }
      
      // Reset failed attempts on successful login
      resetFailedAttempts(ip);
      
      // Set secure, HTTP-only cookie with the token
      const responseWithCookie = NextResponse.json(data);
      
      if (data.token) {
        responseWithCookie.cookies.set({
          name: 'auth_token',
          value: data.token,
          httpOnly: true,
          secure: env.isProduction,
          sameSite: 'strict',
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 1 week
        });
      }
      
      return responseWithCookie;
      
    } catch (error: unknown) {
      console.error('Login error:', error);
      
      if (error instanceof Error && error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout. Please try again.' },
          { status: 504 }
        );
      }
      
      return NextResponse.json(
        { error: 'An unexpected error occurred' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Unexpected error in login handler:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// Export the rate-limited handler
export const POST = withRateLimit(
  async (req: Request) => {
    const nextReq = req as unknown as NextRequest;
    return handleLogin(nextReq);
  },
  RATE_LIMIT_TIER,
  (req) => req.headers.get('x-forwarded-for') || '127.0.0.1'
);

// Export for testing
export { handleLogin };
