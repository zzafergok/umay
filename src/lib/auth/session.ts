import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import {
  LAST_AUTH_ROUTE_COOKIE,
  LAST_AUTH_ROUTE_MAX_AGE,
  sanitizeLastAuthRoute,
} from '@/lib/auth/route-policy';

export const SESSION_COOKIE = 'session';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60, // 7 days
};

export const LAST_AUTH_ROUTE_COOKIE_OPTIONS = {
  httpOnly: false,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: LAST_AUTH_ROUTE_MAX_AGE,
};

export interface RequestSessionStatus {
  isAuthenticated: boolean;
  hadSessionCookie: boolean;
}

function readCookie(request: NextRequest, name: string): string | null {
  const value = request.cookies.get(name)?.value;
  return value && value.trim().length > 0 ? value : null;
}

export function getRequestSessionStatus(
  request: NextRequest,
): RequestSessionStatus {
  const token = readCookie(request, SESSION_COOKIE);
  if (!token) {
    return { isAuthenticated: false, hadSessionCookie: false };
  }

  const payload = verifyToken(token);
  return {
    isAuthenticated: payload !== null,
    hadSessionCookie: true,
  };
}

export function hasUserSession(request: NextRequest): boolean {
  return getRequestSessionStatus(request).isAuthenticated;
}

export function getRequestLastAuthRoute(request: NextRequest): string {
  return sanitizeLastAuthRoute(readCookie(request, LAST_AUTH_ROUTE_COOKIE));
}

export async function createSession(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, COOKIE_OPTIONS);
}

export async function clearLastAuthRoute() {
  const cookieStore = await cookies();
  cookieStore.delete(LAST_AUTH_ROUTE_COOKIE);
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(LAST_AUTH_ROUTE_COOKIE);
}

export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

export async function getLastAuthRoute(): Promise<string> {
  const cookieStore = await cookies();
  return sanitizeLastAuthRoute(cookieStore.get(LAST_AUTH_ROUTE_COOKIE)?.value);
}
