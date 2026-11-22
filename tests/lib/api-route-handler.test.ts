import { NextRequest, NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

vi.mock('server-only', () => ({}));
vi.mock('@/lib/auth/session', () => ({
  getSessionToken: vi.fn(async () => null),
}));
import { withApiRoute } from '@/lib/api/server';
import { signToken } from '@/lib/auth/jwt';
import { resetRateLimitStore } from '@/lib/rate-limit';

describe('withApiRoute wrapper', () => {
  beforeEach(() => {
    resetRateLimitStore();
  });

  it('returns 401 when requireAuth is true and no token is present', async () => {
    const handler = withApiRoute({
      requireAuth: true,
      handler: () => NextResponse.json({ ok: true }),
    });

    const res = await handler(
      new NextRequest('http://localhost/api/test', { method: 'POST' }),
    );
    expect(res.status).toBe(401);
    expect(res.headers.get('x-request-id')).toBeTruthy();
  });

  it('validates bodySchema and passes parsed body + authenticated user', async () => {
    const token = signToken({
      sub: 'usr_1',
      email: 'test@umay.app',
      role: 'user',
    });

    const handler = withApiRoute({
      requireAuth: true,
      bodySchema: z.object({ count: z.number().int().positive() }),
      handler: ({ userId, body }) =>
        NextResponse.json({ userId, count: body.count }),
    });

    const invalidRes = await handler(
      new NextRequest('http://localhost/api/test', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ count: -1 }),
      }),
    );
    expect(invalidRes.status).toBe(400);

    const validRes = await handler(
      new NextRequest('http://localhost/api/test', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ count: 3 }),
      }),
    );
    expect(validRes.status).toBe(200);
    expect(await validRes.json()).toEqual({ userId: 'usr_1', count: 3 });
  });

  it('enforces rateLimitPolicy and returns 429 with Retry-After', async () => {
    const handler = withApiRoute({
      rateLimitPolicy: 'auth_register',
      handler: () => NextResponse.json({ ok: true }),
    });

    for (let i = 0; i < 5; i++) {
      const okRes = await handler(
        new NextRequest('http://localhost/api/register', {
          method: 'POST',
          headers: { 'x-forwarded-for': '198.51.100.10' },
        }),
      );
      expect(okRes.status).toBe(200);
    }

    const limitedRes = await handler(
      new NextRequest('http://localhost/api/register', {
        method: 'POST',
        headers: { 'x-forwarded-for': '198.51.100.10' },
      }),
    );
    expect(limitedRes.status).toBe(429);
    expect(Number(limitedRes.headers.get('retry-after'))).toBeGreaterThan(0);
  });
});
