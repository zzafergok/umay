import { beforeEach, describe, expect, it } from 'vitest';
import {
  consumeRateLimit,
  evaluateRateLimitWindow,
  resetRateLimitStore,
  resolveClientIp,
} from '@/lib/rate-limit';
import type { RateLimitPolicy } from '@/lib/rate-limit';

describe('Rate Limit Window & Store', () => {
  const policy: RateLimitPolicy = {
    id: 'auth_login',
    maxRequests: 3,
    windowMs: 10_000,
  };

  beforeEach(() => {
    resetRateLimitStore();
  });

  it('allows requests up to maxRequests and blocks subsequent requests until window expires', () => {
    const start = 1_000_000;
    const first = evaluateRateLimitWindow(policy, null, start);
    expect(first.decision).toEqual({ allowed: true });
    expect(first.nextState).toEqual({ count: 1, windowStartedAtMs: start });

    const second = evaluateRateLimitWindow(
      policy,
      first.nextState,
      start + 100,
    );
    expect(second.decision).toEqual({ allowed: true });

    const third = evaluateRateLimitWindow(
      policy,
      second.nextState,
      start + 200,
    );
    expect(third.decision).toEqual({ allowed: true });

    const fourth = evaluateRateLimitWindow(
      policy,
      third.nextState,
      start + 500,
    );
    expect(fourth.decision).toEqual({ allowed: false, retryAfterSeconds: 10 });
    expect(fourth.nextState).toBeNull();

    const afterReset = evaluateRateLimitWindow(
      policy,
      third.nextState,
      start + 10_000,
    );
    expect(afterReset.decision).toEqual({ allowed: true });
    expect(afterReset.nextState).toEqual({
      count: 1,
      windowStartedAtMs: start + 10_000,
    });
  });

  it('consumes rate limit per subject key in store', () => {
    for (let i = 0; i < 5; i++) {
      expect(consumeRateLimit('auth_register', '1.2.3.4', 1000)).toEqual({
        allowed: true,
      });
    }

    const blocked = consumeRateLimit('auth_register', '1.2.3.4', 1000);
    expect(blocked.allowed).toBe(false);

    expect(consumeRateLimit('auth_register', '5.6.7.8', 1000)).toEqual({
      allowed: true,
    });
  });

  it('extracts client IP from x-forwarded-for and x-real-ip headers', () => {
    const forwardedReq = new Request('http://localhost/api/auth/login', {
      headers: { 'x-forwarded-for': '203.0.113.5, 10.0.0.1' },
    });
    expect(resolveClientIp(forwardedReq)).toBe('203.0.113.5');

    const realIpReq = new Request('http://localhost/api/auth/login', {
      headers: { 'x-real-ip': '198.51.100.2' },
    });
    expect(resolveClientIp(realIpReq)).toBe('198.51.100.2');
  });
});
