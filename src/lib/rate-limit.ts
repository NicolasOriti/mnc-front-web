export type RateLimitDecision = { allowed: true } | { allowed: false; retryAfterMs: number };

export type RateLimiter = {
  allow(key: string): RateLimitDecision;
};

export type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

type RateLimitWindow = {
  count: number;
  startedAt: number;
};

export function createInMemoryRateLimiter(
  { limit, windowMs }: RateLimitOptions,
  now: () => number,
): RateLimiter {
  const windows = new Map<string, RateLimitWindow>();

  return {
    allow(key) {
      const currentTime = now();
      const existing = windows.get(key);

      if (!existing || currentTime - existing.startedAt >= windowMs) {
        windows.set(key, { count: 1, startedAt: currentTime });
        return { allowed: true };
      }

      if (existing.count >= limit) {
        return { allowed: false, retryAfterMs: windowMs - (currentTime - existing.startedAt) };
      }

      existing.count += 1;
      return { allowed: true };
    },
  };
}
