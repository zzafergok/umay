import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { signToken } from '@/lib/auth/jwt';
import { LAST_AUTH_ROUTE_COOKIE } from '@/lib/auth/route-policy';
import { SESSION_COOKIE } from '@/lib/auth/session';
import { proxy } from '@/proxy';

function makeRequest(
  path: string,
  options: {
    cookies?: Record<string, string>;
    headers?: Record<string, string>;
  } = {},
): NextRequest {
  const req = new NextRequest(new URL(path, 'http://localhost:3000'), {
    headers: options.headers,
  });
  if (options.cookies) {
    for (const [name, value] of Object.entries(options.cookies)) {
      req.cookies.set(name, value);
    }
  }
  return req;
}

describe('Proxy Auth & Route Guard', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const validToken = signToken({
    sub: 'usr_1',
    email: 'ev@umay.app',
    name: 'Ev Sahibi',
    role: 'user',
  });

  function createExpiredToken(): string {
    const eightDaysAgoMs = Date.now() - 8 * 24 * 60 * 60 * 1000;
    const spy = vi.spyOn(Date, 'now').mockReturnValueOnce(eightDaysAgoMs);
    const token = signToken({
      sub: 'usr_expired',
      email: 'expired@umay.app',
      name: 'Expired',
      role: 'user',
    });
    spy.mockRestore();
    return token;
  }

  it('allows unauthenticated users on public / and redirects them away from auth routes', () => {
    const publicRes = proxy(makeRequest('/'));
    expect(publicRes.status).toBe(200);
    expect(publicRes.headers.get('location')).toBeNull();

    for (const authPath of ['/home', '/items', '/parts/p-1', '/settings']) {
      const res = proxy(makeRequest(authPath));
      expect(res.status).toBe(307);
      expect(new URL(res.headers.get('location') ?? '').pathname).toBe('/');
      expect(res.headers.get('cache-control')).toContain('no-store');
    }
  });

  it('treats expired or tampered session tokens as unauthenticated and clears cookies', () => {
    const expiredToken = createExpiredToken();

    const authRedirect = proxy(
      makeRequest('/items', {
        cookies: {
          [SESSION_COOKIE]: expiredToken,
          [LAST_AUTH_ROUTE_COOKIE]: '/items',
        },
      }),
    );
    expect(authRedirect.status).toBe(307);
    expect(new URL(authRedirect.headers.get('location') ?? '').pathname).toBe(
      '/',
    );
    expect(authRedirect.cookies.get(SESSION_COOKIE)?.value).toBe('');
    expect(authRedirect.cookies.get(LAST_AUTH_ROUTE_COOKIE)?.value).toBe('');

    const publicExpired = proxy(
      makeRequest('/', {
        cookies: {
          [SESSION_COOKIE]: 'tampered.jwt.token',
          [LAST_AUTH_ROUTE_COOKIE]: '/settings',
        },
      }),
    );
    expect(publicExpired.status).toBe(200);
    expect(publicExpired.cookies.get(SESSION_COOKIE)?.value).toBe('');
    expect(publicExpired.cookies.get(LAST_AUTH_ROUTE_COOKIE)?.value).toBe('');
  });

  it('redirects authenticated users away from public / to their last auth screen or /home', () => {
    const noLastCookie = proxy(
      makeRequest('/', {
        cookies: { [SESSION_COOKIE]: validToken },
      }),
    );
    expect(noLastCookie.status).toBe(307);
    expect(new URL(noLastCookie.headers.get('location') ?? '').pathname).toBe(
      '/home',
    );

    const withLastCookie = proxy(
      makeRequest('/', {
        cookies: {
          [SESSION_COOKIE]: validToken,
          [LAST_AUTH_ROUTE_COOKIE]: encodeURIComponent('/items?item=abc'),
        },
      }),
    );
    expect(withLastCookie.status).toBe(307);
    const target = new URL(withLastCookie.headers.get('location') ?? '');
    expect(target.pathname).toBe('/items');
    expect(target.search).toBe('?item=abc');

    const unsafeCookie = proxy(
      makeRequest('/', {
        cookies: {
          [SESSION_COOKIE]: validToken,
          [LAST_AUTH_ROUTE_COOKIE]: '//evil.com',
        },
      }),
    );
    expect(unsafeCookie.status).toBe(307);
    expect(new URL(unsafeCookie.headers.get('location') ?? '').pathname).toBe(
      '/home',
    );
  });

  it('records last auth route for real navigations but ignores prefetch and unknown 404 paths', () => {
    const realNav = proxy(
      makeRequest('/parts/part_77', {
        cookies: { [SESSION_COOKIE]: validToken },
      }),
    );
    expect(realNav.status).toBe(200);
    expect(realNav.cookies.get(LAST_AUTH_ROUTE_COOKIE)?.value).toBe(
      '/parts/part_77',
    );

    const prefetchNav = proxy(
      makeRequest('/settings', {
        cookies: { [SESSION_COOKIE]: validToken },
        headers: { 'next-router-prefetch': '1' },
      }),
    );
    expect(prefetchNav.status).toBe(200);
    expect(prefetchNav.cookies.get(LAST_AUTH_ROUTE_COOKIE)).toBeUndefined();

    const unknownNav = proxy(
      makeRequest('/nonexistent-route', {
        cookies: { [SESSION_COOKIE]: validToken },
      }),
    );
    expect(unknownNav.status).toBe(200);
    expect(unknownNav.cookies.get(LAST_AUTH_ROUTE_COOKIE)).toBeUndefined();
  });

  it('bypasses redirects for /api and static assets', () => {
    const apiRes = proxy(makeRequest('/api/auth/me'));
    expect(apiRes.status).toBe(200);
    expect(apiRes.headers.get('location')).toBeNull();

    const assetRes = proxy(makeRequest('/umay-icon.svg'));
    expect(assetRes.status).toBe(200);
    expect(assetRes.headers.get('location')).toBeNull();
  });
});
