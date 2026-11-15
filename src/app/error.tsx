'use client';

import { useEffect } from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/core/button';
import { Link } from '@/components/core/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/core/card';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error('[RootError]', error);
    }
  }, [error]);

  return (
    <div className="bg-bg text-text flex min-h-screen items-center justify-center p-4 font-sans">
      <Card className="border-danger/40 bg-surface shadow-float w-full max-w-lg rounded-lg text-center">
        <CardHeader className="space-y-3 pb-2">
          <div className="border-danger/40 bg-danger-subtle text-danger mx-auto flex h-14 w-14 items-center justify-center rounded-md border">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <div className="text-danger font-mono text-caption font-semibold">
            Sistem hatası
          </div>
          <CardTitle className="font-heading text-display-sm text-text">
            Bir Şeyler Ters Gitti
          </CardTitle>
          <CardDescription className="text-body-sm text-text-muted leading-relaxed">
            Uygulama çalışırken beklenmeyen bir hata ile karşılaşıldı. Sayfayı
            yeniden deneyebilir veya ana sayfaya dönebilirsiniz.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {error.digest && (
            <div className="bg-surface-sunken text-text-muted rounded-md border border-border p-2.5 font-mono text-caption">
              Hata Kodu (Digest): {error.digest}
            </div>
          )}

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button onClick={() => reset()} variant="primary">
              <RefreshCw className="mr-2 h-4 w-4" />
              Tekrar Dene
            </Button>
            <Button asChild variant="secondary">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Ana Sayfa
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
