import { Compass, Home } from 'lucide-react';
import { Button } from '@/components/core/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/core/card';
import { Link } from '@/components/core/link';
import { PublicShell } from '@/features/routes/_shared/layouts';
import { getCurrentLocale } from '@/lib/i18n/server-locale';

export default async function NotFound() {
  const locale = await getCurrentLocale();
  const isTr = locale === 'tr';

  const copy = {
    badge: isTr ? '404 • SAYFA BULUNAMADI' : '404 • PAGE NOT FOUND',
    title: isTr ? 'Kayıp Rota' : 'Page Not Found',
    description: isTr
      ? 'Aradığın sayfa silinmiş, taşınmış veya henüz oluşturulmamış olabilir. Ana sayfaya dönebilirsin.'
      : 'The page you are looking for might have been removed, moved, or does not exist. Return home.',
    homeButton: isTr ? 'Ana Sayfaya Dön' : 'Return Home',
  };

  return (
    <PublicShell>
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-16">
        <Card className="bg-surface shadow-float w-full max-w-lg rounded-lg border-border text-center">
          <CardHeader className="space-y-4 pb-2">
            <div className="bg-accent-subtle mx-auto flex h-14 w-14 items-center justify-center rounded-md border border-accent/30 text-accent">
              <Compass className="h-7 w-7" />
            </div>
            <div className="inline-block font-mono text-caption font-semibold text-accent">
              {copy.badge}
            </div>
            <CardTitle className="font-heading text-display-sm text-text sm:text-display">
              {copy.title}
            </CardTitle>
            <CardDescription className="text-body-sm text-text-muted mx-auto max-w-md leading-relaxed">
              {copy.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex justify-center">
              <Button asChild variant="primary">
                <Link href="/" prefetch={false}>
                  <Home className="mr-2 h-4 w-4" />
                  {copy.homeButton}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicShell>
  );
}
