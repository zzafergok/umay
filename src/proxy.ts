import { NextRequest, NextResponse } from 'next/server';

import { routing } from '@/i18n/routing';
import { buildContentSecurityPolicy } from '@/lib/security/csp';
import {
  isAuthRoutePath,
  isPublicRoutePath,
  LAST_AUTH_ROUTE_COOKIE,
  sanitizeLastAuthRoute,
} from '@/lib/auth/route-policy';
import {
  getRequestLastAuthRoute,
  getRequestSessionStatus,
  LAST_AUTH_ROUTE_COOKIE_OPTIONS,
  SESSION_COOKIE,
} from '@/lib/auth/session';

const LOCALE_HEADER = 'X-NEXT-INTL-LOCALE';

function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(self), microphone=(), geolocation=()',
  );
  response.headers.set('X-XSS-Protection', '1; mode=block');
  return response;
}

function withLocaleHeader(request: NextRequest): NextResponse {
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  const locale =
    cookieLocale &&
    (routing.locales as readonly string[]).includes(cookieLocale)
      ? cookieLocale
      : routing.defaultLocale;

  const headers = new Headers(request.headers);
  headers.set(LOCALE_HEADER, locale);
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const csp = buildContentSecurityPolicy(nonce);
  headers.set('x-nonce', nonce);
  headers.set('Content-Security-Policy', csp);

  const response = NextResponse.next({ request: { headers } });
  response.headers.set('Content-Security-Policy', csp);
  return applySecurityHeaders(response);
}

function redirectWithSecurity(url: URL): NextResponse {
  const response = NextResponse.redirect(url);
  response.headers.set('Cache-Control', 'no-store, must-revalidate');
  return applySecurityHeaders(response);
}

function clearAuthCookies(response: NextResponse): NextResponse {
  response.cookies.delete(SESSION_COOKIE);
  response.cookies.delete(LAST_AUTH_ROUTE_COOKIE);
  return response;
}

function isPrefetchRequest(request: NextRequest): boolean {
  return (
    request.headers.get('next-router-prefetch') === '1' ||
    request.headers.get('purpose') === 'prefetch' ||
    (request.headers.get('sec-purpose')?.includes('prefetch') ?? false)
  );
}

function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/llms.txt'
  );
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isStaticAsset(pathname) || pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    return applySecurityHeaders(response);
  }

  const { isAuthenticated, hadSessionCookie } =
    getRequestSessionStatus(request);

  if (isPublicRoutePath(pathname)) {
    if (isAuthenticated) {
      const targetRoute = getRequestLastAuthRoute(request);
      return redirectWithSecurity(new URL(targetRoute, request.url));
    }

    const response = withLocaleHeader(request);
    if (hadSessionCookie) {
      clearAuthCookies(response);
    }
    return response;
  }

  if (!isAuthenticated) {
    const response = redirectWithSecurity(new URL('/', request.url));
    if (hadSessionCookie) {
      clearAuthCookies(response);
    }
    return response;
  }

  const response = withLocaleHeader(request);
  if (!isPrefetchRequest(request) && isAuthRoutePath(pathname)) {
    const currentAuthRoute = sanitizeLastAuthRoute(`${pathname}${search}`);
    response.cookies.set(
      LAST_AUTH_ROUTE_COOKIE,
      currentAuthRoute,
      LAST_AUTH_ROUTE_COOKIE_OPTIONS,
    );
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
