'use client';

import { useEffect } from 'react';
import { clearClientLastAuthRouteCookie } from '@/lib/auth/route-policy';
import { useAuthStore } from '@/stores/use-auth-store';

export function PublicSessionSync() {
  useEffect(() => {
    const state = useAuthStore.getState();
    if (state.isAuthenticated || state.token || state.user) {
      state.clearAuth();
    }
    clearClientLastAuthRouteCookie();
  }, []);

  return null;
}
