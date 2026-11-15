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

export function GoogleSignInButton({ label }: { label: string }) {
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
        const msg =
          typeof payload === 'object' &&
          payload !== null &&
          'message' in payload
            ? String((payload as { message: unknown }).message)
            : 'Google ile giriş yapılamadı.';
        toast.error(msg);
        return;
      }

      if (
        typeof payload === 'object' &&
        payload !== null &&
        'token' in payload &&
        'user' in payload
      ) {
        const data = payload as { token: string; user: AuthUser };
        setAuth(data.user, data.token);
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
      variant="outline"
      disabled={loading}
      onClick={handleGoogleSignIn}
      className="w-full rounded-none font-semibold"
    >
      <Chrome className="mr-2 h-4 w-4" aria-hidden="true" />
      {loading ? 'Bağlanıyor...' : label}
    </Button>
  );
}
