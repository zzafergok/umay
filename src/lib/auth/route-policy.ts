export const DEFAULT_AUTH_ROUTE = '/home';
export const LAST_AUTH_ROUTE_COOKIE = 'umay_last_auth_route';
export const LAST_AUTH_ROUTE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

const PUBLIC_EXACT_ROUTES = new Set<string>(['/']);

const AUTH_EXACT_ROUTES = new Set<string>([
  '/home',
  '/items',
  '/parts',
  '/shopping',
  '/locations',
  '/categories',
  '/activity',
  '/profile',
  '/settings',
  '/workspace',
]);

const AUTH_DYNAMIC_PATTERNS: readonly RegExp[] = [/^\/parts\/[^/]+$/];

function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function isPublicRoutePath(pathname: string): boolean {
  return PUBLIC_EXACT_ROUTES.has(normalizePathname(pathname));
}

export function isAuthRoutePath(pathname: string): boolean {
  const normalized = normalizePathname(pathname);
  if (AUTH_EXACT_ROUTES.has(normalized)) {
    return true;
  }
  return AUTH_DYNAMIC_PATTERNS.some((pattern) => pattern.test(normalized));
}

/**
 * Validates and normalizes a stored last-auth route so open redirects,
 * public paths, API paths, and unknown/404 paths safely fall back to `/home`.
 */
export function sanitizeLastAuthRoute(
  rawValue: string | null | undefined,
): string {
  if (!rawValue) return DEFAULT_AUTH_ROUTE;

  let decoded = rawValue.trim();
  if (decoded.startsWith('%')) {
    try {
      decoded = decodeURIComponent(decoded).trim();
    } catch {
      return DEFAULT_AUTH_ROUTE;
    }
  }

  if (
    !decoded.startsWith('/') ||
    decoded.startsWith('//') ||
    decoded.includes('\\')
  ) {
    return DEFAULT_AUTH_ROUTE;
  }

  try {
    const parsed = new URL(decoded, 'http://umay.local');
    if (parsed.origin !== 'http://umay.local') {
      return DEFAULT_AUTH_ROUTE;
    }

    const pathname = normalizePathname(parsed.pathname);
    if (!isAuthRoutePath(pathname)) {
      return DEFAULT_AUTH_ROUTE;
    }

    parsed.searchParams.delete('_rsc');
    const search = parsed.searchParams.toString();
    return search ? `${pathname}?${search}` : pathname;
  } catch {
    return DEFAULT_AUTH_ROUTE;
  }
}

export function writeClientLastAuthRouteCookie(route: string): void {
  if (typeof document === 'undefined') return;
  const safeRoute = sanitizeLastAuthRoute(route);
  const secureFlag =
    typeof window !== 'undefined' && window.location.protocol === 'https:'
      ? '; Secure'
      : '';
  document.cookie = `${LAST_AUTH_ROUTE_COOKIE}=${encodeURIComponent(safeRoute)}; Path=/; Max-Age=${LAST_AUTH_ROUTE_MAX_AGE}; SameSite=Lax${secureFlag}`;
}

export function clearClientLastAuthRouteCookie(): void {
  if (typeof document === 'undefined') return;
  const secureFlag =
    typeof window !== 'undefined' && window.location.protocol === 'https:'
      ? '; Secure'
      : '';
  document.cookie = `${LAST_AUTH_ROUTE_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${secureFlag}`;
}
