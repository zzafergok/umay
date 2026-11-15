'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useApiMutation, useApiQuery } from '@/hooks/use-api-query';
import type {
  DeleteAccountFormData,
  ProfileUpdateFormData,
} from '@/lib/auth/auth-schema';
import { signOutFirebaseClient } from '@/lib/firebase/client';
import { clearOfflineMutations } from '@/lib/offline/offline-queue';
import {
  AUTH_CACHE_STRATEGY,
  authService,
  type LoginCredentials,
  type LoginResponse,
  type ProfileUpdateResponse,
  type UserResponse,
} from '@/services/auth-service';
import { useAuthStore } from '@/stores/use-auth-store';

export const AUTH_QUERY_KEY = ['auth', 'current-user'] as const;

async function resetClientSession(
  clearAuth: () => void,
  queryClient: ReturnType<typeof useQueryClient>,
) {
  await signOutFirebaseClient();
  clearAuth();
  queryClient.setQueryData(AUTH_QUERY_KEY, null);
  queryClient.clear();
  await clearOfflineMutations();
}

export function useLoginMutation() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const queryClient = useQueryClient();

  return useApiMutation<LoginResponse, LoginCredentials>(
    (credentials) => authService.login(credentials),
    {
      onSuccess: (data) => {
        setAuth(data.user, data.token);
        queryClient.setQueryData(AUTH_QUERY_KEY, { user: data.user });
      },
    },
  );
}

export function useLogoutMutation() {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const queryClient = useQueryClient();

  return useApiMutation<{ message: string }, void>(
    () => authService.logout(),
    {
      onSettled: async () => {
        await resetClientSession(clearAuth, queryClient);
      },
    },
  );
}

export function useUpdateProfileMutation() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const queryClient = useQueryClient();

  return useApiMutation<ProfileUpdateResponse, ProfileUpdateFormData>(
    (payload) => authService.updateProfile(payload),
    {
      onSuccess: (data) => {
        setAuth(data.user, data.token);
        queryClient.setQueryData(AUTH_QUERY_KEY, { user: data.user });
      },
    },
  );
}

export function useDeleteAccountMutation() {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const queryClient = useQueryClient();

  return useApiMutation<{ message: string }, DeleteAccountFormData>(
    (payload) => authService.deleteAccount(payload),
    {
      onSuccess: async () => {
        await resetClientSession(clearAuth, queryClient);
      },
    },
  );
}

export function useCurrentUserQuery(enabled = true) {
  const setUser = useAuthStore((state) => state.setUser);
  const token = useAuthStore((state) => state.token);

  const query = useApiQuery<UserResponse>(
    AUTH_QUERY_KEY,
    '/auth/me',
    { skipAuth: !token },
    {
      ...AUTH_CACHE_STRATEGY,
      enabled,
      retry: false,
    },
  );

  useEffect(() => {
    if (query.data?.user) {
      setUser(query.data.user);
    }
  }, [query.data?.user, setUser]);

  return query;
}
