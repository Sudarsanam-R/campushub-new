import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export enum RateLimitTier {
  // 5 requests per minute
  STRICT = 'strict',
  // 30 requests per minute
  DEFAULT = 'default',
  // 100 requests per minute
  GENEROUS = 'generous',
  // 10 requests per second
  BURST = 'burst',
}

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Rate limit configurations
const rateLimitConfigs = {
  [RateLimitTier.STRICT]: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    analytics: true,
  }),
  [RateLimitTier.DEFAULT]: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 m'),
    analytics: true,
  }),
  [RateLimitTier.GENEROUS]: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    analytics: true,
  }),
  [RateLimitTier.BURST]: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 s'),
    analytics: true,
  }),
};

/**
 * Get a rate limiter instance by tier
 * @param tier The rate limit tier to use
 * @returns Rate limiter instance
 */
export function getRateLimiter(tier: RateLimitTier = RateLimitTier.DEFAULT) {
  return rateLimitConfigs[tier];
}

/**
 * Check if a request is allowed based on rate limiting
 * @param identifier Unique identifier for the rate limit (e.g., IP, user ID, email)
 * @param tier Rate limit tier to use
 * @returns Object with success status and remaining requests
 */
export async function checkRateLimit(identifier: string, tier: RateLimitTier = RateLimitTier.DEFAULT) {
  const rateLimit = getRateLimiter(tier);
  return rateLimit.limit(identifier);
}

export default {
  getRateLimiter,
  checkRateLimit,
  RateLimitTier,
};
