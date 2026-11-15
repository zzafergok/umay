'use client';

import {
  Globe2,
  Sparkles,
  User,
  Shield,
  Lock,
  ArrowUpRight,
  type LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/core/badge';
import { Card } from '@/components/core/card';
import { Link } from '@/components/core/link';
import type { PublicHomeCopy, QuickRouteItem } from '../types';

const routeIconMap: Record<QuickRouteItem['icon'], LucideIcon> = {
  globe: Globe2,
  sparkles: Sparkles,
  user: User,
  shield: Shield,
  lock: Lock,
};

export function QuickRoutesSection({
  quickRoutesSection,
}: {
  quickRoutesSection: PublicHomeCopy['quickRoutesSection'];
}) {
  return (
    <section id="ekranlar" className="scroll-mt-20 space-y-6">
      <div className="mx-auto max-w-2xl space-y-2 text-center">
        <Badge variant="outline">{quickRoutesSection.badge}</Badge>
        <h2 className="font-heading text-title sm:text-display text-text">
          {quickRoutesSection.title}
        </h2>
        <p className="text-body-sm text-text-muted">
          {quickRoutesSection.description}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {quickRoutesSection.routes.map((route) => {
          const Icon = routeIconMap[route.icon] ?? Globe2;
          return (
            <Link
              key={route.href}
              href={route.href}
              className="focus-visible:ring-offset-bg group block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              <Card
                interactive
                className="flex flex-row items-center justify-between p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="bg-surface-sunken text-text-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border transition-colors group-hover:text-accent">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-body-sm text-text truncate font-medium group-hover:text-accent">
                        {route.title}
                      </span>
                      <Badge variant="secondary" size="sm">
                        {route.badge}
                      </Badge>
                    </div>
                    <p className="text-text-muted mt-0.5 truncate text-caption">
                      {route.subtitle}
                    </p>
                  </div>
                </div>
                <ArrowUpRight
                  className="text-text-muted h-4 w-4 shrink-0 group-hover:text-accent"
                  aria-hidden="true"
                />
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
