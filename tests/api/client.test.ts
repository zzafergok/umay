import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, createApiClient } from '@/lib/api';
import { useAuthStore } from '@/stores/use-auth-store';

describe('Functional API Client (createApiClient)', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('normalizes /api paths, appends query params, and injects Bearer token', async () => {
    useAuthStore.getState().setAuth(
      { id: 'u1', email: 'ev@umay.app', name: 'Ev', role: 'user' },
      'jwt-token-123',
    );

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const client = createApiClient({ baseUrl: 'http://localhost:3000/api' });
    const data = await client.get<{ ok: boolean }>('/api/auth/me', {
      params: { include: 'stats', empty: null, skipped: undefined },
    });

    expect(data).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [calledUrl, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(calledUrl).toBe('http://localhost:3000/api/auth/me?include=stats');
    const headers = init.headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer jwt-token-123');
    expect(headers.get('Content-Type')).toBe('application/json');
  });

  it('clears auth and throws ApiError on 401 responses', async () => {
    useAuthStore.getState().setAuth(
      { id: 'u1', email: 'ev@umay.app', role: 'user' },
      'expired-token',
    );

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: 'Yetkisiz' }), {
          status: 401,
          statusText: 'Unauthorized',
        }),
      ),
    );

    const client = createApiClient({ baseUrl: '/api' });
    const errorHook = vi.fn();
    client.useErrorInterceptor(errorHook);

    await expect(client.get('/auth/me')).rejects.toMatchObject({
      name: 'ApiError',
      status: 401,
      message: 'Yetkisiz',
    });

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().token).toBeNull();
    expect(errorHook).toHaveBeenCalledWith(expect.any(ApiError));
  });

  it('supports 204 No Content and interceptor unsubscription', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(null, { status: 204 })),
    );

    const client = createApiClient({ baseUrl: '/api' });
    const customHeaderInterceptor = vi.fn((url, config) => ({ url, config }));
    const unsubscribe = client.useRequestInterceptor(customHeaderInterceptor);

    const first = await client.delete<Record<string, never>>('/auth/account', {
      body: { confirmEmail: 'ev@umay.app' },
    });
    expect(first).toEqual({});
    expect(customHeaderInterceptor).toHaveBeenCalledTimes(1);

    unsubscribe();
    await client.post('/auth/logout');
    expect(customHeaderInterceptor).toHaveBeenCalledTimes(1);
  });
});
