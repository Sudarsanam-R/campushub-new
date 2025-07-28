import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis client for rate limiting
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Define rate limit tiers
export enum RateLimitTier {
  // Strict rate limiting for authentication endpoints
  AUTH = 'auth',
  // Default rate limiting for regular API endpoints
  API = 'api',
  // More permissive rate limiting for public endpoints
  PUBLIC = 'public',
  // Very strict rate limiting for sensitive operations
  SENSITIVE = 'sensitive',
}

// Rate limit configurations
const RATE_LIMITS = {
  [RateLimitTier.AUTH]: {
    // 5 requests per minute for auth endpoints
    limit: 5,
    window: '1 m',
  },
  [RateLimitTier.API]: {
    // 60 requests per minute for regular API endpoints
    limit: 60,
    window: '1 m',
  },
  [RateLimitTier.PUBLIC]: {
    // 100 requests per minute for public endpoints
    limit: 100,
    window: '1 m',
  },
  [RateLimitTier.SENSITIVE]: {
    // 3 requests per minute for sensitive operations
    limit: 3,
    window: '1 m',
  },
} as const;

// Cache for rate limiters
const rateLimiters = new Map<string, Ratelimit>();

/**
 * Get or create a rate limiter for the specified tier
 */
function getRateLimiter(tier: RateLimitTier): Ratelimit {
  // Return cached rate limiter if available
  const cached = rateLimiters.get(tier);
  if (cached) return cached;

  // Create new rate limiter
  const config = RATE_LIMITS[tier];
  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(config.limit, config.window),
    analytics: true,
    prefix: `@upstash/ratelimit:${tier}`,
  });

  // Cache the rate limiter
  rateLimiters.set(tier, ratelimit);
  return ratelimit;
}

/**
 * Apply rate limiting to an API route handler
 * @param request The incoming request
 * @param tier The rate limit tier to apply
 * @param identifier Optional custom identifier (defaults to IP address)
 * @returns Response with rate limit headers if rate limited, otherwise null
 */
export async function rateLimitRequest(
  request: Request,
  tier: RateLimitTier = RateLimitTier.API,
  identifier?: string
): Promise<Response | null> {
  // Skip rate limiting in development
  if (process.env.NODE_ENV === 'development' && process.env.DISABLE_RATE_LIMIT === 'true') {
    return null;
  }

  // Get the rate limiter for the specified tier
  const ratelimit = getRateLimiter(tier);
  
  // Use the provided identifier or fall back to IP address
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const id = identifier || ip;

  // Check rate limit
  const { success, limit, reset, remaining } = await ratelimit.limit(id);
  
  // Create response headers
  const headers = new Headers({
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': reset.toString(),
  });

  // Return rate limit response if limit exceeded
  if (!success) {
    return new Response(
      JSON.stringify({
        error: {
          message: 'Too many requests',
          retryAfter: Math.ceil((reset - Date.now()) / 1000),
        },
      }),
      {
        status: 429,
        statusText: 'Too Many Requests',
        headers: {
          ...Object.fromEntries(headers),
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  // Return null to indicate the request should proceed
  return null;
}

/**
 * Higher-order function to wrap API route handlers with rate limiting
 * @param handler The API route handler to wrap
 * @param tier The rate limit tier to apply
 * @param getIdentifier Optional function to extract a custom identifier from the request
 * @returns A wrapped API route handler with rate limiting applied
 */
export function withRateLimit<T = any>(
  handler: (req: Request, ...args: any[]) => Promise<Response>,
  tier: RateLimitTier = RateLimitTier.API,
  getIdentifier?: (req: Request) => Promise<string> | string
) {
  return async function rateLimitedHandler(
    req: Request,
    ...args: any[]
  ): Promise<Response> {
    // Get custom identifier if provided
    let identifier: string | undefined;
    if (getIdentifier) {
      try {
        identifier = await Promise.resolve(getIdentifier(req));
      } catch (error) {
        console.error('Error getting rate limit identifier:', error);
      }
    }

    // Apply rate limiting
    const rateLimitResponse = await rateLimitRequest(req, tier, identifier);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Call the original handler if not rate limited
    return handler(req, ...args);
  };
}
