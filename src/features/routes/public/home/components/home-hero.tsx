'use client';

import { LayoutDashboard } from 'lucide-react';
import { Badge } from '@/components/core/badge';
import { Button } from '@/components/core/button';
import { Link } from '@/components/core/link';
import { UmayMark } from '@/components/shared/umay-brand';
import { GoogleSignInButton } from './google-signin-button';
import type { PublicHomeCopy } from '../types';

export function HomeHero({
  badges,
  hero,
}: {
  badges: PublicHomeCopy['badges'];
  hero: PublicHomeCopy['hero'];
}) {
  return (
    <section className="bg-surface rounded-lg border border-border p-6 sm:p-10 lg:p-12">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-4 flex justify-center">
          <UmayMark className="h-10 w-10" />
        </div>
        <div className="mb-5 flex flex-wrap items-center justify-center gap-2">
          {badges.map((badge, idx) => (
            <Badge key={badge} variant={idx === 0 ? 'default' : 'secondary'}>
              {badge}
            </Badge>
          ))}
        </div>

        <h1 className="font-heading text-display text-text font-bold tracking-tight sm:text-4xl lg:text-5xl">
          {hero.title}
        </h1>

        <p className="text-body text-text-muted mx-auto mt-4 max-w-prose">
          {hero.description}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <GoogleSignInButton label={hero.loginAction} />
          <Button asChild variant="secondary">
            <Link href="/home">
              <LayoutDashboard className="text-text-muted mr-1.5 h-4 w-4" />
              {hero.adminAction}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
