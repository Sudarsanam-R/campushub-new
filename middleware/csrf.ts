import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { cookies } from 'next/headers';

// CSRF token generation
const generateCSRFToken = () => {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// CSRF token validation
const validateCSRFToken = (request: NextRequest, token: string): boolean => {
  try {
    // Get CSRF token from cookie
    const csrfCookie = request.cookies.get('__Host-csrf-token')?.value;
    
    // Compare with the token from the request
    return csrfCookie === token;
  } catch (error) {
    console.error('CSRF validation error:', error);
    return false;
  }
};

// Middleware to add CSRF protection to API routes
export const csrfProtect = (handler: Function) => {
  return async (request: NextRequest, ...args: any) => {
    // Skip CSRF for GET, HEAD, OPTIONS methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return handler(request, ...args);
    }

    try {
      // Get CSRF token from headers or form data
      const csrfToken = 
        request.headers.get('x-csrf-token') ||
        (await request.formData())?.get('csrfToken')?.toString();

      if (!csrfToken || !validateCSRFToken(request, csrfToken)) {
        return new NextResponse(
          JSON.stringify({ error: 'Invalid CSRF token' }), 
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return handler(request, ...args);
    } catch (error) {
      console.error('CSRF protection error:', error);
      return new NextResponse(
        JSON.stringify({ error: 'CSRF validation failed' }), 
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
  };
};

// Middleware to add CSRF token to response
// This should be used in API routes that render forms
export const withCSRFToken = (handler: Function) => {
  return async (request: NextRequest, ...args: any) => {
    // Generate a new CSRF token if one doesn't exist
    let csrfToken = request.cookies.get('__Host-csrf-token')?.value;
    
    if (!csrfToken) {
      csrfToken = generateCSRFToken();
      
      // Set the CSRF token in an HTTP-only cookie
      const response = NextResponse.next();
      response.cookies.set({
        name: '__Host-csrf-token',
        value: csrfToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 4, // 4 hours
      });
      
      return response;
    }

    return handler(request, ...args);
  };
};

// Higher-order function to protect API routes with CSRF
export const withCSRFProtection = (handler: Function) => {
  return withCSRFToken(csrfProtect(handler));
};

// Utility to get the CSRF token for client-side use
export const getCSRFToken = () => {
  if (typeof document === 'undefined') return '';
  
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('__Host-csrf-token='))
    ?.split('=')[1];
    
  return csrfToken || '';
};

// React hook to get CSRF token
// This can be used in your React components
export const useCSRFToken = (): string => {
  if (typeof window === 'undefined') return '';
  return getCSRFToken();
};
