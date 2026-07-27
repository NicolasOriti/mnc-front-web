import { describe, expect, it } from 'vitest';
import { createInMemoryRateLimiter } from './rate-limit';

describe('createInMemoryRateLimiter', () => {
  it('allows requests up to the configured limit for an IP address', () => {
    const limiter = createInMemoryRateLimiter({ limit: 2, windowMs: 60_000 }, () => 1_000);

    expect(limiter.allow('203.0.113.10')).toEqual({ allowed: true });
    expect(limiter.allow('203.0.113.10')).toEqual({ allowed: true });
    expect(limiter.allow('203.0.113.10')).toEqual({ allowed: false, retryAfterMs: 60_000 });
  });

  it('uses separate windows for different IP addresses and resets an expired window', () => {
    let now = 1_000;
    const limiter = createInMemoryRateLimiter({ limit: 1, windowMs: 60_000 }, () => now);

    expect(limiter.allow('203.0.113.10')).toEqual({ allowed: true });
    expect(limiter.allow('203.0.113.11')).toEqual({ allowed: true });
    now += 60_000;
    expect(limiter.allow('203.0.113.10')).toEqual({ allowed: true });
  });
});
