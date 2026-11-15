'use client';

import { LayoutDashboard } from 'lucide-react';
import { Badge } from '@/components/core/badge';
import { Button } from '@/components/core/button';
import { Link } from '@/components/core/link';
import { UmayMark } from '@/components/shared/umay-brand';
import { GoogleSignInButton } from './google-signin-button';
import { HeroLivePreview } from './hero-live-preview';
import type { PublicHomeCopy } from '../types';

export function HomeHero({
  badges,
  hero,
  heroPreview,
}: {
  badges: PublicHomeCopy['badges'];
  hero: PublicHomeCopy['hero'];
  heroPreview: PublicHomeCopy['heroPreview'];
}) {
  return (
    <section
      id="hero"
      className="bg-surface rounded-xl border border-border p-6 sm:p-8 lg:p-12"
    >
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="space-y-6 lg:col-span-6">
          <div className="flex items-center gap-3">
            <span className="bg-surface-sunken flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border">
              <UmayMark className="h-5 w-5" />
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {badges.map((badge, idx) => (
                <Badge
                  key={badge}
                  variant={idx === 0 ? 'default' : 'secondary'}
                >
                  {badge}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="font-heading text-display text-text font-bold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12]">
              {hero.title}
            </h1>
            <p className="text-body text-text-muted max-w-prose">
              {hero.description}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <GoogleSignInButton
              label={hero.loginAction}
              size="lg"
              className="w-full sm:w-auto"
            />
            <Button
              asChild
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
            >
              <Link href="/home">
                <LayoutDashboard
                  className="text-text-muted mr-2 h-4 w-4"
                  aria-hidden="true"
                />
                {hero.adminAction}
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3 border-t border-border pt-5 sm:grid-cols-3">
            {hero.highlights.map((item) => (
              <div
                key={item.label}
                className="bg-surface-sunken rounded-md border border-border px-3 py-2.5"
              >
                <span className="text-text-muted block text-caption">
                  {item.label}
                </span>
                <span className="font-heading text-body-sm text-text mt-0.5 block font-semibold">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6">
          <HeroLivePreview preview={heroPreview} />
        </div>
      </div>
    </section>
  );
}
