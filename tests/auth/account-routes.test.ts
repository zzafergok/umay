import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { signToken } from '@/lib/auth/jwt';

vi.mock('server-only', () => ({}));

const {
  mockGetSessionToken,
  mockCreateSession,
  mockDestroySession,
  mockDeleteAllUserData,
  mockIsFirebaseConfigured,
} = vi.hoisted(() => ({
  mockGetSessionToken: vi.fn<() => Promise<string | null>>(),
  mockCreateSession: vi.fn<(token: string) => Promise<void>>(),
  mockDestroySession: vi.fn<() => Promise<void>>(),
  mockDeleteAllUserData: vi.fn<(uid: string) => Promise<void>>(),
  mockIsFirebaseConfigured: vi.fn<() => boolean>(),
}));

vi.mock('@/lib/auth/session', () => ({
  SESSION_COOKIE: 'session',
  getSessionToken: mockGetSessionToken,
  createSession: mockCreateSession,
  destroySession: mockDestroySession,
  hasUserSession: vi.fn(),
}));

vi.mock('@/lib/inventory/repo', () => ({
  deleteAllUserData: mockDeleteAllUserData,
}));

vi.mock('@/lib/firebase/admin', () => ({
  isFirebaseConfigured: mockIsFirebaseConfigured,
  getAdminAuth: vi.fn(),
  getAdminFirestore: vi.fn(),
  getAdminStorage: vi.fn(),
}));

import { DELETE as deleteAccount } from '@/app/api/auth/account/route';
import { POST as logoutPost } from '@/app/api/auth/logout/route';
import { GET as getMe, PATCH as patchMe } from '@/app/api/auth/me/route';

describe('Auth Account & Session API Routes', () => {
  const validToken = signToken({
    sub: 'demo_user_1',
    email: 'ev@umay.app',
    name: 'Ev Sahibi',
    role: 'user',
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsFirebaseConfigured.mockReturnValue(false);
    mockGetSessionToken.mockResolvedValue(null);
  });

  it('returns 401 for unauthenticated GET/PATCH /api/auth/me and DELETE /api/auth/account', async () => {
    const getRes = await getMe(new NextRequest('http://localhost:3000/api/auth/me'));
    expect(getRes.status).toBe(401);

    const patchRes = await patchMe(
      new NextRequest('http://localhost:3000/api/auth/me', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Yeni Ad' }),
      }),
    );
    expect(patchRes.status).toBe(401);

    const deleteRes = await deleteAccount(
      new NextRequest('http://localhost:3000/api/auth/account', {
        method: 'DELETE',
        body: JSON.stringify({ confirmEmail: 'ev@umay.app' }),
      }),
    );
    expect(deleteRes.status).toBe(401);
  });

  it('updates profile name via PATCH /api/auth/me and refreshes session cookie', async () => {
    mockGetSessionToken.mockResolvedValue(validToken);

    const res = await patchMe(
      new NextRequest('http://localhost:3000/api/auth/me', {
        method: 'PATCH',
        body: JSON.stringify({ name: '  Yeni Ev Sahibi  ' }),
      }),
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      user: { id: string; email: string; name: string };
      token: string;
    };
    expect(body.user).toMatchObject({
      id: 'demo_user_1',
      email: 'ev@umay.app',
      name: 'Yeni Ev Sahibi',
    });
    expect(mockCreateSession).toHaveBeenCalledWith(body.token);
  });

  it('rejects DELETE /api/auth/account when confirmation email does not match', async () => {
    const res = await deleteAccount(
      new NextRequest('http://localhost:3000/api/auth/account', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${validToken}` },
        body: JSON.stringify({ confirmEmail: 'wrong@umay.app' }),
      }),
    );

    expect(res.status).toBe(400);
    expect(mockDeleteAllUserData).not.toHaveBeenCalled();
    expect(mockDestroySession).not.toHaveBeenCalled();
  });

  it('deletes all user data and destroys session on matching DELETE /api/auth/account', async () => {
    const res = await deleteAccount(
      new NextRequest('http://localhost:3000/api/auth/account', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${validToken}` },
        body: JSON.stringify({ confirmEmail: 'EV@UMAY.APP' }),
      }),
    );

    expect(res.status).toBe(200);
    expect(mockDeleteAllUserData).toHaveBeenCalledWith('demo_user_1');
    expect(mockDestroySession).toHaveBeenCalledTimes(1);
  });

  it('destroys session on POST /api/auth/logout', async () => {
    const res = await logoutPost();
    expect(res.status).toBe(200);
    expect(mockDestroySession).toHaveBeenCalledTimes(1);
  });
});
