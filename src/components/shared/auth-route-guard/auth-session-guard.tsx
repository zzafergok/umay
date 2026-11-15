'use client';

import { Suspense, useCallback, useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { getTokenRemainingMs, isTokenExpired } from '@/lib/auth/jwt';
import {
  clearClientLastAuthRouteCookie,
  isAuthRoutePath,
  writeClientLastAuthRouteCookie,
} from '@/lib/auth/route-policy';
import { useAuthStore } from '@/stores/use-auth-store';

const MAX_TIMEOUT_MS = 2_147_483_647;

function AuthSessionGuardInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const token = useAuthStore((state) => state.token);
  const lastUnauthorizedAt = useAuthStore((state) => state.lastUnauthorizedAt);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const redirectingRef = useRef(false);

  const redirectToPublicHome = useCallback(() => {
    if (redirectingRef.current) return;
    redirectingRef.current = true;
    clearAuth();
    clearClientLastAuthRouteCookie();
    if (typeof window !== 'undefined') {
      window.location.replace('/');
    }
  }, [clearAuth]);

  useEffect(() => {
    if (lastUnauthorizedAt !== null) {
      redirectToPublicHome();
    }
  }, [lastUnauthorizedAt, redirectToPublicHome]);

  useEffect(() => {
    if (!token) return;

    if (isTokenExpired(token)) {
      redirectToPublicHome();
      return;
    }

    let timerId: number | undefined;
    const scheduleExpiryCheck = () => {
      const remainingMs = getTokenRemainingMs(token);
      if (remainingMs === null || remainingMs <= 0) {
        redirectToPublicHome();
        return;
      }

      const delay = Math.min(remainingMs, MAX_TIMEOUT_MS);
      timerId = window.setTimeout(() => {
        if (isTokenExpired(token)) {
          redirectToPublicHome();
        } else {
          scheduleExpiryCheck();
        }
      }, delay);
    };

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'hidden') return;
      if (isTokenExpired(token)) {
        redirectToPublicHome();
      }
    };

    scheduleExpiryCheck();
    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    return () => {
      if (timerId !== undefined) {
        window.clearTimeout(timerId);
      }
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, [token, redirectToPublicHome]);

  useEffect(() => {
    if (redirectingRef.current) return;
    if (lastUnauthorizedAt !== null) return;
    if (token && isTokenExpired(token)) return;
    if (!pathname || !isAuthRoutePath(pathname)) return;

    const search = searchParams.toString();
    const currentRoute = search ? `${pathname}?${search}` : pathname;
    writeClientLastAuthRouteCookie(currentRoute);
  }, [pathname, searchParams, token, lastUnauthorizedAt]);

  return null;
}

export function AuthSessionGuard() {
  return (
    <Suspense fallback={null}>
      <AuthSessionGuardInner />
    </Suspense>
  );
}
