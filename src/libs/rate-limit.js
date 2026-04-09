/**
 * Simple in-memory rate limiter for API routes.
 * Uses a sliding window approach. Good for single-instance deployments.
 * For multi-instance, swap to Redis-based (e.g. @upstash/ratelimit).
 */

const rateLimitMap = new Map();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitMap.entries()) {
    if (now - data.windowStart > data.windowMs * 2) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * @param {Object} options
 * @param {number} options.limit - Max requests per window
 * @param {number} options.windowMs - Window duration in ms (default: 60000 = 1 min)
 * @returns {Function} rateLimiter(identifier) => { success, remaining, resetIn }
 */
export function rateLimit({ limit = 10, windowMs = 60_000 } = {}) {
  return function check(identifier) {
    const now = Date.now();
    const key = identifier;

    const data = rateLimitMap.get(key);

    if (!data || now - data.windowStart > windowMs) {
      // New window
      rateLimitMap.set(key, { count: 1, windowStart: now, windowMs });
      return { success: true, remaining: limit - 1, resetIn: windowMs };
    }

    if (data.count >= limit) {
      const resetIn = windowMs - (now - data.windowStart);
      return { success: false, remaining: 0, resetIn };
    }

    data.count++;
    return {
      success: true,
      remaining: limit - data.count,
      resetIn: windowMs - (now - data.windowStart),
    };
  };
}

// Pre-configured limiters for different API routes
export const uploadLimiter = rateLimit({ limit: 10, windowMs: 60_000 }); // 10 uploads/min
export const checkoutLimiter = rateLimit({ limit: 5, windowMs: 60_000 }); // 5 checkouts/min
export const transcribeLimiter = rateLimit({ limit: 15, windowMs: 60_000 }); // 15 transcribe/min
export const summarizeLimiter = rateLimit({ limit: 10, windowMs: 60_000 }); // 10 summaries/min
export const generalLimiter = rateLimit({ limit: 30, windowMs: 60_000 }); // 30 req/min general
