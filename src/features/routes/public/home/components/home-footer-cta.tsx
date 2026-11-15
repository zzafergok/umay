'use client';

import { LayoutDashboard } from 'lucide-react';
import { Badge } from '@/components/core/badge';
import { Button } from '@/components/core/button';
import { Card, CardContent } from '@/components/core/card';
import { Link } from '@/components/core/link';
import { Separator } from '@/components/core/separator';
import { UmayMark } from '@/components/shared/umay-brand';
import { GoogleSignInButton } from './google-signin-button';
import type { PublicHomeCopy } from '../types';

export function HomeFooterCta({
  footerCta,
}: {
  footerCta: PublicHomeCopy['footerCta'];
}) {
  return (
    <div className="space-y-10">
      <Card className="bg-surface border-border">
        <CardContent className="flex flex-col items-start justify-between gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:p-10">
          <div className="max-w-2xl space-y-2.5">
            <Badge variant="default">{footerCta.badge}</Badge>
            <h2 className="font-heading text-title sm:text-display text-text">
              {footerCta.title}
            </h2>
            <p className="text-body text-text-muted">{footerCta.description}</p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <GoogleSignInButton
              label={footerCta.loginAction}
              size="lg"
              className="w-full sm:w-auto"
            />
            <Button
              asChild
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
            >
              <Link href="/home" prefetch={false}>
                <LayoutDashboard
                  className="text-text-muted mr-2 h-4 w-4"
                  aria-hidden="true"
                />
                {footerCta.adminAction}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <footer className="space-y-6 pb-4">
        <Separator />
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <UmayMark className="h-5 w-5" />
            <span className="text-text-muted text-caption">
              {footerCta.copyright}
            </span>
          </div>

          <nav className="flex flex-wrap items-center gap-1">
            {footerCta.anchors.map((anchor) => (
              <Button key={anchor.href} asChild variant="ghost" size="sm">
                <Link href={anchor.href}>{anchor.label}</Link>
              </Button>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
