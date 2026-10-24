/**
 * In-memory sliding window rate limiter for Next.js Server Actions & API Routes.
 * Provides protection against brute-force attacks and endpoint flooding.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();
let lastCleanup = Date.now();

function cleanupExpired() {
  const now = Date.now();
  if (now - lastCleanup < 60000) return;
  lastCleanup = now;
  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Checks if a specific key has exceeded the allowed rate limit within the time window.
 * @param key Unique identifier (e.g., `login:ip` or `search:ip`)
 * @param limit Max allowed attempts within the window
 * @param windowMs Duration of the window in milliseconds
 */
export function checkRateLimit(
  key: string,
  limit: number = 10,
  windowMs: number = 60 * 1000
): RateLimitResult {
  cleanupExpired();
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || record.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      success: true,
      remaining: Math.max(0, limit - 1),
      resetAt: now + windowMs,
    };
  }

  if (record.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetAt: record.resetAt,
    };
  }

  record.count += 1;
  return {
    success: true,
    remaining: Math.max(0, limit - record.count),
    resetAt: record.resetAt,
  };
}

/**
 * Resets rate limit for a specific key (e.g., upon successful authentication).
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

/**
 * Extracts client IP safely from incoming request headers.
 * Prioritizes platform-verified provider headers (e.g., Vercel, Cloudflare) before fallback headers.
 */
export function getClientIp(headersObj: Headers | { get: (name: string) => string | null }): string {
  const vercelIp = headersObj.get("x-vercel-ip-client");
  if (vercelIp && vercelIp.trim()) return vercelIp.trim();

  const cfIp = headersObj.get("cf-connecting-ip");
  if (cfIp && cfIp.trim()) return cfIp.trim();

  const realIp = headersObj.get("x-real-ip");
  if (realIp && realIp.trim()) return realIp.trim();

  const forwarded = headersObj.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return "127.0.0.1";
}
