import { NextResponse } from 'next/server';
import type { NextRequest, NextFetchEvent } from 'next/server';
import { RateLimitTier, withRateLimit } from './utils/rateLimit';
import { sanitizeRequest } from './utils/sanitize';

// Simple logger utility
class Logger {
  static logRequest(request: NextRequest, metadata: Record<string, any> = {}) {
    const url = request.nextUrl.toString();
    const method = request.method;
    // Get client IP from headers (handled by platform in production)
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    console.log(JSON.stringify({
      type: 'request',
      timestamp: new Date().toISOString(),
      method,
      url,
      ip,
      userAgent,
      ...metadata,
    }));
  }

  static logResponse(response: Response, metadata: Record<string, any> = {}) {
    console.log(JSON.stringify({
      type: 'response',
      timestamp: new Date().toISOString(),
      status: response.status,
      statusText: response.statusText,
      ...metadata,
    }));
  }

  static logError(error: Error, metadata: Record<string, any> = {}) {
    console.error(JSON.stringify({
      type: 'error',
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'production' ? undefined : error.stack?.split('\n'),
      },
      ...metadata,
    }));
  }
}

// List of public paths that don't require authentication
const publicPaths = [
  '/api/auth',
  '/_next',
  '/favicon.ico',
  '/images',
  '/fonts',
];

// Rate limit tiers for different API endpoints
const RATE_LIMIT_CONFIG: Record<string, RateLimitTier> = {
  // Authentication endpoints - strict rate limiting
  '/api/auth/signin': RateLimitTier.AUTH,
  '/api/auth/signup': RateLimitTier.AUTH,
  '/api/auth/forgot-password': RateLimitTier.AUTH,
  '/api/auth/reset-password': RateLimitTier.AUTH,
  
  // Sensitive operations - very strict rate limiting
  '/api/account/delete': RateLimitTier.SENSITIVE,
  '/api/account/change-password': RateLimitTier.SENSITIVE,
  
  // Default rate limiting for all other API routes
  '/api/': RateLimitTier.API,
};

/**
 * Get the appropriate rate limit tier for a given path
 */
function getRateLimitTier(path: string): RateLimitTier {
  for (const [prefix, tier] of Object.entries(RATE_LIMIT_CONFIG)) {
    if (path.startsWith(prefix)) {
      return tier;
    }
  }
  return RateLimitTier.PUBLIC; // Default to public rate limiting
}

// Performance monitoring wrapper
async function withPerformanceMonitoring<T>(
  handler: () => Promise<T>,
  metadata: { name: string; [key: string]: unknown }
): Promise<T> {
  const start = Date.now();
  try {
    const result = await handler();
    const duration = Date.now() - start;
    
    // Log performance data
    console.log(JSON.stringify({
      type: 'performance',
      timestamp: new Date().toISOString(),
      name: metadata.name,
      duration,
      ...metadata,
    }));
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    Logger.logError(error as Error, {
      ...metadata,
      duration,
      status: 'error'
    });
    throw error;
  }
}

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;
  const requestId = crypto.randomUUID();
  
  // Log the incoming request
  Logger.logRequest(request, {
    requestId,
    path: pathname,
    method: request.method,
    referrer: request.referrer,
  });
  
  // Skip middleware for public paths (except for logging)
  if (publicPaths.some(path => pathname.startsWith(path))) {
    const response = NextResponse.next();
    Logger.logResponse(response, { requestId, path: pathname });
    return response;
  }
  
  // Apply rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    const tier = getRateLimitTier(pathname);
    
    try {
      // Create a rate-limited handler
      const rateLimitedHandler = withRateLimit(
        async () => NextResponse.next(),
        tier
      );
      
      // Apply rate limiting with performance monitoring
      const rateLimitResponse = await withPerformanceMonitoring(
        async () => rateLimitedHandler(request),
        { 
          name: 'rate_limit',
          rateLimitTier: tier, 
          requestId 
        }
      );
      
      if (rateLimitResponse) {
        Logger.logResponse(rateLimitResponse, { 
          requestId, 
          path: pathname,
          rateLimited: true,
          rateLimitTier: tier
        });
        return rateLimitResponse;
      }
    } catch (error) {
      Logger.logError(error as Error, {
        requestId,
        path: pathname,
        rateLimitTier: tier
      });
      throw error;
    }
  }
  
  // For non-API routes, just sanitize the request and continue
  sanitizeRequest(request);
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
