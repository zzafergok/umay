import { describe, expect, it } from 'vitest';
import {
  DEFAULT_AUTH_ROUTE,
  isAuthRoutePath,
  isPublicRoutePath,
  sanitizeLastAuthRoute,
} from '@/lib/auth/route-policy';

describe('Auth Route Policy', () => {
  it('identifies public routes correctly', () => {
    expect(isPublicRoutePath('/')).toBe(true);
    expect(isPublicRoutePath('/home')).toBe(false);
    expect(isPublicRoutePath('/items')).toBe(false);
  });

  it('identifies valid authenticated routes including dynamic part details', () => {
    expect(isAuthRoutePath('/home')).toBe(true);
    expect(isAuthRoutePath('/items')).toBe(true);
    expect(isAuthRoutePath('/items/')).toBe(true);
    expect(isAuthRoutePath('/parts')).toBe(true);
    expect(isAuthRoutePath('/parts/part_42')).toBe(true);
    expect(isAuthRoutePath('/profile')).toBe(true);
    expect(isAuthRoutePath('/settings')).toBe(true);
    expect(isAuthRoutePath('/workspace')).toBe(true);

    expect(isAuthRoutePath('/')).toBe(false);
    expect(isAuthRoutePath('/parts/a/b')).toBe(false);
    expect(isAuthRoutePath('/unknown-route')).toBe(false);
    expect(isAuthRoutePath('/api/auth/me')).toBe(false);
  });

  it('sanitizes valid last auth routes and strips _rsc params', () => {
    expect(sanitizeLastAuthRoute('/items')).toBe('/items');
    expect(sanitizeLastAuthRoute('/items?item=123')).toBe('/items?item=123');
    expect(sanitizeLastAuthRoute('%2Fparts%2Fp-9')).toBe('/parts/p-9');
    expect(sanitizeLastAuthRoute('/items?_rsc=xyz&item=5')).toBe(
      '/items?item=5',
    );
  });

  it('falls back to /home for unsafe, public, or unknown routes', () => {
    expect(sanitizeLastAuthRoute(null)).toBe(DEFAULT_AUTH_ROUTE);
    expect(sanitizeLastAuthRoute(undefined)).toBe(DEFAULT_AUTH_ROUTE);
    expect(sanitizeLastAuthRoute('')).toBe(DEFAULT_AUTH_ROUTE);
    expect(sanitizeLastAuthRoute('/')).toBe(DEFAULT_AUTH_ROUTE);
    expect(sanitizeLastAuthRoute('//evil.com')).toBe(DEFAULT_AUTH_ROUTE);
    expect(sanitizeLastAuthRoute('https://evil.com/home')).toBe(
      DEFAULT_AUTH_ROUTE,
    );
    expect(sanitizeLastAuthRoute('/\\evil')).toBe(DEFAULT_AUTH_ROUTE);
    expect(sanitizeLastAuthRoute('/non-existent')).toBe(DEFAULT_AUTH_ROUTE);
  });
});
