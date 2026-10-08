/**
 * Lightweight in-memory sliding window rate limiter for server actions.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Clean up stale IP records every 10 minutes to prevent memory leak
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < 600000);
      if (record.timestamps.length === 0) {
        rateLimitMap.delete(key);
      }
    }
  }, 600000);
}

/**
 * Checks if an identifier exceeds the allowed number of requests in the specified window.
 * @param identifier Unique key (e.g. client IP, action name)
 * @param maxLimit Maximum allowed attempts
 * @param windowMs Time window in milliseconds (default 10 minutes)
 * @returns { isAllowed: boolean, remaining: number, resetMs: number }
 */
export function checkRateLimit(
  identifier: string,
  maxLimit: number = 5,
  windowMs: number = 600000 // 10 minutes
): { isAllowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  let record = rateLimitMap.get(identifier);

  if (!record) {
    record = { timestamps: [] };
    rateLimitMap.set(identifier, record);
  }

  // Filter timestamps within the current window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= maxLimit) {
    const oldest = record.timestamps[0];
    const resetMs = Math.max(0, windowMs - (now - oldest));
    return {
      isAllowed: false,
      remaining: 0,
      resetMs,
    };
  }

  record.timestamps.push(now);
  return {
    isAllowed: true,
    remaining: maxLimit - record.timestamps.length,
    resetMs: windowMs,
  };
}
