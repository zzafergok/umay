import 'server-only';

import type { NextRequest } from 'next/server';
import { getSessionToken } from '@/lib/auth/session';
import { verifyToken } from '@/lib/auth/jwt';

export interface AuthenticatedUser {
  uid: string;
  email: string;
  name?: string;
  role: 'user' | 'admin';
}

/**
 * Resolves the authenticated user strictly from server-verified JWT
 * (Authorization Bearer header or httpOnly session cookie).
 * Never trusts uid from request body or query params.
 */
export async function getAuthenticatedUser(
  request?: NextRequest,
): Promise<AuthenticatedUser | null> {
  let token: string | null = null;

  if (request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    }
  }

  if (!token) {
    token = await getSessionToken();
  }

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  if (!payload || !payload.sub) {
    return null;
  }

  return {
    uid: payload.sub,
    email: payload.email,
    name: payload.name,
    role: payload.role,
  };
}
