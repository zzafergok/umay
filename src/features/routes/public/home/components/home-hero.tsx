'use client';

import { CheckCircle2, LayoutDashboard } from 'lucide-react';
import { Badge } from '@/components/core/badge';
import { Button } from '@/components/core/button';
import { Link } from '@/components/core/link';
import { UmayMark } from '@/components/shared/umay-brand';
import { GoogleSignInButton } from './google-signin-button';
import { HeroLivePreview } from './hero-live-preview';
import type { PublicHomeCopy } from '../types';

export interface HomeHeroProps {
  hero: PublicHomeCopy['hero'];
  heroPreview: PublicHomeCopy['heroPreview'];
}

export function HomeHero({ hero, heroPreview }: HomeHeroProps) {
  return (
    <section
      id="hero"
      className="grid scroll-mt-20 gap-8 lg:grid-cols-12 lg:items-start lg:gap-10"
    >
      <div className="space-y-6 lg:col-span-6 lg:pt-2">
        <div className="flex items-center gap-3">
          <span className="bg-surface-sunken flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border">
            <UmayMark className="h-5 w-5" />
          </span>
          <Badge variant="outline">{hero.badge}</Badge>
        </div>

        <div className="space-y-3">
          <h1 className="text-text text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.65rem] lg:leading-[1.12]">
            {hero.title}
          </h1>
          <p className="text-text-muted max-w-xl text-sm leading-relaxed sm:text-base">
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
            <Link href="#ekranlar">
              <LayoutDashboard
                className="text-text-muted mr-2 h-4 w-4"
                aria-hidden="true"
              />
              {hero.exploreAction}
            </Link>
          </Button>
        </div>

        <ul className="space-y-2 border-t border-border pt-4">
          {hero.highlights.map((item) => (
            <li
              key={item}
              className="text-text-muted flex items-center gap-2 text-xs sm:text-sm"
            >
              <CheckCircle2
                className="h-4 w-4 shrink-0 text-accent"
                aria-hidden="true"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="lg:col-span-6">
        <HeroLivePreview preview={heroPreview} />
      </div>
    </section>
  );
}
