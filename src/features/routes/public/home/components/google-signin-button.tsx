'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Chrome } from 'lucide-react';
import { Button } from '@/components/core/button';
import { toast } from '@/components/core/toast';
import {
  isFirebaseClientConfigured,
  signInWithGooglePopup,
} from '@/lib/firebase/client';
import { useAuthStore, type AuthUser } from '@/stores/use-auth-store';
import { cn } from '@/lib/utils';

interface GoogleSignInButtonProps {
  label: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  className?: string;
}

function isAuthUser(value: unknown): value is AuthUser {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === 'string' &&
    typeof record.email === 'string' &&
    (record.name === undefined || typeof record.name === 'string') &&
    (record.role === undefined ||
      record.role === 'user' ||
      record.role === 'admin')
  );
}

function extractMessage(payload: unknown): string | null {
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'message' in payload &&
    typeof payload.message === 'string'
  ) {
    return payload.message;
  }
  return null;
}

export function GoogleSignInButton({
  label,
  size = 'default',
  variant = 'default',
  className,
}: GoogleSignInButtonProps) {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    if (!isFirebaseClientConfigured()) {
      toast.error('Firebase istemci ayarları (.env) eksik.');
      return;
    }

    setLoading(true);
    try {
      const idToken = await signInWithGooglePopup();
      const response = await fetch('/api/auth/firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      const payload: unknown = await response.json();
      if (!response.ok) {
        toast.error(extractMessage(payload) ?? 'Google ile giriş yapılamadı.');
        return;
      }

      if (
        typeof payload === 'object' &&
        payload !== null &&
        'token' in payload &&
        typeof payload.token === 'string' &&
        'user' in payload &&
        isAuthUser(payload.user)
      ) {
        setAuth(payload.user, payload.token);
      }

      toast.success('Google ile giriş başarılı');
      router.push('/home');
      router.refresh();
    } catch {
      toast.error('Google oturumu açılamadı veya iptal edildi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      disabled={loading}
      onClick={handleGoogleSignIn}
      className={cn('font-semibold', className)}
    >
      <Chrome className="mr-2 h-4 w-4" aria-hidden="true" />
      {loading ? 'Bağlanıyor...' : label}
    </Button>
  );
}
